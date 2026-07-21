const fs = require('fs');
const file = 'src/lib/auth.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const result = await signInWithPopup(auth, provider);`;
const replacementStr = `const result = await signInWithPopup(auth, provider);

    if (result.user.email !== 'localrescue099@gmail.com') {
      await signOut(auth);
      throw new Error('Accesso negato: devi usare l\\'account principale (localrescue099@gmail.com) per il salvataggio cloud.');
    }`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(file, content);
console.log('Done');
