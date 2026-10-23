import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Maximize2, Camera, Award, Download, Archive } from 'lucide-react';

interface ActivitiesPageProps {
  onBackToHome: () => void;
  onImageClick: (src: string, caption?: string) => void;
  onNavigateApply?: () => void;
  onNavigateAdmitCard?: () => void;
  onNavigateResult?: () => void;
  onNavigateArchive?: () => void;
}

export const ACTIVITIES_IMAGES = [
  "https://i.imgur.com/80GFfoU.jpeg",
  "https://i.imgur.com/BDCKo2d.jpeg",
  "https://i.imgur.com/66UMBHx.jpeg",
  "https://i.imgur.com/dJuMXSF.jpeg",
  "https://i.imgur.com/sCNOLVM.jpeg",
  "https://i.imgur.com/HPKHV9j.jpeg",
  "https://i.imgur.com/fRHkB7i.jpeg",
  "https://i.imgur.com/mDibZkz.jpeg",
  "https://i.imgur.com/d0VA1r0.jpeg",
  "https://i.imgur.com/urAbcus.jpeg",
  "https://i.imgur.com/n9F7QOC.jpeg",
  "https://i.imgur.com/qg6kb0e.jpeg",
  "https://i.imgur.com/Lub6Wpq.jpeg",
  "https://i.imgur.com/PoVafH2.jpeg",
  "https://i.imgur.com/ALjnWo5.jpeg",
  "https://i.imgur.com/zI6dO4s.jpeg",
  "https://i.imgur.com/MxloWnQ.jpeg",
  "https://i.imgur.com/mpZv892.jpeg"
];

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
  onBackToHome,
  onImageClick,
  onNavigateApply,
  onNavigateAdmitCard,
  onNavigateResult,
  onNavigateArchive,
}) => {
  const logoUrl = 'https://i.imgur.com/PmCP59l.png';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-blue-950/90 backdrop-blur-md border-b border-yellow-400/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 group cursor-pointer text-left"
              title="হোম পেজে যান"
            >
              <img 
                src={logoUrl} 
                alt="STAR KIDS" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-white group-hover:text-yellow-400 transition-colors">
                  STAR KIDS
                </span>
                <span className="block text-[10px] sm:text-xs text-yellow-300 font-bold -mt-0.5">
                  আমাদের সকল কার্যক্রম ও ফটো গ্যালারি
                </span>
              </div>
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {onNavigateApply && (
              <button
                onClick={onNavigateApply}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <Sparkles size={14} className="text-yellow-400" />
                <span>আবেদন</span>
              </button>
            )}
            {onNavigateAdmitCard && (
              <button
                onClick={onNavigateAdmitCard}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <Download size={14} className="text-yellow-400" />
                <span>প্রবেশপত্র</span>
              </button>
            )}
            {onNavigateResult && (
              <button
                onClick={onNavigateResult}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <Award size={14} className="text-yellow-400" />
                <span>ফলাফল</span>
              </button>
            )}
            {onNavigateArchive && (
              <button
                onClick={onNavigateArchive}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                <Archive size={14} className="text-yellow-400" />
                <span>আর্কাইভ</span>
              </button>
            )}
            <button
              onClick={onBackToHome}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-yellow-400 hover:bg-yellow-300 text-blue-950 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>হোম পেজে ফিরে যান</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Hero Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs sm:text-sm font-black mb-3">
            <Camera size={16} className="text-yellow-400" />
            <span>প্রতিষ্ঠানের প্রতিদিনের আপডেট, শিক্ষা সফর ও সাংস্কৃতিক মুহূর্তসমূহ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            আমাদের সকল <span className="text-yellow-400">কার্যক্রম ও ফটো অ্যালবামের পূর্ণাঙ্গ গ্যালারি</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            স্টার কিডস্ ক্যাডেট কেয়ারের সকল একাডেমি মেধা প্রতিযোগিতা, কৃতি শিক্ষার্থী সংবর্ধনা, শিক্ষা সফর ও বিভিন্ন ইভেন্টের ছবিগুলো একসাথে বড় আকারে দেখুন।
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-12">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Camera size={20} className="text-yellow-400" />
                <span>ফটোগ্রাফি অ্যালবামের ছবি ({ACTIVITIES_IMAGES.length}টি)</span>
              </h2>
              <p className="text-xs text-yellow-300 mt-0.5">যেকোনো ছবিতে ক্লিক করে ফুল-স্কিন জুম করে বড় আকারে দেখুন</p>
            </div>
            <span className="text-xs font-bold bg-yellow-400 text-blue-950 px-3 py-1 rounded-full shadow-xs">
              গ্যালারি পেজ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {ACTIVITIES_IMAGES.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => onImageClick(src, `স্টার কিডস কার্যক্রম ছবি #${i + 1}`)}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 hover:border-yellow-400/80 transition-all cursor-pointer group bg-slate-900"
              >
                <img 
                  src={src} 
                  alt={`Activity ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                  <span className="self-end bg-yellow-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                    ছবি #{i + 1}
                  </span>
                  <div className="flex items-center gap-2 text-white text-xs font-bold">
                    <Maximize2 size={18} className="text-yellow-400 shrink-0" />
                    <span>ক্লিক করে জুম করুন</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Back to Home Action Bar */}
        <div className="text-center">
          <button
            onClick={onBackToHome}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-base px-8 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-blue-300">
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | আমাদের সকল কার্যক্রম গ্যালারি</p>
      </footer>
    </div>
  );
};
