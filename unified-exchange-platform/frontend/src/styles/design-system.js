// 👑 UNIFIED EXCHANGE - DESIGN SYSTEM
// Centralized styling for consistent UI/UX across all pages

export const colors = {
  // Primary Colors
  primary: '#00ff88',
  primaryDark: '#00cc6a',
  primaryLight: '#33ffaa',
  
  // Semantic Colors
  success: '#00ff88',
  danger: '#ff0055',
  warning: '#ffaa00',
  info: '#00aaff',
  
  // Background Colors
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgTertiary: '#161b22',
  bgCard: '#1a1a1a',
  bgHover: '#222222',
  bgOverlay: 'rgba(0, 0, 0, 0.8)',
  
  // Border Colors
  border: '#333333',
  borderLight: '#444444',
  borderDark: '#222222',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#666666',
  textDisabled: '#444444',
  
  // Chart Colors
  chartGreen: '#3fb950',
  chartRed: '#ff7b72',
  chartYellow: '#ffab00',
  chartBlue: '#58a6ff',
  
  // Asset Type Colors
  crypto: '#f7931a',
  forex: '#00aaff',
  stock: '#00ff88',
  etf: '#aa55ff',
  bond: '#ff5588',
  commodity: '#ffaa00',
  option: '#55ffaa',
  future: '#ff8855',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
    display: '64px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(0, 255, 136, 0.3)',
  glowDanger: '0 0 20px rgba(255, 0, 85, 0.3)',
};

export const transitions = {
  fast: 'all 0.1s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
};

export const zIndex = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// ===================== COMPONENT STYLES =====================

export const componentStyles = {
  // Page Container
  pageContainer: {
    minHeight: '100vh',
    background: colors.bgPrimary,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.primary,
  },

  // Header/Navbar
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${spacing.xl}`,
    background: colors.bgOverlay,
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${colors.border}`,
    zIndex: zIndex.sticky,
  },

  // Card
  card: {
    background: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },

  // Panel (for trading)
  panel: {
    background: colors.bgTertiary,
    border: `1px solid ${colors.borderDark}`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  // Button Primary
  buttonPrimary: {
    padding: `${spacing.sm} ${spacing.lg}`,
    background: colors.primary,
    color: colors.bgPrimary,
    border: 'none',
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
    transition: transitions.fast,
  },

  // Button Secondary
  buttonSecondary: {
    padding: `${spacing.sm} ${spacing.lg}`,
    background: 'transparent',
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
    transition: transitions.fast,
  },

  // Button Danger
  buttonDanger: {
    padding: `${spacing.sm} ${spacing.lg}`,
    background: colors.danger,
    color: colors.textPrimary,
    border: 'none',
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
    transition: transitions.fast,
  },

  // Input
  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.bgCard,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    outline: 'none',
    transition: transitions.fast,
  },

  // Select
  select: {
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.bgCard,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
    outline: 'none',
  },

  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHeader: {
    background: colors.bgPrimary,
    color: colors.textMuted,
    textAlign: 'left',
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${colors.border}`,
  },

  tableCell: {
    padding: spacing.md,
    borderBottom: `1px solid ${colors.borderDark}`,
    fontSize: typography.fontSize.sm,
  },

  // Badge
  badge: (type = 'default') => ({
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    background: `${colors[type]}22`,
    color: colors[type] || colors.textPrimary,
    border: `1px solid ${colors[type]}44`,
  }),

  // Stat Card
  statCard: {
    background: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },

  // Section Title
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // Link
  link: (isActive = false) => ({
    color: isActive ? colors.primary : colors.textSecondary,
    textDecoration: 'none',
    fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
    cursor: 'pointer',
    transition: transitions.fast,
  }),

  // Modal Overlay
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.modal,
  },

  // Modal Content
  modalContent: {
    background: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    zIndex: zIndex.tooltip,
    boxShadow: shadows.md,
  },

  // Loading Spinner container
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: spacing.xxl,
    color: colors.textMuted,
  },
};

// ===================== UTILITY FUNCTIONS =====================

export const getAssetColor = (type) => {
  const typeMap = {
    Crypto: colors.crypto,
    crypto: colors.crypto,
    Forex: colors.forex,
    forex: colors.forex,
    Stock: colors.stock,
    stock: colors.stock,
    ETF: colors.etf,
    etf: colors.etf,
    Bond: colors.bond,
    bond: colors.bond,
    Commodity: colors.commodity,
    commodity: colors.commodity,
    Option: colors.option,
    option: colors.option,
    Future: colors.future,
    future: colors.future,
  };
  return typeMap[type] || colors.textSecondary;
};

export const getPriceColor = (change) => {
  if (change > 0) return colors.success;
  if (change < 0) return colors.danger;
  return colors.textSecondary;
};

export const getStatusColor = (status) => {
  const statusMap = {
    active: colors.success,
    pending: colors.warning,
    completed: colors.info,
    cancelled: colors.textMuted,
    failed: colors.danger,
    healthy: colors.success,
    warning: colors.warning,
    critical: colors.danger,
  };
  return statusMap[status] || colors.textSecondary;
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  componentStyles,
  getAssetColor,
  getPriceColor,
  getStatusColor,
};
