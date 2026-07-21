const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

const helper = `
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
}
`;

content = content.replace(/import jsPDF from 'jspdf';/, "import jsPDF from 'jspdf';\n" + helper);
fs.writeFileSync(file, content);
