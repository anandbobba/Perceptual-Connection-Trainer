import { ValidationRule, Scene, Pin } from '../types';

const findPin = (pinId: string, scene: Scene): Pin | undefined => {
  return scene.pins.find(p => p.id === pinId);
};

// Rule: Cannot mix 3.3V and 5V systems without level shifter
export const voltageLevelMatching: ValidationRule = (connection, scene) => {
  if (!connection.fromPinId || !connection.toPinId) return null;

  const fromPin = findPin(connection.fromPinId, scene);
  const toPin = findPin(connection.toPinId, scene);

  if (!fromPin || !toPin) return null;
  if (fromPin.voltage === undefined || toPin.voltage === undefined) return null;

  // Check if connecting 5V to 3.3V device
  if ((fromPin.voltage === 5 && toPin.voltage === 3.3) ||
      (fromPin.voltage === 3.3 && toPin.voltage === 5)) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'critical'
    };
  }

  return null;
};

// Rule: I2C requires pull-up resistors
export const i2cPullupRequired: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  // Check if this is an I2C connection
  const isI2C = (fromNode.metadata?.protocol === 'i2c' || toNode.metadata?.protocol === 'i2c');

  if (isI2C) {
    // Check if there are resistors in the circuit
    const hasResistors = scene.nodes.some(n => n.type === 'resistor');
    if (!hasResistors) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};

// Rule: Motor requires external power supply (not from microcontroller pin)
export const motorRequiresExternalPower: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isMotor = fromNode.type === 'motor' || toNode.type === 'motor';
  const isDirectMCUConnection = 
    (fromNode.type.includes('arduino') || fromNode.type.includes('esp') || 
     fromNode.type.includes('stm32') || fromNode.type === 'raspberry-pi-pico') ||
    (toNode.type.includes('arduino') || toNode.type.includes('esp') || 
     toNode.type.includes('stm32') || toNode.type === 'raspberry-pi-pico');

  if (isMotor && isDirectMCUConnection) {
    // Check if motor is high current
    const motorNode = fromNode.type === 'motor' ? fromNode : toNode;
    if (motorNode.metadata?.current && motorNode.metadata.current > 0.1) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'critical'
      };
    }
  }

  return null;
};

// Rule: Transistor/MOSFET needed for inductive loads
export const inductiveLoadProtection: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isInductiveLoad = 
    (fromNode.type === 'motor' || fromNode.type === 'relay') ||
    (toNode.type === 'motor' || toNode.type === 'relay');

  if (isInductiveLoad) {
    const hasTransistor = scene.connections.some(c => {
      const node1 = scene.nodes.find(n => n.id === c.fromNodeId);
      const node2 = scene.nodes.find(n => n.id === c.toNodeId);
      return node1?.type.includes('transistor') || node1?.type.includes('mosfet') ||
             node2?.type.includes('transistor') || node2?.type.includes('mosfet');
    });

    if (!hasTransistor) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};

// Rule: Electrolytic capacitors have polarity
export const capacitorPolarity: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const capacitor = 
    fromNode.type === 'capacitor' ? fromNode :
    toNode.type === 'capacitor' ? toNode : null;

  if (capacitor && capacitor.metadata?.polarized) {
    // Check if connected with correct polarity
    if (connection.fromPinId && connection.toPinId) {
      const fromPin = findPin(connection.fromPinId, scene);
      const toPin = findPin(connection.toPinId, scene);

      if (fromPin?.label === '-' && toPin?.type === 'power') {
        return {
          connectionId: connection.id,
          isValid: false,
          severity: 'critical'
        };
      }
    }
  }

  return null;
};

// Rule: Serial communication TX->RX, RX->TX
export const serialCrossover: ValidationRule = (connection, scene) => {
  if (!connection.fromPinId || !connection.toPinId) return null;

  const fromPin = findPin(connection.fromPinId, scene);
  const toPin = findPin(connection.toPinId, scene);

  if (!fromPin || !toPin) return null;

  // TX should connect to RX and vice versa
  if ((fromPin.label === 'TX' && toPin.label === 'TX') ||
      (fromPin.label === 'RX' && toPin.label === 'RX')) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: RGB LED needs current limiting on each channel
export const rgbLedResistors: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isRGBLED = fromNode.type === 'led-rgb' || toNode.type === 'led-rgb';

  if (isRGBLED && connection.fromPinId) {
    const fromPin = findPin(connection.fromPinId, scene);
    if (fromPin && ['R', 'G', 'B'].includes(fromPin.label)) {
      // Check for resistor in the path
      const hasResistor = 
        fromNode.type === 'resistor' || toNode.type === 'resistor' ||
        scene.connections.some(c => {
          const node = scene.nodes.find(n => n.id === c.fromNodeId || n.id === c.toNodeId);
          return node?.type === 'resistor';
        });

      if (!hasResistor) {
        return {
          connectionId: connection.id,
          isValid: false,
          severity: 'critical'
        };
      }
    }
  }

  return null;
};

// Rule: Zener diode has polarity
export const zenerPolarity: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isZener = 
    (fromNode.type === 'diode' && fromNode.metadata?.type === 'zener') ||
    (toNode.type === 'diode' && toNode.metadata?.type === 'zener');

  if (isZener && connection.fromPinId && connection.toPinId) {
    const fromPin = findPin(connection.fromPinId, scene);
    const toPin = findPin(connection.toPinId, scene);

    // Zener cathode (K) should be toward higher voltage
    if (fromPin?.label === 'K' && toPin?.type === 'ground') {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};

// Rule: Display backlight needs current limiting
export const displayBacklightProtection: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isDisplay = fromNode.type === 'display' || toNode.type === 'display';

  if (isDisplay && connection.fromPinId) {
    const pin = findPin(connection.fromPinId, scene);
    if (pin?.label === 'LED+' || pin?.label === 'BL') {
      // Check for resistor
      const hasResistor = scene.connections.some(c => {
        const node = scene.nodes.find(n => n.id === c.fromNodeId || n.id === c.toNodeId);
        return node?.type === 'resistor';
      });

      if (!hasResistor) {
        return {
          connectionId: connection.id,
          isValid: false,
          severity: 'error'
        };
      }
    }
  }

  return null;
};
