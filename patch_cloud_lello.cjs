const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("Per procedere con il salvataggio dei referti in Google Drive, devi autenticarti con l'account principale: <strong className=\"text-white\">localrescue099@gmail.com</strong>", "Per procedere con il salvataggio dei referti in Google Drive, devi autenticarti con l'account principale: <strong className=\"text-white\">lello199830@gmail.com</strong>");

fs.writeFileSync(file, content);
console.log('Done cloud console');
