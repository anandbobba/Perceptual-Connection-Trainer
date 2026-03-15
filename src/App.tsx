import { useEffect, useState } from 'react';
import { Domain, Node, Pin, Connection, ValidationResult } from './types';
import { SceneManager } from './state/scene-manager';
import { ValidationEngine } from './validation/engine';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { RealismAnalysisPanel } from './components/RealismAnalysisPanel';
import { generateAIRealismReport } from './simulation/realism-engine';
import { MICROCONTROLLERS } from './library/microcontrollers';
import { ADVANCED_MICROCONTROLLERS } from './library/advanced-microcontrollers';
import { PHYSICAL_COMPONENTS } from './library/components';
import { PROFESSIONAL_SENSORS } from './library/professional-sensors';
import { ML_COMPONENTS } from './library/ml-components';

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

// Import comprehensive professional-grade rules
import {
  ledCurrentProtection,
  powerBudgetCheck,
  groundLoopPrevention,
  signalPinCompatibility,
  capacitorVoltageRating,
  resistorPowerRating,
  motorDriverRequired,
  i2cProtocolValidation,
  transistorBiasing,
  pwmPinValidation
} from './validation/comprehensive-rules';

// Import real-world ML pipeline rules
import {
  mlDatasetToModelRequired,
  mlModelToLayersRequired,
  mlLossToOptimizerRequired,
  mlConvolutionalRequirements,
  mlBatchNormPlacement,
  mlAttentionHeads,
  mlDropoutPlacement,
  mlEmbeddingRequirements,
  mlOptimizersRequireValidation,
  mlLossFunctionCompatibility
} from './validation/ml-rules';

let nodeCounter = 0;
let pinCounter = 0;
let connectionCounter = 0;

