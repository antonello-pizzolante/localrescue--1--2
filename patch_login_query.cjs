const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const regex = /  const stationPresets = STATION_PRESETS;/;
const replacement = `  const stationPresets = STATION_PRESETS;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stationParam = urlParams.get('station');
    if (stationParam) {
      const preset = stationPresets.find(p => p.name === stationParam);
      if (preset) {
        setStationName(preset.name);
        setAssignedServiceStation(preset.service);
      }
    }
  }, []);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Login.tsx', content);
