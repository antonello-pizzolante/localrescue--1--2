const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix the stray else block
content = content.replace(/  \} else \{\n    \/\/ Logo Reference text[\s\S]*?ASL Taranto s\.r\.l\. Unipersonale', 145, 21\);\n  \}/m, '');

fs.writeFileSync(file, content);
console.log('fixed exports.ts syntax');
