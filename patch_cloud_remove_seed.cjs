const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

// Replace seed button
content = content.replace(
  /\{\/\* Seed Demo Data Button \*\/\}(.|\n)*?<\/button>/m,
  ''
);

// Remove the notice in the empty state
content = content.replace(
  /Modifica i filtri di ricerca o clicca su "Carica Dati Esempio" per riempire il database\./m,
  'Modifica i filtri di ricerca.'
);

fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
