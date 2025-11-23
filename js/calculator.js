/**
 * Calculator Module - Handles all calculation logic
 */

const Calculator = {
    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    },

    /**
     * Calculate percentage
     * @param {number} part - Part value
     * @param {number} whole - Whole value
     * @returns {number} Percentage
     */
    calculatePercentage(part, whole) {
        if (whole === 0) return 0;
        return parseFloat(((part / whole) * 100).toFixed(1));
    },

    /**
     * Calculate appliance daily cost
     * @param {number} watts - Appliance wattage
     * @param {number} hours - Hours used per day
     * @param {number} rate - Electricity rate per kWh
     * @returns {number} Daily cost
     */
    calculateDailyCost(watts, hours, rate) {
        const kwhPerDay = (watts * hours) / 1000;
        return kwhPerDay * rate;
    },

    /**
     * Calculate monthly cost from daily
     * @param {number} dailyCost - Daily cost
     * @param {number} days - Days in month
     * @returns {number} Monthly cost
     */
    calculateMonthlyCost(dailyCost, days = 30) {
        return dailyCost * days;
    },

    /**
     * Calculate yearly cost from monthly
     * @param {number} monthlyCost - Monthly cost
     * @returns {number} Yearly cost
     */
    calculateYearlyCost(monthlyCost) {
        return monthlyCost * 12;
    },

    /**
     * Calculate savings between two plans
     * @param {number} currentCost - Current plan cost
     * @param {number} newCost - New plan cost
     * @returns {Object} Savings breakdown
     */
    calculateSavings(currentCost, newCost) {
        const monthlySavings = currentCost - newCost;
        const yearlySavings = monthlySavings * 12;
        const percentageSavings = this.calculatePercentage(monthlySavings, currentCost);

        return {
            monthly: parseFloat(monthlySavings.toFixed(2)),
            yearly: parseFloat(yearlySavings.toFixed(2)),
            percentage: percentageSavings
        };
    },

    /**
     * Calculate total plan cost with usage
     * @param {Object} plan - Plan data
     * @param {number} monthlyKwh - Monthly kWh usage
     * @returns {number} Total monthly cost
     */
    calculatePlanCost(plan, monthlyKwh) {
        const energyCost = monthlyKwh * plan.rate;
        const totalCost = energyCost + plan.monthlyCost;
        return parseFloat(totalCost.toFixed(2));
    },

    /**
     * Calculate carbon footprint
     * @param {number} kwhUsage - kWh usage
     * @param {number} carbonIntensity - g CO2 per kWh (default US average ~400g)
     * @returns {Object} Carbon footprint data
     */
    calculateCarbonFootprint(kwhUsage, carbonIntensity = 400) {
        const gramsOfCO2 = kwhUsage * carbonIntensity;
        const kgOfCO2 = gramsOfCO2 / 1000;
        const tonnesOfCO2 = kgOfCO2 / 1000;

        // Equivalent trees needed to offset (1 tree absorbs ~20kg CO2/year)
        const treesNeeded = Math.ceil(kgOfCO2 / 20);

        return {
            grams: parseFloat(gramsOfCO2.toFixed(2)),
            kg: parseFloat(kgOfCO2.toFixed(2)),
            tonnes: parseFloat(tonnesOfCO2.toFixed(3)),
            treesNeeded: treesNeeded
        };
    },

    /**
     * Calculate optimal usage time savings
     * @param {number} kwhUsage - kWh usage
     * @param {number} peakRate - Peak rate
     * @param {number} offPeakRate - Off-peak rate
     * @param {number} offPeakPercentage - % of usage shifted to off-peak (0-1)
     * @returns {Object} Savings from time-shifting
     */
    calculateTimeShiftSavings(kwhUsage, peakRate, offPeakRate, offPeakPercentage = 0.4) {
        const shiftedKwh = kwhUsage * offPeakPercentage;
        const remainingKwh = kwhUsage - shiftedKwh;

        const currentCost = kwhUsage * peakRate;
        const optimizedCost = (remainingKwh * peakRate) + (shiftedKwh * offPeakRate);
        const savings = currentCost - optimizedCost;

        return {
            monthlySavings: parseFloat(savings.toFixed(2)),
            yearlySavings: parseFloat((savings * 12).toFixed(2)),
            shiftedKwh: parseFloat(shiftedKwh.toFixed(2)),
            percentageSaved: this.calculatePercentage(savings, currentCost)
        };
    },

    /**
     * Calculate payback period for upgrades
     * @param {number} upfrontCost - Initial investment
     * @param {number} monthlySavings - Monthly savings
     * @returns {Object} Payback period data
     */
    calculatePaybackPeriod(upfrontCost, monthlySavings) {
        if (monthlySavings <= 0) {
            return {
                months: Infinity,
                years: Infinity,
                worthwhile: false
            };
        }

        const months = upfrontCost / monthlySavings;
        const years = months / 12;

        return {
            months: parseFloat(months.toFixed(1)),
            years: parseFloat(years.toFixed(1)),
            worthwhile: years <= 5 // Generally worthwhile if payback < 5 years
        };
    },

    /**
     * Calculate energy efficiency rating
     * @param {number} actualUsage - Actual kWh usage
     * @param {number} householdSize - Number of people
     * @returns {Object} Efficiency rating
     */
    calculateEfficiencyRating(actualUsage, householdSize) {
        // Average US household usage: ~877 kWh/month
        // Adjusted by household size
        const baselineUsage = 877;
        const adjustedBaseline = baselineUsage * (0.5 + (householdSize * 0.25));

        const efficiency = (adjustedBaseline / actualUsage) * 100;

        let rating, message;
        if (efficiency >= 120) {
            rating = 'Excellent';
            message = 'Your energy usage is significantly below average!';
        } else if (efficiency >= 100) {
            rating = 'Good';
            message = 'Your energy usage is better than average.';
        } else if (efficiency >= 80) {
            rating = 'Average';
            message = 'Your energy usage is about average.';
        } else if (efficiency >= 60) {
            rating = 'Below Average';
            message = 'There\'s room for improvement in your energy usage.';
        } else {
            rating = 'Poor';
            message = 'Significant energy savings are possible with optimization.';
        }

        return {
            rating: rating,
            score: parseFloat(efficiency.toFixed(1)),
            message: message,
            comparisonUsage: parseFloat(adjustedBaseline.toFixed(2))
        };
    },

    /**
     * Validate numeric input
     * @param {*} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean} Is valid
     */
    validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    /**
     * Convert appliance name to display format
     * @param {string} name - Camel case name
     * @returns {string} Display name
     */
    formatApplianceName(name) {
        // Convert camelCase to Title Case
        return name
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    /**
     * Generate cost comparison chart data
     * @param {Array} plans - Array of plans with costs
     * @returns {Object} Chart data
     */
    generateComparisonData(plans) {
        return {
            labels: plans.map(p => p.provider),
            costs: plans.map(p => p.estimatedMonthlyCost),
            renewable: plans.map(p => p.renewable)
        };
    },

    /**
     * Calculate average rate across all plans
     * @param {Array} plans - Array of plans
     * @returns {number} Average rate
     */
    calculateAverageRate(plans) {
        if (plans.length === 0) return 0;
        const sum = plans.reduce((acc, plan) => acc + plan.rate, 0);
        return parseFloat((sum / plans.length).toFixed(3));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
