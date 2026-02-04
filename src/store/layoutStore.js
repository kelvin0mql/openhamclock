/**
 * Layout Store - Manages dockable panel layout state
 * Uses flexlayout-react for panel resizing, docking, and tabs
 */

// Default layout configuration matching openhamclock's current structure
export const DEFAULT_LAYOUT = {
  global: {
    tabEnableFloat: false,
    tabSetMinWidth: 150,
    tabSetMinHeight: 100,
    borderMinSize: 100,
    splitterSize: 6,
    tabEnableClose: true,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabSetEnableTabStrip: true,
  },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 22,
        id: 'left-tabset',
        children: [
          {
            type: 'tab',
            name: 'Station',
            component: 'left-sidebar',
            id: 'left-sidebar-tab',
            enableClose: false,
          }
        ]
      },
      {
        type: 'tabset',
        weight: 56,
        id: 'center-tabset',
        children: [
          {
            type: 'tab',
            name: 'Map',
            component: 'world-map',
            id: 'map-tab',
            enableClose: false,
          }
        ]
      },
      {
        type: 'tabset',
        weight: 22,
        id: 'right-tabset',
        children: [
          {
            type: 'tab',
            name: 'DX Cluster',
            component: 'right-sidebar',
            id: 'right-sidebar-tab',
            enableClose: false,
          }
        ]
      }
    ]
  }
};

// Panel definitions for the panel picker
export const PANEL_DEFINITIONS = {
  // Left sidebar panels
  'de-location': { name: 'DE Location', icon: '📍', side: 'left', description: 'Your station location and weather' },
  'dx-location': { name: 'DX Target', icon: '🎯', side: 'left', description: 'Target location for DXing' },
  'solar': { name: 'Solar Indices', icon: '☀️', side: 'left', description: 'Sunspot numbers and solar flux' },
  'propagation': { name: 'Propagation', icon: '📡', side: 'left', description: 'Band conditions and forecasts' },

  // Right sidebar panels
  'dx-cluster': { name: 'DX Cluster', icon: '📻', side: 'right', description: 'Live DX spots from cluster' },
  'psk-reporter': { name: 'PSK Reporter', icon: '📡', side: 'right', description: 'Digital mode spots and WSJT-X' },
  'dxpeditions': { name: 'DXpeditions', icon: '🏝️', side: 'right', description: 'Upcoming DXpeditions' },
  'pota': { name: 'POTA', icon: '🏕️', side: 'right', description: 'Parks on the Air activators' },
  'contests': { name: 'Contests', icon: '🏆', side: 'right', description: 'Upcoming and active contests' },

  // Center panels
  'world-map': { name: 'World Map', icon: '🗺️', side: 'center', description: 'Interactive world map' },
};

// Load layout from localStorage
export const loadLayout = () => {
  try {
    const stored = localStorage.getItem('openhamclock_dockLayout');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate basic structure
      if (parsed.global && parsed.layout) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load layout from localStorage:', e);
  }
  return DEFAULT_LAYOUT;
};

// Save layout to localStorage
export const saveLayout = (layout) => {
  try {
    localStorage.setItem('openhamclock_dockLayout', JSON.stringify(layout));
  } catch (e) {
    console.error('Failed to save layout:', e);
  }
};

// Reset layout to default
export const resetLayout = () => {
  try {
    localStorage.removeItem('openhamclock_dockLayout');
  } catch (e) {
    console.error('Failed to reset layout:', e);
  }
  return DEFAULT_LAYOUT;
};
