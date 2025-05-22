export const calculateStockValue = (quantity, unitPrice) => quantity * unitPrice;

export const calculateStockTurnover = (salesQuantity, averageInventory) => salesQuantity / averageInventory;

export const calculateReorderPoint = (leadTime, averageDailySales, safetyStock) => leadTime * averageDailySales + safetyStock;

export const calculateEconomicOrderQuantity = (annualDemand, orderCost, holdingCost) => Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
