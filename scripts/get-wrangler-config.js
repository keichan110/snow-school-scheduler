#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
// 'toml' パッケージのインストールが必要です: npm install toml
const toml = require('toml');

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && !isNaN(parseInt(key, 10))) {
      return acc[parseInt(key, 10)];
    }
    return acc[key];
  }, obj);
}

if (process.argv.length !== 3) {
  console.error('Usage: node get-wrangler-config.js <key_path>');
  process.exit(1);
}

const keyPath = process.argv[2];
const tomlPath = path.join(process.cwd(), 'wrangler.toml');

if (!fs.existsSync(tomlPath)) {
  console.error(`Error: 'wrangler.toml' not found.`);
  process.exit(1);
}

try {
  const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
  const config = toml.parse(tomlContent);
  const value = getNestedValue(config, keyPath);

  if (value === undefined) {
    console.error(`Error: Key path '${keyPath}' not found in 'wrangler.toml'`);
    process.exit(1);
  }

  process.stdout.write(String(value));
} catch (e) {
  console.error(`Error parsing 'wrangler.toml': ${e.message}`);
  process.exit(1);
}
