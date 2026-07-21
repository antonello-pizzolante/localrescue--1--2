const fs = require('fs');
let code = fs.readFileSync('src/components/CarrozzeriaSelector.tsx', 'utf8');

const resizeFn = `
const resizeImage = (dataUrl: string, maxDim: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = (h / w) * maxDim;
          w = maxDim;
        } else {
          w = (w / h) * maxDim;
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};
`;

code = code.replace("const handleMainBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {", resizeFn + "\n  const handleMainBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {");

code = code.replace(
  /const result = ev\.target\?\.result as string;\s*try \{/g,
  `const rawResult = ev.target?.result as string;
        const result = await resizeImage(rawResult);
        try {`
);

fs.writeFileSync('src/components/CarrozzeriaSelector.tsx', code);
