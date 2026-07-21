const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

content = content.replace(/  const customLogo = localStorage\.getItem\('sanitaservice_logo_custom'\);\n  if \(customLogo\) \{[^]*?\}\n/g, `  // Static logo representation in PDF
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('Sanitàservice', 160, 15);
  doc.setFontSize(8);
  doc.text('ASL TARANTO', 160, 20);
`);

fs.writeFileSync('src/utils/exports.ts', content);
