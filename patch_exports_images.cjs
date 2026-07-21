const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

// A helper for fetching image
const fetchImageHelper = `
// Helper to fetch images as base64 for PDF
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
    console.error('Error fetching image for PDF:', url, err);
    return null;
  }
}
`;

if (!content.includes('fetchImageAsBase64')) {
  content = content.replace(/import \{ jsPDF \} from 'jspdf';/, "import { jsPDF } from 'jspdf';\n" + fetchImageHelper);
}

// Replace sanitaservice logo
const regexCustomLogo = /const customLogo = localStorage\.getItem\('sanitaservice_logo_custom'\);\s*if \(customLogo\) \{[\s\S]*?catch \(e\) \{[\s\S]*?\}[\s\S]*?\}/m;
const fetchLogoStr = `
  const customLogo = await fetchImageAsBase64('/logo-1.png');
  const secondLogo = await fetchImageAsBase64('/logo-2.png');
  if (customLogo) {
    try {
      doc.addImage(customLogo, 'PNG', 15, 5, 45, 18);
    } catch (e) { console.error("Error adding logo 1 to PDF:", e); }
  }
  if (secondLogo) {
    try {
      doc.addImage(secondLogo, 'PNG', 145, 5, 45, 18);
    } catch (e) { console.error("Error adding logo 2 to PDF:", e); }
  }
`;
content = content.replace(regexCustomLogo, fetchLogoStr);

// Same for Sanitari PDF? Let's check if it exists in generateSanitariPDF.
// Sanitari might not have it, but wait, it uses a generic header or similar?
