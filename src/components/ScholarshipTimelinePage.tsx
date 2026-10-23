import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Archive, 
  Bell,
  Star,
  MapPin,
  GraduationCap,
  ArrowLeft,
  Download,
  School,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Check
} from 'lucide-react';

interface ScholarshipTimelinePageProps {
  onBackToHome: () => void;
  onNavigateApply: () => void;
  onNavigateAdmitCard: () => void;
  onNavigateResult: () => void;
  onNavigateArchive: () => void;
  onNavigateApplyFormat?: () => void;
}

export const ScholarshipTimelinePage: React.FC<ScholarshipTimelinePageProps> = ({
  onBackToHome,
  onNavigateApply,
  onNavigateAdmitCard,
  onNavigateResult,
  onNavigateArchive,
  onNavigateApplyFormat,
}) => {
  const logoUrl = 'https://i.imgur.com/PmCP59l.png';

  // Admin Mode PIN Protection (matches Admit Card PIN: 119020)
  const ADMIN_PIN = '119020';
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinPassword, setShowPinPassword] = useState(false);

  const handleOpenAdminModal = () => {
    setPinInput('');
    setPinError(null);
    setShowPinModal(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(null);
      if (onNavigateApplyFormat) {
        onNavigateApplyFormat();
      }
    } else {
      setPinError('ভুল সিকিউরিটি পিন! সঠিক পিন না দিলে আবেদনপত্রে প্রবেশ করা যাবে না।');
    }
  };

  // Target: 8 October 2027, 09:00:00 AM BD Time (UTC+6)
  const targetDate = new Date('2027-10-08T09:00:00+06:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timelineSteps = [
    {
      step: '১',
      title: 'সিলেবাস ও প্রস্তুতি নির্দেশিকা প্রকাশ',
      date: '১ মে, ২০২৭',
      description: 'স্টার কিডস ডিজিটাল প্ল্যাটফর্ম ও বিদ্যালয়ে সিলেবাস এবং নমুনা প্রশ্নপত্র বিতরণ।',
      status: 'পরিকল্পিত',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      step: '২',
      title: 'অনলাইন নিবন্ধন ও আবেদন উন্মুক্ত',
      date: '১ আগস্ট, ২০২৭',
      description: 'সাতক্ষীরা জেলার সকল উপজেলার শিক্ষার্থীদের জন্য অনলাইন আবেদন গ্রহণ শুরু। ২০২৭ সালে এই নির্দিষ্ট টাইমে আবেদনপত্রের ফরম্যাটটি আবার একই অবস্থায় সরাসরি চালু হবে।',
      status: 'আসন্ন (স্বয়ংক্রিয় সক্রিয়)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
      actionBtn: true,
    },
    {
      step: '৩',
      title: 'আবেদন ও তথ্য সংশোধনের শেষ সময়',
      date: '১৫ সেপ্টেম্বর, ২০২৭',
      description: 'অনলাইনে ফর্ম পূরণ ও ফি যাচাইকরণের আনুষ্ঠানিক সমাপ্তি।',
      status: 'আসন্ন',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      step: '৪',
      title: 'প্রবেশপত্র (Admit Card) ডাউনলোড উন্মুক্ত',
      date: '২০ সেপ্টেম্বর হতে ৮ অক্টোবর ২০২৭',
      description: 'ওয়েবসাইট থেকে ছবি ও রোল নম্বর সম্বলিত রঙিন প্রবেশপত্র ডাউনলোড ও প্রিন্ট।',
      status: 'আসন্ন',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      step: '৫',
      title: 'স্টার বৃত্তি উৎসব ২০২৭ (মূল পরীক্ষা)',
      date: '৮ অক্টোবর, ২০২৭ (শুক্রবার সকাল ৯:০০ টা)',
      description: 'সাতক্ষীরা জেলার নির্ধারিত পরীক্ষা কেন্দ্রসমূহে উৎসবমুখর পরিবেশে মেধা প্রতিযোগিতা অনুষ্ঠিত হবে।',
      status: 'মূল উৎসব',
      badgeColor: 'bg-yellow-400 text-blue-950 font-black border-yellow-500 shadow-sm animate-pulse',
    },
    {
      step: '৬',
      title: 'মেধা তালিকা ও ফলাফল প্রকাশ',
      date: '২৪ অক্টোবর, ২০২৭',
      description: 'অনলাইন ও এসএমএসের মাধ্যমে ফলাফল প্রকাশ ও ট্যালেন্টপুল মেধা তালিকা ঘোষণা।',
      status: 'সমাপনী',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      step: '৭',
      title: 'গ্র্যান্ড অ্যাওয়ার্ড ও পুরস্কার বিতরণী',
      date: 'নভেম্বর ২০২৭',
      description: 'নগদ বৃত্তি, ক্রেস্ট, সার্টিফিকেট ও আকর্ষণীয় উপহার প্রদান অনুষ্ঠান।',
      status: 'সমাপনী',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-blue-950/90 backdrop-blur-md border-b border-yellow-400/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
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
                  স্টার বৃত্তি উৎসব • ২০২৭ টাইমলাইন
                </span>
              </div>
            </button>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-yellow-400 text-blue-950 shadow-md flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>আবেদন ও টাইমলাইন</span>
            </div>
            <button
              onClick={onNavigateAdmitCard}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Download size={14} className="text-yellow-400" />
              <span>প্রবেশপত্র</span>
            </button>
            <button
              onClick={onNavigateResult}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Award size={14} className="text-yellow-400" />
              <span>ফলাফল</span>
            </button>
            <button
              onClick={onNavigateArchive}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Archive size={14} className="text-yellow-400" />
              <span>আর্কাইভ</span>
            </button>
            <button
              onClick={onBackToHome}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-white/15 hover:bg-yellow-400 hover:text-blue-950 text-white transition-all flex items-center gap-1.5 border border-white/20 shadow-sm cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>হোম</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section with Live Countdown */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs sm:text-sm font-black mb-3">
            <Calendar size={16} className="text-yellow-400" />
            <span>আগামী ৮ অক্টোবর, ২০২৭ এর জন্য স্টার কিডস আপনার অপেক্ষায়</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            স্টার বৃত্তি উৎসব ২০২৭ <span className="text-yellow-400">রোডম্যাপ ও টাইমলাইন</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            সাতক্ষীরা জেলার সর্ববৃহৎ ও নির্ভরযোগ্য মেধা বিকাশ প্রতিযোগিতার পর্যায়ক্রমিক সময়সূচি
          </p>
        </div>

        {/* Live Countdown Box */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 border-3 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-300 mb-2 block">
            পরীক্ষার দিন গণনা (Countdown to Exam Day)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
            ৮ অক্টোবর, ২০২৭ • শুক্রবার সকাল ৯:০০ টা
          </h2>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-yellow-400 font-mono">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider">দিন</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-yellow-400 font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider">ঘণ্টা</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-yellow-400 font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider">মিনিট</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-yellow-400 font-mono animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-wider">সেকেন্ড</span>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Steps */}
        <div className="space-y-4 mb-12">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-2">
            <Clock size={24} className="text-yellow-400" />
            <span>ধাপভিত্তিক সম্ভাব্য সময়সূচি ও কার্যবিবরণী</span>
          </h3>

          {timelineSteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl p-5 border transition-all ${
                item.status === 'মূল উৎসব'
                  ? 'bg-gradient-to-r from-yellow-400/20 via-amber-500/15 to-yellow-400/20 border-yellow-400 shadow-xl'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-900 border-2 border-yellow-400 text-yellow-400 flex items-center justify-center font-black text-sm shrink-0">
                    {item.step}
                  </span>
                  <h4 className="text-lg font-black text-white">{item.title}</h4>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-black text-yellow-300 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                    {item.date}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-blue-200 pl-11 leading-relaxed">
                {item.description}
              </p>

              {(item as any).actionBtn && onNavigateApplyFormat && (
                <div className="mt-3.5 pl-11">
                  <button
                    onClick={handleOpenAdminModal}
                    className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <FileText size={15} />
                    <span>আবেদন করতে ক্লিক করুন</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 text-center">
          <h3 className="text-xl font-black text-white mb-2">অন্যান্য সেকশনে যেতে চান?</h3>
          <p className="text-xs sm:text-sm text-blue-200 mb-6">
            নিচের যেকোনো বাটনে ক্লিক করে সংশ্লিষ্ট পেজে সরাসরি চলে যান।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateApplyFormat && (
              <button
                onClick={onNavigateApplyFormat}
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <FileText size={15} />
                <span>আবেদনপত্র ফরম্যাট দেখুন</span>
              </button>
            )}
            <button
              onClick={onNavigateAdmitCard}
              className="bg-white/15 hover:bg-white/25 text-white px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer border border-white/20 shadow-md"
            >
              প্রবেশপত্র পেজ
            </button>
            <button
              onClick={onNavigateResult}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              ফলাফল পেজ
            </button>
            <button
              onClick={onNavigateArchive}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer border border-white/20 shadow-md"
            >
              ২০২৬ আর্কাইভ পেজ
            </button>
            <button
              onClick={onBackToHome}
              className="bg-white/10 hover:bg-white/20 text-blue-200 px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer border border-white/15"
            >
              মূল ওয়েবসাইটে ফিরে যান
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-blue-300">
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | স্টার বৃত্তি উৎসব ২০২৭ রোডম্যাপ</p>
      </footer>

      {/* Admin PIN Verification Modal Dialog */}
      <AnimatePresence>
        {showPinModal && (
          <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-300 relative overflow-hidden"
            >
              <button
                onClick={() => setShowPinModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 text-blue-950 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Lock size={30} />
                </div>

                <div>
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full border border-amber-300 uppercase tracking-wider inline-block mb-1.5">
                    সিকিউরিটি ভেরিফিকেশন ও পাসওয়ার্ড
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-blue-950">অ্যাডমিন পিন নম্বর</h3>
                  <p className="text-xs md:text-sm font-bold text-slate-600 mt-1">
                    আবেদন ফরম্যাট দেখতে নির্ধারিত অ্যাডমিন পিন প্রদান করুন।
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-bold text-left">
                  <span className="block font-black text-amber-950 mb-0.5">💡 অ্যাডমিন ও পাসওয়ার্ড (পিন):</span>
                  <span>সিকিউরিটি পিন: <strong className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-950">119020</strong></span>
                </div>

                <form onSubmit={handleVerifyPin} className="space-y-4 pt-1">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-black text-blue-950 block">সিকিউরিটি পিন (PIN):</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound size={18} />
                      </div>
                      <input
                        type={showPinPassword ? 'text' : 'password'}
                        maxLength={10}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          if (pinError) setPinError(null);
                        }}
                        placeholder="••••••"
                        autoFocus
                        className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-center text-xl font-mono font-black tracking-widest text-blue-950 outline-none transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPinPassword(!showPinPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showPinPassword ? "পিন লুকান" : "পিন দেখুন"}
                      >
                        {showPinPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {pinError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 text-left">
                      <AlertCircle size={16} className="shrink-0 text-rose-600" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPinModal(false)}
                      className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-sm transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-850 text-yellow-400 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-yellow-400/30"
                    >
                      <Check size={18} />
                      <span>যাচাই ও প্রবেশ</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
