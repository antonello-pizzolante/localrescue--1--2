const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "  const [session, setSession] = useState<UserSession | null>(null);",
  `  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('118_active_session');
    return saved ? JSON.parse(saved) : null;
  });`
);

const saveSessionEffect = `
  useEffect(() => {
    if (session) {
      localStorage.setItem('118_active_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('118_active_session');
    }
  }, [session]);
`;

content = content.replace(
  "  // Online/Offline listener",
  saveSessionEffect + "\n  // Online/Offline listener"
);

fs.writeFileSync('src/App.tsx', content);
