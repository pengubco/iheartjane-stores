# scrape-iheartjane

Web scraper for iHeartJane store data using Playwright with parallel processing support.

## Requirements

- **Node.js**: v22 LTS or higher
- **npm**: Latest version (comes with Node.js)
- **Brave Browser**: Required for web scraping (script configured for Brave)

## Setup Complete ✅

- ✅ Node.js v22 LTS requirement specified
- ✅ npm initialized with package.json
- ✅ Playwright browser automation configured
- ✅ Single and parallel processing scripts
- ✅ Command-line interface with comprehensive options

## Getting Started

### Step 1: Scrape Store Data

Use the parallel scraper to download iHeartJane store data efficiently:

```bash
# Scrape all stores (1-6000) with optimal settings
node parallel-scraper.js --start 1 --end 6000 --chunk-size 200 --max-concurrent 8

# Or scrape a smaller range for testing
node parallel-scraper.js --start 1 --end 1000 --chunk-size 100 --max-concurrent 5

# Custom output directory
node parallel-scraper.js --start 1 --end 6000 --output ./my-stores --chunk-size 200
```

**Important:** The scraper will save JSON files to `./scraped-stores/` directory by default.

### Step 2: Analyze Store Data

After scraping, analyze the collected data with comprehensive reports:

```bash
# Generate store analysis report
node analyze-stores.js
```

This will provide:
- ❌ **Inactive stores** count (product_count: 0)  
- 🎉 **Active recreational stores** count (recreational: true)
- 💊 **Active medical stores** count (medical: true)
- 🗺️ **Active stores by state/province** with detailed breakdown

### Alternative: Single Store Scraping

For testing or small batches (< 100 stores):

```bash
# Single store
node playwright-brave.js --store 477

# Range of stores
node playwright-brave.js --start 470 --end 480

# With additional file formats
node playwright-brave.js --store 477 --save-html --save-png
```

### Complete Workflow Example

```bash
# 1. Scrape a test batch
node parallel-scraper.js --start 1 --end 100 --chunk-size 50 --max-concurrent 5

# 2. Analyze the results
node analyze-stores.js

# 3. For full dataset
node parallel-scraper.js --start 1 --end 6000 --chunk-size 200 --max-concurrent 8

# 4. Generate final report
node analyze-stores.js
```

## Project Structure

```
scrape-iheartjane/
├── package.json           # Project configuration and dependencies
├── index.js              # Basic Node.js entry point
├── playwright-brave.js   # Single-process web scraper
├── parallel-scraper.js   # Multi-process parallel scraper
├── analyze-stores.js      # Script to analyze store data and generate reports
├── README.md             # This documentation
└── .gitignore           # Git ignore rules (excludes output directories)
```

## Available Scripts

- `npm start` - Run basic Node.js application
- `npm run dev` - Run in development mode  
- `npm run scrape` - Run single-process web scraper
- `npm run scrape-parallel` - Run parallel web scraper
- `npm test` - Run tests (placeholder)

## Features

- **Playwright Integration**: Uses Brave browser for reliable scraping
- **Parallel Processing**: Handle large ranges (1-6000+ stores) efficiently
- **Configurable Output**: Save text, HTML, and PNG formats
- **Destination Control**: Specify custom output directories
- **Progress Tracking**: Real-time progress indicators and completion statistics
- **Error Handling**: Robust error handling and retry logic
- **Command Line Interface**: Comprehensive CLI with help documentation

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd scrape-iheartjane

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify Node.js version (requires v22 LTS or higher)
node --version
```

Happy scraping! 🚀

## Latest Store Analysis Results

*Data as of July 7, 2025*

```
🔍 Analyzing 5927 store files...

📊 STORE ANALYSIS RESULTS

==================================================
❌ INACTIVE STORES: 3271

🎉 ACTIVE RECREATIONAL STORES: 1416
💊 ACTIVE MEDICAL STORES: 1240

🗺️  ACTIVE STORES BY STATE/PROVINCE:
   📍 California: 371 stores (14.0%)
   📍 Washington: 254 stores (9.6%)
   📍 Illinois: 230 stores (8.7%)
   📍 Colorado: 221 stores (8.3%)
   📍 New Mexico: 186 stores (7.0%)
   📍 Ohio: 142 stores (5.3%)
   📍 Florida: 139 stores (5.2%)
   📍 Maryland: 107 stores (4.0%)
   📍 Pennsylvania: 105 stores (4.0%)
   📍 New York: 100 stores (3.8%)
   📍 Connecticut: 96 stores (3.6%)
   📍 Nevada: 89 stores (3.4%)
   📍 Massachusetts: 80 stores (3.0%)
   📍 Arizona: 74 stores (2.8%)
   📍 Michigan: 72 stores (2.7%)
   📍 New Jersey: 60 stores (2.3%)
   📍 Virginia: 42 stores (1.6%)
   📍 Minnesota: 37 stores (1.4%)
   📍 Missouri: 33 stores (1.2%)
   📍 Oregon: 25 stores (0.9%)
   📍 Puerto Rico: 21 stores (0.8%)
   📍 Ontario: 21 stores (0.8%)
   📍 Maine: 19 stores (0.7%)
   📍 Louisiana: 18 stores (0.7%)
   📍 Texas: 18 stores (0.7%)
   📍 Arkansas: 13 stores (0.5%)
   📍 Oklahoma: 10 stores (0.4%)
   📍 North Dakota: 10 stores (0.4%)
   📍 Alaska: 9 stores (0.3%)
   📍 Georgia: 9 stores (0.3%)
   📍 Hawaii: 7 stores (0.3%)
   📍 Vermont: 6 stores (0.2%)
   📍 Rhode Island: 6 stores (0.2%)
   📍 Montana: 5 stores (0.2%)
   📍 New Hampshire: 5 stores (0.2%)
   📍 West Virginia: 4 stores (0.2%)
   📍 Mississippi: 4 stores (0.2%)
   📍 Delaware: 3 stores (0.1%)
   📍 Utah: 3 stores (0.1%)
   📍 District of Columbia: 1 stores (0.0%)
   📍 British Columbia: 1 stores (0.0%)

==================================================
📊 SUMMARY:
   Total stores analyzed: 5927
   Inactive stores: 3271 (55.2%)
   Active stores: 2656 (44.8%)
   Recreational stores: 1416
   Medical stores: 1240
   States/Provinces with stores: 41
```
