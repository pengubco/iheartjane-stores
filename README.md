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
# Basic usage - saves only text content
node playwright-brave.js

# Save all formats (HTML + PNG + text)
node playwright-brave.js --save-html --save-png

# Run in headless mode (no browser window)
node playwright-brave.js --headless

# Show help and options
node playwright-brave.js --help
```

### Check your setup:
```bash
node --version  # Check Node.js version
npm --version   # Check npm version
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
