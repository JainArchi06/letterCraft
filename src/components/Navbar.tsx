import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-indigo-100 rounded-lg p-2">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                LetterCraft
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  <img
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-600"
                    src={currentUser.photoURL || ''}
                    alt={currentUser.displayName || ''}
                  />
                  <span className="text-gray-700 font-medium">{currentUser.displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  style={{background: 'rgb(51 85 240 / 70%)'}}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex flex-col items-center space-y-3 p-4">
              <img
                className="h-12 w-12 rounded-full ring-2 ring-indigo-600"
                src={currentUser.photoURL || ''}
                alt={currentUser.displayName || ''}
              />
              <span className="text-gray-700 font-medium">{currentUser.displayName}</span>
              <button
                onClick={logout}
                className="w-full inline-flex justify-center items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}