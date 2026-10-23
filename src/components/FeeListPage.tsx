import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Sparkles, Download, Award, Archive, Phone, ShieldCheck, CreditCard } from 'lucide-react';

interface FeeListPageProps {
  onBackToHome: () => void;
  onNavigateApply?: () => void;
  onNavigateAdmitCard?: () => void;
  onNavigateResult?: () => void;
  onNavigateArchive?: () => void;
}

export const FEES_DATA = [
  { class: '১ম শ্রেণী', monthly: '১২০০৳', admission: '১৫০০৳', total: '২৭০০৳' },
  { class: '২য় শ্রেণী', monthly: '১২০০৳', admission: '১৫০০৳', total: '২৭০০৳' },
  { class: '৩য় শ্রেণী', monthly: '১৪০০৳', admission: '২০০০৳', total: '৩৪০০৳' },
  { class: '৪র্থ শ্রেণী', monthly: '১৪০০৳', admission: '২০০০৳', total: '৩৪০০৳' },
  { class: '৫ম শ্রেণী', monthly: '১৫০০৳', admission: '২৫০০৳', total: '৪০০০৳' },
  { class: '৬ষ্ঠ শ্রেণী', monthly: '১৫০০৳', admission: '২২০০৳', total: '৩৭০০৳' },
  { class: 'ক্যাডেট শ্রেণি', monthly: '৩৫০০৳', admission: '৩৫০০৳', total: '৭০০০৳' },
  { class: '৭ম শ্রেণী', monthly: '১৫০০৳', admission: '২২০০৳', total: '৩৭০০৳' },
  { class: '৮ম শ্রেণী', monthly: '১৫০০৳', admission: '২৩০০৳', total: '৩৮০০৳' },
  { class: '৯ম শ্রেণী', monthly: '১৬০০৳', admission: '২৩০০৳', total: '৩৯০০৳' },
  { class: '১০ম শ্রেণী', monthly: '১৬০০৳', admission: '২৩০০৳', total: '৩৯০০৳' },
];

export const FeeListPage: React.FC<FeeListPageProps> = ({
  onBackToHome,
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
                  সকল শ্রেণীর বেতন ও ভর্তি/নোট ফি তালিকা
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Hero Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs sm:text-sm font-black mb-3">
            <CreditCard size={16} className="text-yellow-400" />
            <span>স্বচ্ছ ও সুনির্দিষ্ট কোর্স ও টিউশন ফি কাঠামো</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            সকল শ্রেণীর <span className="text-yellow-400">মাসিক বেতন ও ভর্তি/নোট ফি তালিকা</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            ১ম শ্রেণি হতে ১০ম শ্রেণি ও ক্যাডেট স্পেশাল ব্যাচের নির্দিষ্ট মাসিক টিউশন ফি, ভর্তি ও নোট ফি হিসাব নিচে বিস্তারিত দেওয়া হলো।
          </p>
        </div>

        {/* Fees Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {FEES_DATA.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-yellow-400/60 shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                    {item.class}
                  </h3>
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-black border border-yellow-400/30">
                    <BookOpen size={20} />
                  </div>
                </div>

                <div className="space-y-3 mb-4 text-sm font-bold">
                  <div className="flex justify-between items-center bg-blue-950/40 p-2.5 rounded-xl border border-white/5">
                    <span className="text-blue-200">প্রতি মাসের বেতন</span>
                    <span className="text-white font-black text-base">{item.monthly}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-950/40 p-2.5 rounded-xl border border-white/5">
                    <span className="text-blue-200">ভর্তি/নোট ফি</span>
                    <span className="text-white font-black text-base">{item.admission}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-yellow-400/30 flex justify-between items-center bg-yellow-400/10 p-3 rounded-2xl border border-yellow-400/20">
                <span className="text-xs font-black uppercase text-yellow-300">সর্বমোট (প্রাথমিক):</span>
                <span className="text-xl font-black text-yellow-400">{item.total}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Office Note Box */}
        <div className="bg-yellow-400/10 border-2 border-yellow-400/40 rounded-3xl p-6 mb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-yellow-300 font-bold mb-2">
            * বিশেষ সুবিধা বা কোনো জিজ্ঞাসা থাকলে সরাসরি অফিস কর্তৃপক্ষের সাথে যোগাযোগ করুন:
          </p>
          <div className="flex items-center justify-center gap-3 text-white font-black text-sm sm:text-base flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Phone size={16} className="text-yellow-400" />
              <span>01711624478</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
              <Phone size={16} className="text-yellow-400" />
              <span>01712994462</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
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
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | বেতন ও ফি তালিকা</p>
      </footer>
    </div>
  );
};
