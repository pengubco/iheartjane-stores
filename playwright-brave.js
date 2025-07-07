const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const saveHtml = args.includes('--save-html');
const savePng = args.includes('--save-png');
const headless = args.includes('--headless');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
Usage: node playwright-brave.js [options]

Options:
  --save-html    Save HTML content to file
  --save-png     Save screenshot as PNG
  --headless     Run browser in headless mode
  --help, -h     Show this help message

Examples:
  node playwright-brave.js                           # Just save text content
  node playwright-brave.js --save-html --save-png   # Save all formats
  node playwright-brave.js --headless               # Run without browser UI
    `);
    process.exit(0);
}

async function fetchWithBrave() {
    console.log('Starting Playwright with Brave browser...');
    console.log(`Options: HTML=${saveHtml}, PNG=${savePng}, Headless=${headless}`);
    
    // Launch browser with Brave executable path (common macOS location)
    const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    
    const browser = await chromium.launch({
        headless: headless,
        executablePath: bravePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Create a new page
        const page = await browser.newPage();
        
        console.log('Opening page: https://www.iheartjane.com/api/v1/stores/477');
        
        // Navigate to the URL
        await page.goto('https://www.iheartjane.com/api/v1/stores/477', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('Page loaded successfully');
        
        // Always get the text content (likely JSON)
        const textContent = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent || '';
        });
        
        // Always save the text content
        const txtFilename = 'iheartjane-store-477.txt';
        await fs.writeFile(txtFilename, textContent, 'utf8');
        console.log(`✅ Text content saved to: ${txtFilename}`);
        
        // Optionally save HTML content
        if (saveHtml) {
            const content = await page.content();
            const htmlFilename = 'iheartjane-store-477.html';
            await fs.writeFile(htmlFilename, content, 'utf8');
            console.log(`✅ HTML content saved to: ${htmlFilename}`);
        }
        
        // Optionally take a screenshot
        if (savePng) {
            const screenshotPath = 'iheartjane-store-477-screenshot.png';
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`✅ Screenshot saved to: ${screenshotPath}`);
        }
        
        console.log('Closing tab and browser...');
        
        // Close the page (tab)
        await page.close();
        
    } catch (error) {
        console.error('❌ Error occurred:', error.message);
    } finally {
        // Close the browser
        await browser.close();
        console.log('✅ Browser closed successfully');
    }
}

// Run the function
fetchWithBrave().catch(console.error);
