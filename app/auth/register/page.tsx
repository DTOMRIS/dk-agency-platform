// app/auth/register/page.tsx
// DK Agency - Pulsuz Üzvlük Qeydiyyatı

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, User, Building2, Phone, ArrowLeft, Check, Star } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend entegrasyonu
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Təbriklər! 🎉</h1>
          <p className="text-slate-600 mb-6">
            Qeydiyyatınız uğurla tamamlandı. Artıq bütün məqalələri tam oxuya bilərsiniz.
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
          {/* Sol - Form */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Pulsuz Üzv Ol</h1>
                <p className="text-sm text-slate-500">30 saniyədə qeydiyyatdan keç</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-medium text-slate-700 mb-1">Şirkət (ixtiyari)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Şirkət adı"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon (ixtiyari)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+994 XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Pulsuz Qeydiyyat
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-4">
              Artıq üzvsünüz?{' '}
              <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
                Daxil olun
              </Link>
            </p>
          </div>

          {/* Sağ - Benefits */}
          <div className="bg-slate-900 p-8 text-white hidden md:block">
            <h2 className="text-xl font-bold mb-6">Üzvlük üstünlükləri</h2>
            
            <div className="space-y-4">
              {[
                { title: 'Tam Məqalə Oxusu', desc: 'Bütün ekspert yazılarını sonuna qədər oxuyun' },
                { title: 'Həftəlik Newsletter', desc: 'Sektor trendləri hər həftə email-inizə' },
                { title: 'Pulsuz Toolkit', desc: 'P&L, Food Cost və digər kalkulyatorlar' },
                { title: 'Ekspert Webinarları', desc: 'Canlı təlim və sual-cavab sessiyaları' },
                { title: 'PDF Bələdçilər', desc: 'Endirilə bilən resurs və şablonlar' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic">
                {"\u201C"}Sektör NABZI sayəsində food cost-umuzu 8% azaltdıq. Hər həftə newsletter-i gözləyirəm.{"\u201D"}
              </p>
              <p className="text-xs text-slate-500 mt-2">— Elvin M., Restoran Sahibi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
