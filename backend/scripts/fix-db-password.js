#!/usr/bin/env node
/**
 * Usage (from backend/):
 *   node scripts/fix-db-password.js <mysql_root_password>
 * Or:
 *   MYSQL_PASSWORD=secret node scripts/fix-db-password.js
 */
const fs = require('fs');
const path = require('path');

const pw = process.argv[2] || process.env.MYSQL_PASSWORD;
if (!pw) {
  console.error('Usage: node scripts/fix-db-password.js <mysql_root_password>');
  console.error('   or: MYSQL_PASSWORD=... node scripts/fix-db-password.js');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
let content = fs.readFileSync(envPath, 'utf8');

const needsQuotes = /[#\s"'=]/.test(pw);
const value = needsQuotes ? `"${String(pw).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : pw;

if (!/^DB_PASSWORD=/m.test(content)) {
  content += `\nDB_PASSWORD=${value}\n`;
} else {
  content = content.replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${value}`);
}

fs.writeFileSync(envPath, content);
console.log('Updated backend/.env DB_PASSWORD. Restart the server (npm run dev).');
