const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

const replacement = `  // Static logo representation in PDF
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('Sanitàservice', 160, 15);
  doc.setFontSize(8);
  doc.text('ASL TARANTO', 160, 20);`;

const regex = /  \/\/ Static logo representation in PDF[^]*?  \}/;

content = content.replace(regex, replacement);
fs.writeFileSync('src/utils/exports.ts', content);
