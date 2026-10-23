import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Archive, 
  Download, 
  FileText, 
  Award, 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ScholarshipArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApply: () => void;
  onOpenAdmitCard: () => void;
  onOpenResult: () => void;
}

export const ScholarshipArchiveModal: React.FC<ScholarshipArchiveModalProps> = ({
  isOpen,
  onClose,
  onOpenApply,
  onOpenAdmitCard,
  onOpenResult,
}) => {
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden my-6 z-10 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 border-b border-yellow-400/30 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer shadow-md"
                aria-label="বন্ধ করুন"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3">
                <span className="p-2 bg-gradient-to-tr from-yellow-400 to-amber-300 text-blue-950 rounded-xl shadow-md font-black">
                  <Archive size={24} />
                </span>
                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-yellow-300 uppercase tracking-widest bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                    রেকর্ড ও তথ্য সংগ্রহশালা
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    স্টার বৃত্তি উৎসব ২০২৬ আর্কাইভ
                  </h3>
                </div>
              </div>

              <p className="text-blue-200 text-xs sm:text-sm mt-2">
                সাতক্ষীরা জেলার সর্ববৃহৎ ও নির্ভরযোগ্য মেধা বিকাশ প্রতিযোগিতা ২০২৬ এর সকল রেকর্ড ও তথ্য।
              </p>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-slate-50/50">
              {/* Event Summary Overview */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-black text-blue-950 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500 fill-yellow-500" />
                  <span>উৎসবের মূল মাইলফলক ও বিবরণ</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  স্টার বৃত্তি উৎসব ২০২৬ ছিল সাতক্ষীরা জেলার শিশু শ্রেণী থেকে নবম শ্রেণীর শিক্ষার্থীদের জন্য একটি স্মরণীয় মেধাভিত্তিক প্রতিযোগিতা। শত শত বিদ্যালয়ের শিক্ষার্থীরা অত্যন্ত স্বতঃস্ফূর্তভাবে এই উৎসবে অংশ নিয়ে নিজেদের মেধার স্বাক্ষর রেখেছে।
                </p>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                    <span className="block text-xl font-black text-blue-950">৭টি উপজেলা</span>
                    <span className="text-[10px] sm:text-xs text-blue-700 font-bold">সাতক্ষীরা জেলা</span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                    <span className="block text-xl font-black text-amber-900">২৩৫০+</span>
                    <span className="text-[10px] sm:text-xs text-amber-700 font-bold">নিবন্ধিত শিক্ষার্থী</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center col-span-2 sm:col-span-1">
                    <span className="block text-xl font-black text-emerald-900">১০০% স্বচ্ছ</span>
                    <span className="text-[10px] sm:text-xs text-emerald-700 font-bold">মেধাবী মূল্যায়ন</span>
                  </div>
                </div>
              </div>

              {/* 2026 Archive Quick Action Links */}
              <div className="space-y-3">
                <h4 className="font-black text-blue-950 text-xs sm:text-sm">
                  ২০২৬ সালের রেকর্ড ও সেবা সার্ভিস:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Results Button */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenResult();
                    }}
                    className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] text-emerald-200 block font-bold">ফলাফল দেখুন</span>
                      <h5 className="font-black text-sm sm:text-base">২০২৬ মেধা ফলাফল</h5>
                      <span className="text-[11px] text-emerald-100 mt-0.5 block">রোল দিয়ে অনুসন্ধান করুন</span>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl group-hover:translate-x-1 transition-transform">
                      <Award size={20} />
                    </div>
                  </button>

                  {/* Admit Card Download (Historical record) */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmitCard();
                    }}
                    className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white rounded-2xl shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] text-blue-200 block font-bold">প্রবেশপত্র কপি</span>
                      <h5 className="font-black text-sm sm:text-base">২০২৬ প্রবেশপত্র ডাউনলোড</h5>
                      <span className="text-[11px] text-blue-200 mt-0.5 block">পূর্ববর্তী এডমিট কার্ড পান</span>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl group-hover:translate-x-1 transition-transform">
                      <Download size={20} />
                    </div>
                  </button>

                  {/* Application Form */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApply();
                    }}
                    className="p-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-2xl shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer sm:col-span-2"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">আবেদন প্ল্যাটফর্ম</span>
                      <h5 className="font-black text-sm sm:text-base text-blue-950">২০২৬ আবেদন ফর্ম ও তথ্য</h5>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">পূরণকৃত আবেদনের বিবরণ</span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-xl group-hover:translate-x-1 transition-transform text-blue-950">
                      <FileText size={20} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Acknowledgement and Next Year Notice */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 text-xs sm:text-sm text-yellow-950 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold mb-1">ধন্যবাদ ও শুভকামনা</h5>
                  <p className="text-yellow-900/90 leading-relaxed text-[11px] sm:text-xs">
                    স্টার কিডস-এর সাথে থাকার জন্য সকল শিক্ষার্থী, সম্মানিত অভিভাবক ও শিক্ষকবৃন্দকে আন্তরিক ধন্যবাদ। আগামী ৮ অক্টোবর, ২০২৭-এ আরও জমকালো আয়োজনে স্টার বৃত্তি উৎসব ২০২৭ অনুষ্ঠিত হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                স্টার কিডস ইন্টারন্যাশনাল স্কুল অ্যান্ড এডুকেয়ার
              </span>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
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
