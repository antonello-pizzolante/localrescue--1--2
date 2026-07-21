const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const startStr = "  const handleSeedMockData = () => {";
const endStr = "  const deleteReport = (id: string, type: 'autisti' | 'sanitari') => {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
}
