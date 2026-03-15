/**
 * Component Tolerance & Real-World Variations
 * Models realistic component tolerances and manufacturing variations
 */

export interface ComponentTolerance {
  componentType: string;
  nominalValue: number;
  tolerance: number; // percentage
  minValue: number;
  maxValue: number;
  tempCoefficient?: number; // ppm/°C
  ageingRate?: number; // % per year
}

// Resistor tolerances (E-series standards)
export const RESISTOR_TOLERANCES: Record<string, ComponentTolerance> = {
  'tolerance-0.1%': {
    componentType: 'resistor',
    nominalValue: 1,
    tolerance: 0.1,
    minValue: 0.999,
    maxValue: 1.001,
    tempCoefficient: 25, // ppm/°C
    ageingRate: 0.1 // % per year
  },
  'tolerance-1%': {
    componentType: 'resistor',
    nominalValue: 1,
    tolerance: 1,
    minValue: 0.99,
    maxValue: 1.01,
    tempCoefficient: 100,
    ageingRate: 0.5
  },
  'tolerance-5%': {
    componentType: 'resistor',
    nominalValue: 1,
    tolerance: 5,
    minValue: 0.95,
    maxValue: 1.05,
    tempCoefficient: 200,
    ageingRate: 1
  }
};

// Capacitor tolerances
export const CAPACITOR_TOLERANCES: Record<string, ComponentTolerance> = {
  'tolerance-ceramic-10%': {
    componentType: 'capacitor-ceramic',
    nominalValue: 1,
    tolerance: 10,
    minValue: 0.9,
    maxValue: 1.1,
    tempCoefficient: 1000, // High TC for ceramic
    ageingRate: 2
  },
  'tolerance-film-5%': {
    componentType: 'capacitor-film',
    nominalValue: 1,
    tolerance: 5,
    minValue: 0.95,
    maxValue: 1.05,
    tempCoefficient: 200,
    ageingRate: 0.5
  },
  'tolerance-electrolytic-20%': {
    componentType: 'capacitor-electrolytic',
    nominalValue: 1,
    tolerance: 20,
    minValue: 0.8,
    maxValue: 1.2,
    tempCoefficient: 3000,
    ageingRate: 5 // Electrolytic capacitors age faster
  }
};

// LED tolerance
export const LED_TOLERANCE: ComponentTolerance = {
  componentType: 'led',
  nominalValue: 2.0, // Forward voltage
  tolerance: 10,
  minValue: 1.8,
  maxValue: 2.2,
  tempCoefficient: -2, // mV/°C (negative, voltage decreases with temp)
  ageingRate: 1
};

// MCU specifications with tolerances
export const MCU_TOLERANCES: Record<string, ComponentTolerance> = {
  'arduino-voltage': {
    componentType: 'mcu-voltage-regulator',
    nominalValue: 5.0,
    tolerance: 2,
    minValue: 4.9,
    maxValue: 5.1,
    tempCoefficient: 5,
    ageingRate: 0.2
  },
  'arduino-clock': {
    componentType: 'mcu-oscillator',
    nominalValue: 16.0, // MHz
    tolerance: 0.5, // PPM (0.5%)
    minValue: 15.92,
    maxValue: 16.08,
    tempCoefficient: 20, // PPM/°C
    ageingRate: 10 // PPM per year
  }
};

// Sensor tolerances
export const SENSOR_TOLERANCES: Record<string, ComponentTolerance> = {
  'hc-sr04-distance': {
    componentType: 'ultrasonic-distance',
    nominalValue: 100, // cm (example reading)
    tolerance: 3,
    minValue: 97,
    maxValue: 103,
    tempCoefficient: 0.3, // % per °C
    ageingRate: 2
  },
  'mpu6050-accel': {
    componentType: 'accelerometer',
    nominalValue: 1.0, // 1g
    tolerance: 2,
    minValue: 0.98,
    maxValue: 1.02,
    tempCoefficient: 50, // ppm/°C
    ageingRate: 1
  },
  'dht22-humidity': {
    componentType: 'humidity-sensor',
    nominalValue: 50, // % RH
    tolerance: 2,
    minValue: 49,
    maxValue: 51,
    tempCoefficient: 0.2,
    ageingRate: 1
  }
};

/**
 * Calculate actual component value with tolerance
 */
export function calculateActualValue(
  nominalValue: number,
  tolerance: number,
  variationPercent?: number // 0-100, where 50 = nominal
): number {
  const variation = variationPercent ?? Math.random() * 100;
  const percentFromNominal = (variation / 100) * 2 - 1; // -1 to +1
  const change = nominalValue * (tolerance / 100) * percentFromNominal;
  return nominalValue + change;
}

/**
 * Calculate component value with temperature coefficient
 */
export function calculateValueAtTemperature(
  nominalValue: number,
  referenceTemp: number = 25,
  actualTemp: number,
  tempCoefficient: number // ppm/°C or mV/°C
): number {
  const tempDelta = actualTemp - referenceTemp;
  
  if (tempCoefficient < 10) {
    // Probably in mV/°C (like LED forward voltage)
    return nominalValue + (tempCoefficient * tempDelta) / 1000;
  } else {
    // PPM/°C
    const ppmChange = tempCoefficient * tempDelta;
    return nominalValue * (1 + ppmChange / 1000000);
  }
}

/**
 * Calculate component aging effect
 */
export function calculateAgedValue(
  nominalValue: number,
  ageingRate: number, // % per year
  yearsInService: number
): number {
  const totalAgeingPercent = (ageingRate * yearsInService) / 100;
  return nominalValue * (1 - totalAgeingPercent);
}

/**
 * Simulate worst-case component values
 */
export function getWorstCaseValues(tolerance: ComponentTolerance): [number, number] {
  return [tolerance.minValue, tolerance.maxValue];
}

/**
 * Calculate circuit failure probability due to tolerances
 */
export function calculateFailureProbability(
  criticalValue: number,
  minAllowable: number,
  maxAllowable: number,
  tolerance: number,
  _sigma: number = 3 // 3-sigma = 99.7% confidence
): number {
  // Assumes normal distribution
  const nominalRange = maxAllowable - minAllowable;
  const toleranceRange = (tolerance / 100) * criticalValue;
  
  // Probability of being outside acceptable range
  if (toleranceRange > nominalRange / 2) {
    return Math.min(1, toleranceRange / nominalRange);
  }
  return 0;
}
