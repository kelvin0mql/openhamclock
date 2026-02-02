/**
 * PSKReporter Panel
 * Shows where your digital mode signals are being received
 * Uses MQTT WebSocket for real-time data
 */
import React, { useState, useMemo } from 'react';
import { usePSKReporter } from '../hooks/usePSKReporter.js';
import { getBandColor } from '../utils/callsign.js';

const PSKReporterPanel = ({ 
  callsign, 
  onShowOnMap, 
  showOnMap, 
  onToggleMap,
  filters = {},
  onOpenFilters
}) => {
  const [activeTab, setActiveTab] = useState('tx'); // Default to 'tx' (Being Heard)
  
  const { 
    txReports, 
    txCount, 
    rxReports, 
    rxCount, 
    loading, 
    error,
    connected,
    source,
    refresh 
  } = usePSKReporter(callsign, { 
    minutes: 15,
    enabled: callsign && callsign !== 'N0CALL'
  });

  // Filter reports by band, grid, and mode
  const filterReports = (reports) => {
    return reports.filter(r => {
      // Band filter
      if (filters?.bands?.length && !filters.bands.includes(r.band)) return false;
      
      // Grid filter (prefix match)
      if (filters?.grids?.length) {
        const grid = activeTab === 'tx' ? r.receiverGrid : r.senderGrid;
        if (!grid) return false;
        const gridPrefix = grid.substring(0, 2).toUpperCase();
        if (!filters.grids.includes(gridPrefix)) return false;
      }
      
      // Mode filter
      if (filters?.modes?.length && !filters.modes.includes(r.mode)) return false;
      
      return true;
    });
  };

  const filteredTx = useMemo(() => filterReports(txReports), [txReports, filters, activeTab]);
  const filteredRx = useMemo(() => filterReports(rxReports), [rxReports, filters, activeTab]);
  const filteredReports = activeTab === 'tx' ? filteredTx : filteredRx;

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.bands?.length) count++;
    if (filters?.grids?.length) count++;
    if (filters?.modes?.length) count++;
    return count;
  };
  const filterCount = getActiveFilterCount();

  // Get band color from frequency
  const getFreqColor = (freqMHz) => {
    if (!freqMHz) return 'var(--text-muted)';
    const freq = parseFloat(freqMHz);
    return getBandColor(freq);
  };

  // Format age
  const formatAge = (minutes) => {
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes/60)}h`;
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (connected) {
      return <span style={{ color: '#4ade80', fontSize: '10px' }}>● LIVE</span>;
    }
    if (source === 'connecting' || source === 'reconnecting') {
      return <span style={{ color: '#fbbf24', fontSize: '10px' }}>◐ {source}</span>;
    }
    if (error) {
      return <span style={{ color: '#ef4444', fontSize: '10px' }}>● offline</span>;
    }
    return null;
  };

  if (!callsign || callsign === 'N0CALL') {
    return (
      <div className="panel" style={{ padding: '10px' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '6px' }}>
          📡 PSKReporter
        </div>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '10px', fontSize: '11px' }}>
          Set callsign in Settings
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--accent-primary)', 
        fontWeight: '700', 
        marginBottom: '6px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <span>📡 PSKReporter {getStatusIndicator()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            {filteredReports.length}/{activeTab === 'tx' ? txCount : rxCount}
          </span>
          <button
            onClick={onOpenFilters}
            style={{
              background: filterCount > 0 ? 'rgba(255, 170, 0, 0.3)' : 'rgba(100, 100, 100, 0.3)',
              border: `1px solid ${filterCount > 0 ? '#ffaa00' : '#666'}`,
              color: filterCount > 0 ? '#ffaa00' : '#888',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer'
            }}
          >
            🔍 Filters
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            title={connected ? 'Reconnect' : 'Connect'}
            style={{
              background: 'rgba(100, 100, 100, 0.3)',
              border: '1px solid #666',
              color: '#888',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            🔄
          </button>
          {onToggleMap && (
            <button
              onClick={onToggleMap}
              style={{
                background: showOnMap ? 'rgba(68, 136, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                border: `1px solid ${showOnMap ? '#4488ff' : '#666'}`,
                color: showOnMap ? '#4488ff' : '#888',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono',
                cursor: 'pointer'
              }}
            >
              🗺️ {showOnMap ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px',
        marginBottom: '6px'
      }}>
        <button
          onClick={() => setActiveTab('tx')}
          style={{
            flex: 1,
            padding: '4px 6px',
            background: activeTab === 'tx' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(100, 100, 100, 0.2)',
            border: `1px solid ${activeTab === 'tx' ? '#4ade80' : '#555'}`,
            borderRadius: '3px',
            color: activeTab === 'tx' ? '#4ade80' : '#888',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono'
          }}
        >
          📤 Being Heard ({filterCount > 0 ? `${filteredTx.length}` : txCount})
        </button>
        <button
          onClick={() => setActiveTab('rx')}
          style={{
            flex: 1,
            padding: '4px 6px',
            background: activeTab === 'rx' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(100, 100, 100, 0.2)',
            border: `1px solid ${activeTab === 'rx' ? '#60a5fa' : '#555'}`,
            borderRadius: '3px',
            color: activeTab === 'rx' ? '#60a5fa' : '#888',
            cursor: 'pointer',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono'
          }}
        >
          📥 Hearing ({filterCount > 0 ? `${filteredRx.length}` : rxCount})
        </button>
      </div>

      {/* Reports list */}
      {error && !connected ? (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
          ⚠️ Connection failed - click 🔄 to retry
        </div>
      ) : loading && filteredReports.length === 0 && filterCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontSize: '11px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 8px' }} />
          Connecting to MQTT...
        </div>
      ) : !connected && filteredReports.length === 0 && filterCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
          Waiting for connection...
        </div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
          {filterCount > 0 
            ? 'No spots match filters'
            : activeTab === 'tx' 
              ? 'Waiting for spots... (TX to see reports)' 
              : 'No stations heard yet'}
        </div>
      ) : (
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {filteredReports.slice(0, 20).map((report, i) => {
            const freqMHz = report.freqMHz || (report.freq ? (report.freq / 1000000).toFixed(3) : '?');
            const color = getFreqColor(freqMHz);
            const displayCall = activeTab === 'tx' ? report.receiver : report.sender;
            const grid = activeTab === 'tx' ? report.receiverGrid : report.senderGrid;
            
            return (
              <div
                key={`${displayCall}-${report.freq}-${i}`}
                onClick={() => onShowOnMap && report.lat && report.lon && onShowOnMap(report)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '55px 1fr auto',
                  gap: '6px',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  marginBottom: '2px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  cursor: report.lat && report.lon ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  borderLeft: '2px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(68, 136, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'}
              >
                <div style={{ color, fontWeight: '600', fontSize: '11px' }}>
                  {freqMHz}
                </div>
                <div style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '11px'
                }}>
                  {displayCall}
                  {grid && <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px', fontSize: '9px' }}>{grid}</span>}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '10px'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{report.mode}</span>
                  {report.snr !== null && report.snr !== undefined && (
                    <span style={{ 
                      color: report.snr >= 0 ? '#4ade80' : report.snr >= -10 ? '#fbbf24' : '#f97316',
                      fontWeight: '600'
                    }}>
                      {report.snr > 0 ? '+' : ''}{report.snr}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                    {formatAge(report.age)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PSKReporterPanel;

export { PSKReporterPanel };
