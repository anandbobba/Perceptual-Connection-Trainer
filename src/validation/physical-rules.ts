import { ValidationRule, Scene, Pin } from '../types';

// Helper to find pin by id
const findPin = (pinId: string, scene: Scene): Pin | undefined => {
  return scene.pins.find(p => p.id === pinId);
};

// Rule: Cannot connect power to ground directly
export const noDirectPowerToGround: ValidationRule = (connection, scene) => {
  if (!connection.fromPinId || !connection.toPinId) return null;

  const fromPin = findPin(connection.fromPinId, scene);
  const toPin = findPin(connection.toPinId, scene);

  if (!fromPin || !toPin) return null;

  const isPowerToGround = 
    (fromPin.type === 'power' && toPin.type === 'ground') ||
    (fromPin.type === 'ground' && toPin.type === 'power');

  if (isPowerToGround) {
    // Check if there's a resistor in the path
    const hasResistor = scene.nodes.some(
      n => n.id === connection.fromNodeId || n.id === connection.toNodeId
    ) && scene.nodes.find(
      n => (n.id === connection.fromNodeId || n.id === connection.toNodeId) && 
           n.type === 'resistor'
    );

    if (!hasResistor) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical' // Short circuit
      };
    }
  }

  return null;
};

// Rule: Voltage mismatch
// REAL ELECTRICAL ENGINEERING: Direct pin-to-pin voltage must match within tolerance
export const voltageMatch: ValidationRule = (connection, scene) => {
  if (!connection.fromPinId || !connection.toPinId) return null;

  const fromPin = findPin(connection.fromPinId, scene);
  const toPin = findPin(connection.toPinId, scene);

  if (!fromPin || !toPin) return null;
  if (fromPin.voltage === undefined || toPin.voltage === undefined) return null;

  // Don't check voltage match if resistor/LED is in between (voltage drop expected)
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);
  
  if (fromNode?.type === 'resistor' || toNode?.type === 'resistor' ||
      fromNode?.type === 'led' || toNode?.type === 'led') {
    return null; // Voltage drop is expected across these components
  }

  const voltageDiff = Math.abs(fromPin.voltage - toPin.voltage);
  
  // Allow 0.2V tolerance for real-world variance
  if (voltageDiff > 0.2) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: LED must have current-limiting resistor
// REAL ELECTRICAL ENGINEERING: LED needs resistor in series between power and LED
export const ledRequiresResistor: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  // Identify if this connection involves an LED (check all LED types)
  const ledNode = fromNode.type.startsWith('led') ? fromNode : (toNode.type.startsWith('led') ? toNode : null);
  if (!ledNode) return null;

  // Get all connections to/from this LED
  const ledConnections = scene.connections.filter(
    c => c.fromNodeId === ledNode.id || c.toNodeId === ledNode.id
  );

  if (ledConnections.length < 2) {
    // LED needs at least 2 connections (anode and cathode paths)
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  // Trace path from LED to power source
  const hasPowerConnection = ledConnections.some(c => {
    const otherNodeId = c.fromNodeId === ledNode.id ? c.toNodeId : c.fromNodeId;
    const otherNode = scene.nodes.find(n => n.id === otherNodeId);
    
    if (!otherNode) return false;
    
    // Check if connected to MCU power pin
    if (otherNode.type.includes('arduino') || otherNode.type.includes('esp') || otherNode.type.includes('pico')) {
      const pinId = c.fromNodeId === ledNode.id ? c.fromPinId : c.toPinId;
      const pin = pinId ? findPin(pinId, scene) : null;
      return pin?.type === 'power';
    }
    return false;
  });

  if (hasPowerConnection) {
    // LED connected to power - MUST have resistor in series
    const hasResistorInPath = ledConnections.some(c => {
      const otherNodeId = c.fromNodeId === ledNode.id ? c.toNodeId : c.fromNodeId;
      const otherNode = scene.nodes.find(n => n.id === otherNodeId);
      return otherNode?.type === 'resistor';
    });

    if (!hasResistorInPath) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical' // CRITICAL: LED will burn out without resistor!
      };
    }
  }

  return null;
};

// Rule: LED polarity must be correct (anode to + side, cathode to - side)
// REAL ELECTRICAL ENGINEERING: LEDs are diodes - current flows anode(+) to cathode(-)
export const ledPolarity: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);
  
  if (!fromNode || !toNode) return null;
  
  // Check if this is an LED connection
  const ledNode = fromNode.type.startsWith('led') ? fromNode : (toNode.type.startsWith('led') ? toNode : null);
  if (!ledNode) return null;
  
  // Get LED pin labels
  const ledPinId = ledNode.id === connection.fromNodeId ? connection.fromPinId : connection.toPinId;
  const ledPin = ledPinId ? scene.pins.find(p => p.id === ledPinId) : null;
  
  if (!ledPin) return null;
  
  // Check if LED + is connected to ground or LED - is connected to power
  const otherPinId = ledNode.id === connection.fromNodeId ? connection.toPinId : connection.fromPinId;
  const otherPin = otherPinId ? findPin(otherPinId, scene) : null;
  
  if (otherPin) {
    // LED anode (+) should NOT connect to ground
    if (ledPin.label === '+' && otherPin.type === 'ground') {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical' // LED is backwards!
      };
    }
    // LED cathode (-) should NOT connect to power directly
    if (ledPin.label === '-' && otherPin.type === 'power') {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical' // LED is backwards!
      };
    }
  }
  
  return null;
};

// Rule: Ground must be present in circuit
export const requiresGround: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  // If connecting to a power source, ensure ground exists somewhere
  const hasPower = scene.pins.some(p => p.type === 'power' && 
    (p.id === connection.fromPinId || p.id === connection.toPinId));

  if (hasPower) {
    const componentId = fromNode.type !== 'arduino' ? fromNode.id : toNode.id;
    const hasGroundConnection = scene.connections.some(c => {
      if (c.id === connection.id) return false;
      const isComponentConnection = 
        c.fromNodeId === componentId || c.toNodeId === componentId;
      const hasGround = 
        (c.fromPinId && findPin(c.fromPinId, scene)?.type === 'ground') ||
        (c.toPinId && findPin(c.toPinId, scene)?.type === 'ground');
      return isComponentConnection && hasGround;
    });

    if (!hasGroundConnection) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};

// Rule: Analog sensors must connect to analog pins
export const analogToAnalogPin: ValidationRule = (connection, scene) => {
  if (!connection.fromPinId || !connection.toPinId) return null;

  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);
  const toPin = findPin(connection.toPinId, scene);

  if (!fromNode || !toNode || !toPin) return null;

  // If sensor outputs analog signal, must connect to analog pin
  const isAnalogSensor = fromNode.type === 'sensor' && 
                         fromNode.metadata?.outputType === 'analog';
  const isArduino = toNode.type === 'arduino';

  if (isAnalogSensor && isArduino && toPin.type !== 'analog') {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};
