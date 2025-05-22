import { fetchUserReceipts, fetchReceiptsByYear, fetchUserInventory, fetchStockMovements } from './dataFetchers';

// Calculate spending by category
export const calculateSpendingByCategory = (receipts) => {
  const categories = {};

  receipts.forEach(receipt => {
    const category = receipt.category || 'Uncategorized';
    const amount = receipt.total || receipt.amount || 0;

    if (!categories[category]) {
      categories[category] = 0;
    }

    categories[category] += amount;
  });

  // Convert to array format for charting
  return Object.keys(categories).map(category => ({
    category,
    amount: categories[category],
    // Format to 2 decimal places
    formattedAmount: categories[category].toFixed(2)
  }));
};

// Calculate monthly spending
export const calculateMonthlySpending = (receipts) => {
  const months = {};

  // Initialize all months to ensure we have entries even for months without spending
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    months[monthNames[i]] = 0;
  }

  receipts.forEach(receipt => {
    const date = receipt.date.toDate ? receipt.date.toDate() : new Date(receipt.date);
    const monthName = monthNames[date.getMonth()];
    const amount = receipt.total || receipt.amount || 0;

    months[monthName] += amount;
  });

  // Convert to array format for charting
  return Object.keys(months).map(month => ({
    month,
    amount: months[month],
    formattedAmount: months[month].toFixed(2)
  }));
};

// Calculate top merchants
export const calculateTopMerchants = (receipts, limit = 5) => {
  const merchants = {};

  receipts.forEach(receipt => {
    const merchant = receipt.merchant || 'Unknown';
    const amount = receipt.total || receipt.amount || 0;

    if (!merchants[merchant]) {
      merchants[merchant] = {
        total: 0,
        count: 0
      };
    }

    merchants[merchant].total += amount;
    merchants[merchant].count += 1;
  });

  // Convert to array and sort by total spending
  const sortedMerchants = Object.keys(merchants).map(merchant => ({
    merchant,
    total: merchants[merchant].total,
    count: merchants[merchant].count,
    formattedTotal: merchants[merchant].total.toFixed(2)
  })).sort((a, b) => b.total - a.total);

  // Return only the top merchants based on limit
  return sortedMerchants.slice(0, limit);
};

// Calculate inventory value trend
export const calculateInventoryValueTrend = (inventory, stockMovements) => {
  // Create a map of inventory items by ID for quick lookup
  const inventoryMap = inventory.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  // Group stock movements by date (using day as granularity)
  const movementsByDate = {};

  stockMovements.forEach(movement => {
    const date = movement.timestamp.toDate ? movement.timestamp.toDate() : new Date(movement.timestamp);
    const dateString = date.toISOString().split('T')[0];

    if (!movementsByDate[dateString]) {
      movementsByDate[dateString] = [];
    }

    movementsByDate[dateString].push(movement);
  });

  // Calculate daily inventory value
  const valueTrend = [];
  let currentValue = inventory.reduce((total, item) => {
    return total + (item.quantity * (item.unitCost || 0));
  }, 0);

  // Sort dates chronologically
  const sortedDates = Object.keys(movementsByDate).sort();

  sortedDates.forEach(date => {
    const movements = movementsByDate[date];

    movements.forEach(movement => {
      const item = inventoryMap[movement.inventoryId];
      if (item) {
        const unitCost = item.unitCost || 0;
        if (movement.type === 'add') {
          currentValue += movement.quantity * unitCost;
        } else if (movement.type === 'remove') {
          currentValue -= movement.quantity * unitCost;
        }
      }
    });

    valueTrend.push({
      date,
      value: currentValue,
      formattedValue: currentValue.toFixed(2)
    });
  });

  return valueTrend;
};

// Calculate inventory turnover ratio
export const calculateInventoryTurnover = (inventory, stockMovements) => {
  // Calculate cost of goods sold (sum of all "remove" movements)
  const cogs = stockMovements
    .filter(movement => movement.type === 'remove')
    .reduce((total, movement) => {
      const item = inventory.find(i => i.id === movement.inventoryId);
      const unitCost = item ? (item.unitCost || 0) : 0;
      return total + (movement.quantity * unitCost);
    }, 0);

  // Calculate average inventory value
  const inventoryValue = inventory.reduce((total, item) => {
    return total + (item.quantity * (item.unitCost || 0));
  }, 0);

  // Avoid division by zero
  const turnover = inventoryValue > 0 ? cogs / inventoryValue : 0;

  return {
    turnover,
    formattedTurnover: turnover.toFixed(2),
    cogs,
    formattedCogs: cogs.toFixed(2),
    averageInventoryValue: inventoryValue,
    formattedInventoryValue: inventoryValue.toFixed(2)
  };
};
