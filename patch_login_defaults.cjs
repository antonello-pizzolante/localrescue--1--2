const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

content = content.replace(
  "const [stationName, setStationName] = useState('Taranto Centro');",
  "const [stationName, setStationName] = useState('INDIA CENTRO');"
);

content = content.replace(
  "const [assignedServiceStation, setAssignedServiceStation] = useState('Ospedale SS. Annunziata');",
  "const [assignedServiceStation, setAssignedServiceStation] = useState('TARANTO CENTRO');"
);

fs.writeFileSync('src/components/Login.tsx', content);
