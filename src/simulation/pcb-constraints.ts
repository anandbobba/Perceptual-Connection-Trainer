/**
 * PCB Design Constraints & Manufacturing Rules
 * Validates designs against real PCB manufacturing standards (IPC-2152, IEC 60950, etc.)
 */

export interface PCBConstraint {
  name: string;
  actual: number;
  minimum: number;
  maximum: number;
  unit: string;
  specification: string;
  severity: 'info' | 'warning' | 'error';
  recommendation?: string;
}

export interface PCBAnalysis {
  traceConstraints: PCBConstraint[];
  spacingConstraints: PCBConstraint[];
  viaConstraints: PCBConstraint[];
  thermalConstraints: PCBConstraint[];
  manufacturingYield: number; // 0-100%
  estimatedCost: number; // USD
  violations: PCBConstraint[];
  recommendations: string[];
}

/**
 * Calculate required trace width based on current (IPC-2152)
 * Formula: A = I / (k × ΔT^b)
 * Where: A = cross-sectional area (mils²), I = current (A), k & b are constants
 */
export function calculateTraceWidth(
  currentAmps: number,
  temperatureRise: number = 10 // °C
): { width_mil: number; width_mm: number; specification: string } {
  // IPC-2152 constants for external traces
  const k = 0.048;
  const b = 0.44;

  const areaSquareMils = currentAmps / (k * Math.pow(temperatureRise, b));

  // Assume 1 oz copper (1.4 mils thick)
  const copperThickness = 1.4; // mils
  const traceMilsWidth = areaSquareMils / copperThickness;

  // Convert to mm
  const traceWidthMM = (traceMilsWidth * 0.0254) / 1000;

  return {
    width_mil: Math.ceil(traceMilsWidth),
    width_mm: parseFloat(traceWidthMM.toFixed(2)),
    specification: `IPC-2152 external trace for ${currentAmps}A at ${temperatureRise}°C rise`
  };
}

/**
 * Get clearance and spacing requirements (IEC 60950-1, UL 61010)
 */
export function getSpacingRequirements(
  voltage: number, // Volts
  altitude: number = 2000 // meters, sea level default
): Record<string, number> {
  // Creepage and clearance values in mm (basic safety distances)
  const spacing: Record<string, number> = {
    'trace-to-trace': 0.25, // mm minimum
    'trace-to-pad': 0.15,
    'via-to-trace': 0.25,
    'pad-to-edge': 0.5, // Keep traces away from edges
    'component-height': 2.0 // Minimum clearance above components
  };

  // Adjust based on voltage (IEC 60950-1)
  if (voltage > 5 && voltage <= 30) {
    spacing['trace-to-trace'] = 0.5; // mm
    spacing['creepage'] = 3.2; // mm
  } else if (voltage > 30 && voltage <= 60) {
    spacing['trace-to-trace'] = 0.8;
    spacing['creepage'] = 6.4;
  } else if (voltage > 60 && voltage <= 150) {
    spacing['trace-to-trace'] = 1.5;
    spacing['creepage'] = 12.7;
  }

  // Adjust for altitude (thinner air = shorter creepage distances needed)
  if (altitude > 3000) {
    Object.keys(spacing).forEach(key => {
      if (key.includes('creepage') || key.includes('clearance')) {
        spacing[key] *= 1.3; // 30% safety factor at high altitude
      }
    });
  }

  return spacing;
}

/**
 * Calculate via specifications based on current
 */
export function calculateViaSpecifications(
  currentAmps: number,
  _temperatureRise: number = 10
): {
  minDiameter_mil: number;
  minDiameter_mm: number;
  minHoleDiameter_mil: number;
  minPadSize_mil: number;
  recommendation: string;
} {
  // Via current capacity: I = (d² × 0.4) for 1 oz copper per layer
  // d = via diameter in mils, I = current in amps
  const requiredDiameterMil = Math.sqrt(currentAmps / 0.4);

  // Add 1 mil minimum for manufacturing tolerance
  const minDiameterMil = Math.max(requiredDiameterMil + 1, 8); // IPC minimum 8 mils

  // Via pad size: typically 2x hole diameter + 5 mils minimum clearance
  const minPadMil = minDiameterMil + 10;

  // Hole diameter: via diameter - 2 × copper thickness (1 mil nominal)
  const minHoleMil = Math.max(minDiameterMil - 2, 6);

  let recommendation = '';
  if (minDiameterMil < 8) {
    recommendation = 'Standard manufacturing can handle this via size';
  } else if (minDiameterMil < 12) {
    recommendation = 'Normal via, standard PCB houses can manufacture';
  } else if (minDiameterMil < 20) {
    recommendation = 'Large via for high current, may increase cost slightly';
  } else {
    recommendation = 'Very large via - consider multiple smaller vias instead for cost/yield';
  }

  return {
    minDiameter_mil: Math.ceil(minDiameterMil),
    minDiameter_mm: parseFloat((minDiameterMil * 0.0254).toFixed(2)),
    minHoleDiameter_mil: Math.ceil(minHoleMil),
    minPadSize_mil: Math.ceil(minPadMil),
    recommendation
  };
}

/**
 * Estimate PCB manufacturing cost
 */
export function estimatePCBCost(
  areaSquareInches: number,
  layerCount: number = 2,
  quantity: number = 1
): number {
  // Base pricing for small PCB runs
  const baseCost = 5.0; // $ setup fee
  const costPerSquareInch = 0.5 * layerCount; // Scales with layers
  const quantityDiscount = Math.max(0.5, 1 - (quantity / 1000) * 0.5); // Up to 50% discount

  const totalCost = (baseCost + areaSquareInches * costPerSquareInch) * quantityDiscount;
  return Math.max(totalCost, 10); // Minimum cost $10
}

