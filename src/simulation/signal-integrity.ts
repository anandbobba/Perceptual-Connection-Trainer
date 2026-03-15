/**
 * Signal Integrity Analysis
 * Validates timing, rise/fall times, impedance matching, and high-speed signal quality
 */

export interface SignalIntegrityAnalysis {
  signalConstraints: SignalConstraint[];
  timingAnalysis: TimingAnalysis;
  impedanceAnalysis: ImpedanceAnalysis;
  noiseAnalysis: NoiseAnalysis;
  violations: SignalConstraint[];
  recommendations: string[];
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
}

export interface SignalConstraint {
  name: string;
  actual: number;
  minimum?: number;
  maximum?: number;
  unit: string;
  specification: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  tolerance?: number;
}

export interface TimingAnalysis {
  propagationDelay: number; // ns
  riseTime: number; // ns
  fallTime: number; // ns
  setupTime: number; // ns
  holdTime: number; // ns
  clockFrequency: number; // MHz
  timingMargin: number; // %
  metastabilityRisk: 'safe' | 'warning' | 'critical';
}

export interface ImpedanceAnalysis {
  characteristicImpedance: number; // ohms
  sourceImpedance: number; // ohms
  loadImpedance: number; // ohms
  impedanceMismatch: number; // %
  reflectionCoefficient: number; // 0-1
  reflectionLoss: number; // dB
  matching: 'matched' | 'acceptable' | 'poor' | 'critical';
}

