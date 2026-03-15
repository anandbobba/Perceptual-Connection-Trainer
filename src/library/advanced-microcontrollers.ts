// ADDITIONAL PROFESSIONAL MICROCONTROLLERS & PROCESSORS
// Highly accurate pin definitions for advanced projects

import { MicrocontrollerDef } from './microcontrollers';

export const ADVANCED_MICROCONTROLLERS: Record<string, MicrocontrollerDef> = {

  // ============================================================================
  // RASPBERRY PI FAMILY
  // ============================================================================

  'raspberry-pi-4b': {
    type: 'microcontroller',
    label: 'Raspberry Pi 4B',
    width: 120,
    height: 180,
    pins: [
      // Left side (40-pin GPIO header)
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: -60, offsetY: -85 },
      { label: '5V', type: 'power', voltage: 5, offsetX: -60, offsetY: -67 },
      { label: 'GPIO2/SDA', type: 'digital', offsetX: -60, offsetY: -49 },
      { label: '5V', type: 'power', voltage: 5, offsetX: -60, offsetY: -31 },
      { label: 'GPIO3/SCL', type: 'digital', offsetX: -60, offsetY: -13 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -60, offsetY: 5 },
      { label: 'GPIO4', type: 'digital', offsetX: -60, offsetY: 23 },
      { label: 'GPIO17', type: 'digital', offsetX: -60, offsetY: 41 },
      { label: 'GPIO27', type: 'digital', offsetX: -60, offsetY: 59 },
      { label: 'GPIO22', type: 'digital', offsetX: -60, offsetY: 77 },
      
      // Right side
      { label: '5V', type: 'power', voltage: 5, offsetX: 60, offsetY: -85 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 60, offsetY: -67 },
      { label: 'GPIO14/TXD', type: 'digital', offsetX: 60, offsetY: -49 },
      { label: 'GPIO15/RXD', type: 'digital', offsetX: 60, offsetY: -31 },
      { label: 'GPIO18/PWM', type: 'digital', offsetX: 60, offsetY: -13 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 60, offsetY: 5 },
      { label: 'GPIO23', type: 'digital', offsetX: 60, offsetY: 23 },
      { label: 'GPIO24', type: 'digital', offsetX: 60, offsetY: 41 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 60, offsetY: 59 },
      { label: 'GPIO25', type: 'digital', offsetX: 60, offsetY: 77 }
    ],
    metadata: {
      processor: 'Broadcom BCM2711, Quad-core Cortex-A72 @ 1.5GHz',
      ram: '1GB/2GB/4GB/8GB LPDDR4',
      gpio: '40 pins (28 GPIO)',
      pwm: '2 channels',
      i2c: '2 interfaces',
      spi: '2 interfaces',
      uart: '4 interfaces',
      voltage: '3.3V GPIO, 5V power',
      usb: '2x USB 3.0, 2x USB 2.0',
      ethernet: 'Gigabit',
      wireless: 'WiFi 802.11ac, Bluetooth 5.0',
      video: 'Dual 4K HDMI output',
      os: 'Linux (Raspberry Pi OS, Ubuntu, etc.)',
      color: '#c92e3a'
    }
  },

  'raspberry-pi-zero-2w': {
    type: 'microcontroller',
    label: 'Pi Zero 2W',
    width: 80,
    height: 140,
    pins: [
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: -40, offsetY: -65 },
      { label: '5V', type: 'power', voltage: 5, offsetX: -40, offsetY: -52 },
      { label: 'GPIO2/SDA', type: 'digital', offsetX: -40, offsetY: -39 },
      { label: '5V', type: 'power', voltage: 5, offsetX: -40, offsetY: -26 },
      { label: 'GPIO3/SCL', type: 'digital', offsetX: -40, offsetY: -13 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -40, offsetY: 0 },
      { label: 'GPIO4', type: 'digital', offsetX: -40, offsetY: 13 },
      { label: 'GPIO17', type: 'digital', offsetX: -40, offsetY: 26 },
      { label: 'GPIO27', type: 'digital', offsetX: -40, offsetY: 39 },
      { label: 'GPIO22', type: 'digital', offsetX: -40, offsetY: 52 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: -40, offsetY: 65 },
      
      { label: '5V', type: 'power', voltage: 5, offsetX: 40, offsetY: -65 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 40, offsetY: -52 },
      { label: 'GPIO14/TX', type: 'digital', offsetX: 40, offsetY: -39 },
      { label: 'GPIO15/RX', type: 'digital', offsetX: 40, offsetY: -26 },
      { label: 'GPIO18/PWM', type: 'digital', offsetX: 40, offsetY: -13 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 40, offsetY: 0 },
      { label: 'GPIO23', type: 'digital', offsetX: 40, offsetY: 13 },
      { label: 'GPIO24', type: 'digital', offsetX: 40, offsetY: 26 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 40, offsetY: 39 },
      { label: 'GPIO25', type: 'digital', offsetX: 40, offsetY: 52 },
      { label: 'GPIO8/CE0', type: 'digital', offsetX: 40, offsetY: 65 }
    ],
    metadata: {
      processor: 'RP3A0, Quad-core ARM Cortex-A53 @ 1GHz',
      ram: '512MB LPDDR2',
      gpio: '40 pins',
      voltage: '3.3V GPIO, 5V power',
      wireless: 'WiFi 802.11n, Bluetooth 4.2',
      size: '65mm x 30mm',
      power: '~150mA typical',
      color: '#c92e3a'
    }
  },

  // ============================================================================
  // STM32 FAMILY (ARM Cortex-M)
  // ============================================================================

  'stm32f103c8t6-bluepill': {
    type: 'microcontroller',
    label: 'STM32 Blue Pill',
    width: 95,
    height: 160,
    pins: [
      // Left side
      { label: 'VBAT', type: 'power', voltage: 3.3, offsetX: -47, offsetY: -75 },
      { label: 'PC13', type: 'digital', offsetX: -47, offsetY: -60 },
      { label: 'PC14', type: 'digital', offsetX: -47, offsetY: -45 },
      { label: 'PC15', type: 'digital', offsetX: -47, offsetY: -30 },
      { label: 'NRST', type: 'digital', offsetX: -47, offsetY: -15 },
      { label: 'VDDA', type: 'power', voltage: 3.3, offsetX: -47, offsetY: 0 },
      { label: 'PA0', type: 'analog', offsetX: -47, offsetY: 15 },
      { label: 'PA1', type: 'analog', offsetX: -47, offsetY: 30 },
      { label: 'PA2', type: 'analog', offsetX: -47, offsetY: 45 },
      { label: 'PA3', type: 'analog', offsetX: -47, offsetY: 60 },
      { label: 'PA4', type: 'analog', offsetX: -47, offsetY: 75 },
      
      // Right side
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 47, offsetY: -75 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 47, offsetY: -60 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: 47, offsetY: -45 },
      { label: 'BOOT0', type: 'digital', offsetX: 47, offsetY: -30 },
      { label: 'PB11', type: 'digital', offsetX: 47, offsetY: -15 },
      { label: 'PB10', type: 'digital', offsetX: 47, offsetY: 0 },
      { label: 'PB1', type: 'analog', offsetX: 47, offsetY: 15 },
      { label: 'PB0', type: 'analog', offsetX: 47, offsetY: 30 },
      { label: 'PA7', type: 'analog', offsetX: 47, offsetY: 45 },
      { label: 'PA6', type: 'analog', offsetX: 47, offsetY: 60 },
      { label: 'PA5', type: 'analog', offsetX: 47, offsetY: 75 }
    ],
    metadata: {
      processor: 'STM32F103C8T6, ARM Cortex-M3 @ 72MHz',
      flash: '64KB',
      ram: '20KB',
      gpio: '37 pins',
      adc: '10x 12-bit (0-3.3V)',
      timers: '4x 16-bit',
      uart: '3',
      spi: '2',
      i2c: '2',
      usb: 'USB 2.0 Full Speed',
      voltage: '2.0V-3.6V',
      current: '~50mA @ 72MHz',
      programmer: 'ST-Link, UART bootloader',
      color: '#0066cc'
    }
  },

  'stm32f407-discovery': {
    type: 'microcontroller',
    label: 'STM32F4 Discovery',
    width: 110,
    height: 170,
    pins: [
      // Left side
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -55, offsetY: -80 },
      { label: 'VDD', type: 'power', voltage: 3.3, offsetX: -55, offsetY: -64 },
      { label: 'BOOT0', type: 'digital', offsetX: -55, offsetY: -48 },
      { label: 'PA0', type: 'analog', offsetX: -55, offsetY: -32 },
      { label: 'PA1', type: 'analog', offsetX: -55, offsetY: -16 },
      { label: 'PA2', type: 'analog', offsetX: -55, offsetY: 0 },
      { label: 'PA3', type: 'analog', offsetX: -55, offsetY: 16 },
      { label: 'PA4', type: 'analog', offsetX: -55, offsetY: 32 },
      { label: 'PA5', type: 'analog', offsetX: -55, offsetY: 48 },
      { label: 'PA6', type: 'analog', offsetX: -55, offsetY: 64 },
      { label: 'PA7', type: 'analog', offsetX: -55, offsetY: 80 },
      
      // Right side
      { label: '5V', type: 'power', voltage: 5, offsetX: 55, offsetY: -80 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 55, offsetY: -64 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: 55, offsetY: -48 },
      { label: 'PB0', type: 'analog', offsetX: 55, offsetY: -32 },
      { label: 'PB1', type: 'analog', offsetX: 55, offsetY: -16 },
      { label: 'PC0', type: 'analog', offsetX: 55, offsetY: 0 },
      { label: 'PC1', type: 'analog', offsetX: 55, offsetY: 16 },
      { label: 'PC2', type: 'analog', offsetX: 55, offsetY: 32 },
      { label: 'PC3', type: 'analog', offsetX: 55, offsetY: 48 },
      { label: 'PD0', type: 'digital', offsetX: 55, offsetY: 64 },
      { label: 'PD1', type: 'digital', offsetX: 55, offsetY: 80 }
    ],
    metadata: {
      processor: 'STM32F407VGT6, ARM Cortex-M4F @ 168MHz',
      flash: '1MB',
      ram: '192KB',
      fpu: 'Single-precision FPU',
      gpio: '82 pins',
      adc: '3x 12-bit, 24 channels',
      dac: '2x 12-bit',
      timers: '14 (16/32-bit)',
      uart: '6',
      spi: '3',
      i2c: '3',
      usb: 'OTG Full Speed',
      features: 'MEMS accelerometer, audio DAC, microphone, USB',
      color: '#003d7a'
    }
  },

  // ============================================================================
  // TEENSY FAMILY (High-Performance Arduino-Compatible)
  // ============================================================================

  'teensy-4.1': {
    type: 'microcontroller',
    label: 'Teensy 4.1',
    width: 85,
    height: 150,
    pins: [
      // Left side
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -42, offsetY: -70 },
      { label: '0/RX1', type: 'digital', offsetX: -42, offsetY: -56 },
      { label: '1/TX1', type: 'digital', offsetX: -42, offsetY: -42 },
      { label: '2', type: 'digital', offsetX: -42, offsetY: -28 },
      { label: '3/PWM', type: 'digital', offsetX: -42, offsetY: -14 },
      { label: '4/PWM', type: 'digital', offsetX: -42, offsetY: 0 },
      { label: '5/PWM', type: 'digital', offsetX: -42, offsetY: 14 },
      { label: '6/PWM', type: 'digital', offsetX: -42, offsetY: 28 },
      { label: '7/RX2', type: 'digital', offsetX: -42, offsetY: 42 },
      { label: '8/TX2', type: 'digital', offsetX: -42, offsetY: 56 },
      { label: '9/PWM', type: 'digital', offsetX: -42, offsetY: 70 },
      
      // Right side
      { label: 'VIN', type: 'power', voltage: 5, offsetX: 42, offsetY: -70 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: 42, offsetY: -56 },
      { label: '23/A9', type: 'analog', offsetX: 42, offsetY: -42 },
      { label: '22/A8', type: 'analog', offsetX: 42, offsetY: -28 },
      { label: '21/A7', type: 'analog', offsetX: 42, offsetY: -14 },
      { label: '20/A6', type: 'analog', offsetX: 42, offsetY: 0 },
      { label: '19/A5/SCL', type: 'analog', offsetX: 42, offsetY: 14 },
      { label: '18/A4/SDA', type: 'analog', offsetX: 42, offsetY: 28 },
      { label: '17/A3', type: 'analog', offsetX: 42, offsetY: 42 },
      { label: '16/A2', type: 'analog', offsetX: 42, offsetY: 56 },
      { label: '15/A1', type: 'analog', offsetX: 42, offsetY: 70 }
    ],
    metadata: {
      processor: 'ARM Cortex-M7 @ 600MHz',
      flash: '8MB',
      ram: '1MB (512KB + 512KB DMAMEM)',
      eeprom: '4KB emulated',
      gpio: '55 digital pins',
      pwm: '35 pins',
      analog: '18 pins (10-bit, 12-bit capable)',
      uart: '8',
      spi: '3',
      i2c: '3',
      can: '3 (CAN FD)',
      usb: 'USB 2.0 High Speed (480 Mbit/sec)',
      sdCard: 'Built-in SD card slot',
      ethernet: '10/100 Mbit (optional)',
      floatingPoint: 'Double precision FPU',
      dsp: 'DSP instructions',
      voltage: '3.3V I/O, 5V tolerant',
      color: '#00979d'
    }
  },

  'teensy-3.6': {
    type: 'microcontroller',
    label: 'Teensy 3.6',
    width: 85,
    height: 145,
    pins: [
      // Left side
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -42, offsetY: -68 },
      { label: '0/RX1', type: 'digital', offsetX: -42, offsetY: -54 },
      { label: '1/TX1', type: 'digital', offsetX: -42, offsetY: -40 },
      { label: '2', type: 'digital', offsetX: -42, offsetY: -26 },
      { label: '3/PWM', type: 'digital', offsetX: -42, offsetY: -12 },
      { label: '4/PWM', type: 'digital', offsetX: -42, offsetY: 2 },
      { label: '5/PWM', type: 'digital', offsetX: -42, offsetY: 16 },
      { label: '6/PWM', type: 'digital', offsetX: -42, offsetY: 30 },
      { label: '7/RX3', type: 'digital', offsetX: -42, offsetY: 44 },
      { label: '8/TX3', type: 'digital', offsetX: -42, offsetY: 58 },
      
      // Right side
      { label: 'VIN', type: 'power', voltage: 5, offsetX: 42, offsetY: -68 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: 42, offsetY: -54 },
      { label: 'A21', type: 'analog', offsetX: 42, offsetY: -40 },
      { label: 'A20', type: 'analog', offsetX: 42, offsetY: -26 },
      { label: 'A19', type: 'analog', offsetX: 42, offsetY: -12 },
      { label: 'A18', type: 'analog', offsetX: 42, offsetY: 2 },
      { label: 'A17', type: 'analog', offsetX: 42, offsetY: 16 },
      { label: 'A16', type: 'analog', offsetX: 42, offsetY: 30 },
      { label: 'A15', type: 'analog', offsetX: 42, offsetY: 44 },
      { label: 'A14', type: 'analog', offsetX: 42, offsetY: 58 }
    ],
    metadata: {
      processor: 'ARM Cortex-M4 @ 180MHz',
      flash: '1MB',
      ram: '256KB',
      gpio: '62 digital pins',
      analog: '25 pins (13-bit)',
      pwm: '22 pins',
      uart: '6',
      spi: '3',
      i2c: '4',
      can: '2',
      sdCard: 'Built-in',
      dac: '2x 12-bit',
      usb: 'USB 2.0 Full Speed',
      voltage: '3.3V (5V tolerant)',
      color: '#00979d'
    }
  },

  // ============================================================================
  // ADAFRUIT FEATHER ECOSYSTEM
  // ============================================================================

  'adafruit-feather-m4': {
    type: 'microcontroller',
    label: 'Feather M4',
    width: 75,
    height: 130,
    pins: [
      // Left side
      { label: 'RST', type: 'digital', offsetX: -37, offsetY: -60 },
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: -37, offsetY: -48 },
      { label: 'AREF', type: 'analog', offsetX: -37, offsetY: -36 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -37, offsetY: -24 },
      { label: 'A0', type: 'analog', offsetX: -37, offsetY: -12 },
      { label: 'A1', type: 'analog', offsetX: -37, offsetY: 0 },
      { label: 'A2', type: 'analog', offsetX: -37, offsetY: 12 },
      { label: 'A3', type: 'analog', offsetX: -37, offsetY: 24 },
      { label: 'A4', type: 'analog', offsetX: -37, offsetY: 36 },
      { label: 'A5', type: 'analog', offsetX: -37, offsetY: 48 },
      { label: 'SCK', type: 'digital', offsetX: -37, offsetY: 60 },
      
      // Right side
      { label: 'BAT', type: 'power', voltage: 3.7, offsetX: 37, offsetY: -60 },
      { label: 'EN', type: 'digital', offsetX: 37, offsetY: -48 },
      { label: 'USB', type: 'power', voltage: 5, offsetX: 37, offsetY: -36 },
      { label: '13', type: 'digital', offsetX: 37, offsetY: -24 },
      { label: '12', type: 'digital', offsetX: 37, offsetY: -12 },
      { label: '11', type: 'digital', offsetX: 37, offsetY: 0 },
      { label: '10', type: 'digital', offsetX: 37, offsetY: 12 },
      { label: '9', type: 'digital', offsetX: 37, offsetY: 24 },
      { label: '6', type: 'digital', offsetX: 37, offsetY: 36 },
      { label: '5', type: 'digital', offsetX: 37, offsetY: 48 },
      { label: 'SCL', type: 'digital', offsetX: 37, offsetY: 60 }
    ],
    metadata: {
      processor: 'ATSAMD51, ARM Cortex-M4 @ 120MHz',
      flash: '512KB',
      ram: '192KB',
      gpio: '21 GPIO',
      analog: '6x 12-bit ADC, 1x 10-bit DAC',
      pwm: '14 pins',
      uart: '2',
      spi: '1',
      i2c: '1',
      i2s: 'Digital audio',
      fpu: 'Floating point',
      battery: 'Built-in charger (LiPoly)',
      wireless: 'None (stackable with WiFi/BLE FeatherWings)',
      color: '#000000'
    }
  },

  // ============================================================================
  // PORTENTA & ARDUINO PRO
  // ============================================================================

  'arduino-portenta-h7': {
    type: 'microcontroller',
    label: 'Portenta H7',
    width: 90,
    height: 135,
    pins: [
      // Left side
      { label: '3.3V', type: 'power', voltage: 3.3, offsetX: -45, offsetY: -62 },
      { label: 'AVDD', type: 'power', voltage: 3.3, offsetX: -45, offsetY: -50 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: -45, offsetY: -38 },
      { label: 'PA0', type: 'analog', offsetX: -45, offsetY: -26 },
      { label: 'PA1', type: 'analog', offsetX: -45, offsetY: -14 },
      { label: 'PA4', type: 'analog', offsetX: -45, offsetY: -2 },
      { label: 'PA5', type: 'analog', offsetX: -45, offsetY: 10 },
      { label: 'PA6', type: 'analog', offsetX: -45, offsetY: 22 },
      { label: 'PA7', type: 'analog', offsetX: -45, offsetY: 34 },
      { label: 'PC0', type: 'analog', offsetX: -45, offsetY: 46 },
      { label: 'PC1', type: 'analog', offsetX: -45, offsetY: 58 },
      
      // Right side
      { label: '5V', type: 'power', voltage: 5, offsetX: 45, offsetY: -62 },
      { label: 'VIN', type: 'power', voltage: 5, offsetX: 45, offsetY: -50 },
      { label: 'GND', type: 'ground', voltage: 0, offsetX: 45, offsetY: -38 },
      { label: 'PB0', type: 'analog', offsetX: 45, offsetY: -26 },
      { label: 'PB1', type: 'analog', offsetX: 45, offsetY: -14 },
      { label: 'PC2', type: 'analog', offsetX: 45, offsetY: -2 },
      { label: 'PC3', type: 'analog', offsetX: 45, offsetY: 10 },
      { label: 'PC4', type: 'analog', offsetX: 45, offsetY: 22 },
      { label: 'PC5', type: 'analog', offsetX: 45, offsetY: 34 },
      { label: 'PD0', type: 'digital', offsetX: 45, offsetY: 46 },
      { label: 'PD1', type: 'digital', offsetX: 45, offsetY: 58 }
    ],
    metadata: {
      processor: 'STM32H747XI Dual Core',
      cores: 'Cortex-M7 @ 480MHz + Cortex-M4 @ 240MHz',
      flash: '2MB',
      ram: '1MB',
      sdram: '8MB',
      qspi: '16MB NOR Flash',
      gpu: 'Chrom-ART graphics accelerator',
      gpio: '76 pins',
      analog: '3x ADC 16-bit',
      dac: '2x 12-bit',
      usb: 'USB-C (OTG + Host)',
      ethernet: '10/100 Mbps',
      wireless: 'WiFi + BLE (Murata module)',
      crypto: 'Hardware crypto accelerator',
      camera: 'Parallel camera interface',
      audio: 'SAI (4x I2S)',
      video: 'MIPI DSI/CSI',
      features: 'MicroPython, TensorFlow Lite',
      color: '#00979c'
    }
  }
};
