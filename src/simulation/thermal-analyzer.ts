/**
 * Thermal Analysis System
 * Calculates power dissipation, temperature rise, and validates thermal constraints
 */

export interface ThermalAnalysis {
  totalPowerDissipation: number; // mW
  peakComponentTemperature: number; // °C
  ambientTemperature: number; // °C
  thermalRisks: ThermalRisk[];
  heatSinkRequired: boolean;
  coolingRecommendations: string[];
}

export interface ThermalRisk {
  componentType: string;
  label: string;
  powerDissipation: number; // mW
  estimatedTemperature: number; // °C
  maxAllowedTemperature: number; // °C
  safetyMargin: number; // °C
  severity: 'safe' | 'warning' | 'critical';
}

// Thermal parameters for components
const THERMAL_SPECS: Record<string, { maxTemp: number; thetaJA: number }> = {
  'resistor-1/4w': {
    maxTemp: 155, // °C
    thetaJA: 500 // °C/W
  },
  'resistor-1/2w': {
    maxTemp: 155,
    thetaJA: 250
  },
  'resistor-1w': {
    maxTemp: 155,
    thetaJA: 125
  },
  'capacitor': {
    maxTemp: 105, // Electrolytic
    thetaJA: 200
  },
  'led': {
    maxTemp: 85,
    thetaJA: 400
  },
  'mcu': {
    maxTemp: 85,
    thetaJA: 180 // Typical for microcontrollers
  },
  'sensor': {
    maxTemp: 70,
    thetaJA: 250
  }
};

/**
 * Calculate thermal rise for a component
 * ΔT = P × θ_JA (power × junction-to-ambient thermal resistance)
 */
export function calculateTemperatureRise(
  powerDissipation: number, // Watts
  thermalResistance: number // °C/W
): number {
  return powerDissipation * thermalResistance * 1000; // Convert W to mW
}

/**
 * Get thermal specifications for a component type
 */
export function getThermalSpecs(componentType: string): { maxTemp: number; thetaJA: number } | null {
  return THERMAL_SPECS[componentType] || null;
}

/**
 * Perform complete thermal analysis
 */
export function analyzeThermal(
  componentPowers: Map<string, { type: string; power: number; count: number }>,
  ambientTemp: number = 25
): ThermalAnalysis {
  const analysis: ThermalAnalysis = {
    totalPowerDissipation: 0,
    peakComponentTemperature: ambientTemp,
    ambientTemperature: ambientTemp,
    thermalRisks: [],
    heatSinkRequired: false,
    coolingRecommendations: []
  };

  componentPowers.forEach(({ type, power, count }, label) => {
    const specs = getThermalSpecs(type);
    if (!specs) {
      return;
    }

    const totalPower = power * count;
    analysis.totalPowerDissipation += totalPower;

    // Calculate temperature rise
    const powerWatts = totalPower / 1000;
    const tempRise = calculateTemperatureRise(powerWatts, specs.thetaJA);
    const componentTemp = ambientTemp + tempRise;

    analysis.peakComponentTemperature = Math.max(analysis.peakComponentTemperature, componentTemp);

    // Determine risk level
    const safetyMargin = specs.maxTemp - componentTemp;
    let severity: 'safe' | 'warning' | 'critical' = 'safe';

    if (safetyMargin < 5) {
      severity = 'critical';
      analysis.heatSinkRequired = true;
    } else if (safetyMargin < 15) {
      severity = 'warning';
    }

    analysis.thermalRisks.push({
      componentType: type,
      label,
      powerDissipation: totalPower,
      estimatedTemperature: componentTemp,
      maxAllowedTemperature: specs.maxTemp,
      safetyMargin,
      severity
    });
  });

  // Generate recommendations
  generateThermalRecommendations(analysis);

  return analysis;
}

/**
 * Generate cooling recommendations based on analysis
 */
