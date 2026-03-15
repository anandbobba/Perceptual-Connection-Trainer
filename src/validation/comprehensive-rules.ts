import { ValidationRule, Scene, Pin } from '../types';

// Helper to find pin by id
const findPin = (pinId: string, scene: Scene): Pin | undefined => {
  return scene.pins.find(p => p.id === pinId);
};

// Helper to get node by id
const getNode = (nodeId: string, scene: Scene) => {
  return scene.nodes.find(n => n.id === nodeId);
};

// ============================================================================
// RULE 1: LED Current Calculation - Ohm's Law Application
// ============================================================================
export const ledCurrentProtection: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!fromNode || !toNode) return null;
  
  const ledNode = fromNode.type.startsWith('led') ? fromNode : 
                  (toNode.type.startsWith('led') ? toNode : null);
  if (!ledNode) return null;
  
  // Get LED specifications from metadata
  const ledVoltage = ledNode.metadata.voltage || 2.0; // Forward voltage (typical: 2-3V for red/green/yellow, 3-4V for blue/white)
  
  // Find all connections to this LED
  const ledConnections = scene.connections.filter(
    c => c.fromNodeId === ledNode.id || c.toNodeId === ledNode.id
  );
  
  if (ledConnections.length < 2) return null; // LED needs at least 2 connections
  
  // Find power source voltage and resistor in series
  let sourceVoltage = 0;
  let hasResistor = false;
  let resistorValue = 0;
  
  for (const conn of ledConnections) {
    const otherId = conn.fromNodeId === ledNode.id ? conn.toNodeId : conn.fromNodeId;
    const otherNode = getNode(otherId, scene);
    
    if (!otherNode) continue;
    
    // Check for MCU/power source
    if (otherNode.type.includes('arduino') || otherNode.type.includes('esp') || 
        otherNode.type.includes('pico') || otherNode.type === 'power-supply') {
      const pinId = conn.fromNodeId === ledNode.id ? conn.toPinId : conn.fromPinId;
      const pin = pinId ? findPin(pinId, scene) : null;
      
      // Check for power or signal pins with voltage specified
      if (pin?.type === 'power' && pin?.voltage) {
        sourceVoltage = pin.voltage;
      } else if ((pin?.type === 'signal' || pin?.type === 'digital') && pin?.voltage) {
        // GPIO/signal pins can drive LEDs
        sourceVoltage = pin.voltage;
      } else if (!pinId && sourceVoltage === 0) {
        // Default: assume 5V for Arduino-like boards if no pin specified
        sourceVoltage = 5;
      }
    }
    
    // Check for resistor in series
    if (otherNode.type === 'resistor') {
      hasResistor = true;
      resistorValue = otherNode.metadata?.resistance || 220; // Default 220Ω if not specified
    }
  }
  
  // If no power source found, cannot validate current
  if (sourceVoltage <= 0) return null;
  
  // CRITICAL: LED must have resistor
  if (!hasResistor) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'critical',
      message: `LED requires current-limiting resistor! Unprotected LED at ${sourceVoltage}V will draw excessive current and burn out. Add series resistor (~220-330Ω).`
    };
  }
  
  // Calculate actual current using Ohm's Law: I = (Vsource - Vled) / R
  const voltageDrop = sourceVoltage - ledVoltage;
  if (voltageDrop <= 0) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error',
      message: `LED forward voltage (${ledVoltage}V) >= source voltage (${sourceVoltage}V). LED will not light up.`
    };
  }
  
  const calculatedCurrent = voltageDrop / resistorValue; // Amps
  const currentInMilliamps = calculatedCurrent * 1000; // mA
  
  // LED current limits (typical for standard 5mm LEDs):
  // - Minimum: 5mA (too dim)
  // - Typical: 15-20mA (bright)
  // - Maximum: 30mA (safe), 40mA (absolute max, can shorten lifespan)
  
  const minCurrent = 0.005; // 5mA
  const typicalCurrent = 0.020; // 20mA (ideal)
  const maxSafeCurrent = 0.030; // 30mA (safe maximum)
  const maxAbsoluteCurrent = 0.040; // 40mA (absolute maximum)
  
  // Too much current - LED will burn out
  if (calculatedCurrent > maxAbsoluteCurrent) {
    const requiredResistor = Math.ceil(voltageDrop / maxSafeCurrent);
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'critical',
      message: `Current ${currentInMilliamps.toFixed(0)}mA is DANGEROUS for LED! Maximum safe: 30mA. Use at least ${requiredResistor}Ω resistor (currently ${resistorValue}Ω).`
    };
  }
  
  // High current - risky but may work temporarily
  if (calculatedCurrent > maxSafeCurrent) {
    const requiredResistor = Math.ceil(voltageDrop / typicalCurrent);
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error',
      message: `Current ${currentInMilliamps.toFixed(0)}mA exceeds safe limit (30mA). For typical operation, use ${requiredResistor}Ω resistor instead of ${resistorValue}Ω.`
    };
  }
  
  // Too little current - LED will be very dim
  if (calculatedCurrent < minCurrent) {
    const requiredResistor = Math.floor(voltageDrop / typicalCurrent);
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error',
      message: `Current only ${currentInMilliamps.toFixed(1)}mA - LED will be very dim. Use ${requiredResistor}Ω resistor instead of ${resistorValue}Ω for 20mA.`
    };
  }
  
  // Current is in acceptable range
  return null;
};

