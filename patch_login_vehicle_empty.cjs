const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');
content = content.replace(/useState\('TA-01'\)/, "useState('')");
fs.writeFileSync('src/components/Login.tsx', content);
