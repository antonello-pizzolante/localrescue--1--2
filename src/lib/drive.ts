import { getAccessToken } from './auth';

async function createFolderIfNotExists(folderName: string, parentFolderId: string | null = null): Promise<string> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Non autenticato');

  // Search for the folder
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('Drive search error:', errText);
    throw new Error('Errore ricerca cartella: ' + errText);
  }
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Drive create error:', errText);
    throw new Error('Errore creazione cartella: ' + errText);
  }
  const createData = await createRes.json();
  return createData.id;
}

export const uploadFileToDrive = async (
  filename: string,
  contentType: string,
  blob: Blob,
  folderType: 'autisti' | 'sanitari' | 'csv' | 'root' = 'root'
): Promise<string | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Non autenticato con Google Workspace');
  }

  // Determine folder hierarchy
  let targetFolderId: string | null = null;
  
  if (folderType !== 'root') {
    const rootFolderId = await createFolderIfNotExists('LocalRescue_Archive');
    if (folderType === 'autisti') {
      targetFolderId = await createFolderIfNotExists('Referti_Autisti', rootFolderId);
    } else if (folderType === 'sanitari') {
      targetFolderId = await createFolderIfNotExists('Referti_Sanitari', rootFolderId);
    } else if (folderType === 'csv') {
      targetFolderId = await createFolderIfNotExists('Esportazioni_CSV', rootFolderId);
    }
  }

  // Step 1: Initiate resumable upload session
  const metadata: any = {
    name: filename,
    mimeType: contentType,
  };
  if (targetFolderId) {
    metadata.parents = [targetFolderId];
  }

  const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': contentType,
    },
    body: JSON.stringify(metadata),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    console.error('Drive upload init error:', err);
    throw new Error('Errore durante l\'inizializzazione del caricamento su Google Drive');
  }

  const locationUrl = initRes.headers.get('Location');
  if (!locationUrl) {
    throw new Error('Non è stato possibile ottenere l\'URL di caricamento.');
  }

  // Step 2: Upload the actual file
  const uploadRes = await fetch(locationUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('Drive upload error:', err);
    throw new Error('Errore nel caricamento del file su Google Drive');
  }

  const data = await uploadRes.json();
  return data.id;
};
