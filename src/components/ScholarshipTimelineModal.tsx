import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
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
  GraduationCap
} from 'lucide-react';

interface ScholarshipTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResult: () => void;
  onOpenArchive: () => void;
}

export const ScholarshipTimelineModal: React.FC<ScholarshipTimelineModalProps> = ({
  isOpen,
  onClose,
  onOpenResult,
  onOpenArchive,
}) => {
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
      description: 'সাতক্ষীরা জেলার সকল উপজেলার শিক্ষার্থীদের জন্য অনলাইন আবেদন গ্রহণ শুরু।',
      status: 'আসন্ন',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      title: 'স্টার বৃত্তি উৎসব ২০২৭ (পরীক্ষা)',
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          {/* Backdrop Click */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden my-6 z-10 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 pb-6 border-b border-yellow-400/30 shrink-0">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer shadow-md"
                aria-label="বন্ধ করুন"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 bg-yellow-400 text-blue-950 rounded-xl shadow-md font-black">
                  <Calendar size={22} />
                </span>
                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-yellow-300 uppercase tracking-widest bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                    অফিসিয়াল সময়সূচি ও রোডম্যাপ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    স্টার বৃত্তি উৎসব ২০২৭ — টাইমলাইন
                  </h3>
                </div>
              </div>

              <p className="text-yellow-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mt-2 bg-white/10 p-2.5 rounded-xl border border-white/15">
                <Sparkles size={16} className="text-yellow-400 animate-spin shrink-0" />
                <span>আগামী ৮ অক্টোবর, ২০২৭ এর জন্য স্টার কিডস আপনার অপেক্ষায়</span>
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-slate-50/50">
              {/* Live Countdown Timer to 9 October 2027 */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-800 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-center gap-2 mb-2 text-yellow-300 font-bold text-xs sm:text-sm">
                  <Clock size={16} className="animate-pulse" />
                  <span>৮ অক্টোবর, ২০২৭ বৃত্তি উৎসব কাউন্টডাউন</span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto pt-1">
                  <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">
                      {timeLeft.days}
                    </span>
                    <span className="text-[10px] sm:text-xs text-blue-200 font-medium">দিন</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">
                      {timeLeft.hours}
                    </span>
                    <span className="text-[10px] sm:text-xs text-blue-200 font-medium">ঘণ্টা</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-[10px] sm:text-xs text-blue-200 font-medium">মিনিট</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20">
                    <span className="block text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">
                      {timeLeft.seconds}
                    </span>
                    <span className="text-[10px] sm:text-xs text-blue-200 font-medium">সেকেন্ড</span>
                  </div>
                </div>
              </div>

              {/* Notice Box about 2026 completion */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-slate-800 text-xs sm:text-sm flex gap-3 shadow-xs">
                <Bell size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 mb-1">
                    স্টার বৃত্তি উৎসব ২০২৬ সফলভাবে সমাপ্ত হয়েছে!
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    ২০২৬ সালের আবেদন ও প্রবেশপত্র ডাউনলোডের সময়সীমা ৮ অক্টোবর রাত ১২:০০ টায় সমাপ্ত হয়েছে। ২০২৬-এর পরীক্ষার্থীদের পরীক্ষার ফলাফল ও মেধা তালিকা দেখতে নিচে <strong className="text-blue-900">"ফলাফল"</strong> বাটনে ক্লিক করুন। পূর্ববর্তী প্রবেশপত্র বা তথ্য পুনঃনিরীক্ষণের জন্য <strong className="text-blue-900">"স্টার বৃত্তি উৎসব ২০২৬ আর্কাইভ"</strong> বাটনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              {/* Timeline Roadmap */}
              <div>
                <h4 className="text-sm sm:text-base font-black text-blue-950 mb-3 flex items-center gap-2">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <span>স্টার বৃত্তি উৎসব ২০২৭ পূর্ণাঙ্গ সময়রেখা:</span>
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-4 border-l-2 border-blue-200 ml-3">
                  {timelineSteps.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Step Number Dot */}
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-900 text-yellow-400 font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white shadow-md">
                        {item.step}
                      </div>

                      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                          <h5 className="font-black text-blue-950 text-xs sm:text-sm">
                            {item.title}
                          </h5>
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                          <Calendar size={13} className="shrink-0" />
                          <span>{item.date}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competition Details */}
              <div className="bg-blue-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-yellow-400 font-black text-xs sm:text-sm">
                  <GraduationCap size={18} />
                  <span>স্টার বৃত্তি উৎসব ২০২৭ এর আকর্ষণসমূহ</span>
                </div>
                <ul className="text-[11px] sm:text-xs space-y-1.5 text-blue-100 list-disc list-inside">
                  <li>সাতক্ষীরা জেলার সর্ববৃহৎ ও শতভাগ স্বচ্ছ মেধা বিকাশ প্রতিযোগিতা।</li>
                  <li>শিশু শ্রেণী হতে নবম শ্রেণী পর্যন্ত সকল শাখার শিক্ষার্থীদের অংশগ্রহণ।</li>
                  <li>ট্যালেন্টপুল ও সাধারণ গ্রেডে আকর্ষণীয় নগদ অর্থবৃত্তি, ক্রেস্ট ও মেধা সনদ।</li>
                  <li>প্রতিটি শ্রেণীতে শীর্ষস্থান অর্জনকারীদের জন্য বিশেষ সম্মাননা।</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Result Button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenResult();
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Award size={16} />
                  <span>ফলাফল দেখুন</span>
                </button>

                {/* Archive Button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenArchive();
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Archive size={16} />
                  <span>২০২৬ আর্কাইভ</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
