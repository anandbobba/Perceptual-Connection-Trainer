/**
 * Real-world component specifications and connection rules
 * Based on actual datasheets and industry standards
 */

export interface RealComponentSpec {
  id: string;
  name: string;
  category: string;
  
  // Electrical specifications
  electrical: {
    voltage: {
      min: number;
      max: number;
      rated: number;
      unit: 'V';
    };
    current: {
      min: number;
      max: number;
      unit: 'mA' | 'A';
    };
    power: {
      max: number;
      unit: 'W' | 'mW';
    };
    resistance?: {
      min: number;
      max: number;
      unit: 'Ω';
    };
  };
  
  // Pin specifications
  pins: Array<{
    number: string;
    name: string;
    type: 'power' | 'ground' | 'signal' | 'analog' | 'digital' | 'PWM' | 'SPI' | 'I2C' | 'UART';
    voltage: number;
    maxCurrent?: number;
  }>;
  
  // Physical characteristics
  physical: {
    package: string;
    pinCount: number;
    maxTemp: number;
    minTemp: number;
  };
  
  // Connection constraints
  constraints: {
    maxParallelDevices?: number;
    requiredPullups?: boolean;
    requiredResistor?: { min: number; max: number };
    maxWireLength?: number;
    requiredBypass?: { capacitor: string };
  };
}

// Real LED specifications (based on common components)
export const LED_SPECS: RealComponentSpec = {
  id: 'led-standard',
  name: 'Standard LED',
  category: 'Light Emitting Diode',
  electrical: {
    voltage: { min: 1.8, max: 3.6, rated: 2.0, unit: 'V' },
    current: { min: 2, max: 20, unit: 'mA' },
    power: { max: 100, unit: 'mW' }
  },
  pins: [
    { number: '1', name: 'Anode (+)', type: 'signal', voltage: 2.0, maxCurrent: 20 },
    { number: '2', name: 'Cathode (-)', type: 'ground', voltage: 0 }
  ],
  physical: {
    package: 'THT 5mm',
    pinCount: 2,
    maxTemp: 100,
    minTemp: -20
  },
  constraints: {
    requiredResistor: { min: 100, max: 470 },
    maxParallelDevices: 8
  }
};

// Real Resistor specifications
export const RESISTOR_SPECS: RealComponentSpec = {
  id: 'resistor-standard',
  name: 'Carbon Film Resistor',
  category: 'Resistor',
  electrical: {
    voltage: { min: 0, max: 250, rated: 100, unit: 'V' },
    current: { min: 0, max: 0.5, unit: 'A' },
    power: { max: 0.25, unit: 'W' },
    resistance: { min: 10, max: 1000000, unit: 'Ω' }
  },
  pins: [
    { number: '1', name: 'Leg 1', type: 'signal', voltage: 5 },
    { number: '2', name: 'Leg 2', type: 'signal', voltage: 0 }
  ],
  physical: {
    package: 'THT 1/4W',
    pinCount: 2,
    maxTemp: 85,
    minTemp: -10
  },
  constraints: {}
};

// Real Capacitor specifications
export const CAPACITOR_SPECS: RealComponentSpec = {
  id: 'capacitor-electrolytic',
  name: 'Electrolytic Capacitor',
  category: 'Capacitor',
  electrical: {
    voltage: { min: 0, max: 50, rated: 16, unit: 'V' },
    current: { min: 0, max: 2, unit: 'A' },
    power: { max: 100, unit: 'mW' }
  },
  pins: [
    { number: '1', name: 'Positive', type: 'power', voltage: 5 },
    { number: '2', name: 'Negative', type: 'ground', voltage: 0 }
  ],
  physical: {
    package: 'Radial 10x12.5mm',
    pinCount: 2,
    maxTemp: 105,
    minTemp: -20
  },
  constraints: {
    requiredBypass: { capacitor: '100nF ceramic' }
  }
};