function App() {
  const [sceneManager] = useState(() => new SceneManager('physical'));
  const [validationEngine] = useState(() => new ValidationEngine());
  const [scene, setScene] = useState(sceneManager.getScene());
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [domain, setDomain] = useState<Domain>('physical');
  const [isRealismPanelOpen, setIsRealismPanelOpen] = useState(false);
  const [isMagicWiring, setIsMagicWiring] = useState(false);

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

    // COMPREHENSIVE PROFESSIONAL-GRADE RULES (Publication Quality)
    validationEngine.registerRule(ledCurrentProtection);        // Ohm's law LED current calculation
    validationEngine.registerRule(powerBudgetCheck);           // Pin current limits
    validationEngine.registerRule(groundLoopPrevention);       // Ground loop detection
    validationEngine.registerRule(signalPinCompatibility);     // Signal type checking
    validationEngine.registerRule(capacitorVoltageRating);     // Capacitor voltage limits
    validationEngine.registerRule(resistorPowerRating);        // Power dissipation (P=I²R)
    validationEngine.registerRule(motorDriverRequired);        // Motor driver enforcement
    validationEngine.registerRule(i2cProtocolValidation);      // I2C pullup resistors
    validationEngine.registerRule(transistorBiasing);          // Transistor base resistor
    validationEngine.registerRule(pwmPinValidation);           // PWM pin requirements

    // Logical rules
    validationEngine.registerRule(cnnRequiresImageData);
    validationEngine.registerRule(softmaxForClassification);
    validationEngine.registerRule(mseForRegression);
    validationEngine.registerRule(datasetToModelFirst);
    validationEngine.registerRule(optimizerAfterLoss);
    validationEngine.registerRule(rnnRequiresSequentialData);
    validationEngine.registerRule(batchSizeConsistency);

    // REAL-WORLD ML PIPELINE RULES (Industry Standard)
    validationEngine.registerRule(mlDatasetToModelRequired);      // Dataset must feed to model
    validationEngine.registerRule(mlModelToLayersRequired);       // Layers required between dataset/model and loss
    validationEngine.registerRule(mlLossToOptimizerRequired);     // Loss before optimizer
    validationEngine.registerRule(mlConvolutionalRequirements);   // Conv2D layer sequences
    validationEngine.registerRule(mlBatchNormPlacement);          // BatchNorm placement rules
    validationEngine.registerRule(mlAttentionHeads);              // Attention head count validation
    validationEngine.registerRule(mlDropoutPlacement);            // Dropout not last layer
    validationEngine.registerRule(mlEmbeddingRequirements);       // Embedding with tokenizer
    validationEngine.registerRule(mlOptimizersRequireValidation); // Optimizer LR validation
    validationEngine.registerRule(mlLossFunctionCompatibility);   // Loss-Model task compatibility
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

  const handleNodeDelete = (nodeId: string) => {
    const currentScene = sceneManager.getScene();
    
    // Get all connections to/from this node
    const connectionsToDelete = currentScene.connections.filter(
      c => c.fromNodeId === nodeId || c.toNodeId === nodeId
    );
    
    // Delete connections first
    connectionsToDelete.forEach(c => sceneManager.removeConnection(c.id));
    
    // Remove the node (which also removes associated pins)
    sceneManager.removeNode(nodeId);
    
    // Update scene
    setScene(sceneManager.getScene());
    setValidationResults([]);
  };

  const handleAddNode = (type: string, metadata: any = {}, def: any = null) => {
    const id = `node-${nodeCounter++}`;
    const x = 150 + Math.random() * 500;
    const y = 250 + Math.random() * 300;

    let width = 60;
    let height = 40;
    let color = '#999';
    let label = type.toUpperCase();

    // Check ALL microcontroller sources (original + advanced)
    const allMCUs = { ...MICROCONTROLLERS, ...ADVANCED_MICROCONTROLLERS };
    const allComponents = { ...PHYSICAL_COMPONENTS, ...PROFESSIONAL_SENSORS };

    if (def && allMCUs[type]) {
      const mcuDef = allMCUs[type];
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

      // Create all pins
      const pins: Pin[] = mcuDef.pins.map(pinDef => ({
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
      }));
      
      // Add node with all pins as a single undo/redo operation
      sceneManager.addNodeWithPins(node, pins);
    }
    // Check ALL physical components (original + professional sensors)
    else if (def && allComponents[type]) {
      const compDef = allComponents[type];
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

      // Create all pins
      const pins: Pin[] = compDef.pins.map(pinDef => ({
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
      }));
      
      // Add node with all pins as a single undo/redo operation
      sceneManager.addNodeWithPins(node, pins);
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

      // Create input/output pins for ML components - centered on component
      const centerY = height / 2;
      const pins: Pin[] = [
        // Input pin on the left center
        {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: 'signal',
          label: 'in',
          x: x,
          y: y + centerY,
          metadata: {
            offsetX: 0,
            offsetY: centerY
          }
        },
        // Output pin on the right center
        {
          id: `pin-${pinCounter++}`,
          nodeId: id,
          type: 'signal',
          label: 'out',
          x: x + width,
          y: y + centerY,
          metadata: {
            offsetX: width,
            offsetY: centerY
          }
        }
      ];
      
      // Add node with all pins as a single undo/redo operation
      sceneManager.addNodeWithPins(node, pins);
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
    connectionCounter = 0;
  };

  const handleMagicWire = async () => {
    if (domain !== 'physical' || isMagicWiring || scene.nodes.length < 2) return;
    
    setIsMagicWiring(true);
    try {
      const report = await generateAIRealismReport(scene);
      if (report.aiAnalysis?.wiringSuggestions) {
        // Apply suggestions one by one
        for (const sug of report.aiAnalysis.wiringSuggestions) {
          // Normalize labels for matching
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          const sugFrom = normalize(sug.from);
          const sugTo = normalize(sug.to);

          // Find nodes by label (better matching)
          const fromNode = scene.nodes.find(n => normalize(n.label) === sugFrom || normalize(n.label).includes(sugFrom));
          const toNode = scene.nodes.find(n => normalize(n.label) === sugTo || normalize(n.label).includes(sugTo));
          
          if (fromNode && toNode) {
            // Find appropriate pins with priority
            const findBestPin = (nodeId: string, searchTerms: string[]) => {
              const nodePins = scene.pins.filter(p => p.nodeId === nodeId);
              // Priority 1: Exact matches for labels
              for (const term of searchTerms) {
                const p = nodePins.find(p => normalize(p.label) === normalize(term));
                if (p) return p;
              }
              // Priority 2: Includes search terms
              for (const term of searchTerms) {
                const p = nodePins.find(p => normalize(p.label).includes(normalize(term)));
                if (p) return p;
              }
              // Priority 3: Fallback to first available signal pin
              return nodePins.find(p => p.type === 'signal') || nodePins[0];
            };

            const fromPin = findBestPin(fromNode.id, ['out', 'tx', 'signal', 'output']);
            const toPin = findBestPin(toNode.id, ['in', 'rx', 'signal', 'input']);
            
            if (fromPin && toPin) {
              const exists = scene.connections.some(c => 
                (c.fromPinId === fromPin.id && c.toPinId === toPin.id) ||
                (c.fromPinId === toPin.id && c.toPinId === fromPin.id)
              );
              
              if (!exists) {
                handleConnectionCreate(fromNode.id, toNode.id, fromPin.id, toPin.id);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Magic Wiring failed:', error);
    } finally {
      setIsMagicWiring(false);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1d29 50%, #0f1117 100%)',
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        opacity: 0.4
      }} />
      
      <Toolbar
        domain={domain}
        onDomainChange={handleDomainChange}
        onAddNode={handleAddNode}
        onClear={handleClear}
        onMagicWire={handleMagicWire}
        isMagicWiring={isMagicWiring}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          scene={scene}
          validationResults={validationResults}
          onConnectionCreate={handleConnectionCreate}
          onConnectionRemove={handleConnectionRemove}
          onNodeMove={handleNodeMove}
          onNodeDelete={handleNodeDelete}
        />
        
        {/* Status indicator */}
        {scene.connections.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            padding: '16px 28px',
            background: validationResults.some(r => !r.isValid)
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            color: '#fff',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            boxShadow: validationResults.some(r => !r.isValid) 
              ? '0 8px 32px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)' 
              : '0 8px 32px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: validationResults.some(r => !r.isValid) ? 'pulse 2s infinite' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {validationResults.some(r => !r.isValid) 
              ? `⚠️ ${validationResults.filter(r => !r.isValid).length} ERROR${validationResults.filter(r => !r.isValid).length > 1 ? 'S' : ''}`
              : '✅ PERFECT CIRCUIT'}
          </div>
        )}

        {/* Realism Analysis Button */}
        {scene.nodes.length > 0 && (
          <button
            onClick={() => setIsRealismPanelOpen(true)}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
              e.currentTarget.style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            }}
          >
            📊 Realism Analysis
          </button>
        )}

        {/* Realism Analysis Panel */}
        <RealismAnalysisPanel
          scene={scene}
          isOpen={isRealismPanelOpen}
          onClose={() => setIsRealismPanelOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
