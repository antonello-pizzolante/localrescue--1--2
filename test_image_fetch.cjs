const fs = require('fs');
let code = fs.readFileSync('src/utils/exports.ts', 'utf8');

const replacement = `
// Helper to fetch image as base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error fetching image for PDF', err);
    return null;
  }
}
`;

// we need to inject this, and change generateAutistiPdf to be async if it's not.
console.log(code.includes('export const generateAutistiPdf = (report: any) => {'));
