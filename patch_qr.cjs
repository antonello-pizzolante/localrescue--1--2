const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const regex = /\{STATION_PRESETS\.map\(\(preset\) => \{([^]*?)\}\)\}/;
const replacement = `{STATION_PRESETS.map((preset) => {
              const url = \`\${window.location.origin}?station=\${encodeURIComponent(preset.name)}\`;
              const qrId = \`qr-\${preset.name.replace(/\\s+/g, '-')}\`;
              return (
                <div key={preset.name} className="flex flex-col items-center p-4 bg-black/40 rounded-xl border border-white/10">
                  <div id={qrId} className="bg-white p-2 rounded-lg mb-3">
                    <QRCodeSVG value={url} size={120} />
                  </div>
                  <h4 className="text-xs font-bold text-white text-center mb-1">{preset.name}</h4>
                  <p className="text-[10px] text-slate-400 text-center line-clamp-2">{preset.service}</p>
                  
                  <div className="flex gap-2 mt-3 w-full">
                    <button 
                      onClick={() => {
                        const svg = document.getElementById(qrId)?.querySelector('svg');
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width + 40;
                          canvas.height = img.height + 40;
                          if(ctx) {
                            ctx.fillStyle = "white";
                            ctx.fillRect(0,0, canvas.width, canvas.height);
                            ctx.drawImage(img, 20, 20);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = \`QRCode-\${preset.name}.png\`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                          }
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                      }}
                      className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 py-1.5 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 mr-1" /> Salva
                    </button>
                    
                    <button 
                      onClick={() => {
                        const svg = document.getElementById(qrId)?.querySelector('svg');
                        if (!svg) return;
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const printWindow = window.open('', '', 'width=600,height=600');
                        if (printWindow) {
                          printWindow.document.write(\`
                            <html>
                              <head>
                                <title>Stampa QR Code - \${preset.name}</title>
                                <style>
                                  body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                                  .qr-container { padding: 40px; border: 2px solid #000; border-radius: 12px; display: inline-block; text-align: center; }
                                  h1 { margin-top: 20px; font-size: 24px; }
                                  svg { width: 300px; height: 300px; }
                                </style>
                              </head>
                              <body>
                                <div class="qr-container">
                                  \${svgData}
                                  <h1>\${preset.name}</h1>
                                </div>
                                <script>
                                  window.onload = () => {
                                    window.print();
                                    setTimeout(() => window.close(), 500);
                                  };
                                </script>
                              </body>
                            </html>
                          \`);
                          printWindow.document.close();
                        }
                      }}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-600 border border-white/10 text-white py-1.5 rounded flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3 h-3 mr-1" /> Stampa
                    </button>
                  </div>
                </div>
              );
            }}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
