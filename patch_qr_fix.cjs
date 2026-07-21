const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

content = content.replace(/              \);\n            \}\}\n          <\/div>/g, "              );\n            })}\n          </div>");
fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
