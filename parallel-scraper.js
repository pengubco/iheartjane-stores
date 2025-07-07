const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

// Default configuration
let startId = 1;
let endId = 6000;
let outputDir = './scraped-stores';
let chunkSize = 100; // stores per chunk
let maxConcurrent = 5; // maximum parallel processes
let saveHtml = args.includes('--save-html');
let savePng = args.includes('--save-png');
let headless = args.includes('--headless'); // optional headless mode


// Parse arguments
const startFlag = args.findIndex(arg => arg === '--start');
const endFlag = args.findIndex(arg => arg === '--end');
const outputFlag = args.findIndex(arg => arg === '--output' || arg === '-o');
const chunkFlag = args.findIndex(arg => arg === '--chunk-size');
const concurrentFlag = args.findIndex(arg => arg === '--max-concurrent');

if (startFlag !== -1 && args[startFlag + 1]) {
    startId = parseInt(args[startFlag + 1]);
}
if (endFlag !== -1 && args[endFlag + 1]) {
    endId = parseInt(args[endFlag + 1]);
}
if (outputFlag !== -1 && args[outputFlag + 1]) {
    outputDir = args[outputFlag + 1];
}
if (chunkFlag !== -1 && args[chunkFlag + 1]) {
    chunkSize = parseInt(args[chunkFlag + 1]);
}
if (concurrentFlag !== -1 && args[concurrentFlag + 1]) {
    maxConcurrent = parseInt(args[concurrentFlag + 1]);
}

if (help) {
    console.log(`
Parallel Web Scraper for iHeartJane Stores

Usage: node parallel-scraper.js [options]

Options:
  --start <id>           Start store ID (default: 1)
  --end <id>             End store ID (default: 6000)
  --output <path>        Output directory (default: ./scraped-stores)
  -o <path>              Short form of --output
  --chunk-size <size>    Stores per chunk/process (default: 100)
  --max-concurrent <n>   Maximum parallel processes (default: 5)
  --headless             Run browsers in headless mode (no UI)
  --save-html            Save HTML files (passed to each process)
  --save-png             Save PNG screenshots (passed to each process)
  --help, -h             Show this help message

Examples:
  node parallel-scraper.js                                      # Scrape stores 1-6000, defaults
  node parallel-scraper.js --start 1 --end 1000                 # Scrape stores 1-1000
  node parallel-scraper.js --start 1 --end 1000 --chunk-size 50 --max-concurrent 10  # Custom settings
  node parallel-scraper.js --start 1 --end 6000 --chunk-size 200 --max-concurrent 8 --headless  # High-performance
  node parallel-scraper.js --start 1 --end 1000 --save-html --save-png  # Save all formats
  node parallel-scraper.js --start 500 --end 1500 --output ./data       # Custom output directory

Performance Notes:
- Each chunk runs as a separate process with its own browser instance
- Larger chunk sizes = fewer processes but longer individual runtime
- More concurrent processes = faster overall but more resource usage
- Recommended: chunk-size 50-200, max-concurrent 3-10 depending on your system
    `);
    process.exit(0);
}

// Validate input
if (startId > endId) {
    console.error('❌ Error: Start ID cannot be greater than End ID');
    process.exit(1);
}

if (chunkSize < 1 || maxConcurrent < 1) {
    console.error('❌ Error: Chunk size and max concurrent must be positive numbers');
    process.exit(1);
}

// Calculate chunks
const totalStores = endId - startId + 1;
const chunks = [];
for (let i = startId; i <= endId; i += chunkSize) {
    const chunkStart = i;
    const chunkEnd = Math.min(i + chunkSize - 1, endId);
    chunks.push({ start: chunkStart, end: chunkEnd });
}

console.log(`
🚀 Parallel Scraping Configuration:
📊 Total Stores: ${totalStores} (${startId} to ${endId})
📦 Chunks: ${chunks.length} chunks of ~${chunkSize} stores each
🔄 Max Concurrent: ${maxConcurrent} processes
📁 Output Directory: ${outputDir}
💾 Save HTML: ${saveHtml}
📸 Save PNG: ${savePng}
`);

// Progress tracking
const progress = {
    completed: 0,
    failed: 0,
    total: chunks.length,
    startTime: Date.now(),
    statusCodes: {},
    storeResults: {
        successful: [],
        failed: []
    }
};

