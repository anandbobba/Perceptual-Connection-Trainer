import { Scene, Connection, Node, Pin, ValidationResult } from '../types';

// Manages visual rendering and blinking feedback
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blinkingConnections: Set<string> = new Set();
  private criticalConnections: Set<string> = new Set();
  private validConnections: Set<string> = new Set();
  private blinkPhase: number = 0;
  private animationId: number | null = null;
  private isPowered: boolean = false;
  private wireMode: boolean = false;
  private circuitHealth: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');
    this.ctx = ctx;
  }

  // Updates which connections should blink based on validation
  updateValidation(results: ValidationResult[]): void {
    this.blinkingConnections.clear();
    this.criticalConnections.clear();
    this.validConnections.clear();

    let errorCount = 0;
    for (const result of results) {
      if (!result.isValid) {
        this.blinkingConnections.add(result.connectionId);
        if (result.severity === 'critical') {
          this.criticalConnections.add(result.connectionId);
        }
        errorCount++;
      } else {
        this.validConnections.add(result.connectionId);
      }
    }
    
    // Calculate circuit health (0-100%)
    const totalConnections = results.length;
    this.circuitHealth = totalConnections > 0 ? ((totalConnections - errorCount) / totalConnections) * 100 : 100;
  }

  setPowerState(powered: boolean): void {
    this.isPowered = powered;
  }

  setWireMode(wireMode: boolean): void {
    this.wireMode = wireMode;
  }

  render(scene: Scene): void {
    this.clear();
    this.drawNodes(scene.nodes);
    this.drawPins(scene.pins, scene);
    this.drawConnections(scene.connections, scene);
  }

  startAnimation(): void {
    if (this.animationId !== null) return;

    const animate = () => {
      this.blinkPhase += 0.1;
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawNodes(nodes: Node[]): void {
    for (const node of nodes) {
      const width = node.metadata._width || 60;
      const height = node.metadata._height || 40;
      const color = node.metadata._color || this.getNodeColor(node.type);
      
      // Check if component should be "active" (when powered and circuit is healthy)
      const isActive = this.isPowered && this.circuitHealth > 80;
      const isLED = node.type.startsWith('led');
      const isMotor = node.type === 'motor';
      
      // Enhanced shadow for depth
      this.ctx.shadowColor = isActive && isLED ? 'rgba(255, 200, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = isActive && isLED ? 20 : 12;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 4;
      
      // Main body with realistic gradient
      const gradient = this.ctx.createLinearGradient(node.x - width/2, node.y - height/2, node.x + width/2, node.y + height/2);
      gradient.addColorStop(0, this.lightenColor(color, 0.2));
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(0.7, this.darkenColor(color, 0.15));
      gradient.addColorStop(1, this.darkenColor(color, 0.3));
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(node.x - width/2, node.y - height/2, width, height, 5);
      this.ctx.fill();
      
      // Plastic/PCB texture simulation with subtle noise
      this.ctx.globalAlpha = 0.1;
      for (let i = 0; i < 20; i++) {
        const tx = node.x - width/2 + Math.random() * width;
        const ty = node.y - height/2 + Math.random() * height;
        this.ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        this.ctx.fillRect(tx, ty, 1, 1);
      }
      this.ctx.globalAlpha = 1;
      
      // Outer border with metallic shine
      const borderGradient = this.ctx.createLinearGradient(node.x - width/2, node.y - height/2, node.x - width/2, node.y + height/2);
      borderGradient.addColorStop(0, this.lightenColor(color, 0.5));
      borderGradient.addColorStop(0.5, this.lightenColor(color, 0.3));
      borderGradient.addColorStop(1, color);
      this.ctx.strokeStyle = borderGradient;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Top highlight for 3D effect
      this.ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(node.x - width/2 + 2, node.y - height/2 + 2, width - 4, height/2.5, 3);
      this.ctx.stroke();
      
      // Bottom shadow for depth
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.beginPath();
      this.ctx.roundRect(node.x - width/2 + 2, node.y + height/4, width - 4, height/4, 3);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      // LED glow effect when active
      if (isActive && isLED) {
        const glowPulse = Math.sin(this.blinkPhase * 0.15) * 0.3 + 0.7;
        this.ctx.shadowBlur = 25 * glowPulse;
        this.ctx.shadowColor = '#ffcc00';
        this.ctx.fillStyle = `rgba(255, 220, 0, ${0.8 * glowPulse})`;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 15 * glowPulse, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
      
      // Motor rotation indicator when active
      if (isActive && isMotor) {
        const rotation = this.blinkPhase * 0.2;
        this.ctx.save();
        this.ctx.translate(node.x, node.y);
        this.ctx.rotate(rotation);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -8);
        this.ctx.lineTo(0, 8);
        this.ctx.moveTo(-8, 0);
        this.ctx.lineTo(8, 0);
        this.ctx.stroke();
        this.ctx.restore();
      }
      
      // Component specs badge
      if (node.metadata.voltage) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.beginPath();
        this.ctx.roundRect(node.x - width/2, node.y + height/2 - 14, width, 14, [0, 0, 5, 5]);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffcc00';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${node.metadata.voltage}V`, node.x, node.y + height/2 - 4);
      }
      
      // Label with enhanced readability
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = 1;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.label, node.x, node.y);
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetY = 0;
    }
  }

  private drawPins(pins: Pin[], scene: Scene): void {
    for (const pin of pins) {
      const pinColor = this.getPinColor(pin.type);
      const pinSize = this.wireMode ? 8 : 6;
      
      // Subtle highlight in wire mode only
      if (this.wireMode) {
        this.ctx.shadowColor = pinColor;
        this.ctx.shadowBlur = 8;
      }
      
      // Pin outer ring
      this.ctx.fillStyle = pinColor;
      this.ctx.beginPath();
      this.ctx.arc(pin.x, pin.y, pinSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pin inner metallic center
      const innerSize = pinSize - 2;
      const innerGradient = this.ctx.createRadialGradient(pin.x - 1, pin.y - 1, 0, pin.x, pin.y, innerSize);
      innerGradient.addColorStop(0, '#fff');
      innerGradient.addColorStop(1, '#bbb');
      this.ctx.fillStyle = innerGradient;
      this.ctx.beginPath();
      this.ctx.arc(pin.x, pin.y, innerSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
      
      // Pin labels positioned directly on the pins (not above)
      const labelWidth = Math.max(38, pin.label.length * 8);
      const labelHeight = 18;
      
      // Determine label position based on pin location relative to node center
      const node = scene.nodes.find(n => n.id === pin.nodeId);
      let labelOffsetX = 0;
      let labelOffsetY = 0;
      
      if (node) {
        const pinRelativeX = pin.x - node.x;
        const pinRelativeY = pin.y - node.y;
        
        // Position label outside the pin based on which side of component
        if (Math.abs(pinRelativeX) > Math.abs(pinRelativeY)) {
          // Pin is on left or right side
          if (pinRelativeX < 0) {
            // Left side - label to the left
            labelOffsetX = -labelWidth/2 - 12;
          } else {
            // Right side - label to the right
            labelOffsetX = labelWidth/2 + 12;
          }
        } else {
          // Pin is on top or bottom
          if (pinRelativeY < 0) {
            // Top - label above
            labelOffsetY = -12;
          } else {
            // Bottom - label below
            labelOffsetY = 12;
          }
        }
      }
      
      const labelX = pin.x + labelOffsetX;
      const labelY = pin.y + labelOffsetY;
      
      // Label background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      this.ctx.beginPath();
      this.ctx.roundRect(labelX - labelWidth/2, labelY - labelHeight/2, labelWidth, labelHeight, 3);
      this.ctx.fill();
      
      // Label border
      this.ctx.strokeStyle = this.wireMode ? 'rgba(0, 255, 136, 0.7)' : 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      
      // Label text
      this.ctx.fillStyle = this.wireMode ? '#00ff88' : '#ffffff';
      this.ctx.font = 'bold 11px "Courier New", Consolas, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(pin.label, labelX, labelY);
    }
  }

  private drawConnections(connections: Connection[], _scene: Scene): void {
    for (const connection of connections) {
      const shouldBlink = this.blinkingConnections.has(connection.id);
      const isCritical = this.criticalConnections.has(connection.id);
      
      // ALWAYS show errors - remove power state dependency
      if (shouldBlink) {
        this.drawBlinkingConnection(connection, isCritical);
      } else {
        this.drawNormalConnection(connection);
      }
    }
  }

  private drawNormalConnection(connection: Connection): void {
    const from = connection.metadata.fromPoint as { x: number; y: number };
    const to = connection.metadata.toPoint as { x: number; y: number };

    // Bezier curve for smoother look
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offset = 50;

    this.ctx.strokeStyle = '#6a6a6a';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(midX, midY + offset, to.x, to.y);
    this.ctx.stroke();
    
    // Connection endpoints
    this.ctx.fillStyle = '#4a4a4a';
    this.ctx.beginPath();
    this.ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
    this.ctx.arc(to.x, to.y, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawBlinkingConnection(connection: Connection, critical: boolean): void {
    const from = connection.metadata.fromPoint as { x: number; y: number };
    const to = connection.metadata.toPoint as { x: number; y: number };

    // Bezier curve
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const offset = 50;

    // Critical = faster blink
    const frequency = critical ? 0.4 : 0.15;
    const intensity = Math.sin(this.blinkPhase * frequency) * 0.5 + 0.5;

    // Blink between bright red and dark red
    const red = Math.floor(180 + intensity * 75);
    this.ctx.strokeStyle = `rgb(${red}, ${Math.floor(intensity * 50)}, 0)`;
    this.ctx.lineWidth = 4 + intensity * 2;
    
    // Glow effect
    this.ctx.shadowBlur = 15 * intensity;
    this.ctx.shadowColor = critical ? '#ff0000' : '#ff6600';

    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.quadraticCurveTo(midX, midY + offset, to.x, to.y);
    this.ctx.stroke();

    // Pulsing endpoints
    this.ctx.shadowBlur = 10 * intensity;
    this.ctx.fillStyle = `rgba(255, ${Math.floor(intensity * 100)}, 0, ${0.7 + intensity * 0.3})`;
    this.ctx.beginPath();
    this.ctx.arc(from.x, from.y, 5 + intensity * 3, 0, Math.PI * 2);
    this.ctx.arc(to.x, to.y, 5 + intensity * 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  private getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      arduino: '#0066cc',
      led: '#ffcc00',
      resistor: '#cc9966',
      sensor: '#00cc66',
      'breadboard-rail': '#333333',
      dataset: '#4a90e2',
      model: '#e94b3c',
      loss: '#f39c12',
      optimizer: '#9b59b6',
      layer: '#1abc9c'
    };
    return colors[type] || '#999';
  }

  private getPinColor(type: string): string {
    const colors: Record<string, string> = {
      power: '#ff3333',
      ground: '#111111',
      signal: '#00ff00',
      analog: '#3399ff',
      digital: '#ffcc00'
    };
    return colors[type] || '#888';
  }

  private darkenColor(color: string, amount: number): string {
    // Handle RGB color format
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = Math.max(0, Math.floor(parseInt(match[0]) * (1 - amount)));
        const g = Math.max(0, Math.floor(parseInt(match[1]) * (1 - amount)));
        const b = Math.max(0, Math.floor(parseInt(match[2]) * (1 - amount)));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    
    // Handle hex color format
    const hex = color.replace('#', '');
    if (hex.length >= 6) {
      const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - amount)));
      const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - amount)));
      const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - amount)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Fallback for invalid colors
    return 'rgb(128, 128, 128)';
  }

  private lightenColor(color: string, amount: number): string {
    // Handle RGB color format
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = Math.min(255, Math.floor(parseInt(match[0]) * (1 + amount)));
        const g = Math.min(255, Math.floor(parseInt(match[1]) * (1 + amount)));
        const b = Math.min(255, Math.floor(parseInt(match[2]) * (1 + amount)));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    
    // Handle hex color format
    const hex = color.replace('#', '');
    if (hex.length >= 6) {
      const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 + amount)));
      const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 + amount)));
      const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 + amount)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Fallback for invalid colors
    return 'rgb(200, 200, 200)';
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Draw temporary wire while dragging
  drawTempConnection(from: { x: number; y: number }, to: { x: number; y: number }): void {
    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([8, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  // NO TOOLTIPS - minimal visual feedback only

  // NO SUCCESS INDICATORS - silence is the only confirmation
}
