const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const match = `    try {
      setIsSendingEmail(true);`;
      
const replace = `    const confirmed = window.confirm('Sei sicuro di voler inviare questo referto via email tramite il tuo account Gmail?');
    if (!confirmed) return;

    try {
      setIsSendingEmail(true);`;

if (content.includes(match) && !content.includes('Sei sicuro di voler inviare')) {
  content = content.replace(match, replace);
  fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
}
