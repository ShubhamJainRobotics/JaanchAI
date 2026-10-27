const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client', 'src');
const forbiddenTokens = ['GEMINI_API_KEY', '@google/genai', 'SUPABASE_SERVICE_ROLE_KEY'];

let foundForbidden = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?|html|json|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const token of forbiddenTokens) {
        if (content.includes(token)) {
          console.error(`[SECURITY ERROR] Forbidden token "${token}" found in client file: ${fullPath}`);
          foundForbidden = true;
        }
      }
    }
  }
}

scanDir(clientDir);

if (foundForbidden) {
  console.error('[SECURITY CHECK FAILED] Client contains forbidden server secrets or AI SDK imports.');
  process.exit(1);
} else {
  console.log('[SECURITY CHECK PASSED] No server secrets or AI SDK imports found in client.');
}
