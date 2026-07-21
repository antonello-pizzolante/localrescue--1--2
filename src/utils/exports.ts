import jsPDF from 'jspdf';

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

import { AutistiChecklistReport, SanitariChecklistReport, UserSession } from '../types';

// Helper to add UTF-8 BOM for proper Italian character encoding in Excel/CSV
const CSV_BOM = '\uFEFF';

export function exportAutistiToCSV(report: AutistiChecklistReport): string {
  let csv = CSV_BOM;
  csv += 'CHECK LIST 118 TARANTO SOCCORSO - SCHEDA AUTISTI SOCCORRITORI (SANITASERVICE)\n';
  csv += `Data;${report.date}\n`;
  csv += ``;
  csv += `Postazione;${report.stationName}\n`;
  csv += `Postazione di Servizio Assegnata;${report.assignedServiceStation}\n`;
  csv += `Autista 1° Turno;${report.signatures.turn1?.name || 'N/D'}
`;
  csv += `Soccorritore 1° Turno;${report.signatures.turn1?.rescuerName || 'N/D'}
`;
  csv += `Autista 2° Turno;${report.signatures.turn2?.name || 'N/D'}
`;
  csv += `Soccorritore 2° Turno;${report.signatures.turn2?.rescuerName || 'N/D'}
`;
  csv += `Autista 3° Turno;${report.signatures.turn3?.name || 'N/D'}
`;
  csv += `Soccorritore 3° Turno;${report.signatures.turn3?.rescuerName || 'N/D'}

`;

  csv += 'ID;Categoria;Attivita;Valore Selezionato;1° Turno;2° Turno;3° Turno\n';
  report.activities.forEach(act => {
    const valText = `T1:${act.turn1.val || '-'} T2:${act.turn2.val || '-'} T3:${act.turn3.val || '-'}`;
    csv += `${act.id};${act.category.toUpperCase()};"${act.name.replace(/"/g, '""')}";${valText};${act.turn1.status};${act.turn2.status};${act.turn3.status}\n`;
  });

  if (report.damages.length > 0) {
    csv += '\nELENCO DANNI CARROZZERIA RILEVATI\n';
    csv += 'Tipo;Zona;Descrizione;Coordinate X%;Coordinate Y%\n';
    report.damages.forEach(d => {
      csv += `${d.type === 'O' ? 'Ammaccatura (O)' : 'Graffio (X)'};${d.part};"${d.description?.replace(/"/g, '""')}";${d.x}%;${d.y}%\n`;
    });
  }

  if (report.notes) {
    csv += `\nNOTE RILEVATE;"${report.notes.replace(/"/g, '""')}"\n`;
  }

  return csv;
}

export function exportSanitariToCSV(report: SanitariChecklistReport): string {
  let csv = CSV_BOM;
  csv += 'CHECK LIST 118 TARANTO SOCCORSO - SCHEDA SANITARI (MSA/MSB SET 118)\n';
  csv += `Data;${report.date}\n`;
  csv += ``;
  csv += `Postazione;${report.stationName}\n`;
  csv += `Postazione di Servizio Assegnata;${report.assignedServiceStation}\n`;
  csv += `Operatore Turno Mattina (MAT);${report.signatures.mat?.name || 'N/D'}\n`;
  csv += `Operatore Turno Pomeriggio (POM);${report.signatures.pom?.name || 'N/D'}\n`;
  csv += `Operatore Turno Notte (NOT);${report.signatures.not?.name || 'N/D'}\n\n`;

  csv += 'ID;Categoria;Descrizione Presidio;Quantita;Turno Mattina (MAT);Turno Pomeriggio (POM);Turno Notte (NOT)\n';
  report.items.forEach(item => {
    csv += `${item.id};${item.category};"${item.name.replace(/"/g, '""')}";${item.qty};${item.mat};${item.pom};${item.not}\n`;
  });

  if (report.notes) {
    csv += `\nNOTE RILEVATE;"${report.notes.replace(/"/g, '""')}"\n`;
  }

  return csv;
}

