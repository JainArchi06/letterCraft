import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FileText, Clock, Search, Cloud, Save } from 'lucide-react';
import type { Letter } from '../lib/types';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLetters() {
      if (!currentUser) return;

      const q = query(
        collection(db, 'letters'),
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const fetchedLetters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Letter[];

      setLetters(fetchedLetters);
    }

    fetchLetters();
  }, [currentUser]);

  const filteredLetters = letters.filter(letter =>
    letter.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (letter: Letter) => {
    if (letter.googleDriveId) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Cloud className="h-4 w-4 mr-1" />
          Saved to Drive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Save className="h-4 w-4 mr-1" />
        Draft
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Letters</h1>
          <p className="text-gray-600">Create and manage your letters with ease</p>
        </div>
        <Link
          to="/editor"
          className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          style={{background: 'rgb(51 85 240 / 70%)'}}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Letter
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search letters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredLetters.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredLetters.map((letter) => (
              <Link
                key={letter.id}
                to={`/editor/${letter.id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 rounded-lg p-2">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {letter.title || 'Untitled Letter'}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(letter.updatedAt?.toDate()).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-3">
                      {getStatusBadge(letter)}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        View Letter
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No letters found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Create your first letter by clicking the "New Letter" button above'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}