// ============================================================================
// RULE 2: Power Consumption Analysis
// ============================================================================
export const powerBudgetCheck: ValidationRule = (connection, scene) => {
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  // const toPin = connection.toPinId ? findPin(connection.toPinId, scene) : null; // future use
  
  if (!fromPin || fromPin.type !== 'power') return null;
  
  // Calculate total current draw from this power pin
  const powerConnections = scene.connections.filter(c => c.fromPinId === fromPin.id);
  let totalCurrent = 0;
  
  for (const conn of powerConnections) {
    const nodeId = conn.toNodeId;
    const node = getNode(nodeId, scene);
    if (node?.metadata.current) {
      totalCurrent += node.metadata.current;
    }
  }
  
  // Arduino pins: 40mA max per pin, 200mA total
  // ESP32 pins: 40mA max per pin
  const maxPinCurrent = 0.040; // 40mA
  
  if (totalCurrent > maxPinCurrent) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'critical',
      message: `Pin overload! Drawing ${(totalCurrent * 1000).toFixed(0)}mA, max is ${(maxPinCurrent * 1000)}mA. Use external power supply.`
    };
  }
  
  return null;
};

// ============================================================================
// RULE 3: Ground Loop Detection
// ============================================================================
export const groundLoopPrevention: ValidationRule = (_connection, _scene) => {
  // Check for multiple ground paths that could create loops
  // Complex analysis - future implementation
  // const groundPins = scene.pins.filter(p => p.type === 'ground');
  // const groundConnections = scene.connections.filter(c => 
  //   groundPins.some(p => p.id === c.fromPinId || p.id === c.toPinId)
  // ); // future use
  
  // Complex analysis would go here - simplified for now
  return null;
};

// ============================================================================
// RULE 4: Signal Pin Type Validation
// ============================================================================
export const signalPinCompatibility: ValidationRule = (connection, scene) => {
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  const toPin = connection.toPinId ? findPin(connection.toPinId, scene) : null;
  
  if (!fromPin || !toPin) return null;
  
  // Digital output can't connect to power/ground
  if ((fromPin.type === 'digital' && toPin.type === 'power') ||
      (fromPin.type === 'digital' && toPin.type === 'ground')) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error',
      message: 'Digital pins should not connect directly to power rails'
    };
  }
  
  return null;
};

// ============================================================================
// RULE 5: Capacitor Voltage Rating
// ============================================================================
export const capacitorVoltageRating: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!fromNode || !toNode) return null;
  
  const capNode = fromNode.type === 'capacitor' ? fromNode : 
                  (toNode.type === 'capacitor' ? toNode : null);
  if (!capNode) return null;
  
  // Check voltage across capacitor
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  const toPin = connection.toPinId ? findPin(connection.toPinId, scene) : null;
  
  if (fromPin?.voltage && toPin?.voltage) {
    const voltageDiff = Math.abs(fromPin.voltage - toPin.voltage);
    const capRating = capNode.metadata.voltage || 16; // Default 16V rating
    
    if (voltageDiff > capRating * 0.8) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical',
        message: `Capacitor voltage too high! ${voltageDiff.toFixed(1)}V across ${capRating}V rated capacitor`
      };
    }
  }
  
  return null;
};

// ============================================================================
// RULE 6: Resistor Power Dissipation (P = I²R or P = V²/R)
// ============================================================================
export const resistorPowerRating: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!fromNode || !toNode) return null;
  
  const resistorNode = fromNode.type === 'resistor' ? fromNode : 
                       (toNode.type === 'resistor' ? toNode : null);
  if (!resistorNode) return null;
  
  const resistance = resistorNode.metadata.resistance || 220;
  const powerRating = resistorNode.metadata.power || 0.25; // 1/4 watt typical
  
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  const toPin = connection.toPinId ? findPin(connection.toPinId, scene) : null;
  
  if (fromPin?.voltage !== undefined && toPin?.voltage !== undefined) {
    const voltageDiff = Math.abs(fromPin.voltage - toPin.voltage);
    const power = (voltageDiff * voltageDiff) / resistance; // P = V²/R
    
    if (power > powerRating) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical',
        message: `Resistor overheating! Dissipating ${(power * 1000).toFixed(0)}mW, rated for ${(powerRating * 1000)}mW. Use higher wattage or larger resistance.`
      };
    }
  }
  
  return null;
};

