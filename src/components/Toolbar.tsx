import { useState } from 'react';
import { Domain } from '../types';
import { MICROCONTROLLERS } from '../library/microcontrollers';
import { ADVANCED_MICROCONTROLLERS } from '../library/advanced-microcontrollers';
import { PHYSICAL_COMPONENTS } from '../library/components';
import { PROFESSIONAL_SENSORS } from '../library/professional-sensors';
import { ML_COMPONENTS } from '../library/ml-components';

interface ToolbarProps {
  domain: Domain;
  onDomainChange: (domain: Domain) => void;
  onAddNode: (type: string, metadata?: any, def?: any) => void;
  onClear: () => void;
}

export function Toolbar({ domain, onDomainChange, onAddNode, onClear }: ToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<string>('microcontrollers');

  // Merge all microcontrollers and sensors
  const ALL_MCUS = { ...MICROCONTROLLERS, ...ADVANCED_MICROCONTROLLERS };
  const ALL_SENSORS = { 
    ...Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'sensor')),
    ...PROFESSIONAL_SENSORS 
  };

  const physicalCategories = {
    microcontrollers: { label: 'Microcontrollers', items: ALL_MCUS },
    sensors: { label: 'Professional Sensors', items: ALL_SENSORS },
    leds: { label: 'Light Emitting Diodes', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('led'))) },
    resistors: { label: 'Resistors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('resistor'))) },
    capacitors: { label: 'Capacitors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('capacitor'))) },
    transistors: { label: 'Transistors', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([k]) => k.includes('transistor') || k.includes('mosfet'))) },
    displays: { label: 'Displays', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'display')) },
    motors: { label: 'Motors & Actuators', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'motor')) },
    buttons: { label: 'Input Devices', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'button' || v.type === 'switch' || v.type === 'potentiometer')) },
    wireless: { label: 'Wireless Modules', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'wireless')) },
    power: { label: 'Power Supply', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'power-source' || v.type === 'regulator')) },
    other: { label: 'Other Components', items: Object.fromEntries(Object.entries(PHYSICAL_COMPONENTS).filter(([, v]) => v.type === 'diode' || v.type === 'audio' || v.type === 'relay')) },
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
      background: 'linear-gradient(135deg, #1a1d29 0%, #0f1117 100%)',
      color: '#e8eaed',
      borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Top Bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {/* Domain Selector */}
        <select
          value={domain}
          onChange={(e) => {
            onDomainChange(e.target.value as Domain);
            setActiveCategory(e.target.value === 'physical' ? 'microcontrollers' : 'datasets');
          }}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <option value="physical">Physical Circuits</option>
          <option value="logical">Machine Learning Pipeline</option>
        </select>

        {domain === 'physical' && (
          <>
            <div style={{ 
              fontSize: '12px', 
              color: '#9ca3af', 
              marginLeft: '16px', 
              display: 'flex', 
              gap: '20px',
              alignItems: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ 
                  padding: '3px 8px', 
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '4px', 
                  fontWeight: '700',
                  color: '#a5b4fc',
                  fontSize: '11px'
                }}>M</kbd>
                <span>Wire Mode</span>
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>│</span>
              <span>Double-tap pin to connect</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>│</span>
              <span>Click wire to delete</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>│</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <kbd style={{ 
                  padding: '3px 8px', 
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '4px', 
                  fontWeight: '700',
                  color: '#a5b4fc',
                  fontSize: '11px'
                }}>Ctrl+Z</kbd>
                <span>Undo</span>
              </span>
            </div>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={onClear}
            style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 20px',
        overflowX: 'auto',
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        {Object.entries(categories).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            style={{
              padding: '8px 16px',
              background: activeCategory === key 
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              color: activeCategory === key ? '#fff' : '#9ca3af',
              border: activeCategory === key 
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeCategory === key ? '600' : '500',
              transition: 'all 0.2s',
              boxShadow: activeCategory === key 
                ? '0 2px 8px rgba(99, 102, 241, 0.3)' 
                : 'none',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== key) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#e8eaed';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== key) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Components Grid */}
      <div style={{
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        maxHeight: '220px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {Object.entries(currentItems).map(([key, item]: [string, any]) => {
          return (
            <button
              key={key}
              onClick={() => onAddNode(key, item.metadata, item)}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                color: '#e8eaed',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                textAlign: 'center',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
              }}
              title={key}
            >
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '700',
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {item.label}
              </div>
              {item.metadata?.voltage && (
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {item.metadata.voltage}V
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
