import { useState } from 'react';
import { Domain } from '../types';
import { MICROCONTROLLERS } from '../library/microcontrollers';
import { PHYSICAL_COMPONENTS } from '../library/components';
import { ML_COMPONENTS } from '../library/ml-components';
import { CIRCUIT_EXAMPLES } from '../examples/circuit-examples';

interface ToolbarProps {
  domain: Domain;
  onDomainChange: (domain: Domain) => void;
  onAddNode: (type: string, metadata?: any, def?: any) => void;
  onClear: () => void;
  onLoadExample?: (exampleId: string) => void;
}

export function Toolbar({ domain, onDomainChange, onAddNode, onClear, onLoadExample }: ToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<string>('microcontrollers');
  const [showExamples, setShowExamples] = useState(false);

  const physicalCategories = {
    microcontrollers: { label: 'MCUs', items: MICROCONTROLLERS },
    leds: { label: 'LEDs', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('led'))) },
    resistors: { label: 'Resistors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('resistor'))) },
    capacitors: { label: 'Capacitors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('capacitor'))) },
    transistors: { label: 'Transistors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('transistor') || k.includes('mosfet'))) },
    sensors: { label: 'Sensors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'sensor')) },
    displays: { label: 'Displays', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'display')) },
    motors: { label: 'Motors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'motor')) },
    buttons: { label: 'Input', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'button' || v.type === 'switch' || v.type === 'potentiometer')) },
    wireless: { label: 'Wireless', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'wireless')) },
    power: { label: 'Power', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'power-source' || v.type === 'regulator')) },
    other: { label: 'Other', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'diode' || v.type === 'audio' || v.type === 'relay')) },
  };

  const logicalCategories = {
    datasets: { label: 'Datasets', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'dataset')) },
    models: { label: 'Models', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'model')) },
    layers: { label: 'Layers', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'layer')) },
    losses: { label: 'Losses', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'loss')) },
    optimizers: { label: 'Optimizers', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'optimizer')) },
    activation: { label: 'Activation', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'activation')) },
    preprocessing: { label: 'Preprocessing', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'preprocessing')) },
    metrics: { label: 'Metrics', items: Object.fromEntries(Object.entries(ML_COMPONENTS).filter(([, v]) => v.type === 'metric')) },
  };

  const categories = domain === 'physical' ? physicalCategories : logicalCategories;
  const currentItems: Record<string, any> = (categories as any)[activeCategory]?.items || {};

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      color: '#fff',
      borderBottom: '1px solid #333'
    }}>
      {/* Top Bar */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <select
          value={domain}
          onChange={(e) => {
            onDomainChange(e.target.value as Domain);
            setActiveCategory(e.target.value === 'physical' ? 'microcontrollers' : 'datasets');
          }}
          style={{ padding: '6px 10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '13px' }}
        >
          <option value="physical">⚡ Physical Circuits</option>
          <option value="logical">🧠 ML Pipeline</option>
        </select>

        {domain === 'physical' && (
          <>
            <div style={{ fontSize: '11px', color: '#888', marginLeft: '12px', display: 'flex', gap: '12px' }}>
              <span>
                <kbd style={{ padding: '2px 6px', backgroundColor: '#333', borderRadius: '2px', fontWeight: 'bold' }}>M</kbd> Wire Mode
              </span>
              <span style={{ color: '#666' }}>|</span>
              <span>Double-tap pin to connect</span>
              <span style={{ color: '#666' }}>|</span>
              <span>Click wire to delete</span>
              <span style={{ color: '#666' }}>|</span>
              <span>
                <kbd style={{ padding: '2px 6px', backgroundColor: '#333', borderRadius: '2px', fontWeight: 'bold' }}>Ctrl+Z</kbd> Undo
              </span>
            </div>
          </>
        )}

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button
            onClick={() => setShowExamples(!showExamples)}
            style={{
              padding: '6px 16px',
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📚 Examples
          </button>
          
          {showExamples && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: '#2d2d2d',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '8px',
              minWidth: '250px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ padding: '8px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #444', marginBottom: '8px' }}>
                Click to load example circuit
              </div>
              {Object.entries(CIRCUIT_EXAMPLES)
                .filter(([, ex]) => ex.domain === domain)
                .map(([id, example]) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (onLoadExample) onLoadExample(id);
                      setShowExamples(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '6px',
                      backgroundColor: '#3a3a3a',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a4a4a';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a3a3a';
                      e.currentTarget.style.borderColor = '#555';
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {example.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>
                      {example.description}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div style={{ borderLeft: '1px solid #555', height: '28px', margin: '0 8px' }} />

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto' }}>
          {Object.entries(categories).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                ...tabStyle,
                backgroundColor: activeCategory === key ? '#0e639c' : '#2d2d30',
                borderBottom: activeCategory === key ? '2px solid #0e639c' : 'none'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button onClick={onClear} style={{ ...buttonStyle, backgroundColor: '#c41e3a', padding: '6px 12px' }}>Clear All</button>
      </div>

      {/* Component Grid */}
      <div style={{
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
        maxHeight: '180px',
        overflowY: 'auto',
        backgroundColor: '#252526'
      }}>
        {Object.entries(currentItems).map(([key, item]: [string, any]) => {
          const isMCU = activeCategory === 'microcontrollers';
          return (
            <button
              key={key}
              onClick={() => onAddNode(key, item.metadata, item)}
              style={{
                ...componentButtonStyle,
                borderLeft: `4px solid ${item.color}`
              }}
              title={key}
            >
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '10px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isMCU ? `${Object.keys(item.pins || {}).length} pins` : item.type}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '5px 10px',
  backgroundColor: '#0e639c',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '3px',
  fontSize: '12px',
  fontWeight: '500'
};

const tabStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: '#2d2d30',
  color: '#ccc',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: '500',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
};

const componentButtonStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: '#2d2d30',
  color: '#fff',
  border: '1px solid #3e3e42',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '11px',
  textAlign: 'left',
  transition: 'all 0.15s',
  display: 'flex',
  flexDirection: 'column'
};
