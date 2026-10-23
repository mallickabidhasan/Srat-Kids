import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Phone, School, Users, RefreshCw, Sparkles, Download, Award, Archive } from 'lucide-react';

interface FacultyPageProps {
  onBackToHome: () => void;
  onNavigateApply?: () => void;
  onNavigateAdmitCard?: () => void;
  onNavigateResult?: () => void;
  onNavigateArchive?: () => void;
}

const TEACHER_NAMES = [
  "মনি স্যার", "মো: হাফিজুল স্যার", "ইসমাইল স্যার", "শাহ-আলম স্যার", "মাসুম স্যার",
  "রবিউল স্যার", "মঞ্জুর স্যার", "সুভাষ স্যার", "আজিজ স্যার", "সেলিম স্যার",
  "সুমন স্যার", "আল-আমিন স্যার", "সাবু স্যার", "শাহিন স্যার", "রকিব স্যার",
  "সুদীপ্ত স্যার", "খোকন স্যার", "আশরাফুল স্যার", "নূর ইসলাম স্যার", "মোস্তাফিজ স্যার",
  "জুয়েল স্যার", "আসাদ স্যার", "বুলবুল স্যার", "সোহাগ স্যার", "সোহেল স্যার",
  "সুজন স্যার", "জাহিদ স্যার", "শফিকুল স্যার", "তৌহিদ স্যার", "মোস্তফা স্যার",
  "আরিফ স্যার", "ইমরান স্যার", "ফয়সাল স্যার", "হাসান স্যার", "রাসেল স্যার",
  "তারেক স্যার", "মিজান স্যার", "কামরুল স্যার", "নয়ন স্যার", "আরিফুল স্যার",
  "শামিম স্যার", "সাগর স্যার", "মাসুদ স্যার", "আলামিন স্যার", "রিয়াজ স্যার",
  "হাবিব স্যার", "সোহরাব স্যার", "ফারুক স্যার"
];

const TEACHER_MOBILES = [
  "01711624478 / 01712994462", "01712-994462", "01736-249079", "01741-267576", "01740-101168",
  "01712-404543", "01718-877717", "01712-515431", "01715-373801", "01728-662705",
  "01738-898492", "01725-246961", "01722-132338", "01734-631620", "01716-435777",
  "01755-937213", "01740-838634", "01725-455470", "01710-911894", "01723-958807",
  "01728-448293", "01718-936640", "01737-124480", "01722-950821", "01710-449912",
  "01714-883390", "01712-701198", "01738-204060", "01716-092281", "01711-229988",
  "01718-445522", "01725-998811", "01736-112233", "01740-556677", "01712-334455",
  "01715-667788", "01728-990011", "01738-223344", "01725-556677", "01722-889900",
  "01734-112233", "01716-445566", "01755-778899", "01740-112233", "01725-445566",
  "01710-778899", "01723-112233", "01728-445566"
];

const TEACHER_SUBJECTS = [
  "পরিচালক", "গণিত (১০ম)", "পদার্থ বিজ্ঞান (১০ম)", "রসায়ন (১০ম)", "উচ্চতর গণিত (১০ম)",
  "জীববিজ্ঞান (১০ম)", "ইংরেজি (১০ম)", "বাংলা (১০ম)", "সাধারণ বিজ্ঞান (১০ম)", "ICT (১০ম)",
  "গণিত (৯ম)", "পদার্থ বিজ্ঞান (৯ম)", "রসায়ন (৯ম)", "ইংরেজি (৯ম)", "বাংলা (৯ম)",
  "গণিত (৮ম)", "বিজ্ঞান (৮ম)", "ইংরেজি (৮ম)", "বাংলা (৮ম)", "গণিত (৭ম)",
  "বিজ্ঞান (৭ম)", "ইংরেজি (৭ম)", "বাংলা (৭ম)", "গণিত (৬ষ্ঠ)", "বিজ্ঞান (৬ষ্ঠ)",
  "ইংরেজি (৬ষ্ঠ)", "বাংলা (৬ষ্ঠ)", "পঞ্চম", "পঞ্চম", "পঞ্চম",
  "পঞ্চম", "পঞ্চম", "পঞ্চম", "চতুর্থ", "চতুর্থ",
  "চতুর্থ", "চতুর্থ", "চতুর্থ", "তৃতীয়", "তৃতীয়",
  "তৃতীয়", "তৃতীয়", "তৃতীয়", "দ্বিতীয়", "দ্বিতীয়",
  "দ্বিতীয়", "দ্বিতীয়", "প্রথম"
];

export const TEACHER_LIST_DATA = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: TEACHER_NAMES[i] || '',
  subject: TEACHER_SUBJECTS[i] || '',
  mobile: TEACHER_MOBILES[i] || ''
}));

const convertBengaliToStandard = (numStr: string) => {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return numStr.replace(/[০-৯]/g, (w) => bnToEnMap[w] || w);
};

