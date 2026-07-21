const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

// Add Bell and X icons
content = content.replace(
  "import {   Cloud, Database, Search, Calendar,",
  "import {   Cloud, Database, Search, Calendar, Bell, X,"
);

// Add state for notifications
content = content.replace(
  "  const [activeView, setActiveView] = useState<'archivio' | 'scadenze'>('archivio');",
  "  const [activeView, setActiveView] = useState<'archivio' | 'scadenze'>('archivio');\n  const [expiringAlerts, setExpiringAlerts] = useState<any[]>([]);\n  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);"
);

// Add useEffect to fetch REVISIONE_MEZZI and check deadlines
const useEffectHtml = `
  useEffect(() => {
    if (!db) return;
    import('firebase/firestore').then(({ collection, onSnapshot, query, where }) => {
      const q = query(collection(db, 'REVISIONE_MEZZI'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const alerts: any[] = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.expiryDate) {
            const expiry = new Date(data.expiryDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 30) {
              alerts.push({
                id: doc.id,
                vehicleCode: data.vehicleCode,
                type: data.type,
                expiryDate: data.expiryDate,
                daysLeft: diffDays
              });
            }
          }
        });
        
        // Sort by most urgent
        alerts.sort((a, b) => a.daysLeft - b.daysLeft);
        setExpiringAlerts(alerts);
      });
      
      return () => unsubscribe();
    });
  }, []);
`;

content = content.replace(
  "  // -------------------------",
  useEffectHtml + "\n  // -------------------------"
);

// Add Alert UI in render
const alertUiHtml = `
      {/* EXPIRING ALERTS */}
      {expiringAlerts.filter(a => !dismissedAlerts.includes(a.id)).length > 0 && (
        <div className="mb-6 space-y-2">
          {expiringAlerts.filter(a => !dismissedAlerts.includes(a.id)).map(alert => (
            <div key={alert.id} className={\`flex items-start justify-between p-4 rounded-xl border shadow-lg \${alert.daysLeft < 0 ? 'bg-red-900/50 border-red-500/50 shadow-red-500/10' : 'bg-amber-900/50 border-amber-500/50 shadow-amber-500/10'}\`}>
              <div className="flex items-start gap-3">
                <div className={\`p-2 rounded-lg \${alert.daysLeft < 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}\`}>
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className={\`font-bold text-sm \${alert.daysLeft < 0 ? 'text-red-300' : 'text-amber-300'}\`}>
                    Attenzione: Scadenza {alert.type} Mezzo {alert.vehicleCode}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {alert.daysLeft < 0 
                      ? \`La scadenza è superata da \${Math.abs(alert.daysLeft)} giorni (Data: \${new Date(alert.expiryDate).toLocaleDateString('it-IT')})\`
                      : \`Scade tra \${alert.daysLeft} giorni (Data: \${new Date(alert.expiryDate).toLocaleDateString('it-IT')})\`
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
`;

content = content.replace(
  "      {/* HEADER SECTION */}",
  alertUiHtml + "\n      {/* HEADER SECTION */}"
);


fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