export interface NoiseAnalysis {
  crossTalk: number; // % of signal amplitude
  groundBounce: number; // mV
  EMI: number; // dB
  noiseMeasure: number; // 0-100 quality score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Calculate propagation delay in PCB traces
 * Velocity Factor: VF = 0.66 for typical FR4
 * Delay = Distance / (VF × c)
 */
export function calculatePropagationDelay(
  traceLength: number, // mm
  velocityFactor: number = 0.66,
  dielectricConstant: number = 4.5
): number {
  const c = 300; // Speed of light in mm/ns
  const vf = velocityFactor || Math.sqrt(1 / dielectricConstant);
  return traceLength / (vf * c); // Result in ns
}

/**
 * Calculate rise/fall time from driver characteristics
 * Typical for digital signals: rise time depends on driver output impedance and load capacitance
 */
export function calculateRiseTime(
  driverOutputImpedance: number, // ohms
  loadCapacitance: number, // pF
  _voltage: number = 3.3 // V
): number {
  // Rise time ≈ 2.2 × R × C (10% to 90% of voltage swing)
  // Using simplified RC time constant
  const riseTime = 2.2 * driverOutputImpedance * (loadCapacitance / 1e12) * 1e9; // Convert to ns
  return Math.max(riseTime, 0.1); // Minimum realistic rise time
}

/**
 * Validate timing constraints for synchronous circuits
 * Setup and hold times are spec'd by component datasheets
 */
export function validateTimingConstraints(
  clockPeriod: number, // ns
  propagationDelay: number, // ns
  setupTime: number, // ns (from datasheet)
  holdTime: number, // ns (from datasheet)
  riseTime: number // ns
): TimingAnalysis {
  const clockFrequency = 1000 / clockPeriod; // MHz

  // Total required time: setup + hold + propagation delay
  const requiredTime = setupTime + holdTime + propagationDelay + riseTime;
  const timingMargin = ((clockPeriod - requiredTime) / clockPeriod) * 100;

  // Metastability risk: if margin < 0, increased metastability risk
  let metastabilityRisk: 'safe' | 'warning' | 'critical' = 'safe';
  if (timingMargin < 10) {
    metastabilityRisk = 'warning';
  }
  if (timingMargin < 0) {
    metastabilityRisk = 'critical';
  }

  return {
    propagationDelay,
    riseTime,
    fallTime: riseTime, // Assume symmetric
    setupTime,
    holdTime,
    clockFrequency,
    timingMargin: Math.max(timingMargin, 0),
    metastabilityRisk
  };
}

/**
 * Calculate characteristic impedance of trace
 * Microstrip: Z0 = (87 / sqrt(Er + 1.41)) × ln(5.98 × h / (0.8 × w))
 * Where: w = trace width, h = height above ground plane, Er = dielectric constant
 */
export function calculateCharacteristicImpedance(
  traceWidth: number, // mm
  traceHeight: number, // mm
  dielectricConstant: number = 4.5,
  _copperThickness: number = 0.0356 // mm (1 oz copper)
): number {
  // Microstrip formula
  const w = traceWidth;
  const h = traceHeight;
  const Er = dielectricConstant;

  // Effective dielectric constant for microstrip
  const Eeff = (Er + 1) / 2 + ((Er - 1) / 2) * (1 / Math.sqrt(1 + 12 * h / w));

  // Characteristic impedance
  const Z0 = (87 / Math.sqrt(Eeff + 1.41)) * Math.log(5.98 * h / (0.8 * w));

  return Math.max(Math.min(Z0, 200), 20); // Typical range 20-200 ohms
}

/**
 * Calculate impedance mismatch and reflections
 * Reflection coefficient: Γ = (ZL - Z0) / (ZL + Z0)
 * Reflection loss: Return loss = -20 × log10(|Γ|) dB
 */
export function analyzeImpedanceMatching(
  characteristicZ: number,
  sourceZ: number,
  loadZ: number
): ImpedanceAnalysis {
  // Reflection coefficient from load
  const reflectionCoeff = Math.abs((loadZ - characteristicZ) / (loadZ + characteristicZ));

  // Return loss in dB (lower is better, >20dB is good)
  const returnLoss = -20 * Math.log10(reflectionCoeff);

  // Impedance mismatch percentage
  const mismatch = Math.abs(characteristicZ - loadZ) / characteristicZ * 100;

  // Determine matching quality
  let matching: 'matched' | 'acceptable' | 'poor' | 'critical';
  if (returnLoss > 30) {
    matching = 'matched';
  } else if (returnLoss > 20) {
    matching = 'acceptable';
  } else if (returnLoss > 10) {
    matching = 'poor';
  } else {
    matching = 'critical';
  }

  return {
    characteristicImpedance: characteristicZ,
    sourceImpedance: sourceZ,
    loadImpedance: loadZ,
    impedanceMismatch: mismatch,
    reflectionCoefficient: reflectionCoeff,
    reflectionLoss: Math.max(returnLoss, 0),
    matching
  };
}

/**
 * Estimate crosstalk between adjacent traces
 * Crosstalk depends on: length, spacing, dielectric
 */
export function calculateCrossTalk(
  traceSpacing: number, // mm between traces
  traceLength: number, // mm
  traceWidth: number, // mm
  _signalVoltage: number = 3.3, // V
  riseTime: number = 1 // ns
): number {
  // Coupling capacitance roughly: C ≈ εr × ε0 × L / ln(2×spacing/traceWidth)
  // Crosstalk voltage: V ≈ Cd/Ct × dV/dt × (length factor)

  // Simplified: crosstalk decreases exponentially with spacing
  const spacingRatio = traceSpacing / traceWidth;
  const couplingFactor = Math.exp(-1.5 * spacingRatio); // Empirical factor

  // Crosstalk as percentage of signal amplitude
  const crosstalkPercent = couplingFactor * (traceLength / 100) * (1 / riseTime) * 100;

  return Math.max(0, Math.min(crosstalkPercent, 100));
}

/**
 * Estimate ground bounce
 * Ground bounce occurs when many outputs switch simultaneously
 */
export function calculateGroundBounce(
  switchingCurrents: number[], // mA
  groundPlaneInductance: number = 0.1, // nH (via inductance to ground)
  switchingTime: number = 1 // ns (rise time)
): number {
  const totalCurrent = switchingCurrents.reduce((a, b) => a + b, 0) / 1000; // Convert to A
  const dI_dt = totalCurrent / switchingTime; // A/ns

  // Ground bounce voltage: V = L × dI/dt
  const bounceVoltage = groundPlaneInductance * dI_dt;

  return Math.min(bounceVoltage * 1000, 3300); // Return in mV, cap at 3.3V
}

/**
 * Estimate EMI radiation
 * EMI increases with: frequency, loop area, current
 */
export function calculateEMI(
  frequency: number, // MHz
  loopArea: number, // mm²
  currentAmplitude: number // mA
): number {
  // EMI radiation level (dBμV/m) - simplified estimate
  // Higher frequency = more EMI, larger loop area = more EMI

  const frequencyGHz = frequency / 1000;
  const loopAreaCm2 = loopArea / 100;

  // Approximate EMI level at 10m distance
  const emiLevel = 20 + 20 * Math.log10(frequencyGHz) + 10 * Math.log10(loopAreaCm2) + 20 * Math.log10(currentAmplitude / 100);

  return Math.max(emiLevel, 0);
}

/**
 * Perform comprehensive signal integrity analysis
 */
export function analyzeSignalIntegrity(
  traceLength: number, // mm
  traceWidth: number, // mm
  frequency: number, // MHz
  voltage: number = 3.3, // V
  riseTime: number = 1, // ns
  spacing: number = 0.5 // mm to adjacent traces
): SignalIntegrityAnalysis {
  const analysis: SignalIntegrityAnalysis = {
    signalConstraints: [],
    timingAnalysis: {
      propagationDelay: 0,
      riseTime: 0,
      fallTime: 0,
      setupTime: 2, // Typical
      holdTime: 1, // Typical
      clockFrequency: frequency,
      timingMargin: 0,
      metastabilityRisk: 'safe'
    },
    impedanceAnalysis: {
      characteristicImpedance: 0,
      sourceImpedance: 50,
      loadImpedance: 10000,
      impedanceMismatch: 0,
      reflectionCoefficient: 0,
      reflectionLoss: 0,
      matching: 'acceptable'
    },
    noiseAnalysis: {
      crossTalk: 0,
      groundBounce: 0,
      EMI: 0,
      noiseMeasure: 100,
      riskLevel: 'low'
    },
    violations: [],
    recommendations: [],
    overallQuality: 'excellent'
  };

  // Calculate timing
  const propDelay = calculatePropagationDelay(traceLength);
  const calcRiseTime = calculateRiseTime(50, 10);
  const clockPeriod = 1000 / frequency;

  analysis.timingAnalysis = validateTimingConstraints(
    clockPeriod,
    propDelay,
    2,
    1,
    calcRiseTime
  );

  // Calculate impedance
  const z0 = calculateCharacteristicImpedance(traceWidth, 0.2);
  analysis.impedanceAnalysis = analyzeImpedanceMatching(z0, 50, 10000);

  // Calculate noise
  analysis.noiseAnalysis.crossTalk = calculateCrossTalk(spacing, traceLength, traceWidth, voltage, riseTime);
  analysis.noiseAnalysis.groundBounce = calculateGroundBounce([100]);
  analysis.noiseAnalysis.EMI = calculateEMI(frequency, traceLength * traceWidth, 100);

  // Noise measure combines all effects
  analysis.noiseAnalysis.noiseMeasure = Math.max(
    0,
    100 - analysis.noiseAnalysis.crossTalk - (analysis.noiseAnalysis.groundBounce / 33) - (analysis.noiseAnalysis.EMI / 10)
  );

  // Determine overall quality
  let quality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical' = 'excellent';

  if (analysis.timingAnalysis.metastabilityRisk === 'critical') {
    quality = 'critical';
    analysis.violations.push({
      name: 'Metastability Risk',
      actual: analysis.timingAnalysis.timingMargin,
      minimum: 10,
      unit: '%',
      specification: 'Timing margin must be >10% for reliable operation',
      severity: 'critical'
    });
  }

  if (analysis.impedanceAnalysis.matching === 'critical') {
    quality = 'critical';
  }

  if (analysis.noiseAnalysis.noiseMeasure < 50) {
    quality = 'poor';
  } else if (analysis.noiseAnalysis.noiseMeasure < 75) {
    quality = 'acceptable';
  } else if (analysis.noiseAnalysis.noiseMeasure < 90) {
    quality = 'good';
  }

  analysis.overallQuality = quality;

  // Generate recommendations
  if (analysis.impedanceAnalysis.matching === 'poor') {
    analysis.recommendations.push(
      `Add series termination resistor (${(z0 - 50).toFixed(0)}Ω) to improve impedance matching`
    );
  }

  if (analysis.noiseAnalysis.crossTalk > 10) {
    analysis.recommendations.push(
      `Increase trace spacing to ${(spacing * 1.5).toFixed(2)}mm to reduce crosstalk (currently ${analysis.noiseAnalysis.crossTalk.toFixed(1)}%)`
    );
  }

  if (analysis.timingAnalysis.metastabilityRisk !== 'safe') {
    analysis.recommendations.push(
      'Timing margin is critical. Consider lower clock frequency or shorter trace lengths.'
    );
  }

  return analysis;
}
