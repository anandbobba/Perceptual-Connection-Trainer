/**
 * Premium Realism Analysis Panel
 * Features AI-driven insights, glassmorphism design, and professional metrics
 */

import { useState, useEffect } from 'react';
import { Scene } from '../types';
import { generateRealismReport, generateAIRealismReport, type RealismReport, exportRealismReport } from '../simulation/realism-engine';

interface RealismPanelProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
}

export function RealismAnalysisPanel({ scene, isOpen, onClose }: RealismPanelProps) {
  const [selectedTab, setSelectedTab] = useState<
    'summary' | 'ai' | 'bom' | 'thermal' | 'pcb' | 'signal' | 'export'
  >('summary');
  const [report, setReport] = useState<RealismReport | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Caching mechanism for AI reports
  const [aiCache, setAiCache] = useState<Record<string, RealismReport>>({});

  // Helper to generate a fingerprint for the scene - include metadata to detect property changes
  const getSceneFingerprint = () => {
    const nodesString = JSON.stringify(scene.nodes.map(n => ({ 
      id: n.id, 
      type: n.type, 
      metadata: n.metadata // Include metadata (resistance, voltage, etc.)
    })));
    const connectionsString = JSON.stringify(scene.connections.map(c => ({ 
      from: c.fromNodeId, 
      to: c.toNodeId,
      fromPin: c.fromPinId,
      toPin: c.toPinId
    })));
    return `${nodesString}-${connectionsString}`;
  };

  const handleAnalyzeAI = async () => {
    const fingerprint = getSceneFingerprint();
    
    // Check cache
    if (aiCache[fingerprint]) {
      setReport(aiCache[fingerprint]);
      return;
    }

    setIsAiLoading(true);
    // Clear previous error report if any to show we are starting fresh
    if (report?.aiAnalysis?.insights[0].includes('Failed to reach Gemini AI')) {
      const localReport = generateRealismReport(scene);
      setReport(localReport);
    }

    try {
      const aiReport = await generateAIRealismReport(scene);
      setReport(aiReport);
      // Update cache
      setAiCache(prev => ({ ...prev, [fingerprint]: aiReport }));
    } catch (err) {
      console.error('AI Report Error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate local report immediately, but AI is manual now
  useEffect(() => {
    if (!isOpen) return;
    const localReport = generateRealismReport(scene);
    
    // If we have a cached AI report for this fingerprint, use it
    const fingerprint = getSceneFingerprint();
    if (aiCache[fingerprint]) {
      setReport(aiCache[fingerprint]);
    } else {
      setReport(localReport);
    }
  }, [scene, isOpen]);

  if (!isOpen || !report) return null;

  const exportReport = (format: 'json' | 'csv' | 'html') => {
    const content = exportRealismReport(report, format);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/html'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit-realism-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="realism-panel-container">
      <div className="panel-overlay" onClick={onClose} />
      <div className="realism-panel pulse-border">
        <div className="panel-header">
          <div className="header-title">
            <span className="ai-badge">NEURAL CORE AI</span>
            <h2>RealSim Analysis</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="panel-tabs">
          {[
            { id: 'summary', icon: '📊', label: 'Summary' },
            { id: 'ai', icon: '✨', label: 'AI Insights' },
            { id: 'bom', icon: '🛒', label: 'BOM' },
            { id: 'thermal', icon: '🔥', label: 'Thermal' },
            { id: 'pcb', icon: '📐', label: 'PCB' },
            { id: 'signal', icon: '📡', label: 'Signal' },
            { id: 'export', icon: '💾', label: 'Export' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="panel-content">
          {selectedTab === 'summary' && <SummaryTab report={report} isAiLoading={isAiLoading} onAnalyzeAI={handleAnalyzeAI} />}
          {selectedTab === 'ai' && <AITab report={report} isLoading={isAiLoading} onAnalyzeAI={handleAnalyzeAI} />}
          {selectedTab === 'bom' && <BOMTab report={report} />}
          {selectedTab === 'thermal' && <ThermalTab report={report} />}
          {selectedTab === 'pcb' && <PCBTab report={report} />}
          {selectedTab === 'signal' && <SignalTab report={report} />}
          {selectedTab === 'export' && <ExportTab exportReport={exportReport} />}
        </div>

        <style>{`
          .realism-panel-container {
            position: fixed;
            inset: 0;
            z-index: 2000;
            display: flex;
            justify-content: flex-end;
          }

          .panel-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
          }

          .realism-panel {
            position: relative;
            width: 580px;
            height: 100vh;
            background: linear-gradient(165deg, rgba(10, 15, 28, 0.95) 0%, rgba(20, 25, 45, 0.98) 100%);
            backdrop-filter: blur(40px) saturate(200%);
            border-left: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            box-shadow: -40px 0 80px rgba(0, 0, 0, 0.6);
            animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            color: #e2e8f0;
            font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
            overflow: hidden;
          }

          .realism-panel::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
            animation: meshMove 20s linear infinite;
          }

          @keyframes meshMove {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes slideIn {
            from { transform: translateX(100%) scale(0.98); opacity: 0; }
            to { transform: translateX(0) scale(1); opacity: 1; }
          }

          .pulse-border {
            border-left: 3px solid transparent;
            border-image: linear-gradient(to bottom, #6366f1, #a855f7) 1;
          }

          .panel-header {
            padding: 40px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent);
            position: relative;
            z-index: 1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .header-title h2 {
            margin: 0;
            font-size: 32px;
            font-weight: 900;
            background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1px;
            filter: drop-shadow(0 2px 10px rgba(0,0,0,0.3));
          }

          .ai-badge {
            font-size: 11px;
            font-weight: 400;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #a5b4fc;
            padding: 4px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            display: inline-block;
            letter-spacing: 2px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
          }

          .close-btn {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #94a3b8;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .close-btn:hover {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.3);
            transform: rotate(90deg) scale(1.1);
          }

          .panel-tabs {
            display: flex;
            padding: 10px 20px;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
            background: rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
          }

          .tab-item {
            padding: 14px 20px;
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            opacity: 0.4;
            transition: all 0.4s;
            border-radius: 16px;
            min-width: 80px;
          }

          .tab-item.active {
            opacity: 1;
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.2);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }

          .tab-item:hover:not(.active) {
            opacity: 0.7;
            background: rgba(255, 255, 255, 0.04);
          }

          .tab-icon { font-size: 22px; filter: drop-shadow(0 0 10px currentColor); }
          .tab-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

          .panel-content {
            flex: 1;
            overflow-y: auto;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            position: relative;
            z-index: 1;
          }

          .panel-content::-webkit-scrollbar {
            width: 4px;
          }
          .panel-content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }

          .card {
            background: rgba(30, 41, 59, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .card:hover {
            border-color: rgba(99, 102, 241, 0.2);
            background: rgba(30, 41, 59, 0.5);
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 24px;
            color: #fff;
            letter-spacing: -0.5px;
          }

          .metric-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            padding: 24px;
            border-radius: 20px;
            position: relative;
          }

          .metric-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 20px;
            padding: 1px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
          }

          .label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1.5px; }
          .value { font-size: 32px; font-weight: 950; color: #fff; line-height: 1; }

          .health-pass { color: #10b981; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5)); }
          .health-warn { color: #f59e0b; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5)); }
          .health-crit { color: #ef4444; filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5)); }

          .list-item {
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 1.6;
            display: flex;
            gap: 14px;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.02);
            transition: all 0.2s;
          }

          .list-item:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .ai-trigger-btn {
            width: 100%;
            padding: 20px;
            margin-top: 10px;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            color: white;
            border: none;
            border-radius: 18px;
            font-weight: 900;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .ai-trigger-btn:hover:not(:disabled) {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(99, 102, 241, 0.6);
            filter: saturate(1.2) brightness(1.1);
          }

          .ai-trigger-btn:active {
            transform: translateY(0);
          }

          .ai-trigger-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #475569;
            box-shadow: none;
          }

          .wiring-suggestion {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.08), transparent);
            border-left: 4px solid #10b981;
            padding: 20px;
          }

          .ai-loader {
            padding: 60px 40px;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          .spinner {
            width: 70px;
            height: 70px;
            border: 3px solid rgba(99, 102, 241, 0.05);
            border-top: 3px solid #6366f1;
            border-right: 3px solid #a855f7;
            border-radius: 50%;
            animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            margin: 0 auto 30px;
            filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.5));
          }

          .badge {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .badge-safe { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
          .badge-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
          .badge-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

          table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
          th { text-align: left; padding: 0 15px; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; }
          td { padding: 20px 15px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.02); }
          tr td:first-child { border-radius: 18px 0 0 18px; font-weight: 700; color: #fff; }
          tr td:last-child { border-radius: 0 18px 18px 0; }

          .ai-insight-card {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
}

function SummaryTab({ report, isAiLoading, onAnalyzeAI }: { report: RealismReport; isAiLoading: boolean; onAnalyzeAI: () => void }) {
  const getRiskClass = (risk: string) => 
    risk === 'safe' ? 'health-pass' : risk === 'warning' ? 'health-warn' : 'health-crit';

  return (
    <>
      <div className="metric-grid">
        <div className="metric-card" style={{ gridColumn: 'span 2' }}>
          <div className="label">Neural Core System Health</div>
          <div className={`value ${getRiskClass(report.summary.overallRisk)}`} style={{ fontSize: '48px' }}>
            {report.summary.overallRisk.toUpperCase()}
          </div>
          <div style={{ 
            marginTop: '15px', 
            height: '6px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: report.summary.overallRisk === 'safe' ? '100%' : report.summary.overallRisk === 'warning' ? '60%' : '30%',
              height: '100%',
              background: report.summary.overallRisk === 'safe' ? '#10b981' : report.summary.overallRisk === 'warning' ? '#f59e0b' : '#ef4444',
              boxShadow: `0 0 10px ${report.summary.overallRisk === 'safe' ? '#10b981' : report.summary.overallRisk === 'warning' ? '#f59e0b' : '#ef4444'}`
            }} />
          </div>
        </div>
        <div className="metric-card">
          <div className="label">BOM Valuation</div>
          <div className="value">₹{report.summary.estimatedCost.toFixed(0)}</div>
        </div>
        <div className="metric-card">
          <div className="label">Production Yield</div>
          <div className="value">{report.summary.estimatedYield}%</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <span style={{ color: report.summary.violations.length > 0 ? '#ef4444' : '#10b981' }}>⚡</span>
          Engineering Diagnostics ({report.summary.violations.length})
        </div>
        {report.summary.violations.length > 0 ? (
          <div>
            {report.summary.violations.map((v, i) => (
              <div key={i} className="list-item">
                <span style={{ color: '#ef4444' }}>⚠️</span>
                {v}
              </div>
            ))}
          </div>
        ) : (
          <div className="list-item" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
            ✨ No critical design violations detected. Your circuit design is robust!
          </div>
        )}
      </div>

      <div className="card ai-insight-card">
        <div className="section-title">✨ Neural Core Suggestions</div>
        {report.summary.recommendations.slice(0, 3).map((r, i) => (
          <div key={i} className="list-item">
            <span style={{ color: '#6366f1' }}>⚡</span>
            {r.replace('AI Alert: ', '').replace('AI Opt: ', '')}
          </div>
        ))}
        {isAiLoading && (
          <div className="ai-loader" style={{ padding: '20px' }}>
            <div className="spinner" style={{ width: '30px', height: '30px', marginBottom: '10px' }} />
            <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700 }}>Synthesizing topology...</div>
          </div>
        )}
        
        {(!report.aiAnalysis || report.aiAnalysis.insights?.[0]?.includes('Failed to reach Gemini AI')) && !isAiLoading && (
          <button className="ai-trigger-btn" onClick={onAnalyzeAI} disabled={isAiLoading}>
            {report.aiAnalysis ? '🔄 Retry AI Analysis' : '✨ Scan for AI Insights'}
          </button>
        )}
      </div>
    </>
  );
}

function AITab({ report, isLoading, onAnalyzeAI }: { report: RealismReport; isLoading: boolean; onAnalyzeAI: () => void }) {
  if (isLoading) {
    return (
      <div className="ai-loader">
        <div className="spinner"></div>
        <div>
          <h3 style={{ margin: '0 0 8px' }}>Scanning Circuit Topology...</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Consulting Neural Core AI for professional engineering feedback</p>
        </div>
      </div>
    );
  }

  if (!report.aiAnalysis || report.aiAnalysis.insights?.[0]?.includes('Failed to reach Neural Core')) {
    const isError = report.aiAnalysis?.insights?.[0]?.includes('Failed to reach Neural Core');
    return (
      <div className="ai-loader">
        <div className="spinner" style={{ display: !isLoading ? 'none' : 'block' }} />
        {!isLoading && <div style={{ fontSize: '64px', marginBottom: '30px', filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.6))' }}>🧠</div>}
        <h3 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 900 }}>Neural Engineering Core</h3>
        <p style={{ margin: '0 0 32px', color: '#94a3b8', fontSize: '15px', maxWidth: '400px', marginInline: 'auto', lineHeight: 1.6 }}>
          {isError 
            ? 'The neural processors are currently recalibrating. System access will resume shortly.'
            : 'Initialize advanced multiversal topology analysis, thermal dissipation modeling, and signal integrity validation.'}
        </p>
        <button className="ai-trigger-btn" onClick={onAnalyzeAI} style={{ maxWidth: '320px' }} disabled={isLoading}>
          {isError ? '🔄 Reinitialize Core' : '✨ Synchronize Neural AI'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="card ai-insight-card">
        <div className="section-title">⚡ Deep Topology Insights</div>
        {report.aiAnalysis.insights.map((insight, i) => (
          <div key={i} className="list-item">
            <span style={{ color: '#6366f1' }}>✦</span>
            {insight}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">💎 Design Optimizations</div>
        {report.aiAnalysis.optimizations.map((opt, i) => (
          <div key={i} className="list-item">
            <span style={{ color: '#a855f7' }}>✧</span>
            {opt}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">🚀 Extraordinary Capabilities</div>
        {report.aiAnalysis.extraordinaryFeatures.map((feat, i) => (
          <div key={i} className="list-item">
            <span style={{ color: '#ec4899' }}>⚛</span>
            {feat}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">🔗 Wiring & Connections</div>
        {report.aiAnalysis.wiringSuggestions.map((sug, i) => (
          <div key={i} className="list-item wiring-suggestion">
            <div>
              <div style={{ fontWeight: 700, marginBottom: '4px', color: '#10b981' }}>{sug.from} → {sug.to}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{sug.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BOMTab({ report }: { report: RealismReport }) {
  return (
    <>
      <div className="card">
        <div className="label">Total Project Cost</div>
        <div className="value" style={{ fontSize: '36px' }}>₹{report.billOfMaterials.totalCost.toFixed(2)}</div>
        <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Based on current market prices with {report.billOfMaterials.items.length} items.
        </p>
      </div>

      <div className="card">
        <div className="section-title">📦 Inventory & Logistics</div>
        <table>
          <thead>
            <tr>
              <th>Part Node</th>
              <th>Qty</th>
              <th>Unit Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {report.billOfMaterials.items.map((item, i) => (
              <tr key={i}>
                <td>{item.label}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td>₹{item.unitPrice.toFixed(2)}</td>
                <td style={{ color: '#a5b4fc', fontWeight: 800 }}>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, background: 'transparent', border: 'none' }}>Total Valuation:</td>
              <td style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '18px', fontWeight: 900, color: '#fff' }}>₹{report.billOfMaterials.totalCost.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

function ThermalTab({ report }: { report: RealismReport }) {
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="label">Peak Core Temp</div>
          <div className={`value ${report.thermalAnalysis.peakComponentTemperature > 60 ? 'health-crit' : 'health-pass'}`}>
            {report.thermalAnalysis.peakComponentTemperature.toFixed(1)}°C
          </div>
        </div>
        <div className="metric-card">
          <div className="label">Total Dissipation</div>
          <div className="value">{(report.thermalAnalysis.totalPowerDissipation / 1000).toFixed(2)}W</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">🔥 Thermal Topography Risk</div>
        {report.thermalAnalysis.thermalRisks.map((risk, i) => (
          <div key={i} className="list-item">
            <span className={`badge badge-${risk.severity}`} style={{ width: '80px', textAlign: 'center' }}>{risk.severity.toUpperCase()}</span>
            <div style={{ flex: 1, paddingLeft: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{risk.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                <span style={{ color: '#fff' }}>{risk.estimatedTemperature.toFixed(1)}°C</span> 
                <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span> 
                Limit: {risk.maxAllowedTemperature}°C
              </div>
            </div>
            <div style={{ fontSize: '20px' }}>{risk.estimatedTemperature > 60 ? '🔴' : '🟢'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PCBTab({ report }: { report: RealismReport }) {
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)' }}>
        <div className="label">Neural Core Manufacturing Yield</div>
        <div className="value" style={{ color: '#10b981', fontSize: '42px', letterSpacing: '-2px' }}>{report.pcbAnalysis.manufacturingYield}%</div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${report.pcbAnalysis.manufacturingYield}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #10b981, #34d399)', 
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)' 
          }} />
        </div>
      </div>

      <div className="card">
        <div className="section-title">🛠 Architectural DFM Rules</div>
        {report.pcbAnalysis.recommendations.map((rec, i) => (
          <div key={i} className="list-item">
            <span style={{ color: '#10b981', fontSize: '18px' }}>★</span>
            <span style={{ fontWeight: 500 }}>{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalTab({ report }: { report: RealismReport }) {
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
        <div className="label">Neural Flux Quality</div>
        <div className="value" style={{ color: '#6366f1', fontSize: '38px' }}>{report.signalIntegrity.overallQuality.toUpperCase()}</div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>Advanced signal path telemetry synchronization</div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="label">Crosstalk Flux</div>
          <div className="value" style={{ fontSize: '24px' }}>{report.signalIntegrity.noiseAnalysis.crossTalk.toFixed(2)}%</div>
        </div>
        <div className="metric-card">
          <div className="label">Neural Bounce</div>
          <div className="value" style={{ fontSize: '24px' }}>{report.signalIntegrity.noiseAnalysis.groundBounce.toFixed(2)}mV</div>
        </div>
      </div>
    </div>
  );
}

function ExportTab({ exportReport }: { exportReport: (f: 'json' | 'csv' | 'html') => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.6s ease-out' }}>
      <button onClick={() => exportReport('html')} className="card" style={{ cursor: 'pointer', textAlign: 'left', width: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>💎 Premium Neural Report</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>Full architectural analysis documentation (HTML)</div>
      </button>
      
      <button onClick={() => exportReport('json')} className="card" style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <div style={{ fontSize: '18px', fontWeight: 800 }}>📂 System Object Export</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Raw topology data for Neural Core integration</div>
      </button>

      <button onClick={() => exportReport('csv')} className="card" style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <div style={{ fontSize: '18px', fontWeight: 800 }}>📊 Parametric CSV Matrix</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Tabular data for inventory and valuation systems</div>
      </button>
    </div>
  );
}
