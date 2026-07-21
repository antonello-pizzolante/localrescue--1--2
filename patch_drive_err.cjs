const fs = require('fs');
const file = 'src/lib/drive.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("if (!searchRes.ok) throw new Error('Errore ricerca cartella');", `if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('Drive search error:', errText);
    throw new Error('Errore ricerca cartella: ' + errText);
  }`);

content = content.replace("if (!createRes.ok) throw new Error('Errore creazione cartella');", `if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Drive create error:', errText);
    throw new Error('Errore creazione cartella: ' + errText);
  }`);

fs.writeFileSync(file, content);
console.log('Done');
