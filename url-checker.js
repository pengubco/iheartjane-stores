const { chromium } = require('playwright');

// Parse command line arguments
const args = process.argv.slice(2);
const headless = args.includes('--headless');
const help = args.includes('--help') || args.includes('-h');

// Default URL to check
let targetUrl = 'https://www.iheartjane.com/stores/5585';

// Parse custom URL if provided
const urlFlag = args.findIndex(arg => arg === '--url');
if (urlFlag !== -1 && args[urlFlag + 1]) {
    targetUrl = args[urlFlag + 1];
}

if (help) {
    console.log(`
URL Redirect Checker for iHeartJane

Usage: node url-checker.js [options]

Options:
  --url <url>        URL to check (default: https://www.iheartjane.com/stores/5585)
  --headless         Run browser in headless mode (no UI)
  --help, -h         Show this help message

Examples:
  node url-checker.js                                          # Check default URL
  node url-checker.js --url https://www.iheartjane.com/stores/123  # Check custom URL
  node url-checker.js --headless                               # Run without browser UI
    `);
    process.exit(0);
}

async function checkUrlRedirect() {
    console.log('🚀 Starting URL Redirect Checker...');
    console.log(`🔗 Target URL: ${targetUrl}`);
    console.log(`👀 Headless mode: ${headless ? 'ON' : 'OFF'}`);
    
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
        
        // Set up popup/dialog handlers to automatically dismiss them
        page.on('dialog', async dialog => {
            console.log(`🔔 Auto-dismissing dialog: "${dialog.message()}"`);
            await dialog.accept();
        });
        
        console.log(`\n📄 Navigating to: ${targetUrl}`);
        console.log('⏳ Please wait while checking... (browser will close automatically)');
        
        // Navigate to the URL and capture the response
        const response = await page.goto(targetUrl, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        // Handle common popup patterns (age verification, cookie consent, etc.)
        await handlePopups(page);
        
        // Get the final URL after navigation
        const finalUrl = page.url();
        const statusCode = response.status();
        
        console.log(`📡 HTTP Status: ${statusCode}`);
        console.log(`🎯 Final URL: ${finalUrl}`);
        
        // Check if URL changed
        const urlChanged = targetUrl !== finalUrl;
        
        console.log('\n📊 Results:');
        console.log(`🔗 Original URL: ${targetUrl}`);
        console.log(`🔗 Final URL:    ${finalUrl}`);
        
        if (urlChanged) {
            console.log('✅ URL CHANGED - Redirect detected!');
            
            // Analyze the type of redirect
            if (finalUrl.includes('/stores') && !finalUrl.match(/\/stores\/\d+$/)) {
                console.log('🔄 Redirect type: Store-specific URL redirected to general stores page');
            } else if (finalUrl.includes('/stores/')) {
                console.log('🔄 Redirect type: Store URL redirected to different store');
            } else {
                console.log('🔄 Redirect type: General redirect');
            }
            
            // Check if it's the specific redirect we're looking for
            if (targetUrl.includes('/stores/') && finalUrl === 'https://www.iheartjane.com/stores') {
                console.log('🎯 SPECIFIC MATCH: Store URL redirected to general stores page');
            }
        } else {
            console.log('❌ NO REDIRECT - URL stayed the same');
        }
        
        // Quick analysis for immediate results
        console.log('\n🔍 Quick Analysis:');
        console.log(`📊 Status Code: ${statusCode} ${getStatusDescription(statusCode)}`);
        
        // Check page title
        const pageTitle = await page.title();
        console.log(`📄 Page Title: "${pageTitle}"`);
        
        // Summary
        console.log('\n📈 Summary:');
        if (urlChanged) {
            console.log('🔄 REDIRECT DETECTED');
            console.log(`   From: ${targetUrl}`);
            console.log(`   To:   ${finalUrl}`);
            console.log(`   Status: ${statusCode}`);
        } else {
            console.log('✅ NO REDIRECT - URL unchanged');
            console.log(`   URL: ${targetUrl}`);
            console.log(`   Status: ${statusCode}`);
        }
        
        // Give user a moment to see results before closing
        console.log('\n⏳ Closing browser in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
    } catch (error) {
        console.error('❌ Error occurred:', error.message);
        
        // Check if it's a navigation error
        if (error.message.includes('net::ERR_') || error.message.includes('timeout')) {
            console.log('🔍 This might indicate the URL is not accessible or takes too long to load');
        }
    } finally {
        // Close the browser
        await browser.close();
        console.log('\n🏁 Browser closed successfully');
    }
}

async function handlePopups(page) {
    try {
        console.log('🔍 Checking for popups to dismiss...');
        
        // Common selectors for popups that might block interaction
        const popupSelectors = [
            // Age verification
            'button[data-testid*="age"]',
            'button[class*="age"]',
            'button:has-text("Yes")',
            'button:has-text("I am 21")',
            'button:has-text("Enter")',
            'button:has-text("Continue")',
            
            // Cookie consent
            'button[id*="cookie"]',
            'button[class*="cookie"]',
            'button:has-text("Accept")',
            'button:has-text("OK")',
            'button:has-text("Got it")',
            
            // General modal close buttons
            'button[class*="close"]',
            'button[aria-label*="close"]',
            '[class*="modal"] button',
            '[role="dialog"] button',
            
            // Common popup dismiss patterns
            '.popup button',
            '.modal button',
            '.overlay button'
        ];
        
        // Try to click any visible popup dismiss buttons
        for (const selector of popupSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        console.log(`🖱️  Clicking popup button: ${selector}`);
                        await element.click();
                        
                        // Wait a moment for popup to close
                        await page.waitForTimeout(1000);
                        break; // Exit after first successful click
                    }
                }
            } catch (clickError) {
                // Continue to next selector if this one fails
                continue;
            }
        }
        
        // Wait a moment after handling popups
        await page.waitForTimeout(2000);
        
    } catch (error) {
        console.log('⚠️  Could not dismiss popups automatically, continuing...');
    }
}

function getStatusDescription(statusCode) {
    const statusDescriptions = {
        200: 'OK - Success',
        301: 'Moved Permanently',
        302: 'Found (Temporary Redirect)',
        303: 'See Other',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    
    return statusDescriptions[statusCode] || 'Unknown Status';
}

// Run the function
checkUrlRedirect().catch(console.error);
