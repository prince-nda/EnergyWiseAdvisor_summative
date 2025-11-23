// EnergyWise Advisor - Configuration Template
// COPY THIS FILE TO config.js AND ADD YOUR REAL API KEYS

const API_CONFIG = {
    // U.S. Energy Information Administration API
    EIA_BASE_URL: 'https://api.eia.gov/v2',
    
    // UK Carbon Intensity API (free, no key needed)
    CARBON_INTENSITY_URL: 'https://api.carbonintensity.org.uk',
    
    // Fallback electricity rates in cents/kWh (if API fails)
    FALLBACK_RATES: {
        'CA': 22.47, 'TX': 12.56, 'NY': 19.72, 'FL': 12.17,
        'IL': 13.12, 'PA': 14.76, 'OH': 13.02, 'GA': 12.69,
        'NC': 12.11, 'MI': 17.45, 'default': 15.00
    }
};

// GET YOUR FREE API KEY FROM: https://www.eia.gov/opendata/
// Then replace 'demo' with your actual key
const EIA_API_KEY = 'demo';

// No API key needed for Carbon Intensity API - it's completely free!
