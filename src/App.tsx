import { useEffect, useState } from 'react';
import { Domain, Node, Pin, Connection, ValidationResult } from './types';
import { SceneManager } from './state/scene-manager';
import { ValidationEngine } from './validation/engine';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { MICROCONTROLLERS } from './library/microcontrollers';
import { PHYSICAL_COMPONENTS } from './library/components';
import { ML_COMPONENTS } from './library/ml-components';
import { CIRCUIT_EXAMPLES } from './examples/circuit-examples';

// Import physical rules
import {
  noDirectPowerToGround,
  voltageMatch,
  ledRequiresResistor,
  ledPolarity,
  requiresGround,
  analogToAnalogPin
} from './validation/physical-rules';

// Import advanced physical rules
import {
  voltageLevelMatching,
  i2cPullupRequired,
  motorRequiresExternalPower,
  inductiveLoadProtection,
  capacitorPolarity,
  serialCrossover,
  rgbLedResistors,
  zenerPolarity,
  displayBacklightProtection
} from './validation/advanced-physical-rules';

// Import logical rules
import {
  cnnRequiresImageData,
  softmaxForClassification,
  mseForRegression,
  datasetToModelFirst,
  optimizerAfterLoss,
  rnnRequiresSequentialData,
  batchSizeConsistency
} from './validation/logical-rules';

let nodeCounter = 0;
let pinCounter = 0;
let connectionCounter = 0;