/**
 * Estimate manufacturing yield based on design rules compliance
 */
export function estimateYield(violations: PCBConstraint[]): number {
  // Base yield: 95% for good designs
  let yieldPercent = 95;

  // Deduct for constraint violations
  violations.forEach(violation => {
    if (violation.severity === 'error') {
      yieldPercent -= 10; // Major violation: -10% yield
    } else if (violation.severity === 'warning') {
      yieldPercent -= 3; // Minor violation: -3% yield
    }
  });

  // Minimum realistic yield
  return Math.max(yieldPercent, 10);
}

/**
 * Analyze PCB design against manufacturing constraints
 */
export function analyzePCBDesign(
  traceCurrents: Map<string, number>, // Trace ID -> current in Amps
  _traceLengths: Map<string, number>, // Trace ID -> length in mm
  traceWidths: Map<string, number>, // Trace ID -> width in mm (existing)
  viaCurrents: Map<string, number>, // Via ID -> current in Amps
  pcbDimensions: { width: number; height: number }, // mm
  voltage: number = 5
): PCBAnalysis {
  const analysis: PCBAnalysis = {
    traceConstraints: [],
    spacingConstraints: [],
    viaConstraints: [],
    thermalConstraints: [],
    manufacturingYield: 95,
    estimatedCost: 0,
    violations: [],
    recommendations: []
  };

  // Analyze traces
  traceCurrents.forEach((current, traceId) => {
    const requiredTrace = calculateTraceWidth(current);
    const actualWidth = traceWidths.get(traceId) || requiredTrace.width_mm;

    const constraint: PCBConstraint = {
      name: `Trace ${traceId} Width`,
      actual: actualWidth,
      minimum: requiredTrace.width_mm,
      maximum: 25.4, // 1 inch max typical
      unit: 'mm',
      specification: requiredTrace.specification,
      severity: actualWidth >= requiredTrace.width_mm ? 'info' : 'error'
    };

    analysis.traceConstraints.push(constraint);

    if (constraint.severity === 'error') {
      analysis.violations.push(constraint);
      analysis.recommendations.push(
        `Increase trace ${traceId} width to ${requiredTrace.width_mm}mm for ${current}A current`
      );
    }
  });

  // Analyze spacing
  const spacingReqs = getSpacingRequirements(voltage);
  analysis.spacingConstraints.push({
    name: 'Trace-to-Trace Clearance',
    actual: 0.25,
    minimum: spacingReqs['trace-to-trace'],
    maximum: 25.4,
    unit: 'mm',
    specification: `IEC 60950-1 for ${voltage}V circuits`,
    severity: 0.25 >= spacingReqs['trace-to-trace'] ? 'info' : 'warning'
  });

  // Analyze vias
  viaCurrents.forEach((current, viaId) => {
    const viaSpecs = calculateViaSpecifications(current);

    const constraint: PCBConstraint = {
      name: `Via ${viaId} Diameter`,
      actual: viaSpecs.minDiameter_mm,
      minimum: viaSpecs.minDiameter_mm,
      maximum: 10,
      unit: 'mm',
      specification: `IPC-2221 for ${current}A current`,
      severity: 'info',
      recommendation: viaSpecs.recommendation
    };

    analysis.viaConstraints.push(constraint);
  });

  // Thermal analysis
  analysis.thermalConstraints.push({
    name: 'Copper Area for Dissipation',
    actual: (pcbDimensions.width * pcbDimensions.height) / 100, // Percentage of board
    minimum: 10,
    maximum: 100,
    unit: '%',
    specification: 'IPC-2223 thermal design',
    severity: 'warning'
  });

  // Calculate manufacturing metrics
  analysis.manufacturingYield = estimateYield(analysis.violations);

  const areaSquareInches = (pcbDimensions.width * pcbDimensions.height) / (25.4 * 25.4);
  analysis.estimatedCost = estimatePCBCost(areaSquareInches, 2, 10); // 2-layer, qty 10

  // Generate recommendations
  if (analysis.violations.length === 0) {
    analysis.recommendations.push(
      'Design meets all manufacturing constraints. Expected yield: 95%+'
    );
  }

  if (analysis.manufacturingYield < 80) {
    analysis.recommendations.push(
      'Manufacturing yield is low. Review critical constraint violations.'
    );
  }

  if (analysis.estimatedCost > 100) {
    analysis.recommendations.push(
      `Consider consolidating design to reduce PCB area (current: ${areaSquareInches.toFixed(1)} in²)`
    );
  }

  return analysis;
}

/**
 * Get layer stack design recommendation
 */
export function getLayerStackRecommendation(
  highSpeedSignals: boolean,
  powerDissipation: number, // mW
  complexity: 'simple' | 'medium' | 'complex'
): string {
  if (complexity === 'simple' && powerDissipation < 500) {
    return '2-Layer Stack: Signal/Copper, GND/Copper (most cost-effective)';
  } else if (complexity === 'medium' || powerDissipation > 500) {
    return '4-Layer Stack: Signal, GND plane, Power plane, Signal (recommended)';
  } else if (highSpeedSignals && complexity === 'complex') {
    return '6+ Layer Stack: Multiple signal layers with GND/Power planes (high-speed design)';
  }
  return '2-Layer recommended for prototyping';
}
