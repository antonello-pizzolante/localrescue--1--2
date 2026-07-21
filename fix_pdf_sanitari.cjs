const fs = require('fs');
const file = 'src/utils/exports.ts';
let content = fs.readFileSync(file, 'utf8');

// The carrozzeria code wasn't injected into sanitariPDF, just autistiPDF. 
// The user asked about the autisti pdf "nel pdf della ceck degli autisti soccorritori", so this is already completely correct!
