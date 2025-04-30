export const formatCurrency = value => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export const generateChartColors = count => {
  const baseColors = [
    '#0EA5E9', // blue
    '#22C55E', // green
    '#EAB308', // yellow
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#F97316', // orange
    '#14B8A6', // teal
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Use golden angle approximation
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};
