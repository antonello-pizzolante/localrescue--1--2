const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

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
  "  useEffect(() => {\n    const handleOnline",
  saveSessionEffect + "\n  useEffect(() => {\n    const handleOnline"
);

fs.writeFileSync('src/App.tsx', content);
