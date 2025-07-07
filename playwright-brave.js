const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const saveHtml = args.includes('--save-html');
const savePng = args.includes('--save-png');
const headless = args.includes('--headless');
const help = args.includes('--help') || args.includes('-h');

// Parse store ID range
let startId = 477; // default single store
let endId = 477;

const startFlag = args.findIndex(arg => arg === '--start');
const endFlag = args.findIndex(arg => arg === '--end');
const singleFlag = args.findIndex(arg => arg === '--store');

if (singleFlag !== -1 && args[singleFlag + 1]) {
    startId = parseInt(args[singleFlag + 1]);
    endId = startId;
} else {
    if (startFlag !== -1 && args[startFlag + 1]) {
        startId = parseInt(args[startFlag + 1]);
    }
    if (endFlag !== -1 && args[endFlag + 1]) {
        endId = parseInt(args[endFlag + 1]);
    }
}

// Parse destination folder
let destinationFolder = './'; // default to current directory
const outputFlag = args.findIndex(arg => arg === '--output' || arg === '-o');
if (outputFlag !== -1 && args[outputFlag + 1]) {
    destinationFolder = args[outputFlag + 1];
    // Ensure path ends with separator
    if (!destinationFolder.endsWith('/') && !destinationFolder.endsWith('\\')) {
        destinationFolder += '/';
    }
}

if (help) {
    console.log(`
Usage: node playwright-brave.js [options]

Options:
  --store <id>       Fetch single store by ID (default: 477)
  --start <id>       Start of store ID range (default: 477)
  --end <id>         End of store ID range (default: 477)
  --output <path>    Destination folder for saving files (default: current directory)
  -o <path>          Short form of --output
  --save-html        Save HTML content to files
  --save-png         Save screenshots as PNG files
  --headless         Run browser in headless mode
  --help, -h         Show this help message

Examples:
  node playwright-brave.js                                    # Fetch store 477 to current directory
  node playwright-brave.js --store 123 --output ./data       # Fetch store 123 to ./data folder
  node playwright-brave.js --start 470 --end 480 -o ./stores # Fetch stores 470-480 to ./stores
  node playwright-brave.js --start 1 --end 100 --headless --output /tmp/stores  # Fetch 1-100 to /tmp/stores
  node playwright-brave.js --save-html --save-png --output ./downloads          # Save all formats to ./downloads
    `);
    process.exit(0);
}

// Validate range
if (startId > endId) {
    console.error('❌ Error: Start ID cannot be greater than End ID');
    process.exit(1);
}

console.log(`📋 Store ID Range: ${startId} to ${endId} (${endId - startId + 1} stores)`);
console.log(`📁 Output Directory: ${destinationFolder}`);

