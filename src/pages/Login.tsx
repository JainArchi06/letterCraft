import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { currentUser, signInWithGoogle, signIn } = useAuth();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = (event, type) => {
    if(type === 'email'){
      setEmail(event.target.value);
    }else{
      setPassword(event.target.value);
    }
  }
  

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="max-w-md w-full mx-4">
        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              LetterCraft
            </h2>
            <p className="text-indigo-100 text-lg mb-8">
              Craft beautiful letters with ease
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-gray-800 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <img 
                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                alt="Google" 
                className="w-6 h-6"
              />
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/60 bg-transparent">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  onChange={(e) => handleChange(e, 'email')}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="relative">
  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
  <input
    type="password"
    onChange={(e) => handleChange(e, 'pass')}
    placeholder="Password"
    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
  />
</div>

              <button
                onClick={() => signIn(Email, Password)}
                className="w-full bg-indigo-500 text-white rounded-xl py-3 font-medium hover:bg-indigo-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign in
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}