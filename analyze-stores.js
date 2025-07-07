#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Find all JSON files in scraped-stores directory
const scrapedStoresDir = './scraped-stores';

try {
    const files = fs.readdirSync(scrapedStoresDir)
        .filter(file => file.endsWith('.json'))
        .filter(file => file.startsWith('iheartjane-store-'));

    console.log(`🔍 Analyzing ${files.length} store files...\n`);

    const storeData = {
        inactive: [],
        activeRecreational: [],
        activeMedical: [],
        activeByState: {},
        errors: []
    };

    files.forEach(file => {
        try {
            const filePath = path.join(scrapedStoresDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (data.store) {
                const store = {
                    file: file,
                    id: data.store.id,
                    name: data.store.name,
                    city: data.store.city,
                    state: data.store.state,
                    product_count: data.store.product_count,
                    recreational: data.store.recreational,
                    medical: data.store.medical
                };

                // Categorize stores
                if (store.product_count === 0) {
                    storeData.inactive.push(store);
                } else {
                    // Determine if recreational or medical based on boolean flags
                    if (store.recreational === true) {
                        storeData.activeRecreational.push(store);
                    }
                    if (store.medical === true) {
                        storeData.activeMedical.push(store);
                    }
                    
                    // Count by state/province
                    const location = store.state || 'Unknown';
                    if (!storeData.activeByState[location]) {
                        storeData.activeByState[location] = 0;
                    }
                    storeData.activeByState[location]++;
                }
            }
        } catch (error) {
            storeData.errors.push(`Error reading ${file}: ${error.message}`);
        }
    });

    // Display results
    console.log('📊 STORE ANALYSIS RESULTS\n');
    console.log('=' .repeat(50));
    
    // 1. Inactive stores
    console.log(`❌ INACTIVE STORES: ${storeData.inactive.length}`);
    
    // 2. Active recreational stores
    console.log(`\n🎉 ACTIVE RECREATIONAL STORES: ${storeData.activeRecreational.length}`);
    
    // 3. Active medical stores
    console.log(`💊 ACTIVE MEDICAL STORES: ${storeData.activeMedical.length}`);
    
    // 4. Active stores by state/province
    console.log(`\n🗺️  ACTIVE STORES BY STATE/PROVINCE:`);
    const sortedStates = Object.entries(storeData.activeByState)
        .sort(([,a], [,b]) => b - a);
    
    sortedStates.forEach(([state, count]) => {
        const percentage = ((count / (files.length - storeData.inactive.length)) * 100).toFixed(1);
        console.log(`   📍 ${state}: ${count} stores (${percentage}%)`);
    });

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   Total stores analyzed: ${files.length}`);
    console.log(`   Inactive stores: ${storeData.inactive.length} (${((storeData.inactive.length / files.length) * 100).toFixed(1)}%)`);
    console.log(`   Active stores: ${files.length - storeData.inactive.length} (${(((files.length - storeData.inactive.length) / files.length) * 100).toFixed(1)}%)`);
    console.log(`   Recreational stores: ${storeData.activeRecreational.length}`);
    console.log(`   Medical stores: ${storeData.activeMedical.length}`);
    console.log(`   States/Provinces with stores: ${Object.keys(storeData.activeByState).length}`);

    // Show errors if any
    if (storeData.errors.length > 0) {
        console.log(`\n⚠️  ERRORS (${storeData.errors.length}):`);
        storeData.errors.forEach(error => {
            console.log(`   ${error}`);
        });
    }

} catch (error) {
    console.error('❌ Error:', error.message);
}
