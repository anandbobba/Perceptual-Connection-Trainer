export interface MicrocontrollerDef {
  type: string;
  label: string;
  width: number;
  height: number;
  pins: Array<{
    label: string;
    type: 'power' | 'ground' | 'signal' | 'analog' | 'digital';
    voltage?: number;
    position: 'left' | 'right' | 'top' | 'bottom';
    offsetX: number;
    offsetY: number;
  }>;
  metadata: Record<string, any>;
}

export const MICROCONTROLLERS: Record<string, MicrocontrollerDef> = {
  'arduino-uno': {
    type: 'arduino-uno',
    label: 'Arduino UNO',
    width: 90,
    height: 140,
    pins: [
      // Power pins - left side (properly spaced)
      { label: '5V', type: 'power', voltage: 5, position: 'left', offsetX: -45, offsetY: -60 },
      { label: '3.3V', type: 'power', voltage: 3.3, position: 'left', offsetX: -45, offsetY: -42 },
      { label: 'GND', type: 'ground', voltage: 0, position: 'left', offsetX: -45, offsetY: -24 },
      { label: 'VIN', type: 'power', voltage: 9, position: 'left', offsetX: -45, offsetY: -6 },
      // Analog pins - left side
      { label: 'A0', type: 'analog', position: 'left', offsetX: -45, offsetY: 12 },
      { label: 'A1', type: 'analog', position: 'left', offsetX: -45, offsetY: 30 },
      { label: 'A2', type: 'analog', position: 'left', offsetX: -45, offsetY: 48 },
      { label: 'A3', type: 'analog', position: 'left', offsetX: -45, offsetY: 66 },
      // Digital pins - right side (properly spaced)
      { label: 'D0', type: 'digital', position: 'right', offsetX: 45, offsetY: -60 },
      { label: 'D1', type: 'digital', position: 'right', offsetX: 45, offsetY: -42 },
      { label: 'D2', type: 'digital', position: 'right', offsetX: 45, offsetY: -24 },
      { label: 'D3', type: 'digital', position: 'right', offsetX: 45, offsetY: -6 },
      { label: 'D4', type: 'digital', position: 'right', offsetX: 45, offsetY: 12 },
      { label: 'D5', type: 'digital', position: 'right', offsetX: 45, offsetY: 30 },
      { label: 'D6', type: 'digital', position: 'right', offsetX: 45, offsetY: 48 },
      { label: 'D7', type: 'digital', position: 'right', offsetX: 45, offsetY: 66 },
    ],
    metadata: { voltage: 5, frequency: 16000000, flash: 32768 }
  },
  
  'arduino-mega': {
    type: 'arduino-mega',
    label: 'Arduino MEGA',
    width: 100,
    height: 160,
    pins: [
      // Power
      { label: '5V', type: 'power', voltage: 5, position: 'left', offsetX: -50, offsetY: -70 },
      { label: '3.3V', type: 'power', voltage: 3.3, position: 'left', offsetX: -50, offsetY: -55 },
      { label: 'GND', type: 'ground', voltage: 0, position: 'left', offsetX: -50, offsetY: -40 },
      { label: 'GND2', type: 'ground', voltage: 0, position: 'left', offsetX: -50, offsetY: -25 },
      { label: 'VIN', type: 'power', voltage: 9, position: 'left', offsetX: -50, offsetY: -10 },
      // Analog pins
      { label: 'A0', type: 'analog', position: 'left', offsetX: -50, offsetY: 10 },
      { label: 'A1', type: 'analog', position: 'left', offsetX: -50, offsetY: 25 },
      { label: 'A2', type: 'analog', position: 'left', offsetX: -50, offsetY: 40 },
      { label: 'A3', type: 'analog', position: 'left', offsetX: -50, offsetY: 55 },
      { label: 'A4', type: 'analog', position: 'left', offsetX: -50, offsetY: 70 },
      // Digital pins
      { label: 'D0', type: 'digital', position: 'right', offsetX: 50, offsetY: -70 },
      { label: 'D1', type: 'digital', position: 'right', offsetX: 50, offsetY: -55 },
      { label: 'D2', type: 'digital', position: 'right', offsetX: 50, offsetY: -40 },
      { label: 'D3', type: 'digital', position: 'right', offsetX: 50, offsetY: -25 },
      { label: 'D4', type: 'digital', position: 'right', offsetX: 50, offsetY: -10 },
      { label: 'D5', type: 'digital', position: 'right', offsetX: 50, offsetY: 5 },
      { label: 'D6', type: 'digital', position: 'right', offsetX: 50, offsetY: 20 },
      { label: 'D7', type: 'digital', position: 'right', offsetX: 50, offsetY: 35 },
      { label: 'D8', type: 'digital', position: 'right', offsetX: 50, offsetY: 50 },
      { label: 'D9', type: 'digital', position: 'right', offsetX: 50, offsetY: 65 },
    ],
    metadata: { voltage: 5, frequency: 16000000, flash: 256000 }
  },

  'esp32': {
    type: 'esp32',
    label: 'ESP32',
    width: 90,
    height: 130,
    pins: [
      // Power
      { label: '3V3', type: 'power', voltage: 3.3, position: 'left', offsetX: -45, offsetY: -55 },
      { label: 'GND', type: 'ground', voltage: 0, position: 'left', offsetX: -45, offsetY: -40 },
      { label: 'VIN', type: 'power', voltage: 5, position: 'left', offsetX: -45, offsetY: -25 },
      // GPIO pins (can be analog or digital)
      { label: 'GPIO0', type: 'digital', position: 'left', offsetX: -45, offsetY: -5 },
      { label: 'GPIO2', type: 'digital', position: 'left', offsetX: -45, offsetY: 10 },
      { label: 'GPIO4', type: 'digital', position: 'left', offsetX: -45, offsetY: 25 },
      { label: 'GPIO5', type: 'digital', position: 'left', offsetX: -45, offsetY: 40 },
      { label: 'GPIO34', type: 'analog', position: 'left', offsetX: -45, offsetY: 55 },
      { label: 'GPIO35', type: 'analog', position: 'left', offsetX: -45, offsetY: 70 },
      // Right side
      { label: 'GPIO12', type: 'digital', position: 'right', offsetX: 45, offsetY: -55 },
      { label: 'GPIO13', type: 'digital', position: 'right', offsetX: 45, offsetY: -40 },
      { label: 'GPIO14', type: 'digital', position: 'right', offsetX: 45, offsetY: -25 },
      { label: 'GPIO15', type: 'digital', position: 'right', offsetX: 45, offsetY: -10 },
      { label: 'GPIO16', type: 'digital', position: 'right', offsetX: 45, offsetY: 5 },
      { label: 'GPIO17', type: 'digital', position: 'right', offsetX: 45, offsetY: 20 },
      { label: 'GPIO18', type: 'digital', position: 'right', offsetX: 45, offsetY: 35 },
      { label: 'GPIO19', type: 'digital', position: 'right', offsetX: 45, offsetY: 50 },
    ],
    metadata: { voltage: 3.3, frequency: 240000000, wifi: true, bluetooth: true }
  },

  'raspberry-pi-pico': {
    type: 'raspberry-pi-pico',
    label: 'Pi Pico',
    width: 85,
    height: 140,
    pins: [
      // Left side
      { label: '3V3', type: 'power', voltage: 3.3, position: 'left', offsetX: -42, offsetY: -60 },
      { label: 'GND', type: 'ground', voltage: 0, position: 'left', offsetX: -42, offsetY: -45 },
      { label: 'GP0', type: 'digital', position: 'left', offsetX: -42, offsetY: -30 },
      { label: 'GP1', type: 'digital', position: 'left', offsetX: -42, offsetY: -15 },
      { label: 'GP2', type: 'digital', position: 'left', offsetX: -42, offsetY: 0 },
      { label: 'GP3', type: 'digital', position: 'left', offsetX: -42, offsetY: 15 },
      { label: 'GP4', type: 'digital', position: 'left', offsetX: -42, offsetY: 30 },
      { label: 'GP5', type: 'digital', position: 'left', offsetX: -42, offsetY: 45 },
      { label: 'GP26', type: 'analog', position: 'left', offsetX: -42, offsetY: 60 },
      // Right side
      { label: 'VBUS', type: 'power', voltage: 5, position: 'right', offsetX: 42, offsetY: -60 },
      { label: 'GND2', type: 'ground', voltage: 0, position: 'right', offsetX: 42, offsetY: -45 },
      { label: 'GP6', type: 'digital', position: 'right', offsetX: 42, offsetY: -30 },
      { label: 'GP7', type: 'digital', position: 'right', offsetX: 42, offsetY: -15 },
      { label: 'GP8', type: 'digital', position: 'right', offsetX: 42, offsetY: 0 },
      { label: 'GP9', type: 'digital', position: 'right', offsetX: 42, offsetY: 15 },
      { label: 'GP10', type: 'digital', position: 'right', offsetX: 42, offsetY: 30 },
      { label: 'GP27', type: 'analog', position: 'right', offsetX: 42, offsetY: 45 },
      { label: 'GP28', type: 'analog', position: 'right', offsetX: 42, offsetY: 60 },
    ],
    metadata: { voltage: 3.3, frequency: 133000000, flash: 2097152 }
  },

  'stm32': {
    type: 'stm32',
    label: 'STM32',
    width: 95,
    height: 135,
    pins: [
      // Power
      { label: 'VDD', type: 'power', voltage: 3.3, position: 'left', offsetX: -47, offsetY: -57 },
      { label: 'VSS', type: 'ground', voltage: 0, position: 'left', offsetX: -47, offsetY: -42 },
      { label: 'VBAT', type: 'power', voltage: 3.3, position: 'left', offsetX: -47, offsetY: -27 },
      // Port A
      { label: 'PA0', type: 'analog', position: 'left', offsetX: -47, offsetY: -7 },
      { label: 'PA1', type: 'analog', position: 'left', offsetX: -47, offsetY: 8 },
      { label: 'PA2', type: 'analog', position: 'left', offsetX: -47, offsetY: 23 },
      { label: 'PA3', type: 'digital', position: 'left', offsetX: -47, offsetY: 38 },
      { label: 'PA4', type: 'digital', position: 'left', offsetX: -47, offsetY: 53 },
      // Port B
      { label: 'PB0', type: 'analog', position: 'right', offsetX: 47, offsetY: -57 },
      { label: 'PB1', type: 'analog', position: 'right', offsetX: 47, offsetY: -42 },
      { label: 'PB2', type: 'digital', position: 'right', offsetX: 47, offsetY: -27 },
      { label: 'PB3', type: 'digital', position: 'right', offsetX: 47, offsetY: -12 },
      { label: 'PB4', type: 'digital', position: 'right', offsetX: 47, offsetY: 3 },
      { label: 'PB5', type: 'digital', position: 'right', offsetX: 47, offsetY: 18 },
      { label: 'PB6', type: 'digital', position: 'right', offsetX: 47, offsetY: 33 },
      { label: 'PB7', type: 'digital', position: 'right', offsetX: 47, offsetY: 48 },
    ],
    metadata: { voltage: 3.3, frequency: 72000000, flash: 65536 }
  },

  'arduino-nano': {
    type: 'arduino-nano',
    label: 'Nano',
    width: 70,
    height: 100,
    pins: [
      // Power
      { label: '5V', type: 'power', voltage: 5, position: 'left', offsetX: -35, offsetY: -42 },
      { label: '3.3V', type: 'power', voltage: 3.3, position: 'left', offsetX: -35, offsetY: -28 },
      { label: 'GND', type: 'ground', voltage: 0, position: 'left', offsetX: -35, offsetY: -14 },
      { label: 'VIN', type: 'power', voltage: 9, position: 'left', offsetX: -35, offsetY: 0 },
      // Analog
      { label: 'A0', type: 'analog', position: 'left', offsetX: -35, offsetY: 18 },
      { label: 'A1', type: 'analog', position: 'left', offsetX: -35, offsetY: 32 },
      { label: 'A2', type: 'analog', position: 'left', offsetX: -35, offsetY: 46 },
      // Digital
      { label: 'D2', type: 'digital', position: 'right', offsetX: 35, offsetY: -42 },
      { label: 'D3', type: 'digital', position: 'right', offsetX: 35, offsetY: -28 },
      { label: 'D4', type: 'digital', position: 'right', offsetX: 35, offsetY: -14 },
      { label: 'D5', type: 'digital', position: 'right', offsetX: 35, offsetY: 0 },
      { label: 'D6', type: 'digital', position: 'right', offsetX: 35, offsetY: 14 },
      { label: 'D7', type: 'digital', position: 'right', offsetX: 35, offsetY: 28 },
    ],
    metadata: { voltage: 5, frequency: 16000000, flash: 32768 }
  }
};
