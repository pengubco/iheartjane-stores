# JavaScript Project

A basic JavaScript project set up with the latest LTS version of Node.js.

## Setup Complete ✅

- ✅ Latest LTS Node.js version installed via nvm
- ✅ npm initialized with package.json
- ✅ Basic entry point created (index.js)
- ✅ Development scripts configured

## Getting Started

### Run the main project:
```bash
npm start
# or
npm run dev
```

### Run the Playwright web scraper:

#### Single Process (small ranges):
```bash
# Basic usage - fetch single store (default: 477) to current directory
node playwright-brave.js

# Fetch specific store by ID to specific folder
node playwright-brave.js --store 123 --output ./data

# Fetch range of stores to specific directory
node playwright-brave.js --start 470 --end 480 -o ./stores

# Save all formats to specific directory
node playwright-brave.js --start 470 --end 475 --save-html --save-png --output ./complete-data

# Show help and all options
node playwright-brave.js --help
```

#### Parallel Processing (large ranges):
```bash
# Default: scrape stores 1-6000 with 5 concurrent processes, 100 stores per chunk
node parallel-scraper.js

# Custom range with optimized settings
node parallel-scraper.js --start 1 --end 1000 --chunk-size 50 --max-concurrent 10

# Save all formats with parallel processing
node parallel-scraper.js --save-html --save-png --output ./all-stores-data

# High-performance setup for fast systems
node parallel-scraper.js --chunk-size 200 --max-concurrent 8 --output ./bulk-data

# Show parallel scraper help and options
node parallel-scraper.js --help
```

**Performance Recommendations:**
- **Small ranges (< 100 stores)**: Use `playwright-brave.js` directly
- **Large ranges (> 100 stores)**: Use `parallel-scraper.js` for much faster processing
- **Chunk size**: 50-200 stores per chunk (larger = fewer processes, smaller = more parallelism)
- **Max concurrent**: 3-10 processes depending on your system resources

## Project Structure

```
ai-playground/
├── package.json    # Project configuration and dependencies
├── index.js        # Main application entry point
└── README.md       # This file
```

## Available Scripts

- `npm start` - Run the application
- `npm run dev` - Run the application (development)
- `npm test` - Run tests (placeholder)

## Next Steps

Your JavaScript project is ready for development! You can:

1. Add dependencies with `npm install <package-name>`
2. Create additional modules and files
3. Set up testing frameworks
4. Add build tools like webpack or vite
5. Configure linting with ESLint
6. Add TypeScript support

Happy coding! 🚀