async function fetchSingleStore(page, storeId) {
    const url = `https://www.iheartjane.com/api/v1/stores/${storeId}`;
    
    try {
        console.log(`📄 Fetching store ${storeId}...`);
        
        // Navigate to the URL and capture response
        const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        const statusCode = response.status();
        console.log(`📡 Store ${storeId}: HTTP ${statusCode}`);
        
        // Don't save anything for 404 responses
        if (statusCode === 404) {
            console.log(`⚠️  Store ${storeId}: Not found (404) - skipping save`);
            return { success: false, storeId, reason: 'Not found', statusCode: 404 };
        }
        
        // Get the text content (likely JSON)
        const textContent = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent || '';
        });
        
        // Check if we have valid JSON data
        if (textContent.trim().length < 10) {
            console.log(`⚠️  Store ${storeId}: No data or empty response`);
            return { success: false, storeId, reason: 'No data', statusCode };
        }
        
        // Parse and validate JSON before saving
        let jsonData;
        try {
            jsonData = JSON.parse(textContent);
        } catch (parseError) {
            console.log(`⚠️  Store ${storeId}: Invalid JSON response`);
            return { success: false, storeId, reason: 'Invalid JSON', statusCode };
        }
        
        // Save as JSON file
        const jsonFilename = path.join(destinationFolder, `iheartjane-store-${storeId}.json`);
        await fs.writeFile(jsonFilename, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`✅ Store ${storeId}: JSON saved to ${jsonFilename}`);
        
        // Optionally save HTML content
        if (saveHtml) {
            const content = await page.content();
            const htmlFilename = path.join(destinationFolder, `iheartjane-store-${storeId}.html`);
            await fs.writeFile(htmlFilename, content, 'utf8');
            console.log(`✅ Store ${storeId}: HTML saved to ${htmlFilename}`);
        }
        
        // Optionally take a screenshot
        if (savePng) {
            const screenshotPath = path.join(destinationFolder, `iheartjane-store-${storeId}-screenshot.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`✅ Store ${storeId}: Screenshot saved to ${screenshotPath}`);
        }
        
        return { success: true, storeId, statusCode };
        
    } catch (error) {
        console.error(`❌ Store ${storeId} error: ${error.message}`);
        return { success: false, storeId, reason: error.message, statusCode: 'error' };
    }
}

async function fetchWithBrave() {
    console.log('Starting Playwright with Brave browser...');
    console.log(`Options: HTML=${saveHtml}, PNG=${savePng}, Headless=${headless}`);
    
    // Create destination directory if it doesn't exist
    try {
        await fs.mkdir(destinationFolder, { recursive: true });
    } catch (error) {
        console.error(`❌ Error creating directory ${destinationFolder}:`, error.message);
        process.exit(1);
    }
    
    // Launch browser with Brave executable path (common macOS location)
    const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    
    const browser = await chromium.launch({
        headless: headless,
        executablePath: bravePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = {
        success: [],
        failed: [],
        total: endId - startId + 1,
        statusCodes: {}
    };

    try {
        // Create a new page
        const page = await browser.newPage();
        
        console.log(`🚀 Starting to fetch ${results.total} stores...`);
        
        // Iterate through store IDs
        for (let storeId = startId; storeId <= endId; storeId++) {
            const result = await fetchSingleStore(page, storeId);
            
            // Track status codes
            const statusCode = result.statusCode || 'unknown';
            if (!results.statusCodes[statusCode]) {
                results.statusCodes[statusCode] = 0;
            }
            results.statusCodes[statusCode]++;
            
            if (result.success) {
                results.success.push(result.storeId);
            } else {
                results.failed.push({ storeId: result.storeId, reason: result.reason, statusCode: result.statusCode });
            }
            
            // Progress indicator
            const progress = ((storeId - startId + 1) / results.total * 100).toFixed(1);
            console.log(`📊 Progress: ${progress}% (${storeId - startId + 1}/${results.total})`);
            
            // Small delay to be respectful to the server
            if (storeId < endId) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Summary
        console.log('\n📈 Summary:');
        console.log(`✅ Successful: ${results.success.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`📊 Total: ${results.total}`);
        
        // Status code summary
        console.log('\n📡 Response Code Summary:');
        const sortedStatusCodes = Object.entries(results.statusCodes).sort(([a], [b]) => {
            // Sort by status code, putting numbers first, then strings
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
        });
        
        sortedStatusCodes.forEach(([statusCode, count]) => {
            const percentage = ((count / results.total) * 100).toFixed(1);
            const emoji = statusCode === '200' ? '✅' : statusCode === '404' ? '❌' : '⚠️';
            console.log(`   ${emoji} HTTP ${statusCode}: ${count} stores (${percentage}%)`);
        });
        
        if (results.failed.length > 0) {
            console.log('\n❌ Failed stores by reason:');
            const failuresByReason = {};
            results.failed.forEach(fail => {
                const key = `${fail.reason}${fail.statusCode ? ` (HTTP ${fail.statusCode})` : ''}`;
                if (!failuresByReason[key]) failuresByReason[key] = [];
                failuresByReason[key].push(fail.storeId);
            });
            
            Object.entries(failuresByReason).forEach(([reason, storeIds]) => {
                console.log(`   ${reason}: ${storeIds.length} stores`);
                if (storeIds.length <= 10) {
                    console.log(`     Store IDs: ${storeIds.join(', ')}`);
                } else {
                    console.log(`     Store IDs: ${storeIds.slice(0, 10).join(', ')} ... and ${storeIds.length - 10} more`);
                }
            });
        }
        
        if (results.success.length > 0) {
            console.log(`\n✅ Successfully saved ${results.success.length} JSON files`);
            if (results.success.length <= 20) {
                console.log(`   Store IDs: ${results.success.join(', ')}`);
            } else {
                console.log(`   Store IDs: ${results.success.slice(0, 20).join(', ')} ... and ${results.success.length - 20} more`);
            }
        }
        
    } catch (error) {
        console.error('❌ Browser error:', error.message);
    } finally {
        // Close the browser
        await browser.close();
        console.log('\n🏁 Browser closed successfully');
    }
}

// Run the function
fetchWithBrave().catch(console.error);
