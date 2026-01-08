import { useEffect, useRef, useState } from 'react';
import { Scene } from '../types';
import { CanvasRenderer } from '../renderer/canvas-renderer';

interface CanvasProps {
  scene: Scene;
  validationResults: any[];
  onConnectionCreate: (from: string, to: string, fromPin?: string, toPin?: string) => void;
  onConnectionRemove: (id: string) => void;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
}

export function Canvas({ scene, validationResults, onConnectionCreate, onConnectionRemove, onNodeMove }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [drawStart, setDrawStart] = useState<{ x: number; y: number; nodeId?: string; pinId?: string; pinLabel?: string } | null>(null);
  const [tempLine, setTempLine] = useState<{ from: { x: number; y: number }; to: { x: number; y: number }; label?: string } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [wireMode, setWireMode] = useState(false);
  const [lastPinClick, setLastPinClick] = useState<{ pinId: string; time: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.parentElement?.getBoundingClientRect();
    if (!rect) return;
    rendererRef.current = new CanvasRenderer(canvasRef.current);
    rendererRef.current.resize(rect.width, rect.height);
    rendererRef.current.startAnimation();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setWireMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      if (rendererRef.current) rendererRef.current.stopAnimation();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.updateValidation(validationResults);
    rendererRef.current.setWireMode(wireMode);
    const renderLoop = () => {
      if (rendererRef.current) {
        rendererRef.current.render(scene);
        if (tempLine) {
          rendererRef.current.drawTempConnection(tempLine.from, tempLine.to);
        }
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }, [scene, validationResults, tempLine, wireMode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check for wire click (delete wire on click)
    if (hoveredConnection) {
      onConnectionRemove(hoveredConnection);
      setHoveredConnection(null);
      return;
    }
    
    // Check for pin click
    const clickedPin = scene.pins.find(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 10);
    if (clickedPin) {
      const now = Date.now();
      // Double-tap detection (within 300ms)
      if (lastPinClick && lastPinClick.pinId === clickedPin.id && now - lastPinClick.time < 300) {
        // Double-tap detected - start wire drawing
        setIsDrawing(true);
        const pinLabel = `${clickedPin.label}`;
        setDrawStart({ x: clickedPin.x, y: clickedPin.y, nodeId: clickedPin.nodeId, pinId: clickedPin.id, pinLabel });
        setTempLine({ from: { x: clickedPin.x, y: clickedPin.y }, to: { x, y }, label: pinLabel });
        setLastPinClick(null);
        return;
      } else {
        setLastPinClick({ pinId: clickedPin.id, time: now });
      }
      
      // In wire mode, single click on pin starts drawing
      if (wireMode) {
        setIsDrawing(true);
        const pinLabel = `${clickedPin.label}`;
        setDrawStart({ x: clickedPin.x, y: clickedPin.y, nodeId: clickedPin.nodeId, pinId: clickedPin.id, pinLabel });
        setTempLine({ from: { x: clickedPin.x, y: clickedPin.y }, to: { x, y }, label: pinLabel });
        return;
      }
    }
    
    // Check for node click (dragging)
    const clickedNode = scene.nodes.find(n => {
      const w = n.metadata._width || 60;
      const h = n.metadata._height || 40;
      return x >= n.x - w/2 && x <= n.x + w/2 && y >= n.y - h/2 && y <= n.y + h/2;
    });
    
    if (clickedNode && !wireMode) {
      // Normal mode: Drag component
      setIsDragging(true);
      setDraggedNode(clickedNode.id);
      setDragOffset({ x: x - clickedNode.x, y: y - clickedNode.y });
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle component dragging
    if (isDragging && draggedNode && onNodeMove) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      onNodeMove(draggedNode, newX, newY);
      return;
    }
    
    // Handle wire drawing
    if (isDrawing && drawStart) {
      setTempLine({ from: drawStart, to: { x, y }, label: drawStart.pinLabel });
      return;
    }
    
    // Show pin info on hover
    const hovered = scene.pins.find(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 8);
    setHoveredPin(hovered?.id || null);
    
    // Check for wire hover (for deletion)
    if (!isDragging && !isDrawing) {
      const hoveredWire = scene.connections.find(conn => {
        const from = conn.metadata.fromPoint as { x: number; y: number };
        const to = conn.metadata.toPoint as { x: number; y: number };
        const dist = pointToLineDistance(x, y, from.x, from.y, to.x, to.y);
        return dist < 8;
      });
      setHoveredConnection(hoveredWire?.id || null);
    }
  };
  
  // Helper function to calculate point to line distance
  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // End dragging
    if (isDragging) {
      setIsDragging(false);
      setDraggedNode(null);
      return;
    }
    
    // End wire drawing
    if (isDrawing && drawStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const targetPin = scene.pins.find(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < 8);
      if (targetPin && targetPin.nodeId !== drawStart.nodeId) {
        onConnectionCreate(drawStart.nodeId!, targetPin.nodeId, drawStart.pinId, targetPin.id);
      } else {
        const targetNode = scene.nodes.find(n => {
          const w = n.metadata._width || 60;
          const h = n.metadata._height || 40;
          return x >= n.x - w/2 && x <= n.x + w/2 && y >= n.y - h/2 && y <= n.y + h/2;
        });
        if (targetNode && targetNode.id !== drawStart.nodeId) {
          onConnectionCreate(drawStart.nodeId!, targetNode.id, drawStart.pinId);
        }
      }
      setIsDrawing(false);
      setDrawStart(null);
      setTempLine(null);
    }
  };

  const cursor = isDragging ? 'grabbing' : isDrawing ? 'crosshair' : wireMode ? 'crosshair' : hoveredConnection ? 'pointer' : hoveredPin ? 'pointer' : 'grab';
  
  return (
    <>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{ display: 'block', width: '100%', height: '100%', cursor }} />
      {wireMode && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff00',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '2px solid #00ff00',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          🔌 WIRE MODE - Click pins to connect
        </div>
      )}
    </>
  );
}
