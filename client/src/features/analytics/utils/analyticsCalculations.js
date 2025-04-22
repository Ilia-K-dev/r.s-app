export const calculateBudgetVariance = (budgetAmount, actualSpending) => {
  const variance = actualSpending - budgetAmount;
  const percentageVariance = (variance / budgetAmount) * 100;
  return {
    variance,
    percentageVariance: percentageVariance.toFixed(2)
  };
};

export const calculateInventoryTurnoverRatio = (costOfGoodsSold, averageInventory) => {
  return (costOfGoodsSold / averageInventory).toFixed(2);
};

export const calculateDaysOfInventoryOnHand = (averageInventory, costOfGoodsSold, numberOfDays) => {
  return Math.ceil((averageInventory / costOfGoodsSold) * numberOfDays);
};

export const calculateGrowthRate = (data) => {
  if (!data || data.length < 2) return 0;
  const firstValue = data[0].amount;
  const lastValue = data[data.length - 1].amount;
  return ((lastValue - firstValue) / firstValue) * 100;
};

export const generateForecast = (data) => {
  if (!data || data.length < 2) return [];
  
  // Simple linear regression
  const xValues = data.map((_, i) => i);
  const yValues = data.map(item => item.amount);
  
  const n = data.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
  const sumXX = xValues.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(data[data.length - 1].date).setDate(
      new Date(data[data.length - 1].date).getDate() + i + 1
    ),
    amount: slope * (data.length + i) + intercept
  }));
};