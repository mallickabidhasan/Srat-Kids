import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Download, ChevronRight, Calendar, Bell } from 'lucide-react';

interface ScholarshipFestivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyClick: () => void;
  onDownloadAdmitClick: () => void;
}

export const ScholarshipFestivalModal: React.FC<ScholarshipFestivalModalProps> = ({
  isOpen,
  onClose,
  onApplyClick,
  onDownloadAdmitClick,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
          {/* Backdrop Click to Close */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg sm:max-w-xl z-10"
          >
            {/* Notification Badge on top */}
            <div className="flex justify-center -mb-3 relative z-20">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-blue-950 font-black text-xs sm:text-sm shadow-lg border-2 border-white tracking-wide animate-pulse">
                <Bell size={15} className="animate-bounce" />
                <span>বিশেষ নোটিফিকেশন ও আপডেট</span>
              </span>
            </div>

            {/* Main Card */}
            <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white shadow-2xl border-3 border-yellow-400 overflow-hidden text-center">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 z-20 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer shadow-md"
                aria-label="নোটিফিকেশন বন্ধ করুন"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>

              {/* Background Lighting Effects */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />

              {/* Header with Logo & Title */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 pt-2 sm:pt-1">
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-md shrink-0"
                >
                  <img 
                    src="https://i.imgur.com/PmCP59l.png" 
                    alt="STAR KIDS Logo" 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight drop-shadow-sm">
                    স্টার বৃত্তি উৎসব ২০২৬
                  </h2>
                  <p className="text-blue-200 text-xs sm:text-sm font-bold">
                    সাতক্ষীরা জেলার সর্ববৃহৎ ও নির্ভরযোগ্য মেধা বিকাশ প্রতিযোগিতা
                  </p>
                </div>
              </div>

              {/* Action Buttons: Application & Admit Card */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto my-4">
                {/* Primary Action: Application */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onApplyClick();
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-blue-950 px-4 py-3 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:shadow-yellow-400/40 transition-all border border-white cursor-pointer whitespace-nowrap"
                >
                  <Sparkles size={18} className="text-blue-950 animate-spin shrink-0" />
                  <span className="whitespace-nowrap">আবেদন করতে এখানে ক্লিক করুন</span>
                  <ChevronRight size={18} className="shrink-0" />
                </motion.button>

                {/* Secondary Action: Admit Card Download */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onDownloadAdmitClick();
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white hover:text-yellow-300 px-4 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md border border-white/30 hover:border-yellow-400 transition-all cursor-pointer backdrop-blur-md group whitespace-nowrap"
                >
                  <Download size={18} className="text-yellow-400 group-hover:animate-bounce shrink-0" />
                  <span className="whitespace-nowrap">প্রবেশ পত্র ডাউনলোড করুন</span>
                </motion.button>
              </div>

              {/* Compact Date Information Footer */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-blue-200">
                <Calendar size={14} className="text-yellow-400 shrink-0" />
                <span>প্রবেশপত্র ডাউনলোড উন্মুক্ত: ২০ সেপ্টেম্বর হতে ৮ অক্টোবর ২০২৬ রাত ১২:০০ টা পর্যন্ত</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