function App() {
  const [sceneManager] = useState(() => new SceneManager('physical'));
  const [validationEngine] = useState(() => new ValidationEngine());
  const [scene, setScene] = useState(sceneManager.getScene());
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [domain, setDomain] = useState<Domain>('physical');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        sceneManager.undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        sceneManager.redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneManager]);

  // Initialize validation rules
  useEffect(() => {
    // Physical rules
    validationEngine.registerRule(noDirectPowerToGround);
    validationEngine.registerRule(voltageMatch);
    validationEngine.registerRule(ledRequiresResistor);
    validationEngine.registerRule(ledPolarity);
    validationEngine.registerRule(requiresGround);
    validationEngine.registerRule(analogToAnalogPin);
    
    // Advanced physical rules
    validationEngine.registerRule(voltageLevelMatching);
    validationEngine.registerRule(i2cPullupRequired);
    validationEngine.registerRule(motorRequiresExternalPower);
    validationEngine.registerRule(inductiveLoadProtection);
    validationEngine.registerRule(capacitorPolarity);
    validationEngine.registerRule(serialCrossover);
    validationEngine.registerRule(rgbLedResistors);
    validationEngine.registerRule(zenerPolarity);
    validationEngine.registerRule(displayBacklightProtection);

    // Logical rules
    validationEngine.registerRule(cnnRequiresImageData);
    validationEngine.registerRule(softmaxForClassification);
    validationEngine.registerRule(mseForRegression);
    validationEngine.registerRule(datasetToModelFirst);
    validationEngine.registerRule(optimizerAfterLoss);
    validationEngine.registerRule(rnnRequiresSequentialData);
    validationEngine.registerRule(batchSizeConsistency);
  }, [validationEngine]);

  // Subscribe to scene changes
  useEffect(() => {
    return sceneManager.subscribe((newScene) => {
      setScene(newScene);
      // Validate on every change
      const results = validationEngine.validate(newScene);
      setValidationResults(results);
    });
  }, [sceneManager, validationEngine]);

  const handleDomainChange = (newDomain: Domain) => {
    setDomain(newDomain);
    sceneManager.reset();
    nodeCounter = 0;
    pinCounter = 0;
    connectionCounter = 0;
  };


  const handleNodeMove = (nodeId: string, newX: number, newY: number) => {
    const currentScene = sceneManager.getScene();
    const node = currentScene.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const nodePins = currentScene.pins.filter(p => p.nodeId === nodeId);
    
    // Update node position
    sceneManager.updateNode(nodeId, { x: newX, y: newY });
    
    // Update pin positions using stored offsets
    nodePins.forEach(pin => {
      const offsetX = pin.metadata?.offsetX || 0;
      const offsetY = pin.metadata?.offsetY || 0;
      sceneManager.updatePin(pin.id, { x: newX + offsetX, y: newY + offsetY });
    });
    
    // Update connection coordinates
    const updatedScene = sceneManager.getScene();
    updatedScene.connections.forEach(conn => {
      if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
        const updates: any = {};
        
        if (conn.fromNodeId === nodeId) {
          if (conn.fromPinId) {
            const pin = updatedScene.pins.find(p => p.id === conn.fromPinId);
            if (pin) updates.fromPoint = { x: pin.x, y: pin.y };
          } else {
            updates.fromPoint = { x: newX, y: newY };
          }
        }
        
        if (conn.toNodeId === nodeId) {
          if (conn.toPinId) {
            const pin = updatedScene.pins.find(p => p.id === conn.toPinId);
            if (pin) updates.toPoint = { x: pin.x, y: pin.y };
          } else {
            updates.toPoint = { x: newX, y: newY };
          }
        }
        
        if (Object.keys(updates).length > 0) {
          sceneManager.updateConnection(conn.id, {
            metadata: { ...conn.metadata, ...updates }
          });
        }
      }
    });
  };

  const handleAddNode = (type: string, metadata: any = {}, def: any = null) => {
    const id = `node-${nodeCounter++}`;
    const x = 150 + Math.random() * 500;
    const y = 250 + Math.random() * 300;

    let width = 60;
    let height = 40;
    let color = '#999';
    let label = type.toUpperCase();

    // Check if it's a microcontroller
    if (def && MICROCONTROLLERS[type]) {
      const mcuDef = MICROCONTROLLERS[type];
      width = mcuDef.width;
      height = mcuDef.height;
      label = mcuDef.label;
      color = '#0066cc';
      
      const node: Node = {
        id,
        type: mcuDef.type,
        x,
        y,
        label,
        metadata: { ...mcuDef.metadata, _width: width, _height: height, _color: color }
      };
      
      sceneManager.addNode(node);

      // Add all pins from microcontroller definition
      mcuDef.pins.forEach(pinDef => {
        const pin: Pin = {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: pinDef.type,
          voltage: pinDef.voltage,
          label: pinDef.label,
          x: x + pinDef.offsetX,
          y: y + pinDef.offsetY,
          metadata: {
            offsetX: pinDef.offsetX,
            offsetY: pinDef.offsetY
          }
        };
        sceneManager.addPin(pin);
      });
    }
    // Check if it's a physical component
    else if (def && PHYSICAL_COMPONENTS[type]) {
      const compDef = PHYSICAL_COMPONENTS[type];
      width = compDef.width;
      height = compDef.height;
      label = compDef.label;
      color = compDef.color;
      
      const node: Node = {
        id,
        type: compDef.type,
        x,
        y,
        label,
        metadata: { ...compDef.metadata, _width: width, _height: height, _color: color }
      };
      
      sceneManager.addNode(node);

      // Add pins from component definition
      compDef.pins.forEach(pinDef => {
        const pin: Pin = {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: pinDef.type,
          voltage: pinDef.voltage,
          label: pinDef.label,
          x: x + pinDef.offsetX,
          y: y + pinDef.offsetY,
          metadata: {
            offsetX: pinDef.offsetX,
            offsetY: pinDef.offsetY
          }
        };
        sceneManager.addPin(pin);
      });
    }
    // Check if it's an ML component
    else if (def && ML_COMPONENTS[type]) {
      const mlDef = ML_COMPONENTS[type];
      width = mlDef.width;
      height = mlDef.height;
      label = mlDef.label;
      color = mlDef.color;
      
      const node: Node = {
        id,
        type: mlDef.type,
        x,
        y,
        label,
        metadata: { ...mlDef.metadata, _width: width, _height: height, _color: color }
      };
      
      sceneManager.addNode(node);

      // Add generic input/output pins for ML components
      // Input pin on the left
      const inputPin: Pin = {
        id: `pin-${pinCounter++}`,
        nodeId: id,
        type: 'signal',
        label: 'in',
        x: x - 5,
        y: y + height / 2,
        metadata: {
          offsetX: -5,
          offsetY: height / 2
        }
      };
      sceneManager.addPin(inputPin);
      
      // Output pin on the right
      const outputPin: Pin = {
        id: `pin-${pinCounter++}`,
        nodeId: id,
        type: 'signal',
        label: 'out',
        x: x + width + 5,
        y: y + height / 2,
        metadata: {
          offsetX: width + 5,
          offsetY: height / 2
        }
      };
      sceneManager.addPin(outputPin);
    }
    // Fallback for unknown types
    else {
      const node: Node = {
        id,
        type,
        x,
        y,
        label,
        metadata: { ...metadata, _width: width, _height: height, _color: color }
      };
      
      sceneManager.addNode(node);
    }
  };

  const handleConnectionCreate = (fromNodeId: string, toNodeId: string, fromPinId?: string, toPinId?: string) => {
    const id = `conn-${connectionCounter++}`;

    // Get coordinates for rendering
    let fromPoint = { x: 0, y: 0 };
    let toPoint = { x: 0, y: 0 };

    if (fromPinId) {
      const pin = scene.pins.find(p => p.id === fromPinId);
      if (pin) fromPoint = { x: pin.x, y: pin.y };
    } else {
      const node = scene.nodes.find(n => n.id === fromNodeId);
      if (node) fromPoint = { x: node.x, y: node.y };
    }

    if (toPinId) {
      const pin = scene.pins.find(p => p.id === toPinId);
      if (pin) toPoint = { x: pin.x, y: pin.y };
    } else {
      const node = scene.nodes.find(n => n.id === toNodeId);
      if (node) toPoint = { x: node.x, y: node.y };
    }

    const connection: Connection = {
      id,
      fromNodeId,
      toNodeId,
      fromPinId,
      toPinId,
      metadata: { fromPoint, toPoint }
    };

    sceneManager.addConnection(connection);
  };

  const handleConnectionRemove = (id: string) => {
    sceneManager.removeConnection(id);
  };

  const handleClear = () => {
    sceneManager.reset();
    nodeCounter = 0;
    pinCounter = 0;
    connectionCounter = 0;
  };

  const handleLoadExample = (exampleId: string) => {
    const example = CIRCUIT_EXAMPLES[exampleId];
    if (!example) return;

    // Clear current scene
    handleClear();

    // Switch domain if needed
    if (example.domain !== domain) {
      setDomain(example.domain);
      sceneManager.reset();
    }

    // Add components
    const nodeIds: string[] = [];
    example.components.forEach((comp) => {
      const id = `node-${nodeCounter++}`;
      nodeIds.push(id);

      let def = null;
      let width = 60;
      let height = 40;
      let color = '#999';
      let label = comp.type.toUpperCase();

      // Find component definition
      if (MICROCONTROLLERS[comp.type]) {
        def = MICROCONTROLLERS[comp.type];
        width = def.width;
        height = def.height;
        label = def.label;
        color = '#0066cc';
      } else if (PHYSICAL_COMPONENTS[comp.type]) {
        def = PHYSICAL_COMPONENTS[comp.type];
        width = def.width;
        height = def.height;
        label = def.label;
        color = def.color;
      } else if (ML_COMPONENTS[comp.type]) {
        def = ML_COMPONENTS[comp.type];
        width = def.width;
        height = def.height;
        label = def.label;
        color = def.color;
      }

      const node: Node = {
        id,
        type: def?.type || comp.type,
        x: comp.x,
        y: comp.y,
        label,
        metadata: { ...def?.metadata, _width: width, _height: height, _color: color }
      };

      sceneManager.addNode(node);

      // Add pins
      if (MICROCONTROLLERS[comp.type]) {
        const mcuDef = MICROCONTROLLERS[comp.type];
        mcuDef.pins.forEach(pinDef => {
          const pin: Pin = {
            id: `pin-${pinCounter++}`,
            nodeId: id,
            type: pinDef.type,
            voltage: pinDef.voltage,
            label: pinDef.label,
            x: comp.x + pinDef.offsetX,
            y: comp.y + pinDef.offsetY,
            metadata: { offsetX: pinDef.offsetX, offsetY: pinDef.offsetY }
          };
          sceneManager.addPin(pin);
        });
      } else if (PHYSICAL_COMPONENTS[comp.type]) {
        const compDef = PHYSICAL_COMPONENTS[comp.type];
        compDef.pins.forEach(pinDef => {
          const pin: Pin = {
            id: `pin-${pinCounter++}`,
            nodeId: id,
            type: pinDef.type,
            voltage: pinDef.voltage,
            label: pinDef.label,
            x: comp.x + pinDef.offsetX,
            y: comp.y + pinDef.offsetY,
            metadata: { offsetX: pinDef.offsetX, offsetY: pinDef.offsetY }
          };
          sceneManager.addPin(pin);
        });
      } else if (ML_COMPONENTS[comp.type]) {
        // Add generic input/output pins for ML components
        const inputPin: Pin = {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: 'signal',
          label: 'in',
          x: comp.x - 5,
          y: comp.y + height / 2,
          metadata: { offsetX: -5, offsetY: height / 2 }
        };
        sceneManager.addPin(inputPin);

        const outputPin: Pin = {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: 'signal',
          label: 'out',
          x: comp.x + width + 5,
          y: comp.y + height / 2,
          metadata: { offsetX: width + 5, offsetY: height / 2 }
        };
        sceneManager.addPin(outputPin);
      }
    });

    // Add connections after a short delay to ensure pins are created
    setTimeout(() => {
      example.connections.forEach((conn) => {
        const fromNodeId = nodeIds[conn.from];
        const toNodeId = nodeIds[conn.to];

        const fromNode = scene.nodes.find(n => n.id === fromNodeId);
        const toNode = scene.nodes.find(n => n.id === toNodeId);

        if (!fromNode || !toNode) return;

        let fromPinId: string | undefined;
        let toPinId: string | undefined;

        if (conn.fromPin) {
          const fromPin = scene.pins.find(p => p.nodeId === fromNodeId && p.label === conn.fromPin);
          fromPinId = fromPin?.id;
        }

        if (conn.toPin) {
          const toPin = scene.pins.find(p => p.nodeId === toNodeId && p.label === conn.toPin);
          toPinId = toPin?.id;
        }

        handleConnectionCreate(fromNodeId, toNodeId, fromPinId, toPinId);
      });
    }, 100);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d1117', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        domain={domain}
        onDomainChange={handleDomainChange}
        onAddNode={handleAddNode}
        onClear={handleClear}
        onLoadExample={handleLoadExample}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          scene={scene}
          validationResults={validationResults}
          onConnectionCreate={handleConnectionCreate}
          onConnectionRemove={handleConnectionRemove}
          onNodeMove={handleNodeMove}
        />
        
        {/* Status indicator */}
        {scene.connections.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            border: validationResults.some(r => !r.isValid) ? '2px solid #ff4444' : '2px solid #00ff88',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: validationResults.some(r => !r.isValid) ? '#ff4444' : '#00ff88',
            fontWeight: 'bold',
            boxShadow: validationResults.some(r => !r.isValid) 
              ? '0 0 20px rgba(255, 68, 68, 0.5)' 
              : '0 0 20px rgba(0, 255, 136, 0.5)',
          }}>
            {validationResults.some(r => !r.isValid) 
              ? `⚠️ ${validationResults.filter(r => !r.isValid).length} ERROR${validationResults.filter(r => !r.isValid).length > 1 ? 'S' : ''}`
              : '✅ PERFECT'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
