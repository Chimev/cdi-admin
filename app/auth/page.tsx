'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { getSession, signIn, useSession } from 'next-auth/react';

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const {data: session, status} = useSession()

   useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/admin');
    }
  }, [session, status, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin) {
      // REGISTRATION FLOW
      
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await res.json();
        console.log('Registration response:', data);

        if (!res.ok) {
          setError(data.message || 'Something went wrong.');
          setIsLoading(false);
          return;
        }

        alert('Account created! Please sign in.');
        setIsLogin(true);
        setPassword('');
        
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // LOGIN FLOW
      try {
        // Changed 'user-credentials' to 'credentials' to match NextAuth defaults
        const res = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (!res?.ok) {
          setError(res?.error || 'Invalid credentials. Please try again.');
          setIsLoading(false);
          return;
        }

        const session: any = await getSession();
        console.log('first', session?.user?.id);
        router.replace('/admin');
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    } // <-- Fixed: Closes the 'else' block
  }; // <-- Fixed: Closes the 'handleSubmit' function

  // Safe Toggle Handler
  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError('');
  };


  

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#3a3e98] to-[#f0303b] px-8 pt-10 pb-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black opacity-20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden border-2 border-white/20">
              <img 
                src="/logo.png" 
                alt="CDI Logo" 
                className="w-14 h-14 object-contain"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-1 tracking-wide">
              {isLogin ? 'Welcome Back' : 'Create Admin Account'}
            </h1>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-[#f0303b] text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {
              !isLogin && (
                <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" required={!isLogin}
                    placeholder="e.g. Victor"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              )
            }

            {!isLogin && (
              <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" required={!isLogin}
                  placeholder="e.g. Admin"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            )}
            

            
           

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" required 
                  placeholder="admin@cdi.org"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-semibold text-[#3a3e98] hover:text-[#2a2d75] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" required 
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#3a3e98] focus:border-[#3a3e98] text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#3a3e98] hover:bg-[#2a2d75] text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all disabled:opacity-70 mt-4 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center space-y-2">
            <span className="text-sm text-gray-600">
              {isLogin ? "Don't have an admin account?" : "Already have an account?"}
            </span>
            <button 
              type="button"
              onClick={toggleMode}
              className="text-sm font-bold text-[#f0303b] hover:text-[#c72630] transition-colors"
            >
              {isLogin ? 'Create one now' : 'Sign in instead'}
            </button>
          </div>

        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-bold tracking-widest uppercase">
        © {new Date().getFullYear()} Chapel of Divine Inspiration
      </p>

    </div>
  );
}
