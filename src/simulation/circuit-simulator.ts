/**
 * Circuit Behavioral Simulator
 * Calculates actual voltages, currents, power consumption in real-time
 */

import { Scene } from '../types';

export interface CircuitSimulation {
  nodeVoltages: Map<string, number>;
  nodePower: Map<string, number>;
  pinCurrents: Map<string, number>;
  totalPower: number;
  totalCurrent: number;
  warnings: string[];
  errors: string[];
}

export class CircuitSimulator {
  /**
   * Simulate circuit behavior using nodal analysis
   */
  simulateCircuit(scene: Scene, supplyVoltage: number = 5): CircuitSimulation {
    const simulation: CircuitSimulation = {
      nodeVoltages: new Map(),
      nodePower: new Map(),
      pinCurrents: new Map(),
      totalPower: 0,
      totalCurrent: 0,
      warnings: [],
      errors: []
    };

    if (scene.nodes.length === 0) {
      simulation.warnings.push('No components in circuit');
      return simulation;
    }

    // Initialize node voltages (GND = 0V)
    scene.nodes.forEach(node => {
      if (node.type.includes('power') || node.metadata?.isPowerSource) {
        simulation.nodeVoltages.set(node.id, supplyVoltage);
      } else {
        simulation.nodeVoltages.set(node.id, supplyVoltage / 2); // Initial estimate
      }
    });

    // Simulate LED circuit
    scene.nodes.forEach(node => {
      if (node.type.startsWith('led')) {
        const ledVoltage = node.metadata?.voltage || 2.0;
        const ledCurrent = node.metadata?.current || 0.02; // 20mA default
        const ledPower = ledVoltage * ledCurrent * 1000; // mW

        simulation.nodeVoltages.set(node.id, ledVoltage);
        simulation.nodePower.set(node.id, ledPower);
        simulation.totalPower += ledPower;
        simulation.totalCurrent += ledCurrent * 1000; // mA

        // Check if resistor is in series
        const hasResistor = scene.connections.some(conn =>
          (conn.fromNodeId === node.id || conn.toNodeId === node.id) &&
          (scene.nodes.find(n => n.id === (conn.fromNodeId === node.id ? conn.toNodeId : conn.fromNodeId))?.type.includes('resistor'))
        );

        if (!hasResistor) {
          simulation.warnings.push(`LED ${node.label} connected without current-limiting resistor`);
        }
      }
    });

    // Simulate resistor power dissipation (P = V²/R or I²R)
    scene.nodes.forEach(node => {
      if (node.type.includes('resistor')) {
        const resistance = node.metadata?.resistance || 1000; // Ohms
        const appliedVoltage = (simulation.nodeVoltages.get(node.id) || 0);
        const power = (appliedVoltage * appliedVoltage) / resistance; // Watts

        simulation.nodePower.set(node.id, power * 1000); // Convert to mW
        simulation.totalPower += power * 1000;

        // Standard resistor power ratings: 1/4W, 1/2W, 1W, 2W
        const standardRatings = [0.25, 0.5, 1, 2];
        const requiredRating = standardRatings.find(r => power <= r);

        if (!requiredRating) {
          simulation.errors.push(`Resistor ${node.label} power (${(power * 1000).toFixed(0)}mW) exceeds 2W rating`);
        } else if (power > requiredRating * 0.8) {
          simulation.warnings.push(`Resistor ${node.label} operating near limit (${power}W of ${requiredRating}W)`);
        }
      }
    });

    // Simulate MCU power consumption
    scene.nodes.forEach(node => {
      if (node.type.includes('arduino') || node.type.includes('esp')) {
        const mcuPower = node.type.includes('esp') ? 80 : 50; // ESP32 uses more power
        simulation.nodePower.set(node.id, mcuPower);
        simulation.totalPower += mcuPower;
        simulation.totalCurrent += (mcuPower / supplyVoltage) * 1000; // mA
      }
    });

    // Simulate sensor power draw
    const sensorPowerMap: Record<string, number> = {
      'hc-sr04': 15, // mW
      'mpu6050': 35, // mW
      'dht22': 5, // mW average
      'fsr': 10, // mW
      'ina219': 8 // mW
    };

    scene.nodes.forEach(node => {
      for (const [sensorType, power] of Object.entries(sensorPowerMap)) {
        if (node.type.includes(sensorType)) {
          simulation.nodePower.set(node.id, power);
          simulation.totalPower += power;
          simulation.totalCurrent += (power / supplyVoltage) * 1000; // mA
        }
      }
    });

    // Check power budget violations
    if (simulation.totalCurrent > 500) {
      simulation.errors.push(`Total current (${simulation.totalCurrent.toFixed(0)}mA) exceeds typical USB supply (500mA)`);
    }

    // Check Arduino pin current limits
    const connectedDevices = scene.connections.length;
    if (connectedDevices > 64) {
      simulation.warnings.push(`Arduino cannot handle ${connectedDevices} simultaneous I2C/SPI connections`);
    }

    return simulation;
  }

  /**
   * Simulate voltage drop across wires and traces
   */
  calculateVoltageDrops(
    currentAmp: number,
    wireResistance: number // Ohms/meter
  ): number {
    return currentAmp * wireResistance;
  }

  /**
   * Calculate wire requirements for current carrying
   */
  getRequiredWireGauge(currentAmp: number, _allowableDrop: number = 0.5): string {
    // AWG wire table: current capacity at 60°C
    const wireGauges: Record<string, number> = {
      '26 AWG': 0.142,
      '24 AWG': 0.227,
      '22 AWG': 0.361,
      '20 AWG': 0.576,
      '18 AWG': 0.918,
      '16 AWG': 1.46,
      '14 AWG': 2.33
    };

    for (const [gauge, capacity] of Object.entries(wireGauges)) {
      if (currentAmp <= capacity) {
        return gauge;
      }
    }

    return 'Custom wire required';
  }
}

export const circuitSimulator = new CircuitSimulator();
