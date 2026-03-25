'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Star, Sparkles } from 'lucide-react';

export default function B2BDashboardMock() {
  return (
    <div className="relative p-2 bg-white rounded-[32px] border border-[#E5E7EB] shadow-[0_40px_80px_-15px_rgba(26,26,46,0.12)]">
      <div className="relative bg-[#FAFAF8] rounded-[24px] border border-[#EDEDE9] overflow-hidden aspect-[4/3] flex">
        
        {/* 1. Sidebar (Dark) */}
        <div className="w-[180px] bg-[#1A1A2E] flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E94560] rounded-lg flex items-center justify-center text-white font-bold text-xs">DK</div>
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">Agency</span>
          </div>
          
          {/* User Profile in Sidebar */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E94560] to-[#C5A022] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">IH</div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-white font-bold truncate">İstanbul HORECA</div>
                <div className="text-[8px] text-[#C5A022] font-bold">★ PREMIUM</div>
              </div>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-[#E94560]" />
            </div>
          </div>

          <div className="p-4 space-y-6 flex-1">
            {/* Menu Group 1 */}
            <div className="space-y-1.5">
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-2">GENEL</div>
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#E94560] rounded-lg text-white">
                <Star size={12} fill="currentColor" />
                <span className="text-[9px] font-bold">Dashboard</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 text-white/40 hover:text-white transition-colors">
                <ArrowRight size={12} />
                <span className="text-[9px] font-bold">İlanlarım</span>
              </div>
            </div>
            
            {/* Menu Group 2 */}
            <div className="space-y-1.5">
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-2">İLETİŞİM</div>
              <div className="flex items-center justify-between px-3 py-2 text-white/40">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={12} />
                  <span className="text-[9px] font-bold">Təkliflər</span>
                </div>
                <span className="bg-[#C5A022] text-[#1A1A2E] text-[8px] px-1.5 rounded-full font-bold">+3</span>
              </div>
            </div>
          </div>

          {/* AI Assistant Card in Sidebar */}
          <div className="p-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="w-6 h-6 bg-[#C5A022] rounded-lg flex items-center justify-center text-[#1A1A2E] mb-2">
                <Sparkles size={12} fill="currentColor" />
              </div>
              <div className="text-[8px] text-white font-bold mb-1 uppercase tracking-wider">AI ASİSTAN</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[100%] bg-gradient-to-r from-[#E94560] to-[#C5A022]" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Internal Header */}
          <div className="h-14 bg-white border-b border-[#EDEDE9] flex items-center justify-between px-6">
            <div>
              <h4 className="text-xs font-serif font-bold text-[#1A1A2E] mb-0.5">B2B Panel</h4>
              <div className="text-[8px] text-[#888] font-semibold">Biznesinizi buradan idarə edin</div>
            </div>
            <button className="bg-[#E94560] text-white text-[9px] font-bold px-4 py-2 rounded-lg shadow-lg shadow-[#E94560]/20">+ Yeni elan</button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { l: 'Aktiv elan', v: '4', g: '+1', i: <Star size={10} />, cl: 'text-blue-500' },
                { l: 'Baxış', v: '2.8k', g: '+12%', i: <Play size={10} />, cl: 'text-green-500' },
                { l: 'Təkliflər', v: '8', g: '+3', i: <CheckCircle2 size={10} />, cl: 'text-orange-500' },
                { l: 'Mesajlar', v: '15', g: '+5', i: <ArrowRight size={10} />, cl: 'text-[#E94560]' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-[#EDEDE9] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-5 h-5 rounded-md bg-[#FAFAF8] flex items-center justify-center ${item.cl}`}>{item.i}</div>
                    <span className="text-[8px] font-bold text-green-500">{item.g}</span>
                  </div>
                  <div className="text-[12px] font-bold text-[#1A1A2E]">{item.v}</div>
                  <div className="text-[8px] text-[#888] font-bold uppercase tracking-wider">{item.l}</div>
                </div>
              ))}
            </div>

            {/* Data List + Activity Sidebar Grid */}
            <div className="grid grid-cols-[1fr_120px] gap-4">
              {/* Left: Ads List */}
              <div className="bg-white rounded-xl border border-[#EDEDE9] overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-[#EDEDE9] flex justify-between items-center bg-[#FAFAF8]/50">
                  <span className="text-[9px] font-bold text-[#1A1A2E] uppercase">Elanlarım</span>
                  <span className="text-[8px] text-[#E94560] font-bold">Hamısına bax</span>
                </div>
                <div className="divide-y divide-[#EDEDE9]">
                  {[
                    { t: 'Mərkəzi kafelərin devri', s: 'Aktiv', cl: 'text-green-500 bg-green-50' },
                    { t: 'Franchise ortağı axtarılır', s: 'Yoxlamada', cl: 'text-[#C5A022] bg-[#C5A022]/10' },
                    { t: '500k AZN Yatırım təklifi', s: 'Aktiv', cl: 'text-green-500 bg-green-50' },
                  ].map((item, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between group hover:bg-[#FAFAF8] transition-colors">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[9px] font-bold text-[#1A1A2E] truncate">{item.t}</span>
                        <span className="text-[7px] text-[#AAA] font-bold uppercase tracking-widest">İşlətmə devri</span>
                      </div>
                      <span className={`text-[7px] font-bold px-2 py-0.5 rounded-full ${item.cl}`}>{item.s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Activity Feed */}
              <div className="space-y-4">
                <div className="text-[9px] font-bold text-[#1A1A2E] uppercase tracking-widest px-1">Son Aktivlik</div>
                <div className="space-y-3">
                  {[
                    { i: <Star size={10} />, t: '2s əvvəl', c: 'bg-blue-100 text-blue-500' },
                    { i: <ArrowRight size={10} />, t: '5s əvvəl', c: 'bg-[#C5A022]/10 text-[#C5A022]' },
                    { i: <CheckCircle2 size={10} />, t: 'Dünən', c: 'bg-green-100 text-green-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-lg ${item.c} flex items-center justify-center shadow-sm`}>{item.i}</div>
                      <span className="text-[7px] font-bold text-[#AAA]">{item.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Float Badge/Annotation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl border border-[#EDEDE9] z-20"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#C5A022] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#C5A022]/20">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[10px] text-[#888] font-bold uppercase tracking-wider">Sistem Vəziyyəti</div>
            <div className="text-sm font-semibold text-[#1A1A2E]">Aktiv İdarəetmə</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
