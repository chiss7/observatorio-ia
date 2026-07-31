const MONO_STACK =
  "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const COLORS = {
  ink: '#0B1120',
  slate: '#64748B',
  hairline: 'rgba(15, 23, 42, 0.08)',
  indigo: '#4F46E5',
  cyan: '#0E7490',
  amber: '#B45309',
  rose: '#FF4D8D',
  green: '#16a34a',
  neutral: '#95a5a6',
};

// Chart.js global defaults tuned for the refined light "instrument panel".
export const applyChartDefaults = (ChartJS) => {
  ChartJS.defaults.font.family = MONO_STACK;
  ChartJS.defaults.font.size = 11;
  ChartJS.defaults.color = COLORS.slate;
  ChartJS.defaults.borderColor = 'rgba(15, 23, 42, 0.06)';
};

export const baseTooltip = {
  backgroundColor: COLORS.ink,
  titleColor: '#94A3B8',
  bodyColor: '#F8FAFC',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
  boxPadding: 4,
  usePointStyle: true,
  titleFont: { family: MONO_STACK, size: 11, weight: '500' },
  bodyFont: { family: MONO_STACK, size: 12, weight: '600' },
};

export const legendStyle = {
  position: 'bottom',
  labels: {
    boxWidth: 10,
    boxHeight: 10,
    borderRadius: 3,
    usePointStyle: true,
    pointStyle: 'rectRounded',
    padding: 16,
    font: { family: MONO_STACK, size: 11, weight: '500' },
    color: COLORS.slate,
  },
};

export const gridLine = (color = 'rgba(15, 23, 42, 0.06)') => ({
  color,
  drawBorder: false,
  drawTicks: false,
});

export const formatCompact = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};
