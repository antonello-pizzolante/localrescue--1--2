const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

const regex = / else \{\n    \/\/ Logo Reference text[^]*?  \}/;

content = content.replace(regex, "");
fs.writeFileSync('src/utils/exports.ts', content);
