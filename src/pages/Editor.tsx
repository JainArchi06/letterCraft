import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { saveToDrive } from '../lib/googleDrive';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, ArrowLeft, Check, Cloud } from 'lucide-react';
import type { Letter } from '../lib/types';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [letter, setLetter] = useState<Partial<Letter>>({
    title: '',
    content: '',
    status: 'draft'
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    async function fetchLetter() {
      if (id && currentUser) {
        const letterRef = doc(db, 'letters', id);
        const letterSnap = await getDoc(letterRef);
        
        if (letterSnap.exists()) {
          setLetter({ id, ...letterSnap.data() as Letter });
        }
      }
    }

    fetchLetter();
  }, [id, currentUser]);

  async function saveLetter(saveType: 'draft' | 'drive') {
    if (!currentUser) return;

    setSaving(true);
    try {
      const letterId = id || doc(collection(db, 'letters')).id;
      let googleDriveId = letter.googleDriveId;

      if (saveType === 'drive') {
        try {
          googleDriveId = await saveToDrive({
            title: letter.title || 'Untitled Letter',
            content: letter.content || ''
          });
          showSnackbar('Successfully saved to Google Drive!', 'success');
        } catch (error) {
          console.error('Error saving to Google Drive:', error);
          showSnackbar('Failed to save to Google Drive', 'error');
          return;
        }
      }

      const updatedLetter = {
        ...letter,
        title: letter.title || 'Untitled Letter',
        content: letter.content || '',
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
        status: saveType,
        ...(googleDriveId && { googleDriveId })
      };

      await setDoc(doc(db, 'letters', letterId), updatedLetter, { merge: true });

      setSaveStatus('saved');
      showSnackbar(
        saveType === 'drive' 
          ? 'Letter saved to Google Drive' 
          : 'Draft saved successfully',
        'success'
      );
      
      setTimeout(() => setSaveStatus(''), 2000);

      if (!id) {
        navigate(`/editor/${letterId}`);
      }
    } catch (error) {
      console.error('Error saving letter:', error);
      setSaveStatus('error');
      showSnackbar('Failed to save letter', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-3">
            {saveStatus === 'saved' && (
              <span className="flex items-center text-green-600">
                <Check className="h-4 w-4 mr-1" />
                Saved
              </span>
            )}
            <button
              onClick={() => saveLetter('draft')}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 rounded-full text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => saveLetter('drive')}
              disabled={saving}
              style={{background: 'rgb(51 85 240 / 70%)'}}
              className="inline-flex items-center px-6 py-2 rounded-full text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Cloud className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save to Drive'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <input
              type="text"
              value={letter.title}
              onChange={(e) => setLetter({ ...letter, title: e.target.value })}
              placeholder="Enter letter title..."
              className="w-full text-3xl font-bold border-0 focus:ring-0 focus:outline-none mb-6 placeholder-gray-300"
            />
            <div className="h-[calc(100vh-300px)]">
              <ReactQuill
                theme="snow"
                value={letter.content}
                onChange={(content) => setLetter({ ...letter, content })}
                className="h-full"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}