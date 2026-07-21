const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

content = content.replace(/QrCode \} from 'lucide-react';/, "QrCode, Printer } from 'lucide-react';");
fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
