const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

const autistiRegex = /  \/\/ Static logo representation in PDF[^]*?  y = 48;/;
const autistiReplacement = `  const customLogo = localStorage.getItem('sanitaservice_logo_custom');
  if (customLogo) {
    try {
      const imgFormat = customLogo.includes('image/jpeg') ? 'JPEG' : 'PNG';
      doc.addImage(customLogo, imgFormat, 135, 5, 65, 25);
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
      // Fallback
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('[ SANITASERVICE OFFICIAL ]', 145, 16);
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ASL Taranto s.r.l. Unipersonale', 145, 21);
    }
  } else {
    // Logo Reference text
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(59, 130, 246); // blue-500
    doc.text('[ SANITASERVICE OFFICIAL ]', 145, 16);
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ASL Taranto s.r.l. Unipersonale', 145, 21);
  }

  // Operator metadata box
  y = 48;`;

const sanitariRegex = /  \/\/ Logo Reference text\n  doc\.setFont\('Helvetica', 'bold'\);\n  doc\.setTextColor\(255, 255, 255\);\n  doc\.text\('\\[ 118 TARANTO SOCCORSO \\]', 135, 16\);\n  doc\.setFontSize\(8\);\n  doc\.setTextColor\(254, 226, 226\);\n  doc\.text\('Sistema Sanitario Regionale Puglia', 135, 21\);\n\n  \/\/ Operator metadata box\n  y = 48;/;
const sanitariReplacement = `  const customLogo = localStorage.getItem('taranto_soccorso_logo_custom');
  if (customLogo) {
    try {
      const imgFormat = customLogo.includes('image/jpeg') ? 'JPEG' : 'PNG';
      doc.addImage(customLogo, imgFormat, 135, 5, 65, 25);
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
      // Fallback
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('[ 118 TARANTO SOCCORSO ]', 135, 16);
      doc.setFontSize(8);
      doc.setTextColor(254, 226, 226);
      doc.text('Sistema Sanitario Regionale Puglia', 135, 21);
    }
  } else {
    // Logo Reference text
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('[ 118 TARANTO SOCCORSO ]', 135, 16);
    doc.setFontSize(8);
    doc.setTextColor(254, 226, 226);
    doc.text('Sistema Sanitario Regionale Puglia', 135, 21);
  }

  // Operator metadata box
  y = 48;`;

content = content.replace(autistiRegex, autistiReplacement);
content = content.replace(sanitariRegex, sanitariReplacement);
fs.writeFileSync('src/utils/exports.ts', content);