function generateThermalRecommendations(analysis: ThermalAnalysis): void {
  // Check total power
  if (analysis.totalPowerDissipation > 5000) {
    analysis.coolingRecommendations.push(
      `High total power dissipation (${(analysis.totalPowerDissipation / 1000).toFixed(2)}W): Consider active cooling (fan)`
    );
  }

  // Check peak temperature
  if (analysis.peakComponentTemperature > 70) {
    analysis.coolingRecommendations.push(
      'Peak temperature is high: Improve PCB thermal layout or add heatsinks'
    );
  }

  // Check for thermal runaway potential
  if (analysis.heatSinkRequired) {
    analysis.coolingRecommendations.push(
      'Critical thermal margin detected: Active heatsinks required for high-power components'
    );
    analysis.coolingRecommendations.push(
      'Use thermal paste (thermal conductivity 3-5 W/mK) for better contact'
    );
  }

  // Check ambient conditions
  if (analysis.ambientTemperature > 40) {
    analysis.coolingRecommendations.push(
      `High ambient temperature (${analysis.ambientTemperature}°C): Ensure adequate ventilation`
    );
  }

  // Recommend copper area for power dissipation
  if (analysis.totalPowerDissipation > 1000) {
    const requiredCopperArea = calculateRequiredCopperArea(analysis.totalPowerDissipation);
    analysis.coolingRecommendations.push(
      `Use large copper areas (${requiredCopperArea} mm²) for heat spreading`
    );
  }
}

/**
 * Calculate required copper area for heat dissipation
 * Area = P / (k × ΔT)
 * k ≈ 0.3 W/(mm² × °C) for 2oz copper in typical conditions
 */
export function calculateRequiredCopperArea(
  powerDissipation: number, // mW
  thermalGradient: number = 20 // °C acceptable rise
): number {
  const k = 0.3; // W/(mm²×°C)
  const powerWatts = powerDissipation / 1000;
  return Math.ceil(powerWatts / (k * thermalGradient));
}

/**
 * Calculate heatsink specifications
 */
export function calculateHeatSink(
  powerDissipation: number, // mW
  maxTemp: number, // °C
  ambientTemp: number = 25
): { requiredThetaJA: number; recommendedType: string } {
  const powerWatts = powerDissipation / 1000;
  const allowedRise = maxTemp - ambientTemp;
  const requiredThetaJA = allowedRise / powerWatts;

  let recommendedType = '';
  if (requiredThetaJA > 50) {
    recommendedType = 'Small passive (clip-on) heatsink';
  } else if (requiredThetaJA > 20) {
    recommendedType = 'Medium passive heatsink with thermal interface';
  } else if (requiredThetaJA > 10) {
    recommendedType = 'Large passive heatsink + thermal compound';
  } else {
    recommendedType = 'Active cooling required (fan + heatsink)';
  }

  return { requiredThetaJA, recommendedType };
}

/**
 * Check for thermal cycling issues
 * Component failure rate doubles every 10°C increase
 */
export function calculateThermalReliability(
  operatingTemp: number,
  ratedTemp: number = 70
): number {
  const tempDelta = operatingTemp - ratedTemp;
  // Failure rate multiplier based on Arrhenius model
  const multiplier = Math.pow(2, tempDelta / 10);
  // MTTF reduction factor
  return 1 / multiplier; // Returns fraction of rated MTTF
}

/**
 * Calculate power dissipation for wire gauge based on current
 */
export function calculateWireHeating(
  current: number, // Amperes
  wireLength: number, // meters
  wireGaugeAWG: number
): number {
  // Wire resistance by AWG at 20°C (copper)
  const wireResistancePerMeter: Record<number, number> = {
    26: 0.1596, // ohms/meter
    24: 0.1003,
    22: 0.0631,
    20: 0.0397,
    18: 0.0250,
    16: 0.0157,
    14: 0.0099
  };

  const resistance = (wireResistancePerMeter[wireGaugeAWG] || 0.1) * wireLength;
  const powerDissipation = Math.pow(current, 2) * resistance * 1000; // Convert to mW
  return powerDissipation;
}

/**
 * Suggest wire gauge for thermal considerations
 */
export function getOptimalWireGauge(
  current: number, // Amperes
  wireLength: number, // meters
  maxTempRise: number = 10 // °C acceptable temperature rise
): number {
  for (let gauge of [14, 16, 18, 20, 22, 24, 26]) {
    const heating = calculateWireHeating(current, wireLength, gauge);
    // Rough estimate: 0.1 W per meter causes ~10°C rise in typical circuit
    const tempRise = (heating / 1000) / wireLength;
    if (tempRise <= maxTempRise) {
      return gauge;
    }
  }
  return 14; // Maximum recommended gauge
}
