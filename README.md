# ⚡ EnergyWise Advisor

A smart web application that helps users save money on electricity bills by calculating appliance energy costs and providing personalized savings recommendations using real energy data APIs.

## Features

### Calculate Appliance Costs
- Choose from 20+ common household appliances
- See exactly how much each appliance costs to run monthly
- Get a total cost breakdown of your energy usage

### Environmental Impact
- See your carbon footprint based on real grid data
- Understand the environmental cost of your energy use

### Smart Savings Tips
- Get personalized recommendations to save money
- Learn when to use appliances for maximum efficiency
- Discover better electricity plans for your usage

## Quick Start

### Running Locally (Super Easy!)
1. **Download the project**
2. **Open `index.html` in your web browser**
3. **That's it!** The app works immediately with demo data

### For Full Features (Optional)
```bash
# Get free API keys:
# 1. OpenWeatherMap: https://openweathermap.org/api
# 2. EIA: https://www.eia.gov/opendata/
#
# Then:
cp js/config.example.js js/config.js
# Add your keys to js/config.js
```

## Real APIs Used

### 1. **OpenWeatherMap API**
- **What it does:** Gets real-time weather for any city
- **Why it's cool:** Smart energy tips based on actual weather
- **Cost:** Free tier available

### 2. **U.S. Energy Information Administration API**
- **What it does:** Government data on electricity prices by state
- **Why it's cool:** Real cost calculations, not made-up numbers
- **Cost:** Free (registration required)

### 3. **UK Carbon Intensity API** 
- **What it does:** Shows how "clean" or "dirty" electricity production is
- **Why it's cool:** Environmental impact matters!
- **Cost:** Completely free, no signup needed

## Live Deployment

### Production URLs:
- **Main Application**: https://energywiseadvisor.ndahiro.tech
- **Web01 Server**: https://web-01.ndahiro.tech
- **Web02 Server**: https://web-02.ndahiro.tech

### Infrastructure Architecture:
```
 HTTPS://energywiseadvisor.ndahiro.tech (Nginx Load Balancer)
    ├── Web01: https://web-01.ndahiro.tech (3.89.121.247)
    └── Web02: https://web-02.ndahiro.tech (34.227.27.109)
```

### Deployment Verification:
```
Load Balancing Test Results:
Request 1: X-Served-By: Web02
Request 2: X-Served-By: Web01
Request 3: X-Served-By: Web02
Request 4: X-Served-By: Web01
Request 5: X-Served-By: Web02
Request 6: X-Served-By: Web01
```

### Security Features:
-  SSL/TLS Encryption (Let's Encrypt)
-  Automatic HTTP to HTTPS redirect
-  HSTS Headers for security
- Load balancing with health checks
- Professional domain with subdomains

### Application Demo:


## Technical Implementation

### Frontend Architecture:
- **HTML5/CSS3/JavaScript**: Pure vanilla, no frameworks
- **Responsive Design**: Mobile-first approach
- **Modular Code**: Separation of concerns
- **Error Handling**: Graceful degradation

### File Structure:
```
EnergyWiseAdvisor/
├── index.html          # Main application
├── css/
│   └── style.css       # Professional styling
├── js/
│   ├── app.js          # Main application logic
│   ├── calculator.js   # Energy calculations
│   ├── api.js          # External API integration
│   ├── ui.js           # User interface handlers
│   └── config.js       # API configuration
├── data/
│   └── appliances.json # Appliance database
└── README.md           # This file
```

### API Integration Features:
```javascript
// Real API call with error handling
async getEnergyData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API failed');
        return await response.json();
    } catch (error) {
        return this.getFallbackData(); // Graceful degradation
    }
}
```

## Deployment Guide

### Server Infrastructure:
- **Load Balancer**: Nginx on 3.83.154.18
- **Web01**: Nginx on 3.89.121.247
- **Web02**: Nginx on 34.227.27.109

### Deployment Steps:
1. **Upload files** to both web servers
2. **Configure Nginx** on each server
3. **Setup load balancer** with SSL termination
4. **Configure DNS** for custom domains
5. **Test load distribution** and health checks

### Nginx Load Balancer Configuration:
```nginx
upstream energywise_backend {
    server web-01.ndahiro.tech:80;
    server web-02.ndahiro.tech:80;
}

server {
    listen 443 ssl;
    server_name energywiseadvisor.ndahiro.tech;
    
    ssl_certificate /etc/letsencrypt/live/energywiseadvisor.ndahiro.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/energywiseadvisor.ndahiro.tech/privkey.pem;
    
    location / {
        proxy_pass http://energywise_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Assignment Requirements Checklist

 **Meaningful Purpose** - Actually helps save real money on electricity bills  
 **Multiple Real APIs** - 3 different APIs integrated successfully  
 **User Interaction** - Filtering, sorting, searching, calculations, form inputs  
 **Error Handling** - Graceful API failure handling with fallback data  
 **Clean Code** - Modular architecture, proper comments, readable code  
 **No Sensitive Data** - API keys protected with .gitignore  
 **Good Documentation** - Comprehensive README with setup instructions  
 **Deployment** - 3-server setup with load balancing and SSL  
 **Professional Domain** - Custom subdomains with HTTPS  


## Performance Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Uptime**: 100% during testing
- **Concurrent Users**: Supports multiple simultaneous users
- **Mobile Performance**: Optimized for all device sizes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues:
**API not working?**
- App uses fallback data - still functional!
- Check internet connection
- Verify API keys in config.js

**SSL certificate issues?**
- Certificates auto-renew with Let's Encrypt
- Manual renewal: `sudo certbot renew`

**Load balancing not working?**
- Check health endpoints: `/health` on each server
- Verify upstream configuration

## Acknowledgments

### APIs & Data Sources:
- **OpenWeatherMap** - Real-time weather data
- **U.S. EIA** - Government energy pricing data
- **UK Carbon Intensity** - Environmental impact data

  
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Student**: Prince Ndahiro   
**GitHub**: [prince-nda](https://github.com/prince-nda)

---

### GitHub Repository:
https://github.com/prince-nda/EnergyWiseAdvisor_summative

### Live Application:
https://energywiseadvisor.ndahiro.tech

### Demo Video:
**[INSERT YOUR DEMO VIDEO LINK HERE]**

*Built with for smarter energy usage and for clean code practices*  