export const FacultyPage: React.FC<FacultyPageProps> = ({
  onBackToHome,
  onNavigateApply,
  onNavigateAdmitCard,
  onNavigateResult,
  onNavigateArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const logoUrl = 'https://i.imgur.com/PmCP59l.png';

  const filteredTeachers = TEACHER_LIST_DATA.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.mobile.toLowerCase().includes(q)
    );
  });

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
                  অভিজ্ঞ ও দক্ষ শিক্ষকদের প্যানেল
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
            <Users size={16} className="text-yellow-400" />
            <span>সাতক্ষীরা জেলার সেরা ও অভিজ্ঞ বিষয়ভিত্তিক শিক্ষকবৃন্দ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            আমাদের অভিজ্ঞ ও দক্ষ <span className="text-yellow-400">শিক্ষকদের প্যানেল (৪৮ জন)</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            শিক্ষকদের নাম, বিষয় বা মোবাইল নম্বর দিয়ে সরাসরি অনুসন্ধান করুন এবং শ্রেণিকক্ষের সেরা পাঠদানকারীদের তালিকা দেখুন।
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষকের নাম, বিষয় (যেমন: গণিত, পদার্থ) বা ফোন নম্বর লিখুন..."
              className="w-full bg-white text-blue-950 placeholder-slate-400 font-bold px-4 py-3.5 pl-11 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-3 focus:ring-yellow-400 shadow-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-lg font-bold"
              >
                মুছুন
              </button>
            )}
          </div>
          <div className="mt-2 text-right text-xs text-yellow-300 font-medium">
            মোট শিক্ষক পাওয়া গেছে: <span className="font-bold text-white">{filteredTeachers.length}</span> জন
          </div>
        </div>

        {/* Teachers Table / Grid */}
        <div className="bg-white/5 rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl mb-12">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 mb-4 sticky top-16 z-20 shadow-md">
            <div className="col-span-4 sm:col-span-3 bg-blue-900 text-yellow-300 py-3 px-3 sm:px-6 rounded-l-xl font-black text-xs sm:text-base flex items-center justify-start border border-blue-700/50">
              শিক্ষকের নাম
            </div>
            <div className="col-span-5 sm:col-span-6 bg-yellow-400 text-blue-950 py-3 px-3 sm:px-6 font-black text-xs sm:text-base flex items-center justify-start">
              মোবাইল নম্বর (যোগাযোগ)
            </div>
            <div className="col-span-3 bg-indigo-900 text-white py-3 px-3 sm:px-6 rounded-r-xl font-black text-xs sm:text-base flex items-center justify-start border border-indigo-700/50">
              শ্রেণি / বিষয়
            </div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2.5">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12 text-slate-300">
                <p className="text-base font-bold mb-2">কোনো শিক্ষক পাওয়া যায়নি</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-blue-950 font-black text-xs rounded-xl shadow-md"
                >
                  <RefreshCw size={14} />
                  <span>সকল ৪৮ জন শিক্ষককে দেখুন</span>
                </button>
              </div>
            ) : (
              filteredTeachers.map((teacher, idx) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.015 }}
                  className="grid grid-cols-12 gap-1 group hover:scale-[1.01] transition-transform"
                >
                  <div className="col-span-4 sm:col-span-3 bg-white/10 group-hover:bg-white/20 text-white py-3 px-3 sm:px-6 rounded-l-xl font-bold text-xs sm:text-base flex items-center justify-start border-l border-y border-white/10">
                    <span className="font-black text-yellow-300 mr-1.5 text-[10px] sm:text-xs">
                      #{teacher.id}
                    </span>
                    <span className="line-clamp-1">{teacher.name}</span>
                  </div>

                  <div className="col-span-5 sm:col-span-6 bg-yellow-400/10 group-hover:bg-yellow-400/20 text-yellow-300 py-3 px-3 sm:px-6 font-mono font-bold text-xs sm:text-base flex items-center justify-start border-y border-yellow-400/20 overflow-hidden">
                    {teacher.mobile === '-' ? (
                      <span className="text-slate-500">-</span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Phone size={14} className="text-yellow-400 shrink-0" />
                        {teacher.mobile.split('/').map((num, i) => (
                          <React.Fragment key={i}>
                            <a
                              href={`tel:${convertBengaliToStandard(num.replace(/[-\s()]/g, ''))}`}
                              className="hover:underline hover:text-white transition-colors"
                              title={`${teacher.name}-কে কল করুন`}
                            >
                              {num.trim()}
                            </a>
                            {i < teacher.mobile.split('/').length - 1 && <span className="text-yellow-500/60 mx-0.5">/</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-3 bg-white/10 group-hover:bg-white/20 text-blue-200 py-3 px-3 sm:px-6 rounded-r-xl font-bold text-xs sm:text-base flex items-center justify-start border-r border-y border-white/10">
                    <span className="line-clamp-1">{teacher.subject}</span>
                  </div>
                </motion.div>
              ))
            )}
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
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | শিক্ষকদের প্যানেল নির্দেশিকা</p>
      </footer>
    </div>
  );
};
