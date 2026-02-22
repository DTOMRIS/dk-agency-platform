// app/auth/login/page.tsx
// DK Agency - Üzv Girişi

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react';

// Test kullanıcısı - Production'da database'den gelecek
const TEST_USERS = [
  { email: 'dotomris@gmail.com', password: '123456', name: 'Doğan Tomris' },
  { email: 'admin@dkagency.az', password: 'admin123', name: 'Admin' },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Test kullanıcısı kontrolü
    const user = TEST_USERS.find(
      u => u.email === formData.email && u.password === formData.password
    );
    
    if (user) {
      // localStorage'a kaydet (paywall için)
      localStorage.setItem('dk_user', JSON.stringify({ email: user.email, name: user.name, loggedIn: true }));
      setSubmitted(true);
    } else {
      setError('E-mail və ya şifrə yanlışdır');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Xoş gəldiniz! 👋</h1>
          <p className="text-slate-600 mb-6">
            Uğurla daxil oldunuz. Artıq bütün məzmuna tam giriş əldə etdiniz.
          </p>
          <Link 
            href="/haberler"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Sektör NABZI-ya keç
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Back Button */}
      <div className="p-4">
        <Link 
          href="/haberler"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sektör NABZI</span>
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Daxil Ol</h1>
              <p className="text-sm text-slate-500">Hesabınıza giriş edin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şifrə</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-slate-600">Məni xatırla</span>
              </label>
              <Link href="/auth/forgot-password" className="text-amber-600 hover:text-amber-700 font-medium">
                Şifrəni unutdum
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              Daxil Ol
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Hələ üzv deyilsiniz?{' '}
              <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-medium">
                Pulsuz qeydiyyat
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

