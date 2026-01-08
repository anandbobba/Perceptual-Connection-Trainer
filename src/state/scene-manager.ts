import { Scene, Connection, Node, Pin, Domain } from '../types';

// Manages scene state - single source of truth
export class SceneManager {
  private scene: Scene;
  private listeners: Array<(scene: Scene) => void> = [];
  private history: Scene[] = [];
  private historyIndex: number = -1;
  private maxHistory: number = 50;

  constructor(domain: Domain) {
    this.scene = {
      domain,
      nodes: [],
      pins: [],
      connections: []
    };
    this.saveState();
  }

  getScene(): Scene {
    return { ...this.scene };
  }

  addNode(node: Node): void {
    this.scene.nodes.push(node);
    this.saveState();
    this.notify();
  }

  removeNode(nodeId: string): void {
    this.scene.nodes = this.scene.nodes.filter(n => n.id !== nodeId);
    // Remove associated connections
    this.scene.connections = this.scene.connections.filter(
      c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
    );
    // Remove associated pins
    this.scene.pins = this.scene.pins.filter(p => p.nodeId !== nodeId);
    this.saveState();
    this.notify();
  }

  updateNode(nodeId: string, updates: Partial<Node>): void {
    const idx = this.scene.nodes.findIndex(n => n.id === nodeId);
    if (idx !== -1) {
      this.scene.nodes[idx] = {
        ...this.scene.nodes[idx],
        ...updates
      };
      // Don't save state for every move - handle in batch
      this.notify();
    }
  }

  addPin(pin: Pin): void {
    this.scene.pins.push(pin);
    // Pins are added with nodes, don't double-save
    this.notify();
  }

  updatePin(pinId: string, updates: Partial<Pin>): void {
    const idx = this.scene.pins.findIndex(p => p.id === pinId);
    if (idx !== -1) {
      this.scene.pins[idx] = {
        ...this.scene.pins[idx],
        ...updates
      };
      // Pin updates happen during node moves, don't save each update
      this.notify();
    }
  }

  addConnection(connection: Connection): void {
    this.scene.connections.push(connection);
    this.saveState();
    this.notify();
  }

  removeConnection(connectionId: string): void {
    this.scene.connections = this.scene.connections.filter(
      c => c.id !== connectionId
    );
    this.saveState();
    this.notify();
  }

  updateConnection(connectionId: string, updates: Partial<Connection>): void {
    const idx = this.scene.connections.findIndex(c => c.id === connectionId);
    if (idx !== -1) {
      this.scene.connections[idx] = {
        ...this.scene.connections[idx],
        ...updates
      };
      this.notify();
    }
  }

  clearConnections(): void {
    this.scene.connections = [];
    this.notify();
  }

  reset(): void {
    this.scene.nodes = [];
    this.scene.pins = [];
    this.scene.connections = [];
    this.saveState();
    this.notify();
  }

  private saveState(): void {
    // Remove any future states if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add current state
    this.history.push(JSON.parse(JSON.stringify(this.scene)));
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.scene = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notify();
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.scene = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notify();
      return true;
    }
    return false;
  }

  subscribe(listener: (scene: Scene) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const sceneCopy = this.getScene();
    for (const listener of this.listeners) {
      listener(sceneCopy);
    }
  }
}
