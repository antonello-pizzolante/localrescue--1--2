const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

// Add helper if not there
if (!content.includes('fetchImageAsBase64')) {
  content = content.replace(/import \{ jsPDF \} from 'jspdf';/, "import { jsPDF } from 'jspdf';\n\nasync function fetchImageAsBase64(url: string): Promise<string | null> {\n  try {\n    const res = await fetch(url);\n    const blob = await res.blob();\n    return new Promise((resolve) => {\n      const reader = new FileReader();\n      reader.onloadend = () => resolve(reader.result as string);\n      reader.readAsDataURL(blob);\n    });\n  } catch (err) {\n    return null;\n  }\n}\n");
}

// Replace carrozzeria image fetching
const regexCarrozzeria = /const carrozzeriaImg = localStorage\.getItem\('vehicle_bg_ambulanza'\) \|\| localStorage\.getItem\('vehicle_bg_automedica'\) \|\| localStorage\.getItem\('vehicle_main_bg'\);/g;
content = content.replace(regexCarrozzeria, `
    const isAutomedica = report.vehicleCode?.toLowerCase().includes('automedica');
    const carrozzeriaUrl = isAutomedica ? '/automedica.png' : '/ambulanza.png';
    const carrozzeriaImg = await fetchImageAsBase64(carrozzeriaUrl);
`);

// Replace logo fetching for Autisti (only has one logo in top right currently)
const regexCustomLogo = /const customLogo = localStorage\.getItem\('sanitaservice_logo_custom'\);[\s\S]*?ASL Taranto s\.r\.l\. Unipersonale', 145, 21\);\n    \}/g;

const logoReplacement = `
  const customLogo = await fetchImageAsBase64('/logo-1.png');
  const secondLogo = await fetchImageAsBase64('/logo-2.png');
  if (customLogo) {
    try { doc.addImage(customLogo, 'PNG', 15, 5, 40, 14); } catch(e){}
  }
  if (secondLogo) {
    try { doc.addImage(secondLogo, 'PNG', 155, 5, 40, 14); } catch(e){}
  }
`;

content = content.replace(regexCustomLogo, logoReplacement);

// Check if Sanitari PDF has logo code
content = content.replace(
  /doc\.text\('Scheda Sanitari - Taranto Soccorso', 15, 22\);[\s\S]*?Taranto Soccorso 118', 145, 21\);/m,
  `doc.text('Scheda Sanitari - Taranto Soccorso', 15, 22);

  const customLogoSan = await fetchImageAsBase64('/logo-1.png');
  const secondLogoSan = await fetchImageAsBase64('/logo-2.png');
  if (customLogoSan) {
    try { doc.addImage(customLogoSan, 'PNG', 15, 5, 40, 14); } catch(e){}
  }
  if (secondLogoSan) {
    try { doc.addImage(secondLogoSan, 'PNG', 155, 5, 40, 14); } catch(e){}
  }`
);

fs.writeFileSync(file, content);
console.log('patched exports.ts');
