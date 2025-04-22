"use strict";
const logger = require('../logger'); //good
class PriceCalculator {
    constructor() {
        this.unitConversions = {
            // Weight
            mg: 0.001,
            g: 1,
            kg: 1000,
            oz: 28.3495,
            lb: 453.592,
            // Volume
            ml: 0.001,
            l: 1,
            gal: 3.78541,
            fl_oz: 0.0295735,
            // Length
            mm: 0.001,
            cm: 0.01,
            m: 1,
            in: 0.0254,
            ft: 0.3048,
            // Count/Pack
            pc: 1,
            pack: 1,
            dozen: 12
        };
    }
    calculateUnitPrice(price, quantity, fromUnit, toUnit = null) {
        try {
            if (!price || !quantity || quantity <= 0) {
                throw new Error('Invalid price or quantity');
            }
            // If no unit conversion needed, simply divide price by quantity
            if (!fromUnit || !toUnit) {
                return {
                    unitPrice: price / quantity,
                    baseUnit: 'pc'
                };
            }
            // Normalize units
            fromUnit = fromUnit.toLowerCase();
            toUnit = toUnit.toLowerCase();
            // Validate units
            if (!this.unitConversions[fromUnit] || !this.unitConversions[toUnit]) {
                throw new Error('Invalid unit type');
            }
            // Convert to base unit first, then to target unit
            const baseQuantity = quantity * this.unitConversions[fromUnit];
            const targetQuantity = baseQuantity / this.unitConversions[toUnit];
            return {
                unitPrice: price / targetQuantity,
                baseUnit: toUnit
            };
        }
        catch (error) {
            logger.error('Unit price calculation error:', error);
            throw error;
        }
    }
    extractUnitFromString(text) {
        // Common unit patterns
        const patterns = {
            weight: /(?:mg|g|kg|oz|lbs?)\b/i,
            volume: /(?:ml|l|gal|fl oz)\b/i,
            length: /(?:mm|cm|m|in|ft)\b/i,
            count: /(?:pc|pack|dozen)\b/i
        };
        for (const [type, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                return {
                    unit: match[0].toLowerCase(),
                    type
                };
            }
        }
        return null;
    }
    standardizeUnit(unit) {
        const unitMappings = {
            // Weight
            'milligram': 'mg',
            'milligrams': 'mg',
            'gram': 'g',
            'grams': 'g',
            'kilogram': 'kg',
            'kilograms': 'kg',
            'ounce': 'oz',
            'ounces': 'oz',
            'pound': 'lb',
            'pounds': 'lb',
            // Volume
            'milliliter': 'ml',
            'milliliters': 'ml',
            'liter': 'l',
            'liters': 'l',
            'gallon': 'gal',
            'gallons': 'gal',
            'fluid ounce': 'fl_oz',
            'fluid ounces': 'fl_oz',
            // Count
            'piece': 'pc',
            'pieces': 'pc',
            'pack': 'pack',
            'packs': 'pack',
            'dozen': 'dozen',
            'dozens': 'dozen'
        };
        return unitMappings[unit.toLowerCase()] || unit.toLowerCase();
    }
    compareUnitPrices(items) {
        try {
            const normalizedPrices = items.map(item => {
                const { unitPrice, baseUnit } = this.calculateUnitPrice(item.price, item.quantity, item.unit, item.compareUnit || item.unit);
                return {
                    ...item,
                    normalizedPrice: unitPrice,
                    normalizedUnit: baseUnit
                };
            });
            // Sort by unit price
            return normalizedPrices.sort((a, b) => a.normalizedPrice - b.normalizedPrice);
        }
        catch (error) {
            logger.error('Price comparison error:', error);
            throw error;
        }
    }
    calculateBulkDiscount(regularPrice, bulkPrice, regularQty, bulkQty) {
        const regularUnitPrice = regularPrice / regularQty;
        const bulkUnitPrice = bulkPrice / bulkQty;
        const savings = regularUnitPrice - bulkUnitPrice;
        const savingsPercentage = (savings / regularUnitPrice) * 100;
        return {
            regularUnitPrice,
            bulkUnitPrice,
            savings,
            savingsPercentage,
            recommendation: savingsPercentage > 5 ? 'bulk' : 'regular'
        };
    }
    formatPrice(price, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    }
}
module.exports = new PriceCalculator();
