/**
 * API Module - Handles all data fetching and API calls
 * Now includes REAL API integrations!
 */

const API = {
    // Sample electricity plans data (fallback)
    electricityPlans: [
        {
            id: 1,
            provider: "GreenEnergy Co",
            planName: "EcoSaver Plus",
            rate: 0.12,
            peakRate: 0.18,
            offPeakRate: 0.08,
            renewable: 100,
            contractLength: 12,
            monthlyCost: 15
        },
        {
            id: 2,
            provider: "PowerGrid Solutions",
            planName: "Standard Fixed",
            rate: 0.15,
            peakRate: 0.20,
            offPeakRate: 0.10,
            renewable: 30,
            contractLength: 24,
            monthlyCost: 10
        },
        {
            id: 3,
            provider: "CitiPower",
            planName: "Flexible Rates",
            rate: 0.14,
            peakRate: 0.19,
            offPeakRate: 0.09,
            renewable: 50,
            contractLength: 12,
            monthlyCost: 12
        },
        {
            id: 4,
            provider: "SolarFirst Energy",
            planName: "100% Solar",
            rate: 0.13,
            peakRate: 0.17,
            offPeakRate: 0.09,
            renewable: 100,
            contractLength: 18,
            monthlyCost: 18
        },
        {
            id: 5,
            provider: "Budget Power",
            planName: "Economy Choice",
            rate: 0.16,
            peakRate: 0.22,
            offPeakRate: 0.11,
            renewable: 10,
            contractLength: 12,
            monthlyCost: 8
        },
        {
            id: 6,
            provider: "WindPower Inc",
            planName: "Green Future",
            rate: 0.13,
            peakRate: 0.16,
            offPeakRate: 0.10,
            renewable: 85,
            contractLength: 24,
            monthlyCost: 14
        },
        {
            id: 7,
            provider: "NaturalChoice Energy",
            planName: "Balanced Plan",
            rate: 0.14,
            peakRate: 0.18,
            offPeakRate: 0.09,
            renewable: 60,
            contractLength: 12,
            monthlyCost: 11
        },
        {
            id: 8,
            provider: "EcoFlow Power",
            planName: "Smart Saver",
            rate: 0.11,
            peakRate: 0.15,
            offPeakRate: 0.07,
            renewable: 95,
            contractLength: 36,
            monthlyCost: 20
        }
    ],

    // Sample appliances data
    appliances: {
        refrigerator: { watts: 150, hoursPerDay: 24, },
        washingMachine: { watts: 500, hoursPerDay: 1, },
        dryer: { watts: 3000, hoursPerDay: 1, },
        dishwasher: { watts: 1800, hoursPerDay: 1, },
        airConditioner: { watts: 3500, hoursPerDay: 8, },
        heater: { watts: 1500, hoursPerDay: 6, },
        tv: { watts: 100, hoursPerDay: 5, },
        computer: { watts: 200, hoursPerDay: 8, },
        lights: { watts: 60, hoursPerDay: 6,},
        oven: { watts: 2400, hoursPerDay: 1,},
        microwave: { watts: 1200, hoursPerDay: 0.5, },
        waterHeater: { watts: 4000, hoursPerDay: 3, },
        kettle: { watts: 1500, hoursPerDay: 0.5, },
        toaster: { watts: 1200, hoursPerDay: 0.2, },
        vacuum: { watts: 1400, hoursPerDay: 0.5,},
        fan: { watts: 75, hoursPerDay: 8, }
    },

    /**
     * Check if config is loaded
     */
    hasConfig() {
        return typeof CONFIG !== 'undefined' && CONFIG.OPENWEATHER_API_KEY;
    },

    /**
     * Get weather data from OpenWeatherMap API
     * @param {string} city - City name
     * @returns {Promise<Object>} Weather data
     */
    async getWeatherData(city = 'London') {
        if (!this.hasConfig() || !CONFIG.USE_REAL_WEATHER_API) {
            console.log('Using sample weather data');
            return this.getSampleWeatherData();
        }

        try {
            const url = `${CONFIG.OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                city: data.name,
                country: data.sys.country,
                isReal: true
            };
        } catch (error) {
            console.error('Weather API error:', error);
            if (CONFIG.USE_SAMPLE_DATA_FALLBACK) {
                console.log('Falling back to sample weather data');
                return this.getSampleWeatherData();
            }
            throw error;
        }
    },

    /**
     * Get sample weather data (fallback)
     */
    getSampleWeatherData() {
        return {
            temperature: 22,
            feelsLike: 21,
            condition: 'Clear',
            description: 'clear sky',
            humidity: 65,
            city: 'Sample City',
            country: 'US',
            isReal: false
        };
    },

    /**
     * Get carbon intensity data from Electricity Maps or CO2 Signal API
     * @param {string} zone - Zone code (e.g., 'US-CAL-CISO', 'GB') or country code
     * @returns {Promise<Object>} Carbon intensity data
     */
    async getCarbonIntensity(zone = 'US-CAL-CISO') {
        if (!this.hasConfig() || !CONFIG.USE_REAL_CARBON_API) {
            console.log('Using sample carbon data');
            return this.getSampleCarbonData();
        }

        // Try Electricity Maps first if key is available
        if (CONFIG.ELECTRICITY_MAPS_API_KEY) {
            try {
                const url = `${CONFIG.ELECTRICITY_MAPS_BASE_URL}/carbon-intensity/latest?zone=${zone}`;
                
                const response = await fetch(url, {
                    headers: {
                        'auth-token': CONFIG.ELECTRICITY_MAPS_API_KEY
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Electricity Maps API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                return {
                    carbonIntensity: data.carbonIntensity,
                    fossilFuelPercentage: data.fossilFuelPercentage || 50,
                    renewablePercentage: data.renewablePercentage || 50,
                    zone: zone,
                    isReal: true,
                    source: 'Electricity Maps'
                };
            } catch (error) {
                console.error('Electricity Maps API error:', error);
                // Try CO2 Signal as fallback
            }
        }

        // Try CO2 Signal API as fallback
        if (CONFIG.CO2_SIGNAL_API_KEY) {
            try {
                const countryCode = zone.split('-')[0]; // Extract country from zone
                const url = `${CONFIG.CO2_SIGNAL_BASE_URL}/latest?countryCode=${countryCode}`;
                
                const response = await fetch(url, {
                    headers: {
                        'auth-token': CONFIG.CO2_SIGNAL_API_KEY
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`CO2 Signal API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                return {
                    carbonIntensity: data.data.carbonIntensity,
                    fossilFuelPercentage: data.data.fossilFuelPercentage,
                    renewablePercentage: 100 - (data.data.fossilFuelPercentage || 0),
                    zone: countryCode,
                    isReal: true,
                    source: 'CO2 Signal'
                };
            } catch (error) {
                console.error('CO2 Signal API error:', error);
            }
        }

        // Use sample data as final fallback
        if (CONFIG.USE_SAMPLE_DATA_FALLBACK) {
            console.log('Falling back to sample carbon data');
            return this.getSampleCarbonData();
        }
        
        throw new Error('No carbon intensity API available');
    },

    /**
     * Get sample carbon data (fallback)
     */
    getSampleCarbonData() {
        return {
            carbonIntensity: 400,
            fossilFuelPercentage: 60,
            renewablePercentage: 40,
            zone: 'Sample',
            isReal: false,
            source: 'Sample Data'
        };
    },

    /**
     * Get hourly carbon intensity forecast
     * @returns {Promise<Array>} Hourly data
     */
    async getCarbonForecast() {
        // Mock hourly data with variation
        const hours = [];
        const baseIntensity = 400;
        
        for (let i = 0; i < 24; i++) {
            // Lower intensity during midday (solar peak) and night (lower demand)
            const variation = Math.sin((i - 6) * Math.PI / 12) * 150;
            const intensity = Math.round(baseIntensity + variation);
            
            hours.push({
                hour: i,
                intensity: intensity,
                label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
                isClean: intensity < 350
            });
        }
        
        return hours;
    },

    /**
     * Fetch electricity plans with filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} Filtered plans
     */
    async getPlans(filters = {}) {
        // Simulate API delay
        await this.delay(500);

        let plans = [...this.electricityPlans];

        // Apply renewable filter
        if (filters.renewable) {
            plans = plans.filter(plan => plan.renewable >= parseInt(filters.renewable));
        }

        // Apply max rate filter
        if (filters.maxRate) {
            plans = plans.filter(plan => plan.rate <= parseFloat(filters.maxRate));
        }

        // Apply sorting
        if (filters.sortBy === 'price') {
            plans.sort((a, b) => a.rate - b.rate);
        } else if (filters.sortBy === 'renewable') {
            plans.sort((a, b) => b.renewable - a.renewable);
        } else if (filters.sortBy === 'contract') {
            plans.sort((a, b) => a.contractLength - b.contractLength);
        }

        return plans;
    },

    /**
     * Get all appliances
     * @returns {Promise<Object>} Appliances data
     */
    async getAppliances() {
        await this.delay(200);
        return this.appliances;
    },

    /**
     * Calculate energy costs with weather-adjusted recommendations
     * @param {Object} data - Calculation parameters
     * @returns {Promise<Object>} Cost breakdown with weather insights
     */
    async calculateCosts(data) {
        await this.delay(300);

        const { selectedAppliances, electricityRate, daysPerMonth, city } = data;

        let totalKwhPerMonth = 0;
        const breakdown = [];

        selectedAppliances.forEach(applianceName => {
            const appliance = this.appliances[applianceName];
            if (appliance) {
                const kwhPerDay = (appliance.watts * appliance.hoursPerDay) / 1000;
                const kwhPerMonth = kwhPerDay * daysPerMonth;
                const costPerMonth = kwhPerMonth * electricityRate;

                totalKwhPerMonth += kwhPerMonth;

                breakdown.push({
                    name: applianceName,
                    icon: appliance.icon,
                    watts: appliance.watts,
                    hoursPerDay: appliance.hoursPerDay,
                    kwhPerMonth: parseFloat(kwhPerMonth.toFixed(2)),
                    costPerMonth: parseFloat(costPerMonth.toFixed(2))
                });
            }
        });

        const totalCost = totalKwhPerMonth * electricityRate;

        // Sort breakdown by cost (highest first)
        breakdown.sort((a, b) => b.costPerMonth - a.costPerMonth);

        // Get weather data for additional insights
        let weatherInsights = null;
        try {
            const weather = await this.getWeatherData(city);
            weatherInsights = {
                temperature: weather.temperature,
                condition: weather.condition,
                recommendation: this.getWeatherRecommendation(weather, selectedAppliances)
            };
        } catch (error) {
            console.log('Could not fetch weather data');
        }

        // Get carbon data
        let carbonData = null;
        try {
            carbonData = await this.getCarbonIntensity();
        } catch (error) {
            console.log('Could not fetch carbon data');
        }

        return {
            totalKwhPerMonth: parseFloat(totalKwhPerMonth.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            breakdown: breakdown,
            rate: electricityRate,
            weatherInsights: weatherInsights,
            carbonData: carbonData
        };
    },

    /**
     * Get weather-based energy recommendation
     */
    getWeatherRecommendation(weather, appliances) {
        if (weather.temperature > 25 && appliances.includes('airConditioner')) {
            return `It's ${weather.temperature}°C outside. Consider using fans instead of AC when possible to reduce costs.`;
        } else if (weather.temperature < 15 && appliances.includes('heater')) {
            return `It's ${weather.temperature}°C outside. Set your heater to 20°C for optimal comfort and efficiency.`;
        } else {
            return `Current temperature: ${weather.temperature}°C. Weather conditions are optimal for energy efficiency.`;
        }
    },

    /**
     * Compare plans for user's usage
     * @param {number} monthlyKwh - Monthly kWh usage
     * @returns {Promise<Object>} Comparison results
     */
    async comparePlans(monthlyKwh) {
        await this.delay(400);

        const comparison = this.electricityPlans.map(plan => {
            const energyCost = monthlyKwh * plan.rate;
            const totalMonthlyCost = energyCost + plan.monthlyCost;

            return {
                ...plan,
                estimatedMonthlyCost: parseFloat(totalMonthlyCost.toFixed(2)),
                energyCost: parseFloat(energyCost.toFixed(2))
            };
        });

        // Sort by total monthly cost
        comparison.sort((a, b) => a.estimatedMonthlyCost - b.estimatedMonthlyCost);

        // Calculate potential savings
        const cheapest = comparison[0].estimatedMonthlyCost;
        const mostExpensive = comparison[comparison.length - 1].estimatedMonthlyCost;
        const maxSavings = parseFloat(((mostExpensive - cheapest) * 12).toFixed(2));

        return {
            comparison: comparison,
            insights: {
                cheapestPlan: comparison[0].planName,
                cheapestProvider: comparison[0].provider,
                maxYearlySavings: maxSavings,
                monthlyKwh: monthlyKwh
            }
        };
    },

    /**
     * Get optimization recommendations with real carbon data
     * @param {Object} data - User's current usage data
     * @returns {Promise<Object>} Recommendations
     */
    async getOptimizations(data) {
        await this.delay(500);

        const { currentCost, monthlyUsage, householdSize } = data;

        // Get real carbon intensity data
        let carbonData = null;
        try {
            carbonData = await this.getCarbonIntensity();
        } catch (error) {
            console.log('Using sample carbon data');
        }

        // Base suggestions
        const suggestions = [
            {
                title: "Shift to Off-Peak Hours",
                description: "Run high-energy appliances like washing machines, dryers, and dishwashers during off-peak hours (typically 9 PM - 7 AM). Many plans offer rates 30-50% lower during these times.",
                potentialSavings: parseFloat((currentCost * 0.15).toFixed(2)),
                difficulty: "Easy",
                impact: "High"
            },
            {
                title: "Optimize Thermostat Settings",
                description: "Adjust your thermostat by 2-3 degrees (lower in winter, higher in summer) to reduce heating and cooling costs by 10-15% without significantly affecting comfort.",
                potentialSavings: parseFloat((currentCost * 0.12).toFixed(2)),
                difficulty: "Easy",
                impact: "High"
            },
            {
                title: "Switch to Renewable Energy Plan",
                description: `Consider switching to a plan with higher renewable energy percentage. ${carbonData && carbonData.isReal ? `Current grid: ${carbonData.renewablePercentage.toFixed(0)}% renewable.` : 'Many green plans are now price-competitive.'}`,
                potentialSavings: parseFloat((currentCost * 0.08).toFixed(2)),
                difficulty: "Easy",
                impact: "Medium"
            },
            {
                title: "Upgrade to LED Lighting",
                description: "Replace incandescent bulbs with LEDs. LEDs use 75% less energy and last 25 times longer, saving an average household $225 per year.",
                potentialSavings: 18.75,
                difficulty: "Easy",
                impact: "Medium"
            },
            {
                title: "Eliminate Phantom Power",
                description: "Unplug devices or use smart power strips to eliminate standby power consumption. Phantom power can account for 5-10% of residential energy use.",
                potentialSavings: parseFloat((currentCost * 0.07).toFixed(2)),
                difficulty: "Easy",
                impact: "Low"
            },
            {
                title: "Optimize Water Heater",
                description: "Lower your water heater temperature to 120°F (49°C) and consider using cold water for laundry. This can reduce water heating costs by 10-20%.",
                potentialSavings: parseFloat((currentCost * 0.10).toFixed(2)),
                difficulty: "Easy",
                impact: "Medium"
            }
        ];

        // Add household-specific suggestions
        if (householdSize >= 3) {
            suggestions.push({
                title: "Batch Your Loads",
                description: "Run full loads in your washing machine and dishwasher to maximize efficiency. This can reduce energy and water usage by up to 20% for larger households.",
                potentialSavings: parseFloat((currentCost * 0.08).toFixed(2)),
                difficulty: "Easy",
                impact: "Medium"
            });
        }

        const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.potentialSavings, 0);

        return {
            suggestions: suggestions,
            totalPotentialMonthlySavings: parseFloat(totalPotentialSavings.toFixed(2)),
            totalPotentialYearlySavings: parseFloat((totalPotentialSavings * 12).toFixed(2)),
            currentRate: parseFloat((currentCost / monthlyUsage).toFixed(3)),
            carbonData: carbonData
        };
    },

    /**
     * Simulate API delay
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
