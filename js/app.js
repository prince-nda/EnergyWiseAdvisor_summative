/**
 * Main Application Module
 * Coordinates all app functionality
 */

const App = {
    // Initialize the application
    init() {
        console.log('EnergyWise Advisor initializing...');
        
        this.setupEventListeners();
        this.initializeAppliances();
        
        console.log('Application ready!');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Search plans button
        const searchPlansBtn = document.getElementById('search-plans-btn');
        if (searchPlansBtn) {
            searchPlansBtn.addEventListener('click', () => this.handleSearchPlans());
        }

        // Calculate costs button
        const calculateBtn = document.getElementById('calculate-costs-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.handleCalculateCosts());
        }

        // Get recommendations button
        const recommendationsBtn = document.getElementById('get-recommendations-btn');
        if (recommendationsBtn) {
            recommendationsBtn.addEventListener('click', () => this.handleGetRecommendations());
        }

        // Appliance search
        const searchInput = document.getElementById('appliance-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAppliances(e.target.value));
        }

        // Real-time validation
        this.setupInputValidation();
    },

    /**
     * Setup input validation
     */
    setupInputValidation() {
        const numericInputs = [
            'electricity-rate',
            'days-per-month',
            'max-rate-filter',
            'current-monthly-cost',
            'monthly-usage'
        ];

        numericInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9.]/g, '');
                });
            }
        });
    },

    /**
     * Switch between tabs
     * @param {string} tabName - Name of tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    },

    /**
     * Initialize appliances grid
     */
    async initializeAppliances() {
        try {
            const appliances = await API.getAppliances();
            UI.displayAppliances(appliances);
        } catch (error) {
            console.error('Error loading appliances:', error);
            UI.showError('Failed to load appliances. Please refresh the page.', 'appliances-grid');
        }
    },

    /**
     * Handle search plans
     */
    async handleSearchPlans() {
        const filters = {
            renewable: document.getElementById('renewable-filter').value,
            maxRate: document.getElementById('max-rate-filter').value,
            sortBy: document.getElementById('sort-filter').value
        };

        UI.showLoading();

        try {
            const plans = await API.getPlans(filters);
            UI.displayPlans(plans);
            UI.scrollToElement('plans-results');
        } catch (error) {
            console.error('Error fetching plans:', error);
            UI.showError('Failed to load electricity plans. Please try again.', 'plans-results');
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Handle calculate costs
     */
    async handleCalculateCosts() {
        const rate = parseFloat(document.getElementById('electricity-rate').value);
        const days = parseInt(document.getElementById('days-per-month').value);

        // Validation
        if (!Calculator.validateNumber(rate, 0.01, 1)) {
            alert('Please enter a valid electricity rate between $0.01 and $1.00 per kWh');
            return;
        }

        if (!Calculator.validateNumber(days, 1, 31)) {
            alert('Please enter a valid number of days (1-31)');
            return;
        }

        // Get selected appliances
        const selectedAppliances = [];
        document.querySelectorAll('.appliance-card input:checked').forEach(checkbox => {
            selectedAppliances.push(checkbox.dataset.appliance);
        });

        if (selectedAppliances.length === 0) {
            alert('Please select at least one appliance');
            return;
        }

        UI.showLoading();

        try {
            const results = await API.calculateCosts({
                selectedAppliances,
                electricityRate: rate,
                daysPerMonth: days
            });

            UI.displayCalculationResults(results);
            UI.scrollToElement('calculator-results');
        } catch (error) {
            console.error('Error calculating costs:', error);
            UI.showError('Failed to calculate costs. Please try again.', 'calculator-results');
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Handle get recommendations
     */
    async handleGetRecommendations() {
        const currentCost = parseFloat(document.getElementById('current-monthly-cost').value);
        const monthlyUsage = parseFloat(document.getElementById('monthly-usage').value);
        const householdSize = parseInt(document.getElementById('household-size').value);

        // Validation
        if (!Calculator.validateNumber(currentCost, 1, 10000)) {
            alert('Please enter a valid monthly cost (minimum $1)');
            return;
        }

        if (!Calculator.validateNumber(monthlyUsage, 1, 100000)) {
            alert('Please enter a valid monthly usage (minimum 1 kWh)');
            return;
        }

        UI.showLoading();

        try {
            const optimizations = await API.getOptimizations({
                currentCost,
                monthlyUsage,
                householdSize
            });

            UI.displayOptimizations(optimizations);

            // Also show plan comparison
            const comparison = await API.comparePlans(monthlyUsage);
            
            // Add plan comparison below recommendations
            const resultsContainer = document.getElementById('optimizer-results');
            const currentHTML = resultsContainer.innerHTML;
            
            let comparisonHTML = `
                <div style="margin-top: 30px;">
                    <div class="result-title">Better Plan Options</div>
                    <div class="info-box">
                        Based on your usage of ${monthlyUsage} kWh/month, here are the most cost-effective plans:
                    </div>
                    <div class="plans-grid">
            `;

            comparison.comparison.slice(0, 3).forEach((plan, index) => {
                const badge = index === 0 ? '<div style="background: var(--success-color); color: white; padding: 5px 15px; border-radius: 5px; display: inline-block; margin-bottom: 10px;">Best Deal</div>' : '';
                const savings = Calculator.calculateSavings(currentCost, plan.estimatedMonthlyCost);
                
                comparisonHTML += `
                    <div class="plan-card">
                        ${badge}
                        <div class="plan-header">
                            <div class="plan-provider">${plan.provider}</div>
                            <div class="plan-name">${plan.planName}</div>
                        </div>
                        <div class="plan-detail">
                            <span class="plan-label">Monthly Cost:</span>
                            <span class="plan-value" style="font-size: 1.2em; color: var(--primary-color);">
                                ${Calculator.formatCurrency(plan.estimatedMonthlyCost)}
                            </span>
                        </div>
                        ${savings.monthly > 0 ? `
                        <div style="background: var(--light-bg); padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center;">
                            <div style="color: var(--success-color); font-weight: 700;">
                                Save ${Calculator.formatCurrency(savings.monthly)}/month
                            </div>
                            <div style="font-size: 0.9em; color: var(--text-secondary);">
                                ${Calculator.formatCurrency(savings.yearly)}/year
                            </div>
                        </div>
                        ` : ''}
                        <div class="renewable-badge">${plan.renewable}% Renewable</div>
                    </div>
                `;
            });

            comparisonHTML += '</div></div>';
            resultsContainer.innerHTML = currentHTML + comparisonHTML;

            UI.scrollToElement('optimizer-results');
        } catch (error) {
            console.error('Error getting recommendations:', error);
            UI.showError('Failed to generate recommendations. Please try again.', 'optimizer-results');
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * Filter appliances by search term
     * @param {string} searchTerm - Search term
     */
    filterAppliances(searchTerm) {
        const cards = document.querySelectorAll('.appliance-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('.appliance-name').textContent.toLowerCase();
            const matches = name.includes(term);
            card.style.display = matches ? 'flex' : 'none';
        });
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App available globally for debugging
window.App = App;
