const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function fetchWithBrave() {
    console.log('Starting Playwright with Brave browser...');
    
    // Launch browser with Brave executable path (common macOS location)
    const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    
    const browser = await chromium.launch({
        headless: false, // Set to true if you don't want to see the browser
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
        
        // Get the page content
        const content = await page.content();
        
        // Also get just the text content if it's JSON
        const textContent = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent || '';
        });
        
        // Save the full HTML content
        const htmlFilename = 'iheartjane-store-477.html';
        await fs.writeFile(htmlFilename, content, 'utf8');
        console.log(`HTML content saved to: ${htmlFilename}`);
        
        // Save the text content (likely JSON)
        const txtFilename = 'iheartjane-store-477.txt';
        await fs.writeFile(txtFilename, textContent, 'utf8');
        console.log(`Text content saved to: ${txtFilename}`);
        
        // Optional: Take a screenshot
        const screenshotPath = 'iheartjane-store-477-screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to: ${screenshotPath}`);
        
        console.log('Closing tab and browser...');
        
        // Close the page (tab)
        await page.close();
        
    } catch (error) {
        console.error('Error occurred:', error.message);
    } finally {
        // Close the browser
        await browser.close();
        console.log('Browser closed successfully');
    }
}

// Run the function
fetchWithBrave().catch(console.error);
