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
