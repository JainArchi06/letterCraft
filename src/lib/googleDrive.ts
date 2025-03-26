import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface SaveToDriveOptions {
  title: string;
  content: string;
}

const LETTERS_FOLDER_KEY = 'lettersFolderId';

async function getOrCreateLettersFolder(token: string): Promise<string> {
  // First, try to get the folder ID from localStorage
  let folderId = localStorage.getItem(LETTERS_FOLDER_KEY);

  if (folderId) {
    // Verify the folder still exists
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return folderId;
      }
    } catch (error) {
      console.error('Error verifying Letters folder:', error);
    }
  }

  // If we don't have a folder ID or it's invalid, search for an existing "Letters" folder
  const searchResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=name%3D%27Letters%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27%20and%20trashed%3Dfalse',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (searchResponse.ok) {
    const { files } = await searchResponse.json();
    if (files && files.length > 0) {
      localStorage.setItem(LETTERS_FOLDER_KEY, files[0].id);
      return files[0].id;
    }
  }

  // If no folder exists, create a new one
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Letters',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    throw new Error('Failed to create Letters folder');
  }

  const folder = await createResponse.json();
  localStorage.setItem(LETTERS_FOLDER_KEY, folder.id);
  return folder.id;
}

export async function saveToDrive({ title, content }: SaveToDriveOptions): Promise<string> {
  try {
    let token = localStorage.getItem('googleAccessToken');

    // If no token exists or token is expired, request a new one
    if (!token) {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to get Google access token');
      }

      localStorage.setItem('googleAccessToken', token);
    }

    // Get or create the Letters folder
    const folderId = await getOrCreateLettersFolder(token);

    // Create a new Google Doc in the Letters folder
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        mimeType: 'application/vnd.google-apps.document',
        parents: [folderId],
      }),
    });

    if (!createResponse.ok) {
      // If token is expired, try to get a new one
      if (createResponse.status === 401) {
        localStorage.removeItem('googleAccessToken');
        return saveToDrive({ title, content }); // Retry with new token
      }
      throw new Error(`Failed to create Google Doc: ${createResponse.statusText}`);
    }

    const data = await createResponse.json();
    
    // Upload the content
    const updateResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${data.id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/html',
      },
      body: content,
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update Google Doc content: ${updateResponse.statusText}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error saving to Google Drive:', error);
    throw error;
  }
}

export async function getDocFromDrive(fileId: string) {
  try {
    let token = localStorage.getItem('googleAccessToken');

    // If no token exists or token is expired, request a new one
    if (!token) {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to get Google access token');
      }

      localStorage.setItem('googleAccessToken', token);
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If token is expired, try to get a new one
      if (response.status === 401) {
        localStorage.removeItem('googleAccessToken');
        return getDocFromDrive(fileId); // Retry with new token
      }
      throw new Error(`Failed to fetch Google Doc: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error getting document from Google Drive:', error);
    throw error;
  }
}