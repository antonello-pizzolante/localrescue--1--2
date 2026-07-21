const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const closingHtml = `
        </>
      ) : (
        <ScadenzeMezzi />
      )}

      {/* DETAILED CONSULTATION MODAL */}
`;

content = content.replace(
  "      {/* DETAILED CONSULTATION MODAL */}",
  closingHtml
);

fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
