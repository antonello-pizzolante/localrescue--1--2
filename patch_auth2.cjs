const fs = require('fs');
const file = 'src/lib/auth.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `if (result.user.email !== 'localrescue099@gmail.com') {`;
const replacementStr = `const allowedEmails = ['localrescue099@gmail.com', 'lello199830@gmail.com'];
    if (!result.user.email || !allowedEmails.includes(result.user.email.toLowerCase())) {`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(file, content);
console.log('Done');
