const fs = require('fs');
let content = fs.readFileSync('src/components/CloudArchiveConsole.tsx', 'utf8');

const regex = /  const deleteReport = \(id: string, type: 'autisti' \| 'sanitari'\) => \{/;
const replacement = `  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    
    // Hardcoded old check for demo
    if (oldPassword !== 'localrescue') {
      setPassError('La password attuale non è corretta.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPassError('La nuova password non coincide con la conferma.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPassError('La nuova password deve essere lunga almeno 6 caratteri.');
      return;
    }
    
    setPassSuccess('Password modificata con successo!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setIsChangingPass(false);
      setPassSuccess('');
    }, 2000);
  };

  const deleteReport = (id: string, type: 'autisti' | 'sanitari') => {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/CloudArchiveConsole.tsx', content);
