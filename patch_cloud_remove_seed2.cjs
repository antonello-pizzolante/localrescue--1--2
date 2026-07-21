const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const regex = /  \/\/ Generate demo logs if empty(.|\n)*?setShowSeedSuccess\(true\);\n    \}, 2000\);\n  \};/m;
content = content.replace(regex, '');

fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
