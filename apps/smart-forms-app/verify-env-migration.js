#!/usr/bin/env node

/**
 * Verification script to ensure all environment variables have been migrated to config.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Environment Variable Migration...\n');

// Check for remaining environment variable usage
const srcDir = path.join(__dirname, 'src');
const envPatterns = [
    /import\.meta\.env\.VITE_/g,
    /process\.env\.VITE_/g,
    /process\.env\.REACT_APP_/g
];

let foundEnvUsage = false;

function searchInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            envPatterns.forEach(pattern => {
                if (pattern.test(line)) {
                    console.log(`❌ Found environment variable usage in ${filePath}:${index + 1}`);
                    console.log(`   ${line.trim()}`);
                    foundEnvUsage = true;
                }
            });
        });
    } catch (error) {
        // Ignore files that can't be read
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            searchInFile(filePath);
        }
    });
}

// Search for environment variable usage
walkDirectory(srcDir);

// Check if config.json exists and is valid
const configPath = path.join(__dirname, 'public', 'config.json');
if (fs.existsSync(configPath)) {
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        console.log('\n✅ config.json found and valid');
        console.log('📋 Configuration structure:');
        console.log(`   - Client IDs: ${Object.keys(config.clientIds || {}).length} configured`);
        console.log(`   - App Config: ${Object.keys(config.appConfig || {}).length} settings`);
        
        // Check for required fields
        const requiredFields = [
            'terminologyServerUrl',
            'formsServerUrl',
            'launchScope',
            'launchClientId',
            'appTitle',
            'inAppPopulate',
            'enableDynamicClientRegistration',
            'dynamicRegistrationFallbackEnabled',
            'showDebugMode'
        ];
        
        const missingFields = requiredFields.filter(field => 
            !config.appConfig || !(field in config.appConfig)
        );
        
        if (missingFields.length > 0) {
            console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        } else {
            console.log('✅ All required configuration fields present');
        }
        
    } catch (error) {
        console.log(`❌ config.json is invalid: ${error.message}`);
    }
} else {
    console.log('❌ config.json not found in public directory');
}

// Check for .env files
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
let foundEnvFiles = false;

envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
        console.log(`⚠️  Found ${envFile} file (should be removed or renamed)`);
        foundEnvFiles = true;
    }
});

// Summary
console.log('\n📊 Migration Summary:');
if (!foundEnvUsage && !foundEnvFiles) {
    console.log('✅ SUCCESS: All environment variables have been migrated to config.json');
    console.log('✅ No .env files found');
    console.log('✅ No environment variable usage found in source code');
} else {
    console.log('❌ ISSUES FOUND:');
    if (foundEnvUsage) {
        console.log('   - Environment variable usage still found in source code');
    }
    if (foundEnvFiles) {
        console.log('   - .env files still present');
    }
}

console.log('\n🎯 Next Steps:');
console.log('1. Test the app at http://localhost:5174/');
console.log('2. Test the config checker at http://localhost:5174/config-check');
console.log('3. Test configuration changes by editing public/config.json');
console.log('4. Run the test page at http://localhost:5174/test-config.html');