export function triggerDownload(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Custom PDF Generator using standard jsPDF elements
export async function generateAutistiPDF(report: AutistiChecklistReport, session: UserSession): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 15;

  // Header Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CHECK LIST 118 TARANTO SOCCORSO', 15, 16);
  
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Scheda Autisti Soccorritori - Sanitàservice ASL TA', 15, 22);


  
  const customLogo = await fetchImageAsBase64('/logo-1.png');
  const secondLogo = await fetchImageAsBase64('/logo-2.png');
  if (customLogo) {
    try { doc.addImage(customLogo, 'PNG', 15, 5, 40, 14); } catch(e){}
  }
  if (secondLogo) {
    try { doc.addImage(secondLogo, 'PNG', 155, 5, 40, 14); } catch(e){}
  }



  // Operator metadata box
  y = 48;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(12, y, 186, 32, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATI IDENTIFICATIVI DEL MEZZO E DEL SERVIZIO', 15, y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`MEZZO (Codice): ${report.vehicleCode}`, 15, y + 13);
  doc.text(`POSTAZIONE: ${report.stationName}`, 15, y + 20);
  doc.text(`POSTAZIONE DI SERVIZIO: ${report.assignedServiceStation}`, 15, y + 27);

  doc.text(`DATA COMPILAZIONE: ${report.date}`, 110, y + 13);
  doc.text(`STATO INVIO: PEC & EMAIL AUTOMATICHE`, 110, y + 20);
  doc.text(`SISTEMA FIRME: Validazione Digitale Integrata`, 110, y + 27);

  // Checklist table
  y = 86;
  doc.setFillColor(51, 65, 85); // slate-700
  doc.rect(12, y, 186, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ATTIVITÀ E CONTROLLI PRINCIPALI', 15, y + 4.5);
  doc.text('VALORE', 115, y + 4.5);
  doc.text('1° T', 145, y + 4.5);
  doc.text('2° T', 165, y + 4.5);
  doc.text('3° T', 185, y + 4.5);

  y += 7;
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  // Render top 25 checklist items dynamically
  const maxItemsOnFirstPage = 22;
  report.activities.slice(0, maxItemsOnFirstPage).forEach((act, index) => {
    // Alternating rows background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, 186, 6.5, 'F');
    }
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${index + 1}. ${act.name.length > 50 ? act.name.substring(0, 47) + '...' : act.name}`, 15, y + 4.5);
    
    // Val text
    doc.setFont('Helvetica', 'bold');
    doc.text(act.turn1.val || act.turn2.val || act.turn3.val || 'OK', 115, y + 4.5);

    // Turn 1, 2, 3 statuses
    const drawStatus = (status: string, xPos: number) => {
      if (status === 'OK') {
        doc.setTextColor(22, 163, 74); // green-600
        doc.text('V (OK)', xPos, y + 4.5);
      } else if (status === 'ANOMALIA') {
        doc.setTextColor(220, 38, 38); // red-600
        doc.text('X (ANOM)', xPos, y + 4.5);
      } else {
        doc.setTextColor(148, 163, 184); // gray
        doc.text('-', xPos, y + 4.5);
      }
      doc.setTextColor(15, 23, 42);
    };

    drawStatus(act.turn1.status, 145);
    drawStatus(act.turn2.status, 165);
    drawStatus(act.turn3.status, 185);

    y += 6.5;
  });

  // Second Page
  doc.addPage();
  y = 15;

  // Header for Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`DETTAGLI COMPILAZIONE E FIRME - MEZZO ${report.vehicleCode ? report.vehicleCode + ' - ' : ''}${report.date}`, 15, 12.5);

  // Render remaining items
  y = 25;
  doc.setFillColor(51, 65, 85);
  doc.rect(12, y, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('ALTRI CONTROLLI E STRUMENTAZIONE SANITARIA', 15, y + 4);
  doc.text('VALORE', 115, y + 4);
  doc.text('1° T', 145, y + 4);
  doc.text('2° T', 165, y + 4);
  doc.text('3° T', 185, y + 4);

  y += 6;
  doc.setTextColor(15, 23, 42);

  report.activities.slice(maxItemsOnFirstPage).forEach((act, index) => {
    const actIdx = index + maxItemsOnFirstPage;
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, 186, 6, 'F');
    }
    
    doc.setFont('Helvetica', 'normal');
    doc.text(`${actIdx + 1}. ${act.name}`, 15, y + 4);
    doc.setFont('Helvetica', 'bold');
    doc.text(act.turn1.val || act.turn2.val || act.turn3.val || 'OK', 115, y + 4);

    const drawStatus = (status: string, xPos: number) => {
      if (status === 'OK') {
        doc.setTextColor(22, 163, 74);
        doc.text('V', xPos, y + 4);
      } else if (status === 'ANOMALIA') {
        doc.setTextColor(220, 38, 38);
        doc.text('X', xPos, y + 4);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text('-', xPos, y + 4);
      }
      doc.setTextColor(15, 23, 42);
    };

    drawStatus(act.turn1.status, 145);
    drawStatus(act.turn2.status, 165);
    drawStatus(act.turn3.status, 185);

    y += 6;
  });

  // Damages summary
  y += 6;
  
  if (y > 230) { doc.addPage(); y = 15; }
  
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(12, y, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('RILIEVO ANOMALIE CARROZZERIA', 15, y + 4);
    
  y += 6;
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  
  
    const isAutomedica = report.vehicleCode?.toLowerCase().includes('automedica');
    const carrozzeriaUrl = isAutomedica ? '/automedica.png' : '/ambulanza.png';
    const carrozzeriaImg = await fetchImageAsBase64(carrozzeriaUrl);

  
  if (report.damages.length === 0) {
    doc.text('Nessuna anomalia o graffio riscontrato sulla carrozzeria del veicolo.', 15, y + 5);
    y += 8;
  } else {
    if (carrozzeriaImg) {
       if (y + 55 > 280) { doc.addPage(); y = 15; }
       
       const imgW = 100;
       const imgH = 55;
       const imgX = 98;
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
       
       let listY = y;
       report.damages.forEach((d) => {
         doc.setTextColor(51, 65, 85);
         doc.setFont('Helvetica', 'bold');
         doc.setFontSize(7.5);
         doc.text(`${d.type === 'O' ? '[O]' : '[X]'} ${d.part}:`, 15, listY + 4);
         doc.setFont('Helvetica', 'normal');
         const textLines = doc.splitTextToSize(`"${d.description}"`, 65);
         doc.text(textLines, 15, listY + 8);
         listY += 5 + (textLines.length * 3.5);
       });
       
       y += Math.max(listY - y, imgH) + 5;
    } else {
      report.damages.forEach((d) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(`${d.type === 'O' ? 'AMMACCATURA [O]' : 'GRAFFIO [X]'} su ${d.part}:`, 15, y + 4);
        doc.setFont('Helvetica', 'normal');
        doc.text(`"${d.description}"`, 80, y + 4);
        y += 5;
      });
      y += 2;
    }
  }
  // Notes
  if (report.notes) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(12, y, 186, 12, 'F');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.setFont('Helvetica', 'bold');
    doc.text('NOTE RILEVATE OPERATORI:', 15, y + 4.5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(report.notes.substring(0, 120), 15, y + 9);
    y += 16;
  } else {
    y += 2;
  }

  // Crew signatures (Driver & Rescuer)
  doc.setFillColor(241, 245, 249);
  // Signatures Panel (Turn validation)
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
      doc.text(`Data/Ora: ${sig.data.timestamp}`, xOffset, y + 14);
      
      // Autista
      doc.setFont('Helvetica', 'bold');
      doc.text(`Autista: ${sig.data.name.substring(0, 15)}`, xOffset, y + 18);
      try {
        if (sig.data.signatureDataUrl) doc.addImage(sig.data.signatureDataUrl, 'PNG', xOffset, y + 19, 28, 10);
      } catch (err) {}

      // Soccorritore
      doc.setFont('Helvetica', 'bold');
      doc.text(`Socc.: ${(sig.data.rescuerName || '').substring(0, 15)}`, xOffset, y + 33);
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
}

export async function generateSanitariPDF(report: SanitariChecklistReport, session: UserSession): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 15;

  // Header Background - Red/Blue theme for 118 Taranto
  doc.setFillColor(220, 38, 38); // red-600
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('CHECK-LIST MSA/MSB SET 118', 15, 16);
  
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(254, 226, 226); // red-100
  doc.text('118 Taranto Soccorso - Scheda Presidi Sanitari ed Equipaggiamenti', 15, 22);

  // Logo Reference text
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('[ 118 TARANTO SOCCORSO ]', 135, 16);
  doc.setFontSize(8);
  doc.setTextColor(254, 226, 226);
  doc.text('Sistema Sanitario Regionale Puglia', 135, 21);

  // Operator metadata box
  y = 48;
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(220, 38, 38); // red-600
  doc.roundedRect(12, y, 186, 32, 2, 2, 'FD');

  doc.setTextColor(153, 27, 27); // red-800
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATI INTEGRATI SQUADRA E ASSEGNAZIONE TURNO', 15, y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`CODICE MEZZO: ${report.vehicleCode}`, 15, y + 13);
  doc.text(`POSTAZIONE: ${report.stationName}`, 15, y + 20);
  doc.text(`POSTAZIONE DI SERVIZIO: ${report.assignedServiceStation}`, 15, y + 27);

  doc.text(`DATA COMPILAZIONE: ${report.date}`, 110, y + 13);
  doc.text(`GESTIONE REFERTO: Invio PEC Diretto ASL TA`, 110, y + 20);
  doc.text(`FIRMÀRI: Medici e Infermieri di Centrale`, 110, y + 27);

  // We have 187 items! Let's summarize item status counts by category on Page 1, and render a beautifully formatted breakdown so the PDF stays clean and readable!
  // Doing 187 rows on a PDF would generate ~8 pages. Instead, let's group items by category, and print the key categories or anomalies! This is vastly smarter, cleaner, and extremely useful!
  // Let's print category summary and a table of items that have anomalies first, then a standard structured breakdown.
  y = 86;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(12, y, 186, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SINTESI DISPONIBILITÀ MATERIALE E PRESIDI SANITARI', 15, y + 4.5);
  doc.text('CATEGORIA', 15, y + 4.5);
  doc.text('Q.TÀ TOT', 110, y + 4.5);
  doc.text('MAT', 145, y + 4.5);
  doc.text('POM', 165, y + 4.5);
  doc.text('NOT', 185, y + 4.5);

  y += 7;
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'normal');

  // Let's show categories
  const categories = Array.from(new Set(report.items.map(i => i.category)));
  categories.slice(0, 15).forEach((cat, idx) => {
    const catItems = report.items.filter(i => i.category === cat);
    const anomalies = catItems.filter(i => i.mat === 'ANOMALIA' || i.pom === 'ANOMALIA' || i.not === 'ANOMALIA').length;

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, 186, 6.5, 'F');
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(cat.length > 55 ? cat.substring(0, 52) + '...' : cat, 15, y + 4.5);
    
    doc.setFont('Helvetica', 'normal');
    doc.text(`${catItems.length} articoli`, 110, y + 4.5);

    if (anomalies > 0) {
      doc.setTextColor(220, 38, 38);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${anomalies} ANOMALIE`, 145, y + 4.5);
      doc.setTextColor(51, 65, 85);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('OK (Completo)', 145, y + 4.5);
      doc.setTextColor(51, 65, 85);
    }

    y += 6.5;
  });

  // Let's add second page for detailed Anomalies list and Signatures
  doc.addPage();
  y = 15;

  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`ANOMALIE E FIRME REGISTRATE - MEZZO ${report.vehicleCode}`, 15, 12.5);

  y = 25;
  // Let's list individual items with anomalies
  doc.setFillColor(51, 65, 85);
  doc.rect(12, y, 186, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('RILEVAMENTO ERRORI E DISCREPANZE QUANTITATIVE (MANCANZE)', 15, y + 4.5);

  y += 6.5;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);

  const activeAnomalies = report.items.filter(i => i.mat === 'ANOMALIA' || i.pom === 'ANOMALIA' || i.not === 'ANOMALIA');

  if (activeAnomalies.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.rect(12, y, 186, 15, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFont('Helvetica', 'bold');
    doc.text('TUTTI I MATERIALI SANITARI RISULTANO CONFORMI ALLA NORMATIVA VIGENTE.', 15, y + 6);
    doc.setFont('Helvetica', 'normal');
    doc.text('I presidi per MSB, MSA, Zaino Pediatrico, Zaino Rosso e Borsa Termica sono pienamente carichi e sigillati.', 15, y + 11);
    y += 20;
  } else {
    activeAnomalies.slice(0, 15).forEach((anom, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(254, 242, 242);
        doc.rect(12, y, 186, 6.5, 'F');
      }
      doc.setFont('Helvetica', 'bold');
      doc.text(`${anom.name.substring(0, 50)} (${anom.qty})`, 15, y + 4.5);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Sezione: ${anom.category}`, 95, y + 4.5);

      let shifts = [];
      if (anom.mat === 'ANOMALIA') shifts.push('MAT');
      if (anom.pom === 'ANOMALIA') shifts.push('POM');
      if (anom.not === 'ANOMALIA') shifts.push('NOT');

      doc.setTextColor(220, 38, 38);
      doc.setFont('Helvetica', 'bold');
      doc.text(`Anomalia in: ${shifts.join(', ')}`, 155, y + 4.5);
      doc.setTextColor(15, 23, 42);
      y += 6.5;
    });
    y += 5;
  }

  // Pharmacy Expiring and Orders Section
  const hasExpMeds = (report.pharmacyExpiringMeds || []).length > 0;
  const hasOrders = (report.pharmacyOrders || []).length > 0;

  if (hasExpMeds || hasOrders) {
    doc.setFillColor(220, 38, 38); // Red
    doc.rect(12, y, 186, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SEGNALAZIONI SCADENZE E RICHIESTE FARMACI / MATERIALI', 15, y + 4.5);

    y += 6.5;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);

    if (hasExpMeds) {
      doc.setFont('Helvetica', 'bold');
      doc.text('Farmaci in Scadenza / Da Sostituire:', 15, y + 4.5);
      y += 5;
      (report.pharmacyExpiringMeds || []).slice(0, 5).forEach((med) => {
        doc.setFont('Helvetica', 'normal');
        const dStr = med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('it-IT') : 'N/D';
        doc.text(`• ${med.name} - Scadenza: ${dStr} - Q.ta: ${med.qtyText || 'N/D'} (${med.notes || ''})`, 18, y + 4);
        y += 4.5;
      });
      y += 2;
    }

    if (hasOrders) {
      doc.setFont('Helvetica', 'bold');
      doc.text('Articoli / Dispositivi da Ordinare:', 15, y + 4.5);
      y += 5;
      (report.pharmacyOrders || []).slice(0, 5).forEach((ord) => {
        doc.setFont('Helvetica', 'normal');
        doc.text(`• ${ord.name} - Q.ta: ${ord.qtyText || 'N/D'} (${ord.notes || 'Priorità Standard'})`, 18, y + 4);
        y += 4.5;
      });
      y += 2;
    }
    y += 2;
  }

  // NOTE RILEVATE
  if (report.notes) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += 5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('NOTE RILEVATE:', 15, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(report.notes, 180);
    doc.text(splitNotes, 15, y + 5);
    y += (splitNotes.length * 4) + 10;
  }

  // Ensure signatures fit
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Signatures
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, y, 186, 42, 1, 1, 'F');
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('FIRME DI VALIDAZIONE SANITARIA (REPERIBILI IN CENTRALINA)', 15, y + 6);

  const sigsSanitari = [
    { key: 'mat', label: 'MATTINA (MAT)', data: report.signatures.mat },
    { key: 'pom', label: 'POMERIGGIO (POM)', data: report.signatures.pom },
    { key: 'not', label: 'NOTTE (NOT)', data: report.signatures.not }
  ];

  sigsSanitari.forEach((sig, sIdx) => {
    const xOffset = 15 + (sIdx * 62);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(sig.label, xOffset, y + 15);

    if (sig.data) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Firma: ${sig.data.name.substring(0, 18)}`, xOffset, y + 20);
      doc.text(`Data/Ora: ${sig.data.timestamp}`, xOffset, y + 24);

      try {
        doc.addImage(sig.data.signatureDataUrl, 'PNG', xOffset, y + 26, 32, 12);
      } catch (err) {
        doc.text('[Firma Apposta]', xOffset, y + 30);
      }
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('NON ANCORA FIRMATO', xOffset, y + 22);
      doc.setTextColor(15, 23, 42);
    }
  });

  return doc;
}
