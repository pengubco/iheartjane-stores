#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Find all JSON files in scraped-stores directory
const scrapedStoresDir = './scraped-stores';

try {
    const files = fs.readdirSync(scrapedStoresDir)
        .filter(file => file.endsWith('.json'))
        .filter(file => file.startsWith('iheartjane-store-'));

    console.log(`🔍 Checking ${files.length} store files for inactive stores (product_count: 0)...\n`);

    const inactiveStores = [];

    files.forEach(file => {
        try {
            const filePath = path.join(scrapedStoresDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (data.store && data.store.product_count === 0) {
                inactiveStores.push({
                    file: file,
                    id: data.store.id,
                    name: data.store.name,
                    city: data.store.city,
                    state: data.store.state
                });
            }
        } catch (error) {
            console.log(`⚠️  Error reading ${file}: ${error.message}`);
        }
    });

    if (inactiveStores.length > 0) {
        console.log(`❌ Found ${inactiveStores.length} inactive stores (product_count: 0):`);
        inactiveStores.forEach(store => {
            console.log(`   📁 ${store.file}`);
            console.log(`      ID: ${store.id} | Name: ${store.name} | Location: ${store.city}, ${store.state}`);
        });
    } else {
        console.log('✅ No inactive stores found (all stores have product_count > 0)');
    }

    // Show count prominently
    console.log(`\n📊 INACTIVE STORES COUNT: ${inactiveStores.length}`);
    console.log(`📊 TOTAL STORES CHECKED: ${files.length}`);
    console.log(`📊 ACTIVE STORES: ${files.length - inactiveStores.length}`);
    console.log(`📊 PERCENTAGE INACTIVE: ${((inactiveStores.length / files.length) * 100).toFixed(1)}%`);

} catch (error) {
    console.error('❌ Error:', error.message);
}
