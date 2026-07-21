const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

// First, remove the previously appended carrozzeria code at the bottom.
const toRemove = `  // --- CARROZZERIA IMAGE (Appended at the end or on a new page) ---`;
const removeStart = content.indexOf(toRemove);
if (removeStart !== -1) {
  const removeEnd = content.indexOf('return doc;', removeStart);
  if (removeEnd !== -1) {
    content = content.substring(0, removeStart) + content.substring(removeEnd);
  }
}

// Now let's replace the damages block.
const damageTarget = `  // Damages summary
  y += 6;
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(12, y, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('RILIEVO ANOMALIE CARROZZERIA', 15, y + 4);
    
  y += 6;
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  if (report.damages.length === 0) {
    doc.text('Nessuna anomalia o graffio riscontrato sulla carrozzeria del veicolo.', 15, y + 5);
    y += 8;
  } else {
    report.damages.forEach((d) => {
      doc.setFont('Helvetica', 'bold');
      doc.text(\`\${d.type === 'O' ? 'AMMACCATURA [O]' : 'GRAFFIO [X]'} su \${d.part}:\`, 15, y + 4);
      doc.setFont('Helvetica', 'normal');
      doc.text(\`"\${d.description}"\`, 80, y + 4);
      y += 5;
    });
    y += 2;
  }`;

const damageNew = `  // Damages summary
  y += 6;
  if (y > 240) { doc.addPage(); y = 15; }
  
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(12, y, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('RILIEVO ANOMALIE CARROZZERIA', 15, y + 4);
    
  y += 6;
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  
  const carrozzeriaImg = localStorage.getItem('vehicle_bg_ambulanza') || localStorage.getItem('vehicle_bg_automedica') || localStorage.getItem('vehicle_main_bg');
  
  if (report.damages.length === 0) {
    doc.text('Nessuna anomalia o graffio riscontrato sulla carrozzeria del veicolo.', 15, y + 5);
    y += 8;
  } else {
    if (carrozzeriaImg) {
       // Ensure there's enough space for the image (50mm height). If not, add page.
       if (y + 55 > 280) {
         doc.addPage();
         y = 15;
       }
       
       const imgW = 100;
       const imgH = 55;
       const imgX = 98; // align right side
       const imgY = y;
       
       try {
         const format = carrozzeriaImg.includes('image/png') ? 'PNG' : 'JPEG';
         doc.addImage(carrozzeriaImg, format, imgX, imgY, imgW, imgH);
         
         report.damages.forEach(m => {
           const mx = imgX + (m.x / 100) * imgW;
           const my = imgY + (m.y / 100) * imgH;
           
           doc.setFillColor(m.type === 'O' ? 220 : 245, m.type === 'O' ? 38 : 158, m.type === 'O' ? 38 : 11);
           doc.circle(mx, my, 2.5, 'F');
           doc.setTextColor(255, 255, 255);
           doc.setFontSize(5);
           doc.text(m.type, mx - 0.7, my + 1);
         });
       } catch (e) {
         console.error(e);
       }
       
       // Draw text list on the left side
       let listY = y;
       report.damages.forEach((d) => {
         doc.setTextColor(51, 65, 85);
         doc.setFont('Helvetica', 'bold');
         doc.setFontSize(7.5);
         doc.text(\`\${d.type === 'O' ? '[O]' : '[X]'} \${d.part}:\`, 15, listY + 4);
         doc.setFont('Helvetica', 'normal');
         
         const textLines = doc.splitTextToSize(\`"\${d.description}"\`, 65);
         doc.text(textLines, 15, listY + 8);
         listY += 5 + (textLines.length * 3.5);
       });
       
       y += Math.max(listY - y, imgH) + 5;
    } else {
      report.damages.forEach((d) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(\`\${d.type === 'O' ? 'AMMACCATURA [O]' : 'GRAFFIO [X]'} su \${d.part}:\`, 15, y + 4);
        doc.setFont('Helvetica', 'normal');
        doc.text(\`"\${d.description}"\`, 80, y + 4);
        y += 5;
      });
      y += 2;
    }
  }`;

content = content.replace(damageTarget, damageNew);

fs.writeFileSync(file, content);
console.log('PDF layout updated');