// Real Arduino UNO specifications (ATmega328P)
export const ARDUINO_UNO_SPECS: RealComponentSpec = {
  id: 'arduino-uno',
  name: 'Arduino UNO (ATmega328P)',
  category: 'Microcontroller',
  electrical: {
    voltage: { min: 5, max: 5, rated: 5, unit: 'V' },
    current: { min: 40, max: 200, unit: 'mA' },
    power: { max: 1, unit: 'W' }
  },
  pins: [
    // Power
    { number: '1', name: 'GND', type: 'ground', voltage: 0 },
    { number: '2', name: '5V', type: 'power', voltage: 5, maxCurrent: 500 },
    { number: '3', name: '3.3V', type: 'power', voltage: 3.3, maxCurrent: 50 },
    // Analog (10-bit ADC, 0-5V)
    { number: 'A0-A5', name: 'Analog Input', type: 'analog', voltage: 5, maxCurrent: 0 },
    // Digital I/O
    { number: 'D0-D13', name: 'Digital I/O', type: 'digital', voltage: 5, maxCurrent: 40 },
    // PWM pins
    { number: 'D3,5,6,9,10,11', name: 'PWM Output', type: 'PWM', voltage: 5, maxCurrent: 40 }
  ],
  physical: {
    package: 'DIP 28 / Bootloader',
    pinCount: 30,
    maxTemp: 95,
    minTemp: -10
  },
  constraints: {
    requiredBypass: { capacitor: '100nF ceramic near VCC' },
    maxParallelDevices: 64
  }
};

// Real HC-SR04 Ultrasonic Sensor specifications
export const HC_SR04_SPECS: RealComponentSpec = {
  id: 'hc-sr04',
  name: 'HC-SR04 Ultrasonic Distance Sensor',
  category: 'Distance Sensor',
  electrical: {
    voltage: { min: 4.5, max: 5.5, rated: 5, unit: 'V' },
    current: { min: 15, max: 30, unit: 'mA' },
    power: { max: 0.15, unit: 'W' }
  },
  pins: [
    { number: '1', name: 'VCC', type: 'power', voltage: 5, maxCurrent: 30 },
    { number: '2', name: 'GND', type: 'ground', voltage: 0 },
    { number: '3', name: 'TRIG', type: 'digital', voltage: 5, maxCurrent: 10 },
    { number: '4', name: 'ECHO', type: 'digital', voltage: 5, maxCurrent: 10 }
  ],
  physical: {
    package: 'Module with sensor heads',
    pinCount: 4,
    maxTemp: 60,
    minTemp: -20
  },
  constraints: {
    requiredResistor: { min: 1000, max: 10000 },
    maxWireLength: 2
  }
};

// Real MPU6050 (6-DOF IMU) specifications
export const MPU6050_SPECS: RealComponentSpec = {
  id: 'mpu6050',
  name: 'MPU6050 6-Axis IMU',
  category: 'Motion Sensor',
  electrical: {
    voltage: { min: 3, max: 3.6, rated: 3.3, unit: 'V' },
    current: { min: 3, max: 50, unit: 'mA' },
    power: { max: 0.15, unit: 'W' }
  },
  pins: [
    { number: '1', name: 'VCC', type: 'power', voltage: 3.3, maxCurrent: 50 },
    { number: '2', name: 'GND', type: 'ground', voltage: 0 },
    { number: '3', name: 'SCL', type: 'I2C', voltage: 3.3, maxCurrent: 3 },
    { number: '4', name: 'SDA', type: 'I2C', voltage: 3.3, maxCurrent: 3 },
    { number: '5', name: 'INT', type: 'digital', voltage: 3.3, maxCurrent: 10 }
  ],
  physical: {
    package: 'GY-521 Module',
    pinCount: 5,
    maxTemp: 85,
    minTemp: -40
  },
  constraints: {
    requiredPullups: true,
    requiredResistor: { min: 2200, max: 10000 },
    requiredBypass: { capacitor: '100nF ceramic near VCC' }
  }
};

