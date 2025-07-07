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

### Run the main project:
```bash
npm start
# or
npm run dev
```

### Web Scraping Commands:

#### Single Process (recommended for < 100 stores):
```bash
# Using npm scripts
npm run scrape                                      # Default: single store 477
npm run scrape -- --store 123 --output ./data     # Specific store to folder

# Direct command usage
node playwright-brave.js --start 470 --end 480 -o ./stores         # Range of stores
node playwright-brave.js --store 477 --save-html --save-png         # Save all formats
node playwright-brave.js --help                                     # Show all options
```

#### Parallel Processing (recommended for > 100 stores):
```bash
# Using npm scripts  
npm run scrape-parallel                             # Default: stores 1-6000

# Direct command usage
node parallel-scraper.js --start 1 --end 1000 --chunk-size 50 --max-concurrent 10
node parallel-scraper.js --start 1 --end 6000 --chunk-size 200 --max-concurrent 8 --headless
node parallel-scraper.js --help                    # Show all options
```

#### URL Redirect Checker:
```bash
# Using npm scripts
npm run check-url                                   # Check default URL (stores/5585)
npm run check-url -- --url https://www.iheartjane.com/stores/123  # Check custom URL

# Direct command usage
node url-checker.js                                 # Check stores/5585 with browser UI
node url-checker.js --headless                      # Check without browser UI
node url-checker.js --url https://www.iheartjane.com/stores/456   # Check specific store
node url-checker.js --help                          # Show all options
```

**Performance Recommendations:**
- **Small ranges (< 100 stores)**: Use single process scraper
- **Large ranges (> 100 stores)**: Use parallel scraper for much faster processing
- **Chunk size**: 50-200 stores per chunk (larger = fewer processes, smaller = more parallelism)
- **Max concurrent**: 3-10 processes depending on your system resources

## Project Structure

```
scrape-iheartjane/
├── package.json           # Project configuration and dependencies
├── index.js              # Basic Node.js entry point
├── playwright-brave.js   # Single-process web scraper
├── parallel-scraper.js   # Multi-process parallel scraper
├── url-checker.js        # URL redirect checker and verification tool
├── README.md             # This documentation
└── .gitignore           # Git ignore rules (excludes output directories)
```

## Available Scripts

- `npm start` - Run basic Node.js application
- `npm run dev` - Run in development mode  
- `npm run scrape` - Run single-process web scraper
- `npm run scrape-parallel` - Run parallel web scraper
- `npm run check-url` - Check URL redirects and verify page behavior
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
