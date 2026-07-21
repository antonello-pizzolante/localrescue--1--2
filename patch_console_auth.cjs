const fs = require('fs');
const file = 'src/components/CloudArchiveConsole.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [isGoogleLinked, setIsGoogleLinked] = useState(false);')) {
  content = content.replace('const [isUploadingDrive, setIsUploadingDrive] = useState(false);', 'const [isUploadingDrive, setIsUploadingDrive] = useState(false);\n  const [isGoogleLinked, setIsGoogleLinked] = useState(false);');
}

if (!content.includes('checkGoogleAuth();')) {
  content = content.replace(`  useEffect(() => {
    // Initial fetch
    if (isOnline) {`, `  useEffect(() => {
    const checkGoogleAuth = async () => {
      const token = await getAccessToken();
      setIsGoogleLinked(!!token);
    };
    checkGoogleAuth();
    
    // Initial fetch
    if (isOnline) {`);
}

const googleLinkBtn = `
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {!isGoogleLinked ? (
              <button
                onClick={async () => {
                  try {
                    const res = await googleSignIn();
                    if (res?.accessToken) {
                      setIsGoogleLinked(true);
                      alert('Account Google collegato con successo! I referti verranno salvati su Drive.');
                    }
                  } catch (e: any) {
                    alert('Errore di collegamento account Google: ' + e.message);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg"
              >
                <Cloud className="w-4 h-4" />
                Collega Google Drive
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                Google Drive Connesso
              </div>
            )}
          </div>
`;

if (!content.includes('Collega Google Drive')) {
  content = content.replace('<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">', googleLinkBtn);
}

fs.writeFileSync(file, content);
console.log('Done');