// Real FSR (Force Sensing Resistor) specifications
export const FSR_SPECS: RealComponentSpec = {
  id: 'fsr-402',
  name: 'FSR 402 Pressure Sensor',
  category: 'Pressure Sensor',
  electrical: {
    voltage: { min: 5, max: 5, rated: 5, unit: 'V' },
    current: { min: 0, max: 3, unit: 'mA' },
    power: { max: 0.015, unit: 'W' },
    resistance: { min: 100000, max: 10000000, unit: 'Ω' }
  },
  pins: [
    { number: '1', name: 'Pin 1', type: 'signal', voltage: 5 },
    { number: '2', name: 'Pin 2', type: 'ground', voltage: 0 }
  ],
  physical: {
    package: 'Flexible sensor 30.4mm x 19.1mm',
    pinCount: 2,
    maxTemp: 70,
    minTemp: -10
  },
  constraints: {
    requiredResistor: { min: 10000, max: 100000 }
  }
};

// Real DHT22 Temperature/Humidity Sensor
export const DHT22_SPECS: RealComponentSpec = {
  id: 'dht22',
  name: 'DHT22 Temperature & Humidity Sensor',
  category: 'Environmental Sensor',
  electrical: {
    voltage: { min: 3.3, max: 5.5, rated: 5, unit: 'V' },
    current: { min: 0.5, max: 2.5, unit: 'mA' },
    power: { max: 0.0125, unit: 'W' }
  },
  pins: [
    { number: '1', name: 'VCC', type: 'power', voltage: 5, maxCurrent: 2.5 },
    { number: '2', name: 'DATA', type: 'digital', voltage: 5, maxCurrent: 1 },
    { number: '3', name: 'NC', type: 'signal', voltage: 0 },
    { number: '4', name: 'GND', type: 'ground', voltage: 0 }
  ],
  physical: {
    package: 'THT 4-pin',
    pinCount: 4,
    maxTemp: 60,
    minTemp: -10
  },
  constraints: {
    requiredResistor: { min: 4700, max: 10000 },
    requiredBypass: { capacitor: '100nF ceramic' }
  }
};

// Connection validation rules based on real electrical standards
export const CONNECTION_RULES = {
  // Voltage compatibility
  voltage: {
    tolerance: 0.1, // ±10%
    maxVoltageDrop: 0.5 // 0.5V max acceptable drop
  },
  
  // Current limits
  current: {
    arduinoPinMax: 40, // mA per pin
    arduinoTotalMax: 200, // mA total
    maxSeriesResistance: 10000 // Ω
  },
  
  // Power supply requirements
  power: {
    minBypassCapacitor: 100, // nF
    minDecouplingCapacitor: 100 // nF
  },
  
  // Signal integrity
  signal: {
    maxWireLength: 5, // meters for digital signals
    maxI2CLength: 1, // meter for I2C
    maxSPILength: 0.5 // meter for SPI
  }
};

// Real component compatibility matrix
export const COMPATIBILITY_MATRIX: Record<string, string[]> = {
  'arduino-uno': [
    'led-red', 'led-green', 'led-blue',
    'resistor-standard',
    'capacitor-electrolytic',
    'hc-sr04', 'mpu6050', 'fsr-402', 'dht22',
    'motor-dc', 'buzzer'
  ],
  'hc-sr04': ['arduino-uno', 'resistor-standard'],
  'mpu6050': ['arduino-uno', 'resistor-standard', 'capacitor-electrolytic'],
  'dht22': ['arduino-uno', 'resistor-standard', 'capacitor-electrolytic'],
  'fsr-402': ['arduino-uno', 'resistor-standard'],
  'led-red': ['resistor-standard', 'arduino-uno'],
  'led-green': ['resistor-standard', 'arduino-uno'],
  'led-blue': ['resistor-standard', 'arduino-uno'],
  'resistor-standard': ['*'], // Can connect to anything
  'capacitor-electrolytic': ['*'] // Can connect to anything
};
