const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const regex = /signatures: \{\n    turn1\?: \{ name: string; signatureDataUrl: string; timestamp: string \};\n    turn2\?: \{ name: string; signatureDataUrl: string; timestamp: string \};\n    turn3\?: \{ name: string; signatureDataUrl: string; timestamp: string \};\n  \};/m;

const replacement = `signatures: {
    turn1?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
    turn2?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
    turn3?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
  };`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/types.ts', content);
  console.log('Types updated.');
} else {
  console.log('Types regex not matched.');
}
