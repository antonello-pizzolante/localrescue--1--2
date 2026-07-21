const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const missingImports = `
import { getAccessToken } from './lib/auth';
import { uploadFileToDrive } from './lib/drive';
import { generateAutistiPDF, generateSanitariPDF } from './utils/exports';
`;
content = content.replace(/import CloudArchiveConsole from '\.\/components\/CloudArchiveConsole';/, "import CloudArchiveConsole from './components/CloudArchiveConsole';\n" + missingImports);
fs.writeFileSync(file, content);
console.log('patched imports');
