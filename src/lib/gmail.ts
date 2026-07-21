import { getAccessToken } from './auth';

export const sendEmail = async (to: string, subject: string, bodyText: string) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Access token non disponibile, esegui il login con Google.');
  }

  // Costruiamo il messaggio in formato RFC 2822
  const messageParts = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    bodyText,
  ];
  
  const message = messageParts.join('\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errData = await res.json();
    console.error('Gmail send error', errData);
    throw new Error("Errore durante l'invio dell'email tramite Gmail.");
  }
  
  return res.json();
};
