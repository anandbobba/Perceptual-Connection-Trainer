// Core graph representation for all connection types
export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
  metadata: Record<string, any>;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPinId?: string;
  toNodeId: string;
  toPinId?: string;
  metadata: Record<string, any>;
}

// Validation results - only stores error state, never explanation
export interface ValidationResult {
  connectionId: string;
  isValid: boolean;
  severity: 'error' | 'critical'; // critical = faster blink
}

// Domain-specific node types
export type PhysicalNodeType = 
  | 'arduino' 
  | 'led' 
  | 'resistor' 
  | 'sensor' 
  | 'breadboard-rail';

export type LogicalNodeType = 
  | 'dataset' 
  | 'model' 
  | 'loss' 
  | 'optimizer' 
  | 'layer';

export interface Pin {
  id: string;
  nodeId: string;
  type: 'power' | 'ground' | 'signal' | 'analog' | 'digital';
  voltage?: number;
  label: string;
  x: number;
  y: number;
  metadata?: Record<string, any>;
}

// Domain discriminator
export type Domain = 'physical' | 'logical';

export interface Scene {
  domain: Domain;
  nodes: Node[];
  pins: Pin[];
  connections: Connection[];
}

// Validation rule signature - pure function, no side effects
export type ValidationRule = (
  connection: Connection,
  scene: Scene
) => ValidationResult | null;
