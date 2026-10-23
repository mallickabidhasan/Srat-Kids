import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Award, 
  Search, 
  Sparkles, 
  Printer, 
  School, 
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { 
  ALL_SCHOLARSHIP_RESULTS_2026,
  CLASS_5_SCHOLARSHIP_RESULTS_2026,
  CLASS_4_SCHOLARSHIP_RESULTS_2026,
  CLASS_3_SCHOLARSHIP_RESULTS_2026,
  CLASS_2_SCHOLARSHIP_RESULTS_2026,
  CLASS_1_SCHOLARSHIP_RESULTS_2026,
  KG_SCHOLARSHIP_RESULTS_2026,
  ScholarshipStudentResult, 
  searchScholarshipResults,
  toBengaliNumber,
  OFFICIAL_CLASS_5_RESULT_PDF_PATH,
  OFFICIAL_CLASS_4_RESULT_PDF_PATH,
  OFFICIAL_CLASS_3_RESULT_PDF_PATH,
  OFFICIAL_CLASS_2_RESULT_PDF_PATH,
  OFFICIAL_KG_RESULT_PDF_PATH
} from '../data/scholarshipResult2026';

interface ScholarshipResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArchive: () => void;
}

export const ScholarshipResultModal: React.FC<ScholarshipResultModalProps> = ({
  isOpen,
  onClose,
  onOpenArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<ScholarshipStudentResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoUrl = 'https://i.imgur.com/PmCP59l.png';

  const results = searchScholarshipResults({
    query: searchQuery,
    className: selectedClass,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) {
      setError('অনুগ্রহ করে রোল নম্বর, শিক্ষার্থীর নাম বা বিদ্যালয় লিখুন');
      return;
    }
    setError(null);
    setSearched(true);
    if (results.length === 1) {
      setSelectedStudent(results[0]);
    } else if (results.length === 0) {
      setError(`"${clean}" এর কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে সঠিক রোল নম্বর, শিক্ষার্থীর নাম বা বিদ্যালয়ের নাম দিয়ে আবার চেষ্টা করুন। (ডাটাবেজে মোট ৬৯১ জন বৃত্তিপ্রাপ্ত শিক্ষার্থীর ফলাফল রয়েছে)`);
    } else {
      setSelectedStudent(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
            className="relative w-full max-w-3xl bg-slate-900 border-2 border-yellow-400/40 rounded-3xl shadow-2xl text-slate-100 overflow-hidden z-10 my-8 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-950 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={logoUrl} 
                  alt="STAR KIDS" 
                  className="w-10 h-10 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    স্টার বৃত্তি উৎসব ২০২৬ <span className="text-yellow-400">ফলাফল</span>
                  </h3>
                  <p className="text-[11px] text-yellow-300 font-bold">
                    ১০ম হতে কেজি (মোট ৬৯১ জন) মেধা ফলাফল
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Class Tabs */}
              <div className="flex items-center gap-1 bg-blue-950 p-1 rounded-2xl border border-white/10 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setSelectedClass('all'); setError(null); }}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'all'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  সকল
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('কেজি'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'কেজি'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  কেজি
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('প্রথম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'প্রথম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ১ম
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('দ্বিতীয়'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'দ্বিতীয়'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ২য়
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('তৃতীয়'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'তৃতীয়'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৩য়
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('চতুর্থ'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'চতুর্থ'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৪র্থ
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('পঞ্চম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'পঞ্চম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৫ম
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('ষষ্ঠ'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'ষষ্ঠ'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৬ষ্ঠ
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('সপ্তম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'সপ্তম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৭ম
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('অষ্টম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'অষ্টম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৮ম
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('নবম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'নবম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ৯ম
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedClass('দশম'); setError(null); }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedClass === 'দশম'
                      ? 'bg-yellow-400 text-blue-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ১০ম
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <label className="block text-xs font-black text-yellow-300 uppercase tracking-wider">
                  রোল নম্বর / ছাত্র-ছাত্রীর নাম / বিদ্যালয়ের নাম
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setError(null);
                      }}
                      placeholder={
                        selectedClass === 'দশম'
                          ? "যেমন: রোল 1001, প্রীতম দেবনাথ, সাতক্ষীরা সরকারি উচ্চ বিদ্যালয়..."
                          : selectedClass === 'নবম'
                          ? "যেমন: রোল 9002, শ্রেয়ান সরকার, সাতক্ষীরা সরকারি উচ্চ বিদ্যালয়..."
                          : selectedClass === 'অষ্টম'
                          ? "যেমন: রোল 8001, সুহায়লা ফারহিন, সাতক্ষীরা সরকারি বালিকা উচ্চ বিদ্যালয়..."
                          : selectedClass === 'সপ্তম'
                          ? "যেমন: রোল 7001, মিম্মা তানজীম, সাতক্ষীরা সরকারি বালিকা উচ্চ বিদ্যালয়..."
                          : selectedClass === 'ষষ্ঠ'
                          ? "যেমন: রোল 6001, তানযীম হাসান, সাতক্ষীরা সরকারি উচ্চ বিদ্যালয়..."
                          : selectedClass === 'পঞ্চম'
                          ? "যেমন: রোল 5001, নাফিসা বিনতে মফিজ, সাতক্ষীরা সরকারি বালিকা..."
                          : selectedClass === 'চতুর্থ'
                          ? "যেমন: রোল 4001, মোবাশশিরা তাসনিম..."
                          : selectedClass === 'তৃতীয়'
                          ? "যেমন: রোল 3001, শেখ মোহাম্মাদ নাঈমুর রহমান..."
                          : selectedClass === 'দ্বিতীয়'
                          ? "যেমন: রোল 262, তাবাসসুম ইমরোজ..."
                          : selectedClass === 'প্রথম'
                          ? "যেমন: রোল 2104, জুবায়ের হোসেন..."
                          : "যেমন: রোল 88, কত্তরীন কায়নাত..."
                      }
                      className="w-full bg-white text-blue-950 placeholder-slate-400 font-bold px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Search size={16} />
                    <span>খুঁজুন</span>
                  </button>
                </div>

                {/* Quick stats & sample codes */}
                <div className="flex flex-wrap items-center justify-between text-xs text-blue-200 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-yellow-300">নমুনা রোল:</span>
                    {(selectedClass === 'দশম'
                      ? ['1001', '1004', '1006', '1012']
                      : selectedClass === 'নবম'
                      ? ['9002', '9005', '9012', '9018']
                      : selectedClass === 'অষ্টম'
                      ? ['8001', '8005', '8012', '8020']
                      : selectedClass === 'সপ্তম'
                      ? ['7001', '7003', '7011', '7025']
                      : selectedClass === 'ষষ্ঠ'
                      ? ['6001', '6003', '6010', '6020']
                      : selectedClass === 'পঞ্চম'
                      ? ['5001', '5003', '5012', '5025']
                      : selectedClass === 'চতুর্থ'
                      ? ['4001', '4005', '4010', '4022']
                      : selectedClass === 'তৃতীয়'
                      ? ['3001', '3005', '3012', '3020']
                      : selectedClass === 'দ্বিতীয়'
                      ? ['262', '1204', '220', '259', '256']
                      : selectedClass === 'প্রথম'
                      ? ['2104', '106', '102', '180', '2131']
                      : ['88', '33', '51', '2331', '34']
                    ).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setSearchQuery(code);
                          setError(null);
                        }}
                        className="bg-white/10 hover:bg-yellow-400 hover:text-blue-950 px-2 py-0.5 rounded font-mono font-bold text-yellow-300 transition-colors cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    পাওয়া গেছে: {toBengaliNumber(results.length)} জন
                  </span>
                </div>
              </form>

              {/* Error Notice */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Single Student Certificate Card */}
              {selectedStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← সকল তালিকায় ফিরুন
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold bg-yellow-400 text-blue-950 px-2 py-0.5 rounded">
                        {selectedStudent.classDisplayBn}
                      </span>
                      <span className="text-xs font-bold bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded border border-yellow-400/30">
                        রোল: {selectedStudent.codeNumber}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white text-blue-950 rounded-2xl p-5 sm:p-6 shadow-xl border-3 border-yellow-400 relative">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                      <div>
                        <h4 className="text-xl font-black text-blue-950">STAR KIDS</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          স্টার বৃত্তি উৎসব ২০২৬ • মেধা স্বীকৃতি
                        </p>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        selectedStudent.scholarshipType === 'ট্যালেন্টপুল'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {selectedStudent.scholarshipType} বৃত্তি
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="block text-slate-400 font-bold text-[10px]">শিক্ষার্থীর নাম</span>
                        <span className="font-black text-blue-950 text-sm">{selectedStudent.studentNameBn}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold text-[10px]">রোল নম্বর</span>
                        <span className="font-mono font-black text-blue-900 bg-yellow-400/20 px-2 py-0.5 rounded">
                          {selectedStudent.codeNumber}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold text-[10px]">শ্রেণি</span>
                        <span className="font-bold text-slate-800">{selectedStudent.classDisplayBn}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold text-[10px]">মেধা ক্রমিক</span>
                        <span className="font-bold text-slate-800">{toBengaliNumber(selectedStudent.serialNo)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 font-bold text-[10px]">বিদ্যালয়</span>
                        <span className="font-bold text-slate-800">{selectedStudent.schoolName}</span>
                      </div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs font-black text-yellow-900">
                        {selectedStudent.categoryGrade}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {selectedStudent.classDisplayBn}-এর মোট {toBengaliNumber(selectedStudent.totalExaminees)} জন পরীক্ষার্থীর মধ্যে মেধা স্থানপ্রাপ্ত
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                      <button
                        onClick={handlePrint}
                        className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer size={14} />
                        <span>প্রিন্ট করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Results List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold">
                      {selectedClass === 'all' ? 'সকল শ্রেণির' : `${selectedClass} শ্রেণির`} বৃত্তিপ্রাপ্তদের তালিকা ({toBengaliNumber(results.length)} জন)
                    </span>
                    <span>নামের ওপর ক্লিক করে মেধা কার্ড দেখুন</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {results.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-yellow-400/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold bg-yellow-400 text-blue-950 px-2 py-0.5 rounded">
                            {student.codeNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-black text-white">{student.studentNameBn}</h5>
                              <span className="text-[10px] text-yellow-300 bg-white/10 px-1.5 py-0.2 rounded">
                                {student.classDisplayBn}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-1">{student.schoolName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            student.scholarshipType === 'ট্যালেন্টপুল'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {student.scholarshipType}
                          </span>
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-blue-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-[11px]">STAR KIDS ক্যাডেট কেয়ার • সাতক্ষীরা</span>
              <button
                onClick={onOpenArchive}
                className="text-yellow-400 hover:underline font-bold cursor-pointer"
              >
                আর্কাইভ দেখুন →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
