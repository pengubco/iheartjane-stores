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
```bash
# Basic usage - fetch single store (default: 477) to current directory
node playwright-brave.js

# Fetch specific store by ID to specific folder
node playwright-brave.js --store 123 --output ./data

# Fetch range of stores to specific directory
node playwright-brave.js --start 470 --end 480 -o ./stores

# Fetch large range silently to organized folder
node playwright-brave.js --start 1 --end 100 --headless --output ./downloads

# Save all formats to specific directory
node playwright-brave.js --start 470 --end 475 --save-html --save-png --output ./complete-data

# Show help and all options
node playwright-brave.js --help
```

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
