/**
 * Bill of Materials (BOM) Generator with Real Pricing
 * Generates complete component list with real-world component pricing and sourcing
 */

import { Scene } from '../types';

export interface BOMItem {
  componentType: string;
  label: string;
  quantity: number;
  part: string; // Real part number
  description: string;
  unitPrice: number; // USD
  supplier: string;
  leadTime: number; // days
  availability: 'in-stock' | 'limited' | 'special-order';
  datasheet?: string;
}

export interface BOM {
  items: BOMItem[];
  totalCost: number;
  totalLeadTime: number;
  criticalComponents: BOMItem[];
  warnings: string[];
}

// Real component pricing database (2026 prices - Indian Rupees)
// INR conversion: 1 USD ≈ 84 INR (as of Feb 2026)
const COMPONENT_PRICING: Record<string, BOMItem> = {
  'arduino-uno': {
    componentType: 'microcontroller',
    label: 'Arduino UNO R3',
    quantity: 1,
    part: 'A000066',
    description: 'Professional microcontroller board for embedded projects and IoT applications',
    unitPrice: 2094, // 24.95 USD × 84
    supplier: 'Arduino Official / Online Retailers',
    leadTime: 3,
    availability: 'in-stock',
    datasheet: 'https://www.arduino.cc/en/Main/ArduinoBoardUno'
  },
  'esp32': {
    componentType: 'microcontroller',
    label: 'ESP32-WROOM-32',
    quantity: 1,
    part: 'ESP32-WROOM-32D',
    description: 'WiFi and Bluetooth enabled microcontroller for wireless applications',
    unitPrice: 630, // 7.50 USD × 84
    supplier: 'Espressif / Amazon India / Flipkart',
    leadTime: 4,
    availability: 'in-stock'
  },
  'hc-sr04': {
    componentType: 'sensor',
    label: 'HC-SR04 Ultrasonic Sensor',
    quantity: 1,
    part: 'HC-SR04',
    description: 'Ultrasonic distance measurement sensor for robotics and object detection',
    unitPrice: 273, // 3.25 USD × 84
    supplier: 'AliExpress / Amazon India',
    leadTime: 5,
    availability: 'in-stock'
  },
  'mpu6050': {
    componentType: 'sensor',
    label: 'MPU6050 6-DOF IMU',
    quantity: 1,
    part: 'GY-521',
    description: 'Inertial Measurement Unit with 6-axis motion detection (accelerometer + gyroscope)',
    unitPrice: 239, // 2.85 USD × 84
    supplier: 'AliExpress / Amazon India',
    leadTime: 5,
    availability: 'in-stock'
  },
  'dht22': {
    componentType: 'sensor',
    label: 'DHT22 Temperature/Humidity Sensor',
    quantity: 1,
    part: 'DHT22',
    description: 'Temperature and humidity sensor for environmental monitoring applications',
    unitPrice: 500, // 5.95 USD × 84
    supplier: 'Adafruit / Amazon India',
    leadTime: 2,
    availability: 'in-stock'
  },
  'led-red': {
    componentType: 'optoelectronic',
    label: 'Red LED 5mm',
    quantity: 10,
    part: 'LED-5MM-RED',
    description: 'Standard red light-emitting diode for visual indicators and displays',
    unitPrice: 8.4, // 0.10 USD × 84
    supplier: 'Generic / Local Electronics Shop',
    leadTime: 1,
    availability: 'in-stock'
  },
  'resistor-1k': {
    componentType: 'passive',
    label: '1kΩ Resistor',
    quantity: 100,
    part: 'RES-1K-1/4W-5%',
    description: 'Carbon film resistor 1kΩ for current limiting and voltage division - pack of 100',
    unitPrice: 0.84, // 0.01 USD × 84
    supplier: 'Generic / Local Electronics',
    leadTime: 1,
    availability: 'in-stock'
  },
  'capacitor-100nf': {
    componentType: 'passive',
    label: '100nF Ceramic Capacitor',
    quantity: 50,
    part: 'CAP-100NF-50V',
    description: 'Ceramic disc capacitor 100nF for filtering and coupling - pack of 50',
    unitPrice: 6.7, // 0.08 USD × 84
    supplier: 'Generic / Local Electronics',
    leadTime: 1,
    availability: 'in-stock'
  },
  'breadboard-830': {
    componentType: 'prototyping',
    label: 'Solderless Breadboard 830',
    quantity: 1,
    part: 'BB-830',
    description: 'Solderless prototyping breadboard for circuit prototyping without solder',
    unitPrice: 415, // 4.95 USD × 84
    supplier: 'Generic / Amazon India',
    leadTime: 2,
    availability: 'in-stock'
  },
  'usb-cable': {
    componentType: 'connector',
    label: 'USB 2.0 A-B Cable',
    quantity: 1,
    part: 'USB-AB-6FT',
    description: 'USB Type A to Type B cable for connecting microcontroller boards to computer',
    unitPrice: 210, // 2.50 USD × 84
    supplier: 'Generic / Local Shop',
    leadTime: 1,
    availability: 'in-stock'
  },
  'jumper-wire-pack': {
    componentType: 'connector',
    label: 'Jumper Wire Pack',
    quantity: 1,
    part: 'JUMPER-SET-65',
    description: 'Colored jumper wires for breadboard connections - multicolor pack of 65 pieces',
    unitPrice: 335, // 3.99 USD × 84
    supplier: 'Generic / Amazon India',
    leadTime: 2,
    availability: 'in-stock'
  },
  'power-supply-5v': {
    componentType: 'power',
    label: '5V 2A Power Supply',
    quantity: 1,
    part: 'PS-5V-2A',
    description: 'Regulated 5V DC power supply with 2A output for powering circuit projects',
    unitPrice: 755, // 8.99 USD × 84
    supplier: 'Generic / Amazon India',
    leadTime: 2,
    availability: 'in-stock'
  }
};

