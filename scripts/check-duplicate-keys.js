#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Check for duplicate keys in JSON translation files
 * This script validates all translation files for duplicate keys
 */

const I18N_DIR = path.join(__dirname, '../i18n/resources');

function checkDuplicateKeysInString(jsonString, filePath) {
  // Regex to find JSON keys. It captures the key name (group 1).
  // It handles escaped quotes within keys.
  const keyPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g;
  const keysFound = [];
  let match;

  while ((match = keyPattern.exec(jsonString)) !== null) {
    keysFound.push(match[1]); // match[1] is the captured key name
  }

  const duplicates = [];
  const seen = new Set();

  for (const key of keysFound) {
    if (seen.has(key)) {
      duplicates.push(key);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length > 0) {
    console.error(`❌ Duplicate keys found in ${filePath}:`);
    duplicates.forEach(key => {
      console.error(`   - "${key}"`);
    });
    return false;
  }

  return true;
}

function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // First, check for duplicates in the raw string content
    if (!checkDuplicateKeysInString(content, filePath)) {
      return false; // Duplicates found, report failure
    }
    
    // If no duplicates in string, then try to parse to ensure it's valid JSON
    // This will catch other JSON syntax errors that the regex might miss.
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`❌ Error parsing or validating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  let allValid = true;

  const languages = fs.readdirSync(I18N_DIR);

  for (const lang of languages) {
    const langDir = path.join(I18N_DIR, lang);
    if (fs.statSync(langDir).isDirectory()) {
      const files = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(langDir, file);
        if (!validateJsonFile(filePath)) {
          allValid = false;
        }
      }
    }
  }

  if (allValid) {
    console.log('✅ All translation files are valid and have no duplicate keys.');
  } else {
    console.error('🚨 Found issues in translation files. Please fix them.');
    process.exit(1);
  }
}

main();