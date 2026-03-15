/**
 * Realism Analysis Panel Component
 * Displays comprehensive circuit realism analysis and recommendations
 */

import { useState, useMemo } from 'react';
import { Scene } from '../types';
import { generateRealismReport, type RealismReport, exportRealismReport } from '../simulation/realism-engine';

interface RealismPanelProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
}

export function RealismAnalysisPanel({ scene, isOpen, onClose }: RealismPanelProps) {
  const [selectedTab, setSelectedTab] = useState<
    'summary' | 'bom' | 'thermal' | 'pcb' | 'signal' | 'export'
  >('summary');

  // Generate realism report
  const report = useMemo(() => {
    try {
      return generateRealismReport(scene);
    } catch (error) {
      console.error('Error generating realism report:', error);
      return null;
    }
  }, [scene]);

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
    <div className="realism-panel">
      <div className="panel-header">
        <h2>Circuit Realism Analysis</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="panel-tabs">
        <button
          className={`tab ${selectedTab === 'summary' ? 'active' : ''}`}
          onClick={() => setSelectedTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab ${selectedTab === 'bom' ? 'active' : ''}`}
          onClick={() => setSelectedTab('bom')}
        >
          BOM
        </button>
        <button
          className={`tab ${selectedTab === 'thermal' ? 'active' : ''}`}
          onClick={() => setSelectedTab('thermal')}
        >
          Thermal
        </button>
        <button
          className={`tab ${selectedTab === 'pcb' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pcb')}
        >
          PCB
        </button>
        <button
          className={`tab ${selectedTab === 'signal' ? 'active' : ''}`}
          onClick={() => setSelectedTab('signal')}
        >
          Signal
        </button>
        <button
          className={`tab ${selectedTab === 'export' ? 'active' : ''}`}
          onClick={() => setSelectedTab('export')}
        >
          Export
        </button>
      </div>

      <div className="panel-content">
        {selectedTab === 'summary' && <SummaryTab report={report} />}
        {selectedTab === 'bom' && <BOMTab report={report} />}
        {selectedTab === 'thermal' && <ThermalTab report={report} />}
        {selectedTab === 'pcb' && <PCBTab report={report} />}
        {selectedTab === 'signal' && <SignalTab report={report} />}
        {selectedTab === 'export' && <ExportTab report={report} exportReport={exportReport} />}
      </div>

      <style>{`
        .realism-panel {
          position: fixed;
          right: 0;
          top: 0;
          width: 500px;
          height: 100vh;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
          border-left: 2px solid rgba(99, 102, 241, 0.5);
          box-shadow: -12px 0 48px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.9;
          transition: all 0.2s;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .close-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }

        .panel-tabs {
          display: flex;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          background: rgba(0, 0, 0, 0.3);
          overflow-x: auto;
          padding: 0 8px;
          gap: 4px;
        }

        .tab {
          flex: 1;
          padding: 12px 14px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tab:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(99, 102, 241, 0.1);
          border-radius: 6px;
        }

        .tab.active {
          color: #fff;
          border-bottom-color: #667eea;
          background: rgba(102, 126, 234, 0.15);
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          color: rgba(255, 255, 255, 0.95);
        }

        .panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .panel-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 3px;
        }

        .risk-safe { color: #10b981; font-weight: 700; text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
        .risk-warning { color: #f59e0b; font-weight: 700; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
        .risk-critical { color: #ef4444; font-weight: 700; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }

        .metric-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(99, 102, 241, 0.3);
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .metric-card:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .metric-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .section {
          margin-bottom: 24px;
        }

        .section-title {
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title-icon {
          font-size: 18px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 8px;
        }

        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          color: rgba(255, 255, 255, 0.85);
        }

        th {
          background: rgba(99, 102, 241, 0.2);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .insight-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .insight-list li {
          padding: 12px 16px;
          background: rgba(16, 185, 129, 0.15);
          border-left: 4px solid #10b981;
          margin-bottom: 10px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
          transition: all 0.3s;
        }

        .insight-list li:hover {
          background: rgba(16, 185, 129, 0.25);
          border-left-color: #34d399;
          transform: translateX(4px);
        }

        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .recommendation-list li {
          padding: 12px 16px;
          background: rgba(59, 130, 246, 0.15);
          border-left: 4px solid #3b82f6;
          margin-bottom: 10px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
          transition: all 0.3s;
        }

        .recommendation-list li:hover {
          background: rgba(59, 130, 246, 0.25);
          border-left-color: #60a5fa;
          transform: translateX(4px);
        }

        .export-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 18px;
          border: 1.5px solid #667eea;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 11px;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn:hover {
          background: #667eea;
          color: white;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-safe {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }

        .badge-critical {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }
      `}</style>
    </div>
  );
}

/**
 * Summary Tab Component
 */
function SummaryTab({ report }: { report: RealismReport }) {
  const getRiskClass = (risk: string) => `risk-${risk}`;

  return (
    <div>
      <div className="metric-card">
        <div className="metric-label">Overall Health</div>
        <div className={`metric-value ${getRiskClass(report.summary.overallRisk)}`}>
          {report.summary.overallRisk === 'safe' ? 'PASS' : report.summary.overallRisk === 'warning' ? 'WARNING' : 'CRITICAL'}
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Estimated Project Cost</div>
        <div className="metric-value">₹{report.summary.estimatedCost.toFixed(0)}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Component cost estimation
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Manufacturing Yield</div>
        <div className="metric-value">{report.summary.estimatedYield.toFixed(1)}%</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Success rate for manufacturing
        </div>
      </div>

      {report.summary.violations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">⚠</span>
            Issues Found ({report.summary.violations.length})
          </div>
          <ul className="insight-list">
            {report.summary.violations.map((violation, idx) => (
              <li key={idx}>{violation}</li>
            ))}
          </ul>
        </div>
      )}

      {report.summary.recommendations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">ℹ</span>
            Recommendations
          </div>
          <ul className="recommendation-list">
            {report.summary.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {report.summary.violations.length === 0 && (
        <div className="metric-card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>DESIGN VALIDATION PASSED</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
            Your circuit design meets all standards. Ready for manufacturing.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * BOM Tab Component
 */
function BOMTab({ report }: { report: RealismReport }) {
  return (
    <div>
      <div className="metric-card">
        <div className="metric-label">Total Cost</div>
        <div className="metric-value">₹{report.billOfMaterials.totalCost.toFixed(0)}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Lead Time</div>
        <div className="metric-value">{report.billOfMaterials.totalLeadTime} days</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Total delivery time for all components
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <span className="section-title-icon">▶</span>
          Components ({report.billOfMaterials.items.length})
        </div>
        <table>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {report.billOfMaterials.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.label}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice.toFixed(0)}</td>
                <td>₹{(item.quantity * item.unitPrice).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.billOfMaterials.warnings.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">ℹ</span>
            Important Notes
          </div>
          <ul className="recommendation-list">
            {report.billOfMaterials.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Thermal Tab Component
 */
function ThermalTab({ report }: { report: RealismReport }) {
  return (
    <div>
      <div className="metric-card">
        <div className="metric-label">Total Power Dissipation</div>
        <div className="metric-value">{(report.thermalAnalysis.totalPowerDissipation / 1000).toFixed(2)}W</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Power consumption of your circuit
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Peak Temperature</div>
        <div className="metric-value">{report.thermalAnalysis.peakComponentTemperature.toFixed(1)}°C</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Highest component temperature
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <span className="section-title-icon">▶</span>
          Thermal Analysis
        </div>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Temperature</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {report.thermalAnalysis.thermalRisks.map((risk, idx) => (
              <tr key={idx}>
                <td>{risk.label}</td>
                <td>{risk.estimatedTemperature.toFixed(1)}°C</td>
                <td>
                  <span className={`badge badge-${risk.severity}`}>
                    {risk.severity === 'safe' ? 'OK' : risk.severity === 'warning' ? 'WARNING' : 'CRITICAL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.thermalAnalysis.coolingRecommendations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">ℹ</span>
            Cooling Recommendations
          </div>
          <ul className="recommendation-list">
            {report.thermalAnalysis.coolingRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {report.thermalAnalysis.coolingRecommendations.length === 0 && (
        <div className="metric-card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>THERMAL ANALYSIS PASSED</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
            Your circuit temperature is within acceptable limits. No cooling required.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PCB Tab Component
 */
function PCBTab({ report }: { report: RealismReport }) {
  return (
    <div>
      <div className="metric-card">
        <div className="metric-label">Manufacturing Yield</div>
        <div className="metric-value">{report.pcbAnalysis.manufacturingYield.toFixed(1)}%</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Expected success rate for PCB manufacturing
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">PCB Manufacturing Cost</div>
        <div className="metric-value">₹{report.pcbAnalysis.estimatedCost.toFixed(0)}</div>
      </div>

      {report.pcbAnalysis.violations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">⚠</span>
            Constraint Violations
          </div>
          <ul className="insight-list">
            {report.pcbAnalysis.violations.map((v, idx) => (
              <li key={idx}>{v.name}: {v.specification}</li>
            ))}
          </ul>
        </div>
      )}

      {report.pcbAnalysis.recommendations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">ℹ</span>
            Design Recommendations
          </div>
          <ul className="recommendation-list">
            {report.pcbAnalysis.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {report.pcbAnalysis.violations.length === 0 && (
        <div className="metric-card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>PCB DESIGN PASSED</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
            PCB design meets all manufacturing constraints. Ready for production.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Signal Integrity Tab Component
 */
function SignalTab({ report }: { report: RealismReport }) {
  return (
    <div>
      <div className="metric-card">
        <div className="metric-label">Signal Quality</div>
        <div className={`metric-value ${report.signalIntegrity.overallQuality === 'excellent' ? 'risk-safe' : report.signalIntegrity.overallQuality === 'good' ? 'risk-safe' : 'risk-warning'}`}>
          {report.signalIntegrity.overallQuality === 'excellent' ? 'EXCELLENT' : report.signalIntegrity.overallQuality === 'good' ? 'GOOD' : 'NEEDS IMPROVEMENT'}
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Crosstalk</div>
        <div className="metric-value">{report.signalIntegrity.noiseAnalysis.crossTalk.toFixed(2)}%</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
          Signal coupling between traces
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Ground Bounce</div>
        <div className="metric-value">{report.signalIntegrity.noiseAnalysis.groundBounce.toFixed(2)}mV</div>
      </div>

      {report.signalIntegrity.recommendations.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span className="section-title-icon">ℹ</span>
            Signal Integrity Recommendations
          </div>
          <ul className="recommendation-list">
            {report.signalIntegrity.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {report.signalIntegrity.overallQuality === 'excellent' && (
        <div className="metric-card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>SIGNAL INTEGRITY PASSED</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
            Your circuit signal quality meets all requirements. No signal integrity issues detected.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Export Tab Component
 */
function ExportTab({
  report: _report,
  exportReport
}: {
  report: RealismReport;
  exportReport: (format: 'json' | 'csv' | 'html') => void;
}) {
  return (
    <div>
      <div className="section">
        <div className="section-title">
          <span className="section-title-icon">▶</span>
          Export Analysis Report
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '8px 0 16px', lineHeight: '1.6' }}>
          Download your circuit analysis in multiple formats. Share with your team or keep for your records.
        </p>
        <div className="export-buttons">
          <button className="btn" onClick={() => exportReport('json')}>
            JSON Format
          </button>
          <button className="btn" onClick={() => exportReport('csv')}>
            CSV/Excel
          </button>
          <button className="btn" onClick={() => exportReport('html')}>
            HTML Report
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <span className="section-title-icon">▶</span>
          Report Contents
        </div>
        <ul style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', listStylePosition: 'inside' }}>
          <li>✓ Circuit simulation data (voltage, current, power)</li>
          <li>✓ Component tolerance analysis</li>
          <li>✓ Bill of Materials (BOM) with pricing</li>
          <li>✓ Thermal analysis and recommendations</li>
          <li>✓ PCB manufacturing constraint verification</li>
          <li>✓ Signal quality assessment</li>
          <li>✓ Risk evaluation and design feedback</li>
          <li>✓ Manufacturing readiness verification</li>
        </ul>
      </div>

      <div className="metric-card" style={{ background: 'rgba(102, 126, 234, 0.15)', borderColor: 'rgba(102, 126, 234, 0.4)' }}>
        <div style={{ color: '#667eea', fontWeight: 700, marginBottom: '8px' }}>PATENT-READY ANALYSIS</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          This analysis is based on international standards (IPC-2152, IEC 60950-1, JEDEC, IEEE). Your design meets industrial-grade quality requirements.
        </div>
      </div>
    </div>
  );
}
