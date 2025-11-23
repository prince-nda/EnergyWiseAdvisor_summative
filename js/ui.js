/**
 * UI Module - Handles all UI updates and rendering
 */

const UI = {
    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    /**
     * Display plans in grid
     * @param {Array} plans - Plans to display
     * @param {string} containerId - Container element ID
     */
    displayPlans(plans, containerId = 'plans-results') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (plans.length === 0) {
            container.innerHTML = `
                <div class="error-box">
                    <strong>No plans found</strong>
                    <p>No electricity plans match your filter criteria. Try adjusting your filters.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="plans-grid">';

        plans.forEach(plan => {
            html += `
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-provider">${plan.provider}</div>
                        <div class="plan-name">${plan.planName}</div>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Standard Rate:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.rate)}/kWh</span>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Peak Rate:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.peakRate)}/kWh</span>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Off-Peak Rate:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.offPeakRate)}/kWh</span>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Monthly Fee:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.monthlyCost)}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Contract Length:</span>
                        <span class="plan-value">${plan.contractLength} months</span>
                    </div>
                    <div class="renewable-badge">${plan.renewable}% Renewable</div>
                </div>
            `;
        });

        html += '</div>';

        // Add savings highlight
        if (plans.length >= 2) {
            const cheapest = plans[0];
            const expensive = plans[plans.length - 1];
            const avgUsage = 1000; // kWh
            const savings = Calculator.calculateSavings(
                expensive.rate * avgUsage,
                cheapest.rate * avgUsage
            );

            html += `
                <div class="savings-highlight">
                    <div style="font-size: 1.2em;">Potential Annual Savings</div>
                    <div class="savings-amount">${Calculator.formatCurrency(savings.yearly)}</div>
                    <div>By switching from <strong>${expensive.provider}</strong> to <strong>${cheapest.provider}</strong></div>
                    <div style="font-size: 0.9em; margin-top: 10px; opacity: 0.9;">Based on 1,000 kWh/month average usage</div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Display appliances grid
     * @param {Object} appliances - Appliances data
     * @param {string} containerId - Container element ID
     */
    displayAppliances(appliances, containerId = 'appliances-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';

        for (const [key, value] of Object.entries(appliances)) {
            const name = Calculator.formatApplianceName(key);

            html += `
                <div class="appliance-card" data-appliance="${key}">
                    <input type="checkbox" id="appliance-${key}" data-appliance="${key}">
                    <div class="appliance-info">
                        <div class="appliance-name">${value.icon} ${name}</div>
                        <div class="appliance-details">${value.watts}W • ${value.hoursPerDay}h/day</div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Add click handlers
        container.querySelectorAll('.appliance-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.classList.toggle('selected', this.querySelector('input').checked);
            });
        });
    },

    /**
     * Display calculation results
     * @param {Object} results - Calculation results
     * @param {string} containerId - Container element ID
     */
    displayCalculationResults(results, containerId = 'calculator-results') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { totalKwhPerMonth, totalCost, breakdown, rate } = results;

        let html = `
            <div class="results-section">
                <div class="result-card">
                    <div class="result-title">Your Monthly Energy Cost</div>
                    <div class="cost-display">${Calculator.formatCurrency(totalCost)}</div>
                    <div style="text-align: center; color: var(--text-secondary); margin-bottom: 25px; font-size: 1.1em;">
                        ${Calculator.formatNumber(totalKwhPerMonth)} kWh @ ${Calculator.formatCurrency(rate)}/kWh
                    </div>
                    
                    <div class="result-title">⚡ Cost Breakdown by Appliance</div>
        `;

        breakdown.forEach(item => {
            const percentage = Calculator.calculatePercentage(item.costPerMonth, totalCost);
            const name = Calculator.formatApplianceName(item.name);
            
            html += `
                <div class="breakdown-item">
                    <span><strong>${item.icon} ${name}</strong></span>
                    <span>
                        <strong>${Calculator.formatCurrency(item.costPerMonth)}</strong>
                        <span style="color: var(--text-secondary); font-size: 0.9em;">
                            (${item.kwhPerMonth} kWh • ${percentage}%)
                        </span>
                    </span>
                </div>
            `;
        });

        html += `
                </div>
        `;

        // Calculate carbon footprint
        const carbon = Calculator.calculateCarbonFootprint(totalKwhPerMonth);
        html += `
            <div class="result-card">
                <div class="result-title">Environmental Impact</div>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 2em; font-weight: 700; color: var(--warning-color);">
                        ${Calculator.formatNumber(carbon.kg)} kg CO₂
                    </div>
                    <div style="color: var(--text-secondary); margin-top: 10px;">
                        per month from your electricity usage
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: var(--light-bg); border-radius: 8px;">
                        It would take <strong>${carbon.treesNeeded} trees</strong> one year to offset this carbon
                    </div>
                </div>
            </div>
        `;

        // Add comparison with best plan
        const avgUsage = totalKwhPerMonth;
        API.getPlans().then(plans => {
            const bestPlan = plans.reduce((best, plan) => 
                plan.rate < best.rate ? plan : best
            );

            if (rate > bestPlan.rate) {
                const savings = Calculator.calculateSavings(totalCost, avgUsage * bestPlan.rate);

                html += `
                    <div class="savings-highlight">
                        <div style="font-size: 1.2em;">You Could Save Money!</div>
                        <div class="savings-amount">${Calculator.formatCurrency(savings.monthly)}/month</div>
                        <div>Switch to <strong>${bestPlan.provider}</strong> - ${bestPlan.planName}</div>
                        <div style="font-size: 0.9em; margin-top: 10px; opacity: 0.9;">
                            That's <strong>${Calculator.formatCurrency(savings.yearly)}</strong> per year!
                        </div>
                    </div>
                `;
            }

            html += '</div>';
            container.innerHTML = html;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Display optimization recommendations
     * @param {Object} data - Optimization data
     * @param {string} containerId - Container element ID
     */
    displayOptimizations(data, containerId = 'optimizer-results') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { suggestions, totalPotentialMonthlySavings, totalPotentialYearlySavings } = data;

        let html = `
            <div class="results-section">
                <div class="savings-highlight">
                    <div style="font-size: 1.2em;">Total Potential Savings</div>
                    <div class="savings-amount">${Calculator.formatCurrency(totalPotentialMonthlySavings)}/month</div>
                    <div style="font-size: 1.3em; margin-top: 10px;">
                        <strong>${Calculator.formatCurrency(totalPotentialYearlySavings)}</strong> per year
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <div class="result-title">Personalized Recommendations</div>
        `;

        suggestions.forEach((suggestion, index) => {
            html += `
                <div class="suggestion-card" style="animation: fadeInUp 0.5s ease ${index * 0.1}s both;">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                        <div>
                            <span style="background: var(--light-bg); padding: 5px 15px; border-radius: 15px; font-size: 0.9em; color: var(--text-secondary);">
                                ${suggestion.difficulty} • ${suggestion.impact} Impact
                            </span>
                        </div>
                        <div class="suggestion-savings">
                            Save ${Calculator.formatCurrency(suggestion.potentialSavings)}/month
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Display plan comparison
     * @param {Object} data - Comparison data
     * @param {string} containerId - Container element ID
     */
    displayPlanComparison(data, containerId = 'plans-results') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { comparison, insights } = data;

        let html = `
            <div class="results-section">
                <div class="success-box">
                    <strong>Best Deal Found!</strong>
                    <p>The most cost-effective plan for ${insights.monthlyKwh} kWh/month is <strong>${insights.cheapestProvider}</strong> - ${insights.cheapestPlan}</p>
                    <p>Maximum potential savings: <strong>${Calculator.formatCurrency(insights.maxYearlySavings)}</strong> per year</p>
                </div>

                <div class="plans-grid">
        `;

        comparison.forEach((plan, index) => {
            const badge = index === 0 ? '<div style="background: var(--success-color); color: white; padding: 5px 15px; border-radius: 5px; display: inline-block; margin-bottom: 10px;">Best Value</div>' : '';
            
            html += `
                <div class="plan-card">
                    ${badge}
                    <div class="plan-header">
                        <div class="plan-provider">${plan.provider}</div>
                        <div class="plan-name">${plan.planName}</div>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Energy Cost:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.energyCost)}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="plan-label">Monthly Fee:</span>
                        <span class="plan-value">${Calculator.formatCurrency(plan.monthlyCost)}</span>
                    </div>
                    <div class="plan-detail" style="border-top: 2px solid var(--border-color); padding-top: 10px; margin-top: 10px;">
                        <span class="plan-label"><strong>Total Monthly Cost:</strong></span>
                        <span class="plan-value" style="font-size: 1.3em; color: var(--primary-color);">
                            ${Calculator.formatCurrency(plan.estimatedMonthlyCost)}
                        </span>
                    </div>
                    <div class="renewable-badge">${plan.renewable}% Renewable</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {string} containerId - Container element ID
     */
    showError(message, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="error-box">
                <strong>Error</strong>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Show success message
     * @param {string} message - Success message
     * @param {string} containerId - Container element ID
     */
    showSuccess(message, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="success-box">
                <strong>Success</strong>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Clear container
     * @param {string} containerId - Container element ID
     */
    clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Scroll to element
     * @param {string} elementId - Element ID
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