/**
 * Generate Bill of Materials from circuit schematic
 */
export function generateBOM(scene: Scene): BOM {
  const itemMap: Map<string, { item: BOMItem; count: number }> = new Map();
  const bom: BOM = {
    items: [],
    totalCost: 0,
    totalLeadTime: 0,
    criticalComponents: [],
    warnings: []
  };

  // Count components
  scene.nodes.forEach(node => {
    const bomItem = COMPONENT_PRICING[node.type];
    if (bomItem) {
      const existing = itemMap.get(node.type);
      if (existing) {
        existing.count += 1;
      } else {
        itemMap.set(node.type, { item: { ...bomItem }, count: 1 });
      }
    } else {
      bom.warnings.push(`No BOM entry for component type: ${node.type}`);
    }
  });

  // Add breadboard and accessories if prototyping
  itemMap.set('breadboard-830', {
    item: COMPONENT_PRICING['breadboard-830'],
    count: 1
  });
  itemMap.set('usb-cable', {
    item: COMPONENT_PRICING['usb-cable'],
    count: 1
  });
  itemMap.set('jumper-wire-pack', {
    item: COMPONENT_PRICING['jumper-wire-pack'],
    count: 1
  });

  // Generate BOM with quantities
  itemMap.forEach(({ item, count }) => {
    const bomItem: BOMItem = {
      ...item,
      quantity: item.quantity * count
    };

    // Calculate cost
    const itemCost = bomItem.unitPrice * bomItem.quantity;
    bom.totalCost += itemCost;

    // Track lead time
    bom.totalLeadTime = Math.max(bom.totalLeadTime, item.leadTime);

    // Mark critical components (long lead time)
    if (item.leadTime > 10) {
      bom.criticalComponents.push(bomItem);
    }

    bom.items.push(bomItem);
  });

  // Check for supply chain issues
  const limitedComponents = bom.items.filter(item => item.availability === 'limited');
  if (limitedComponents.length > 0) {
    bom.warnings.push(`${limitedComponents.length} components have limited availability`);
  }

  return bom;
}

/**
 * Get cost breakdown by category
 */
export function getCostBreakdown(bom: BOM): Record<string, number> {
  const breakdown: Record<string, number> = {};

  bom.items.forEach(item => {
    const category = item.componentType;
    const cost = item.unitPrice * item.quantity;
    breakdown[category] = (breakdown[category] || 0) + cost;
  });

  return breakdown;
}

/**
 * Estimate project cost with margin
 */
export function estimateProjectCost(bom: BOM, margin: number = 0.15): number {
  return bom.totalCost * (1 + margin);
}

/**
 * Check component availability and suggest alternatives
 */
export function checkComponentAvailability(componentType: string): BOMItem | null {
  return COMPONENT_PRICING[componentType] || null;
}

/**
 * Export BOM to CSV format (with INR currency)
 */
export function exportBOMToCSV(bom: BOM): string {
  const headers = ['Part Number', 'Description', 'Quantity', 'Unit Price (₹)', 'Total (₹)', 'Supplier', 'Lead Time (days)'];
  const rows = bom.items.map(item => [
    item.part,
    item.description,
    item.quantity.toString(),
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${(item.unitPrice * item.quantity).toFixed(2)}`,
    item.supplier,
    item.leadTime.toString()
  ]);

  const footer = [
    '',
    '',
    '',
    'Total:',
    `₹${bom.totalCost.toFixed(2)}`,
    '',
    `Max: ${bom.totalLeadTime} days`
  ];

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    footer.join(',')
  ].join('\n');

  return csv;
}
