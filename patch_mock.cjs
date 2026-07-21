const fs = require('fs');

function replaceAllInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replace);
  fs.writeFileSync(file, content);
}

replaceAllInFile('src/components/Dashboard.tsx', 'Taranto Centro', 'INDIA CENTRO');
replaceAllInFile('src/components/Dashboard.tsx', 'SS. Annunziata', 'TARANTO CENTRO');

replaceAllInFile('src/components/CloudArchiveConsole.tsx', 'Taranto Centro', 'INDIA CENTRO');
replaceAllInFile('src/components/CloudArchiveConsole.tsx', 'Ospedale SS. Annunziata', 'TARANTO CENTRO');

replaceAllInFile('src/data.ts', 'Taranto Centro', 'INDIA CENTRO');
replaceAllInFile('src/data.ts', 'Ospedale SS. Annunziata', 'TARANTO CENTRO');