// Process a single chunk
async function processChunk(chunk, chunkIndex) {
    return new Promise((resolve, reject) => {
        const args = [
            'playwright-brave.js',
            '--start', chunk.start.toString(),
            '--end', chunk.end.toString(),
            '--output', outputDir
        ];

        if (headless) args.push('--headless');

        if (saveHtml) args.push('--save-html');
        if (savePng) args.push('--save-png');

        console.log(`🔄 Starting chunk ${chunkIndex + 1}/${chunks.length}: stores ${chunk.start}-${chunk.end}`);

        const child = spawn('node', args, {
            stdio: ['inherit', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error(`Chunk ${chunkIndex + 1} error: ${data.toString()}`);
        });

        child.on('close', (code) => {
            // Parse status codes from stdout
            const parseResults = (output) => {
                const results = { statusCodes: {}, successful: [], failed: [] };
                
                // Extract HTTP status codes from output
                const statusCodeMatches = output.match(/HTTP (\d+|error): (\d+) stores/g);
                if (statusCodeMatches) {
                    statusCodeMatches.forEach(match => {
                        const [_, statusCode, count] = match.match(/HTTP (\d+|error): (\d+) stores/);
                        results.statusCodes[statusCode] = parseInt(count);
                    });
                }
                
                // Extract successful store IDs
                const successMatch = output.match(/Successfully saved (\d+) JSON files/);
                if (successMatch) {
                    const storeIdsMatch = output.match(/Store IDs: ([\d, ]+)/);
                    if (storeIdsMatch) {
                        results.successful = storeIdsMatch[1].split(', ').map(id => parseInt(id.trim()));
                    }
                }
                
                return results;
            };
            
            if (code === 0) {
                progress.completed++;
                console.log(`✅ Chunk ${chunkIndex + 1}/${chunks.length} completed (stores ${chunk.start}-${chunk.end})`);
                
                // Parse and aggregate results
                const chunkResults = parseResults(stdout);
                
                // Aggregate status codes
                Object.entries(chunkResults.statusCodes).forEach(([statusCode, count]) => {
                    if (!progress.statusCodes[statusCode]) {
                        progress.statusCodes[statusCode] = 0;
                    }
                    progress.statusCodes[statusCode] += count;
                });
                
                // Aggregate successful stores
                progress.storeResults.successful.push(...chunkResults.successful);
                
                resolve({ success: true, chunkIndex, chunk, stdout, results: chunkResults });
            } else {
                progress.failed++;
                console.error(`❌ Chunk ${chunkIndex + 1}/${chunks.length} failed with code ${code}`);
                reject({ success: false, chunkIndex, chunk, code, stderr });
            }

            // Progress update
            const completedTotal = progress.completed + progress.failed;
            const progressPercent = ((completedTotal / progress.total) * 100).toFixed(1);
            const elapsed = ((Date.now() - progress.startTime) / 1000).toFixed(1);
            console.log(`📊 Overall Progress: ${progressPercent}% (${completedTotal}/${progress.total} chunks, ${elapsed}s elapsed)`);
        });
    });
}

// Process chunks with concurrency limit
async function processAllChunks() {
    console.log(`🚀 Starting parallel processing...`);
    
    // Create output directory
    try {
        await fs.mkdir(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${outputDir}`);
    } catch (error) {
        console.error(`❌ Failed to create output directory: ${error.message}`);
        process.exit(1);
    }

    const results = [];
    let chunkIndex = 0;

    // Process chunks with proper concurrency control
    while (chunkIndex < chunks.length) {
        const activePromises = [];
        
        // Start up to maxConcurrent processes
        for (let i = 0; i < maxConcurrent && chunkIndex < chunks.length; i++) {
            const promise = processChunk(chunks[chunkIndex], chunkIndex)
                .then(result => result)
                .catch(error => error);
            
            activePromises.push(promise);
            chunkIndex++;
        }
        
        // Wait for all current batch to complete
        const batchResults = await Promise.all(activePromises);
        results.push(...batchResults);
        
        console.log(`📊 Batch completed: ${Math.min(chunkIndex, chunks.length)}/${chunks.length} chunks processed`);
    }

    return results;
}

// Main execution
async function main() {
    const startTime = Date.now();
    
    try {
        const results = await processAllChunks();
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`
🏁 Parallel Scraping Complete!

📊 Final Results:
✅ Successful chunks: ${successful}
❌ Failed chunks: ${failed}
📦 Total chunks: ${results.length}
⏱️  Total time: ${totalTime} seconds
📁 Output saved to: ${outputDir}

Average time per chunk: ${(totalTime / results.length).toFixed(1)} seconds
        `);

        // Aggregated status code summary
        if (Object.keys(progress.statusCodes).length > 0) {
            console.log('\n📡 Aggregated Response Code Summary:');
            const sortedStatusCodes = Object.entries(progress.statusCodes).sort(([a], [b]) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                if (!isNaN(aNum)) return -1;
                if (!isNaN(bNum)) return 1;
                return a.localeCompare(b);
            });
            
            const totalStores = endId - startId + 1;
            sortedStatusCodes.forEach(([statusCode, count]) => {
                const percentage = ((count / totalStores) * 100).toFixed(1);
                const emoji = statusCode === '200' ? '✅' : statusCode === '404' ? '❌' : '⚠️';
                console.log(`   ${emoji} HTTP ${statusCode}: ${count} stores (${percentage}%)`);
            });
            
            // Summary of saved files
            const totalSaved = progress.storeResults.successful.length;
            if (totalSaved > 0) {
                console.log(`\n💾 Files Saved: ${totalSaved} JSON files successfully created`);
            }
        }

        if (failed > 0) {
            console.log('\n❌ Failed chunks:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`   Chunk ${r.chunkIndex + 1}: stores ${r.chunk.start}-${r.chunk.end} (code: ${r.code})`);
            });
        }

    } catch (error) {
        console.error(`❌ Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Run the main function
main().catch(console.error);
