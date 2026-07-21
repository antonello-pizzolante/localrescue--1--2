const fs = require('fs');
const file = 'src/lib/auth.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("login_hint: 'localrescue099@gmail.com',", "login_hint: 'lello199830@gmail.com',");

content = content.replace("const allowedEmails = ['localrescue099@gmail.com', 'lello199830@gmail.com'];", "const allowedEmails = ['lello199830@gmail.com'];");
content = content.replace("throw new Error('Accesso negato: devi usare l\\'account principale (localrescue099@gmail.com) per il salvataggio cloud.');", "throw new Error('Accesso negato: devi usare l\\'account principale (lello199830@gmail.com) per il salvataggio cloud.');");

fs.writeFileSync(file, content);
console.log('Done auth');
