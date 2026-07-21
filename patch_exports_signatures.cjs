const fs = require('fs');
let content = fs.readFileSync('src/utils/exports.ts', 'utf8');

const regex = /  \/\/ Signatures Panel \(Turn validation\)([^]*?)return doc;\n\}/;
const replacement = `  // Signatures Panel (Turn validation)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, 186, 60, 1, 1, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VALIDAZIONE DEI TURNI (1° / 2° / 3° TURNO)', 15, y + 5);

  // Column width: 62mm each
  const sigs = [
    { key: 'turn1', label: '1° TURNO', data: report.signatures.turn1 },
    { key: 'turn2', label: '2° TURNO', data: report.signatures.turn2 },
    { key: 'turn3', label: '3° TURNO', data: report.signatures.turn3 }
  ];

  sigs.forEach((sig, sIdx) => {
    const xOffset = 15 + (sIdx * 62);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(sig.label, xOffset, y + 10);

    if (sig.data) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(\`Data/Ora: \${sig.data.timestamp}\`, xOffset, y + 14);
      
      // Autista
      doc.setFont('Helvetica', 'bold');
      doc.text(\`Autista: \${sig.data.name.substring(0, 15)}\`, xOffset, y + 18);
      try {
        if (sig.data.signatureDataUrl) doc.addImage(sig.data.signatureDataUrl, 'PNG', xOffset, y + 19, 28, 10);
      } catch (err) {}

      // Soccorritore
      doc.setFont('Helvetica', 'bold');
      doc.text(\`Socc.: \${(sig.data.rescuerName || '').substring(0, 15)}\`, xOffset, y + 33);
      try {
        if (sig.data.rescuerSignatureDataUrl) doc.addImage(sig.data.rescuerSignatureDataUrl, 'PNG', xOffset, y + 34, 28, 10);
      } catch (err) {}

    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('NON ANCORA FIRMATO', xOffset, y + 18);
      doc.setTextColor(15, 23, 42);
    }
  });

  return doc;
}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/utils/exports.ts', content);