// ============================================================================
// RULE 7: Motor Driver Requirements
// ============================================================================
export const motorDriverRequired: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!fromNode || !toNode) return null;
  
  const motorNode = fromNode.type === 'motor' ? fromNode : 
                    (toNode.type === 'motor' ? toNode : null);
  if (!motorNode) return null;
  
  // Check if motor is connected directly to MCU pin
  const mcuNode = fromNode.type.includes('arduino') || fromNode.type.includes('esp') ? fromNode : 
                  (toNode.type.includes('arduino') || toNode.type.includes('esp') ? toNode : null);
  
  if (mcuNode) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'critical',
      message: 'Motors cannot connect directly to MCU pins! Use motor driver (L298N, L293D, etc.)'
    };
  }
  
  return null;
};

// ============================================================================
// RULE 8: I2C Protocol Requirements (SDA/SCL with pullups)
// ============================================================================
export const i2cProtocolValidation: ValidationRule = (connection, scene) => {
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  const toPin = connection.toPinId ? findPin(connection.toPinId, scene) : null;
  
  if (!fromPin || !toPin) return null;
  
  // Check for I2C pins (SDA/SCL)
  const isI2C = (fromPin.label?.includes('SDA') || fromPin.label?.includes('SCL') ||
                 toPin.label?.includes('SDA') || toPin.label?.includes('SCL'));
  
  if (isI2C) {
    // Check for pullup resistors (4.7kΩ typical)
    const hasResistor = scene.connections.some(c => {
      const node = getNode(c.fromNodeId, scene) || getNode(c.toNodeId, scene);
      return node?.type === 'resistor' && 
             node.metadata.resistance >= 4000 && 
             node.metadata.resistance <= 10000;
    });
    
    if (!hasResistor) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error',
        message: 'I2C requires pullup resistors (4.7kΩ typical) on SDA and SCL lines'
      };
    }
  }
  
  return null;
};

// ============================================================================
// RULE 9: Transistor Configuration Validation
// ============================================================================
export const transistorBiasing: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!fromNode || !toNode) return null;
  
  const transistorNode = fromNode.type.includes('transistor') ? fromNode : 
                         (toNode.type.includes('transistor') ? toNode : null);
  if (!transistorNode) return null;
  
  // Check for base resistor (for BJT) or gate resistor (for MOSFET)
  const hasBaseResistor = scene.connections.some(c => {
    const otherId = c.fromNodeId === transistorNode.id ? c.toNodeId : c.fromNodeId;
    const node = getNode(otherId, scene);
    const pinId = c.fromNodeId === transistorNode.id ? c.fromPinId : c.toPinId;
    const pin = pinId ? scene.pins.find(p => p.id === pinId) : null;
    
    return node?.type === 'resistor' && pin?.label?.includes('B'); // Base pin
  });
  
  if (!hasBaseResistor) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error',
      message: 'Transistor base requires current-limiting resistor (1kΩ typical)'
    };
  }
  
  return null;
};

// ============================================================================
// RULE 10: PWM Pin Usage
// ============================================================================
export const pwmPinValidation: ValidationRule = (connection, scene) => {
  const fromPin = connection.fromPinId ? findPin(connection.fromPinId, scene) : null;
  const toNode = connection.toNodeId ? getNode(connection.toNodeId, scene) : null;
  
  if (!fromPin || !toNode) return null;
  
  // Check if component needs PWM
  const needsPWM = toNode.type === 'servo' || toNode.type === 'motor' || 
                   toNode.type.includes('led-rgb');
  
  if (needsPWM && fromPin.type === 'digital') {
    // Check if it's a PWM-capable pin (typically D3, D5, D6, D9, D10, D11 on Arduino)
    const isPWMPin = fromPin.label?.includes('~') || 
                     fromPin.label?.match(/D(3|5|6|9|10|11)/);
    
    if (!isPWMPin) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error',
        message: `${toNode.type} requires PWM pin. Use pins with ~ symbol (D3, D5, D6, D9, D10, D11)`
      };
    }
  }
  
  return null;
};
