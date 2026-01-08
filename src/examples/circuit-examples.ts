// Pre-built example circuits for learning
export interface CircuitExample {
  id: string;
  name: string;
  description: string;
  domain: 'physical' | 'logical';
  components: Array<{
    type: string;
    x: number;
    y: number;
  }>;
  connections: Array<{
    from: number; // Component index
    to: number;
    fromPin?: string;
    toPin?: string;
  }>;
}

export const CIRCUIT_EXAMPLES: Record<string, CircuitExample> = {
  'led-basic': {
    id: 'led-basic',
    name: '💡 LED Blink',
    description: 'Basic LED circuit with resistor',
    domain: 'physical',
    components: [
      { type: 'pi-pico', x: 200, y: 300 },
      { type: 'led-red', x: 400, y: 250 },
      { type: 'resistor-220', x: 400, y: 350 }
    ],
    connections: [
      { from: 0, to: 1, fromPin: 'GP15', toPin: 'anode' },
      { from: 1, to: 2, fromPin: 'cathode', toPin: 'pin1' },
      { from: 2, to: 0, fromPin: 'pin2', toPin: 'GND' }
    ]
  },
  
  'rgb-led': {
    id: 'rgb-led',
    name: '🌈 RGB LED',
    description: 'RGB LED with three resistors',
    domain: 'physical',
    components: [
      { type: 'arduino-uno', x: 180, y: 300 },
      { type: 'led-rgb', x: 450, y: 280 },
      { type: 'resistor-220', x: 350, y: 200 },
      { type: 'resistor-220', x: 350, y: 280 },
      { type: 'resistor-220', x: 350, y: 360 }
    ],
    connections: [
      { from: 0, to: 2, fromPin: 'D9', toPin: 'pin1' },
      { from: 2, to: 1, fromPin: 'pin2', toPin: 'R' },
      { from: 0, to: 3, fromPin: 'D10', toPin: 'pin1' },
      { from: 3, to: 1, fromPin: 'pin2', toPin: 'G' },
      { from: 0, to: 4, fromPin: 'D11', toPin: 'pin1' },
      { from: 4, to: 1, fromPin: 'pin2', toPin: 'B' },
      { from: 1, to: 0, fromPin: 'cathode', toPin: 'GND' }
    ]
  },

  'motor-control': {
    id: 'motor-control',
    name: '⚙️ Motor Control',
    description: 'DC motor with external power',
    domain: 'physical',
    components: [
      { type: 'arduino-nano', x: 180, y: 320 },
      { type: 'motor-dc', x: 450, y: 280 },
      { type: 'transistor-npn', x: 320, y: 280 },
      { type: 'resistor-1k', x: 250, y: 280 },
      { type: 'power-9v', x: 450, y: 180 }
    ],
    connections: [
      { from: 0, to: 3, fromPin: 'D3', toPin: 'pin1' },
      { from: 3, to: 2, fromPin: 'pin2', toPin: 'base' },
      { from: 4, to: 1, fromPin: 'positive', toPin: 'positive' },
      { from: 1, to: 2, fromPin: 'negative', toPin: 'collector' },
      { from: 2, to: 0, fromPin: 'emitter', toPin: 'GND' },
      { from: 4, to: 0, fromPin: 'negative', toPin: 'GND' }
    ]
  },

  'sensor-reading': {
    id: 'sensor-reading',
    name: '🌡️ Temperature Sensor',
    description: 'DHT11 sensor reading',
    domain: 'physical',
    components: [
      { type: 'esp32', x: 200, y: 320 },
      { type: 'sensor-dht11', x: 450, y: 320 }
    ],
    connections: [
      { from: 0, to: 1, fromPin: '3V3', toPin: 'VCC' },
      { from: 0, to: 1, fromPin: 'GPIO4', toPin: 'DATA' },
      { from: 0, to: 1, fromPin: 'GND', toPin: 'GND' }
    ]
  },

  'ultrasonic-distance': {
    id: 'ultrasonic-distance',
    name: '📏 Distance Sensor',
    description: 'HC-SR04 ultrasonic sensor',
    domain: 'physical',
    components: [
      { type: 'arduino-mega', x: 200, y: 320 },
      { type: 'sensor-ultrasonic', x: 480, y: 320 }
    ],
    connections: [
      { from: 0, to: 1, fromPin: '5V', toPin: 'VCC' },
      { from: 0, to: 1, fromPin: 'D7', toPin: 'TRIG' },
      { from: 0, to: 1, fromPin: 'D8', toPin: 'ECHO' },
      { from: 0, to: 1, fromPin: 'GND', toPin: 'GND' }
    ]
  },

  'cnn-classification': {
    id: 'cnn-classification',
    name: '🖼️ Image Classification',
    description: 'CNN model for image classification',
    domain: 'logical',
    components: [
      { type: 'dataset-image', x: 150, y: 300 },
      { type: 'model-cnn', x: 300, y: 300 },
      { type: 'loss-crossentropy', x: 450, y: 300 },
      { type: 'optimizer-adam', x: 600, y: 300 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },

  'rnn-sequence': {
    id: 'rnn-sequence',
    name: '📊 Sequence Prediction',
    description: 'LSTM for sequential data',
    domain: 'logical',
    components: [
      { type: 'dataset-sequential', x: 150, y: 300 },
      { type: 'model-lstm', x: 300, y: 300 },
      { type: 'loss-mse', x: 450, y: 300 },
      { type: 'optimizer-adam', x: 600, y: 300 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  }
};
