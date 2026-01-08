export interface ComponentDef {
  type: string;
  label: string;
  width: number;
  height: number;
  pins: Array<{
    label: string;
    type: 'power' | 'ground' | 'signal' | 'analog' | 'digital';
    voltage?: number;
    offsetX: number;
    offsetY: number;
  }>;
  metadata: Record<string, any>;
  color: string;
}

export const PHYSICAL_COMPONENTS: Record<string, ComponentDef> = {
  // LEDs
  'led-red': {
    type: 'led-red',
    label: 'LED R',
    width: 40,
    height: 30,
    pins: [
      { label: '+', type: 'signal', offsetX: -20, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 20, offsetY: 0 }
    ],
    metadata: { voltage: 2.0, current: 0.02, color: 'red' },
    color: '#ff0000'
  },
  'led-green': {
    type: 'led-green',
    label: 'LED G',
    width: 40,
    height: 30,
    pins: [
      { label: '+', type: 'signal', offsetX: -20, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 20, offsetY: 0 }
    ],
    metadata: { voltage: 2.1, current: 0.02, color: 'green' },
    color: '#00ff00'
  },
  'led-blue': {
    type: 'led-blue',
    label: 'LED B',
    width: 40,
    height: 30,
    pins: [
      { label: '+', type: 'signal', offsetX: -20, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 20, offsetY: 0 }
    ],
    metadata: { voltage: 3.2, current: 0.02, color: 'blue' },
    color: '#0066ff'
  },
  'led-rgb': {
    type: 'led-rgb',
    label: 'RGB LED',
    width: 50,
    height: 40,
    pins: [
      { label: 'R', type: 'signal', offsetX: -25, offsetY: -10 },
      { label: 'G', type: 'signal', offsetX: -25, offsetY: 10 },
      { label: 'B', type: 'signal', offsetX: 25, offsetY: -10 },
      { label: 'GND', type: 'ground', offsetX: 25, offsetY: 10 }
    ],
    metadata: { voltage: 3.0, current: 0.06 },
    color: '#ffcc00'
  },

  // Resistors
  'resistor-220': {
    type: 'resistor',
    label: '220Ω',
    width: 50,
    height: 25,
    pins: [
      { label: '1', type: 'signal', offsetX: -25, offsetY: 0 },
      { label: '2', type: 'signal', offsetX: 25, offsetY: 0 }
    ],
    metadata: { resistance: 220, power: 0.25 },
    color: '#d2b48c'
  },
  'resistor-1k': {
    type: 'resistor',
    label: '1KΩ',
    width: 50,
    height: 25,
    pins: [
      { label: '1', type: 'signal', offsetX: -25, offsetY: 0 },
      { label: '2', type: 'signal', offsetX: 25, offsetY: 0 }
    ],
    metadata: { resistance: 1000, power: 0.25 },
    color: '#d2b48c'
  },
  'resistor-10k': {
    type: 'resistor',
    label: '10KΩ',
    width: 50,
    height: 25,
    pins: [
      { label: '1', type: 'signal', offsetX: -25, offsetY: 0 },
      { label: '2', type: 'signal', offsetX: 25, offsetY: 0 }
    ],
    metadata: { resistance: 10000, power: 0.25 },
    color: '#d2b48c'
  },

  // Capacitors
  'capacitor-ceramic': {
    type: 'capacitor',
    label: '100nF',
    width: 45,
    height: 30,
    pins: [
      { label: '1', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: '2', type: 'signal', offsetX: 22, offsetY: 0 }
    ],
    metadata: { capacitance: 0.0000001, type: 'ceramic' },
    color: '#8b7355'
  },
  'capacitor-electrolytic': {
    type: 'capacitor',
    label: '100µF',
    width: 45,
    height: 35,
    pins: [
      { label: '+', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 22, offsetY: 0 }
    ],
    metadata: { capacitance: 0.0001, type: 'electrolytic', polarized: true },
    color: '#4a4a4a'
  },

  // Transistors
  'transistor-npn': {
    type: 'transistor-npn',
    label: 'NPN',
    width: 45,
    height: 40,
    pins: [
      { label: 'B', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: 'C', type: 'signal', offsetX: 10, offsetY: -15 },
      { label: 'E', type: 'signal', offsetX: 10, offsetY: 15 }
    ],
    metadata: { type: 'npn', maxCurrent: 0.1 },
    color: '#2f4f4f'
  },
  'mosfet-n': {
    type: 'mosfet-n',
    label: 'N-FET',
    width: 45,
    height: 40,
    pins: [
      { label: 'G', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: 'D', type: 'signal', offsetX: 15, offsetY: -15 },
      { label: 'S', type: 'signal', offsetX: 15, offsetY: 15 }
    ],
    metadata: { type: 'n-channel', maxCurrent: 1 },
    color: '#2f4f4f'
  },

  // Sensors
  'temp-dht11': {
    type: 'sensor',
    label: 'DHT11',
    width: 50,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 3.3, offsetX: -25, offsetY: -12 },
      { label: 'DATA', type: 'digital', offsetX: -25, offsetY: 12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 25, offsetY: 0 }
    ],
    metadata: { outputType: 'digital', measures: ['temperature', 'humidity'] },
    color: '#4169e1'
  },
  'ultrasonic-hcsr04': {
    type: 'sensor',
    label: 'HC-SR04',
    width: 60,
    height: 40,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -30, offsetY: -10 },
      { label: 'TRIG', type: 'digital', offsetX: -30, offsetY: 10 },
      { label: 'ECHO', type: 'digital', offsetX: 30, offsetY: -10 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 30, offsetY: 10 }
    ],
    metadata: { outputType: 'digital', measures: ['distance'] },
    color: '#1e90ff'
  },
  'light-ldr': {
    type: 'sensor',
    label: 'LDR',
    width: 40,
    height: 35,
    pins: [
      { label: '1', type: 'signal', offsetX: -20, offsetY: 0 },
      { label: '2', type: 'signal', offsetX: 20, offsetY: 0 }
    ],
    metadata: { outputType: 'analog', measures: ['light'] },
    color: '#ffa500'
  },
  'pir-motion': {
    type: 'sensor',
    label: 'PIR',
    width: 50,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -25, offsetY: -12 },
      { label: 'OUT', type: 'digital', offsetX: -25, offsetY: 12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 25, offsetY: 0 }
    ],
    metadata: { outputType: 'digital', measures: ['motion'] },
    color: '#ff6347'
  },
  'accelerometer-mpu6050': {
    type: 'sensor',
    label: 'MPU6050',
    width: 55,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 3.3, offsetX: -27, offsetY: -12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -27, offsetY: 12 },
      { label: 'SCL', type: 'digital', offsetX: 27, offsetY: -12 },
      { label: 'SDA', type: 'digital', offsetX: 27, offsetY: 12 }
    ],
    metadata: { outputType: 'digital', measures: ['acceleration', 'gyroscope'], protocol: 'i2c' },
    color: '#20b2aa'
  },

  // Displays
  'lcd-16x2': {
    type: 'display',
    label: 'LCD 16x2',
    width: 80,
    height: 50,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -40, offsetY: -18 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -40, offsetY: -6 },
      { label: 'SDA', type: 'digital', offsetX: -40, offsetY: 6 },
      { label: 'SCL', type: 'digital', offsetX: -40, offsetY: 18 }
    ],
    metadata: { resolution: '16x2', protocol: 'i2c' },
    color: '#00ced1'
  },
  'oled-128x64': {
    type: 'display',
    label: 'OLED',
    width: 65,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 3.3, offsetX: -32, offsetY: -12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -32, offsetY: 12 },
      { label: 'SCL', type: 'digital', offsetX: 32, offsetY: -12 },
      { label: 'SDA', type: 'digital', offsetX: 32, offsetY: 12 }
    ],
    metadata: { resolution: '128x64', protocol: 'i2c' },
    color: '#4682b4'
  },
  '7segment': {
    type: 'display',
    label: '7-SEG',
    width: 50,
    height: 60,
    pins: [
      { label: 'A', type: 'signal', offsetX: -25, offsetY: -25 },
      { label: 'B', type: 'signal', offsetX: -25, offsetY: -10 },
      { label: 'C', type: 'signal', offsetX: -25, offsetY: 5 },
      { label: 'D', type: 'signal', offsetX: -25, offsetY: 20 },
      { label: 'COM', type: 'ground', offsetX: 25, offsetY: -10 }
    ],
    metadata: { type: 'common-cathode' },
    color: '#ff4500'
  },

  // Motors & Actuators
  'motor-dc': {
    type: 'motor',
    label: 'DC Motor',
    width: 50,
    height: 40,
    pins: [
      { label: '+', type: 'signal', offsetX: -25, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 25, offsetY: 0 }
    ],
    metadata: { voltage: 6, current: 0.5 },
    color: '#696969'
  },
  'servo-sg90': {
    type: 'motor',
    label: 'Servo',
    width: 50,
    height: 40,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -25, offsetY: -10 },
      { label: 'SIG', type: 'signal', offsetX: -25, offsetY: 10 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 25, offsetY: 0 }
    ],
    metadata: { voltage: 5, angle: 180 },
    color: '#8b4513'
  },
  'stepper-28byj': {
    type: 'motor',
    label: 'Stepper',
    width: 60,
    height: 50,
    pins: [
      { label: 'IN1', type: 'signal', offsetX: -30, offsetY: -15 },
      { label: 'IN2', type: 'signal', offsetX: -30, offsetY: 0 },
      { label: 'IN3', type: 'signal', offsetX: -30, offsetY: 15 },
      { label: 'IN4', type: 'signal', offsetX: 30, offsetY: -15 },
      { label: 'VCC', type: 'power', voltage: 5, offsetX: 30, offsetY: 0 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 30, offsetY: 15 }
    ],
    metadata: { voltage: 5, steps: 2048 },
    color: '#a0522d'
  },

  // Buttons & Switches
  'pushbutton': {
    type: 'button',
    label: 'Button',
    width: 40,
    height: 40,
    pins: [
      { label: '1', type: 'signal', offsetX: -20, offsetY: -10 },
      { label: '2', type: 'signal', offsetX: 20, offsetY: -10 },
      { label: '3', type: 'signal', offsetX: -20, offsetY: 10 },
      { label: '4', type: 'signal', offsetX: 20, offsetY: 10 }
    ],
    metadata: { type: 'momentary' },
    color: '#cd5c5c'
  },
  'switch-spdt': {
    type: 'switch',
    label: 'Switch',
    width: 45,
    height: 35,
    pins: [
      { label: 'COM', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: 'NO', type: 'signal', offsetX: 22, offsetY: -10 },
      { label: 'NC', type: 'signal', offsetX: 22, offsetY: 10 }
    ],
    metadata: { type: 'spdt' },
    color: '#bc8f8f'
  },
  'potentiometer': {
    type: 'potentiometer',
    label: 'Pot',
    width: 45,
    height: 40,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -22, offsetY: -10 },
      { label: 'OUT', type: 'analog', offsetX: -22, offsetY: 10 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 22, offsetY: 0 }
    ],
    metadata: { resistance: 10000 },
    color: '#daa520'
  },

  // Communication
  'bluetooth-hc05': {
    type: 'wireless',
    label: 'HC-05',
    width: 55,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -27, offsetY: -12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -27, offsetY: 12 },
      { label: 'TX', type: 'digital', offsetX: 27, offsetY: -12 },
      { label: 'RX', type: 'digital', offsetX: 27, offsetY: 12 }
    ],
    metadata: { protocol: 'bluetooth', version: '2.0' },
    color: '#4169e1'
  },
  'wifi-esp8266': {
    type: 'wireless',
    label: 'ESP-01',
    width: 55,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 3.3, offsetX: -27, offsetY: -12 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -27, offsetY: 12 },
      { label: 'TX', type: 'digital', offsetX: 27, offsetY: -12 },
      { label: 'RX', type: 'digital', offsetX: 27, offsetY: 12 }
    ],
    metadata: { protocol: 'wifi', standard: '802.11' },
    color: '#00bfff'
  },

  // Power
  'battery-9v': {
    type: 'power-source',
    label: '9V',
    width: 50,
    height: 40,
    pins: [
      { label: '+', type: 'power', voltage: 9, offsetX: -25, offsetY: 0 },
      { label: '-', type: 'ground', voltage: 0, offsetX: 25, offsetY: 0 }
    ],
    metadata: { voltage: 9, capacity: 500 },
    color: '#ffd700'
  },
  'voltage-regulator-7805': {
    type: 'regulator',
    label: '7805',
    width: 50,
    height: 35,
    pins: [
      { label: 'IN', type: 'power', voltage: 12, offsetX: -25, offsetY: 0 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 0, offsetY: 15 },
      { label: 'OUT', type: 'power', voltage: 5, offsetX: 25, offsetY: 0 }
    ],
    metadata: { inputVoltage: 12, outputVoltage: 5, maxCurrent: 1.5 },
    color: '#c0c0c0'
  },

  // Diodes
  'diode-1n4007': {
    type: 'diode',
    label: '1N4007',
    width: 45,
    height: 25,
    pins: [
      { label: 'A', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: 'K', type: 'signal', offsetX: 22, offsetY: 0 }
    ],
    metadata: { type: 'rectifier', maxCurrent: 1 },
    color: '#708090'
  },
  'zener-5v': {
    type: 'diode',
    label: 'Zener 5V',
    width: 45,
    height: 25,
    pins: [
      { label: 'A', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: 'K', type: 'signal', offsetX: 22, offsetY: 0 }
    ],
    metadata: { type: 'zener', voltage: 5 },
    color: '#778899'
  },

  // Audio
  'buzzer': {
    type: 'audio',
    label: 'Buzzer',
    width: 40,
    height: 35,
    pins: [
      { label: '+', type: 'signal', offsetX: -20, offsetY: 0 },
      { label: '-', type: 'ground', voltage: 0, offsetX: 20, offsetY: 0 }
    ],
    metadata: { voltage: 5, frequency: 2400 },
    color: '#000000'
  },
  'speaker-8ohm': {
    type: 'audio',
    label: 'Speaker',
    width: 45,
    height: 40,
    pins: [
      { label: '+', type: 'signal', offsetX: -22, offsetY: 0 },
      { label: '-', type: 'signal', offsetX: 22, offsetY: 0 }
    ],
    metadata: { impedance: 8, power: 0.5 },
    color: '#2f4f4f'
  },

  // Relays
  'relay-5v': {
    type: 'relay',
    label: 'Relay',
    width: 55,
    height: 45,
    pins: [
      { label: 'VCC', type: 'power', voltage: 5, offsetX: -27, offsetY: -12 },
      { label: 'IN', type: 'digital', offsetX: -27, offsetY: 12 },
      { label: 'COM', type: 'signal', offsetX: 27, offsetY: -12 },
      { label: 'NO', type: 'signal', offsetX: 27, offsetY: 0 },
      { label: 'NC', type: 'signal', offsetX: 27, offsetY: 12 }
    ],
    metadata: { voltage: 5, maxCurrent: 10 },
    color: '#4682b4'
  }
};
