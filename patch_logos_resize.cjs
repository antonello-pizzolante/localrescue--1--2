const fs = require('fs');
let code = fs.readFileSync('src/components/Logos.tsx', 'utf8');

const resizeFn = `
// Helper to resize image to a max dimension to avoid Firestore 1MB limit
const resizeImage = (dataUrl: string, maxDim: number = 400): Promise<string> => {
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
        resolve(canvas.toDataURL('image/png', 0.8));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
};
`;

code = code.replace("import { db } from '../lib/firebase';", "import { db } from '../lib/firebase';\n" + resizeFn);

// For Sanitaservice
code = code.replace(
  /reader\.onload = async \(e\) => \{\s*const result = e\.target\?\.result as string;\s*setImageSrc\(result\);\s*localStorage\.setItem\('sanitaservice_logo_custom', result\);\s*try \{\s*await setDoc\(doc\(db, 'settings', 'sanitaservice_logo'\), \{ imageSrc: result \}, \{ merge: true \}\);\s*\} catch \(err\) \{\s*console\.error\("Error saving logo to cloud:", err\);\s*\}\s*\};/g,
  `reader.onload = async (e) => {
        const rawResult = e.target?.result as string;
        const result = await resizeImage(rawResult);
        setImageSrc(result);
        localStorage.setItem('sanitaservice_logo_custom', result);
        try {
          await setDoc(doc(db, 'settings', 'sanitaservice_logo'), { imageSrc: result }, { merge: true });
        } catch (err) {
          console.error("Error saving logo to cloud:", err);
          alert("Errore salvataggio in cloud. L'immagine potrebbe essere troppo grande.");
        }
      };`
);

// For Taranto Soccorso
code = code.replace(
  /reader\.onload = async \(e\) => \{\s*const result = e\.target\?\.result as string;\s*setImageSrc\(result\);\s*localStorage\.setItem\('taranto_soccorso_logo_custom', result\);\s*try \{\s*await setDoc\(doc\(db, 'settings', 'taranto_soccorso_logo'\), \{ imageSrc: result \}, \{ merge: true \}\);\s*\} catch \(err\) \{\s*console\.error\("Error saving logo to cloud:", err\);\s*\}\s*\};/g,
  `reader.onload = async (e) => {
        const rawResult = e.target?.result as string;
        const result = await resizeImage(rawResult);
        setImageSrc(result);
        localStorage.setItem('taranto_soccorso_logo_custom', result);
        try {
          await setDoc(doc(db, 'settings', 'taranto_soccorso_logo'), { imageSrc: result }, { merge: true });
        } catch (err) {
          console.error("Error saving logo to cloud:", err);
          alert("Errore salvataggio in cloud. L'immagine potrebbe essere troppo grande.");
        }
      };`
);

// Remove the `!imageSrc ? 'cursor-pointer hover:bg-slate-50' : ''` check, so we can ALWAYS click it to replace it if we want?
// Wait, the user wants "FAMMI CARICARE LE IMMAGINI MANUALMENTE SOLO UNA VOLTA".
// If they want to upload it ONLY once, they don't want to replace it.
// If `!imageSrc` they can click. If they want to change it later? Let's allow them to double click? No, they said "SOLO UNA VOLTA".
// So the current logic where they can't click once `imageSrc` is set is actually perfectly fine.

fs.writeFileSync('src/components/Logos.tsx', code);
