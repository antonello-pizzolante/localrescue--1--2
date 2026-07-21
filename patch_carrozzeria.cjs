const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      doc.text('NON ANCORA FIRMATO', xOffset, y + 18);
      doc.setTextColor(15, 23, 42);
    }
  });

  return doc;
}`;

const newStr = `      doc.text('NON ANCORA FIRMATO', xOffset, y + 18);
      doc.setTextColor(15, 23, 42);
    }
  });

  // --- CARROZZERIA IMAGE (Appended at the end or on a new page) ---
  const carrozzeriaImg = localStorage.getItem('vehicle_bg_ambulanza') || localStorage.getItem('vehicle_bg_automedica') || localStorage.getItem('vehicle_main_bg');
  
  if (carrozzeriaImg || report.damages.length > 0) {
    doc.addPage();
    let cy = 15;
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(\`SCHEMA CARROZZERIA E DANNI RILEVATI - MEZZO \${report.vehicleCode}\`, 15, 12.5);
    
    cy = 25;
    
    if (carrozzeriaImg) {
      try {
        const format = carrozzeriaImg.includes('image/png') ? 'PNG' : 'JPEG';
        
        // Calculate image aspect ratio
        const imgW = 180;
        const imgH = 100; // rough estimation
        const imgX = 15;
        const imgY = cy;
        
        doc.addImage(carrozzeriaImg, format, imgX, imgY, imgW, imgH);
        
        // Draw markers
        report.damages.forEach(m => {
          const mx = imgX + (m.x / 100) * imgW;
          const my = imgY + (m.y / 100) * imgH;
          
          doc.setFillColor(m.type === 'O' ? 220 : 245, m.type === 'O' ? 38 : 158, m.type === 'O' ? 38 : 11); // red-600 or amber-500
          doc.circle(mx, my, 3.5, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(m.type, mx - 1, my + 1.5);
          
          // Draw a small tooltip box for the description
          doc.setDrawColor(255, 255, 255);
          doc.setFillColor(15, 23, 42);
          doc.rect(mx - 15, my - 12, 30, 6, 'FD');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(5);
          const text = (m.description || m.part).substring(0, 25);
          doc.text(text, mx - 13, my - 8);
        });
        
        cy += imgH + 10;
      } catch (e) {
        console.error('Error drawing carrozzeria:', e);
        doc.setTextColor(0, 0, 0);
        doc.text('Immagine schema carrozzeria non disponibile (errore di formato).', 15, cy);
        cy += 10;
      }
    } else {
      doc.setTextColor(0, 0, 0);
      doc.text('Nessuna immagine schema salvata nel dispositivo.', 15, cy);
      cy += 10;
    }
  }

  return doc;
}`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
console.log('Done');
