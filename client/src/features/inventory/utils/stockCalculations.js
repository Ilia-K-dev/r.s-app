export const calculateStockValue = (quantity, unitPrice) => {
    return quantity * unitPrice;
  };
  
  export const calculateStockTurnover = (salesQuantity, averageInventory) => {
    return salesQuantity / averageInventory;
  };
  
  export const calculateReorderPoint = (leadTime, averageDailySales, safetyStock) => {
    return (leadTime * averageDailySales) + safetyStock;
  };
  
  export const calculateEconomicOrderQuantity = (annualDemand, orderCost, holdingCost) => {
    return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  };