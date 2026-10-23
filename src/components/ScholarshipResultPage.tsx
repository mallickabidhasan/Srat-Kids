import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Search, 
  Sparkles, 
  Printer, 
  Phone, 
  Calendar, 
  School, 
  AlertCircle,
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Archive,
  RefreshCw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { downloadElementAsPdf } from '../utils/pdfExport';
import { 
  ALL_SCHOLARSHIP_RESULTS_2026,
  CLASS_10_SCHOLARSHIP_RESULTS_2026,
  CLASS_9_SCHOLARSHIP_RESULTS_2026,
  CLASS_8_SCHOLARSHIP_RESULTS_2026,
  CLASS_7_SCHOLARSHIP_RESULTS_2026,
  CLASS_6_SCHOLARSHIP_RESULTS_2026,
  CLASS_5_SCHOLARSHIP_RESULTS_2026,
  CLASS_4_SCHOLARSHIP_RESULTS_2026,
  CLASS_3_SCHOLARSHIP_RESULTS_2026,
  CLASS_2_SCHOLARSHIP_RESULTS_2026,
  CLASS_1_SCHOLARSHIP_RESULTS_2026,
  KG_SCHOLARSHIP_RESULTS_2026,
  ScholarshipStudentResult, 
  searchScholarshipResults,
  getUniqueScholarshipSchools,
  toBengaliNumber,
  OFFICIAL_CLASS_10_RESULT_PDF_PATH,
  OFFICIAL_CLASS_9_RESULT_PDF_PATH,
  OFFICIAL_CLASS_8_RESULT_PDF_PATH,
  OFFICIAL_CLASS_7_RESULT_PDF_PATH,
  OFFICIAL_CLASS_6_RESULT_PDF_PATH,
  OFFICIAL_CLASS_5_RESULT_PDF_PATH,
  OFFICIAL_CLASS_4_RESULT_PDF_PATH,
  OFFICIAL_CLASS_3_RESULT_PDF_PATH,
  OFFICIAL_CLASS_2_RESULT_PDF_PATH,
  OFFICIAL_CLASS_1_RESULT_PDF_PATH,
  OFFICIAL_KG_RESULT_PDF_PATH
} from '../data/scholarshipResult2026';

interface ScholarshipResultPageProps {
  onBackToHome: () => void;
  onNavigateApply: () => void;
  onNavigateAdmitCard: () => void;
  onNavigateArchive: () => void;
}

export const ScholarshipResultPage: React.FC<ScholarshipResultPageProps> = ({
  onBackToHome,
  onNavigateApply,
  onNavigateAdmitCard,
  onNavigateArchive,
}) => {
  // Search and filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  // Default to 'all' to immediately display all 691 published results across classes
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [scholarshipType, setScholarshipType] = useState<'all' | 'ট্যালেন্টপুল' | 'সাধারণ'>('all');

  // Active view state
  const [selectedStudent, setSelectedStudent] = useState<ScholarshipStudentResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCert, setIsExportingCert] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const logoUrl = 'https://i.imgur.com/PmCP59l.png';
  const schoolsList = useMemo(() => getUniqueScholarshipSchools(selectedClass === 'all' ? undefined : selectedClass), [selectedClass]);

  // Instant load: local authoritative dataset renders immediately, background Firestore sync runs non-blocking
  useEffect(() => {
    let isMounted = true;
    const syncToDatabase = async () => {
      try {
        const resultsCol = collection(db, 'scholarship_results');
        const snap = await getDocs(resultsCol);
        
        if (snap.size < ALL_SCHOLARSHIP_RESULTS_2026.length) {
          const chunkSize = 350;
          for (let i = 0; i < ALL_SCHOLARSHIP_RESULTS_2026.length; i += chunkSize) {
            const chunk = ALL_SCHOLARSHIP_RESULTS_2026.slice(i, i + chunkSize);
            const batch = writeBatch(db);
            chunk.forEach((student) => {
              const prefix = 
                student.className === 'দশম' ? 'cls10' :
                student.className === 'নবম' ? 'cls9' :
                student.className === 'অষ্টম' ? 'cls8' :
                student.className === 'সপ্তম' ? 'cls7' :
                student.className === 'ষষ্ঠ' ? 'cls6' :
                student.className === 'পঞ্চম' ? 'cls5' : 
                student.className === 'চতুর্থ' ? 'cls4' :
                student.className === 'তৃতীয়' ? 'cls3' :
                student.className === 'দ্বিতীয়' ? 'cls2' : 
                student.className === 'প্রথম' ? 'cls1' : 'kg';
              const docRef = doc(db, 'scholarship_results', `${prefix}_${student.codeNumber}_${student.serialNo}`);
              batch.set(docRef, {
                ...student,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            });
            await batch.commit();
          }
        }
        if (isMounted) setDbSyncStatus('synced');
      } catch (err) {
        console.warn('Firestore sync note:', err);
        if (isMounted) setDbSyncStatus('synced');
      }
    };

    // Run non-blocking in background after initial render
    const timer = setTimeout(() => {
      syncToDatabase();
    }, 100);

    return () => { 
      isMounted = false; 
      clearTimeout(timer);
    };
  }, []);

  // Filtered Results - strictly from the official database records
  const filteredResults = useMemo(() => {
    return searchScholarshipResults({
      query: searchQuery,
      schoolName: selectedSchool === 'all' ? undefined : selectedSchool,
      className: selectedClass,
      scholarshipType: scholarshipType,
    });
  }, [searchQuery, selectedSchool, selectedClass, scholarshipType]);

  // Active Statistics Summary
  const stats = useMemo(() => {
    if (selectedClass === 'দশম') {
      return {
        title: 'দশম শ্রেণি (Class 10)',
        candidates: 54,
        awarded: 16,
        talentpool: 12,
        general: 4,
      };
    } else if (selectedClass === 'নবম') {
      return {
        title: 'নবম শ্রেণি (Class 9)',
        candidates: 130,
        awarded: 41,
        talentpool: 19,
        general: 22,
      };
    } else if (selectedClass === 'অষ্টম') {
      return {
        title: 'অষ্টম শ্রেণি (Class 8)',
        candidates: 193,
        awarded: 65,
        talentpool: 34,
        general: 31,
      };
    } else if (selectedClass === 'সপ্তম') {
      return {
        title: 'সপ্তম শ্রেণি (Class 7)',
        candidates: 170,
        awarded: 50,
        talentpool: 33,
        general: 17,
      };
    } else if (selectedClass === 'ষষ্ঠ') {
      return {
        title: 'ষষ্ঠ শ্রেণি (Class 6)',
        candidates: 255,
        awarded: 77,
        talentpool: 51,
        general: 26,
      };
    } else if (selectedClass === 'পঞ্চম') {
      return {
        title: 'পঞ্চম শ্রেণি (Class 5)',
        candidates: 355,
        awarded: 107,
        talentpool: 72,
        general: 35,
      };
    } else if (selectedClass === 'চতুর্থ') {
      return {
        title: 'চতুর্থ শ্রেণি (Class 4)',
        candidates: 249,
        awarded: 73,
        talentpool: 45,
        general: 28,
      };
    } else if (selectedClass === 'তৃতীয়') {
      return {
        title: 'তৃতীয় শ্রেণি (Class 3)',
        candidates: 254,
        awarded: 76,
        talentpool: 48,
        general: 28,
      };
    } else if (selectedClass === 'দ্বিতীয়') {
      return {
        title: 'দ্বিতীয় শ্রেণি (Class 2)',
        candidates: 266,
        awarded: 84,
        talentpool: 51,
        general: 33,
      };
    } else if (selectedClass === 'প্রথম') {
      return {
        title: 'প্রথম শ্রেণি (Class 1)',
        candidates: 178,
        awarded: 56,
        talentpool: 31,
        general: 25,
      };
    } else if (selectedClass === 'কেজি') {
      return {
        title: 'কেজি শ্রেণি (KG)',
        candidates: 144,
        awarded: 46,
        talentpool: 28,
        general: 18,
      };
    } else {
      return {
        title: 'সকল প্রকাশিত শ্রেণি (কেজি হতে দশম শ্রেণি)',
        candidates: 2248,
        awarded: 691,
        talentpool: 424,
        general: 267,
      };
    }
  }, [selectedClass]);

  const activePdfUrl = useMemo(() => {
    if (selectedClass === 'দশম') return OFFICIAL_CLASS_10_RESULT_PDF_PATH;
    if (selectedClass === 'নবম') return OFFICIAL_CLASS_9_RESULT_PDF_PATH;
    if (selectedClass === 'অষ্টম') return OFFICIAL_CLASS_8_RESULT_PDF_PATH;
    if (selectedClass === 'সপ্তম') return OFFICIAL_CLASS_7_RESULT_PDF_PATH;
    if (selectedClass === 'ষষ্ঠ') return OFFICIAL_CLASS_6_RESULT_PDF_PATH;
    if (selectedClass === 'পঞ্চম') return OFFICIAL_CLASS_5_RESULT_PDF_PATH;
    if (selectedClass === 'চতুর্থ') return OFFICIAL_CLASS_4_RESULT_PDF_PATH;
    if (selectedClass === 'তৃতীয়') return OFFICIAL_CLASS_3_RESULT_PDF_PATH;
    if (selectedClass === 'দ্বিতীয়') return OFFICIAL_CLASS_2_RESULT_PDF_PATH;
    if (selectedClass === 'প্রথম') return OFFICIAL_CLASS_1_RESULT_PDF_PATH;
    if (selectedClass === 'কেজি') return OFFICIAL_KG_RESULT_PDF_PATH;
    return null;
  }, [selectedClass]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    if (filteredResults.length === 1) {
      setSelectedStudent(filteredResults[0]);
    } else {
      setSelectedStudent(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedSchool('all');
    setScholarshipType('all');
    setSelectedStudent(null);
    setHasSearched(false);
  };

  const handlePrint = async () => {
    if (!selectedStudent) return;
    setIsExporting(true);
    try {
      await downloadElementAsPdf({
        elementId: 'printable-result-card',
        filename: `Star_Scholarship_2026_${selectedStudent.className}_Roll_${selectedStudent.codeNumber}_${selectedStudent.studentNameBn}.pdf`,
        scale: 2,
        orientation: 'portrait',
        marginMm: 10,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.warn('PDF export fallback:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCertificateDownload = async () => {
    if (!selectedStudent) return;
    setIsExportingCert(true);
    try {
      await downloadElementAsPdf({
        elementId: 'printable-result-card',
        filename: `Star_Scholarship_2026_Certificate_${selectedStudent.className}_Roll_${selectedStudent.codeNumber}_${selectedStudent.studentNameBn}.pdf`,
        scale: 2,
        orientation: 'landscape',
        marginMm: 10,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.warn('Certificate export fallback:', err);
      window.print();
    } finally {
      setIsExportingCert(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
                  স্টার বৃত্তি উৎসব ২০২৬ • মেধা ফলাফল
                </span>
              </div>
            </button>
          </div>

          {/* Festival Sub-Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={onNavigateApply}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Sparkles size={14} className="text-yellow-400" />
              <span>আবেদন</span>
            </button>
            <button
              onClick={onNavigateAdmitCard}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Download size={14} className="text-yellow-400" />
              <span>প্রবেশপত্র</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-yellow-400 text-blue-950 shadow-md flex items-center gap-1.5">
              <Award size={15} />
              <span>ফলাফল</span>
            </div>
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

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Hero Banner: div:nth-of-type(1) */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs sm:text-sm font-black mb-3">
            <Award size={16} className="text-yellow-400" />
            <span>সাতক্ষীরা জেলার সর্ববৃহৎ ও নির্ভরযোগ্য মেধা বিকাশ প্রতিযোগিতা</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            স্টার বৃত্তি উৎসব ২০২৬ <span className="text-yellow-400">ফলাফল</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-3xl mx-auto font-medium">
            প্লে/কেজি শ্রেণি হতে দশম শ্রেণি পর্যন্ত সকল শ্রেণির অফিসিয়াল ফলাফল ডাটাবেজে সংরক্ষিত রয়েছে। রোল নম্বর, শিক্ষার্থীর নাম, বিদ্যালয়ের নাম অথবা শ্রেণি নির্বাচন করে ফলাফল দেখুন।
          </p>

          {/* Dynamic Statistics Bar */}
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
              <span className="block text-[11px] font-bold text-slate-300">মোট পরীক্ষার্থী ({stats.title})</span>
              <span className="text-xl sm:text-2xl font-black text-white">{toBengaliNumber(stats.candidates)} জন</span>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-md rounded-2xl p-3 border border-yellow-400/30 text-center">
              <span className="block text-[11px] font-bold text-yellow-300">মোট বৃত্তিপ্রাপ্ত</span>
              <span className="text-xl sm:text-2xl font-black text-yellow-400">{toBengaliNumber(stats.awarded)} জন</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30 text-center">
              <span className="block text-[11px] font-bold text-emerald-300">ট্যালেন্টপুল বৃত্তি</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{toBengaliNumber(stats.talentpool)} জন</span>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-3 border border-blue-400/30 text-center">
              <span className="block text-[11px] font-bold text-blue-300">সাধারণ বৃত্তি</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400">{toBengaliNumber(stats.general)} জন</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Box: div:nth-of-type(2) (Target focused element) */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-yellow-400/40 shadow-2xl max-w-4xl mx-auto mb-8 sm:mb-12">
          {/* Header Bar within Search Box */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Search size={20} className="text-yellow-400" />
                <span>ফলাফল অনুসন্ধান ও শ্রেণি ফিল্টার</span>
              </h2>
              <p className="text-xs text-yellow-300 font-medium mt-0.5">
                রোল নম্বর, শিক্ষার্থীর নাম, বিদ্যালয়ের নাম বা শ্রেণি দিয়ে খুঁজুন
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Official PDF Link if available */}
              {activePdfUrl && (
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-red-500/40"
                  title="কর্তৃপক্ষ কর্তৃক প্রকাশিত মূল ফলাফল নোটিশ (PDF) দেখুন"
                >
                  <FileText size={14} />
                  <span>
                    মূল {
                      selectedClass === 'দশম' ? '১০ম শ্রেণি' :
                      selectedClass === 'নবম' ? '৯ম শ্রেণি' :
                      selectedClass === 'অষ্টম' ? '৮ম শ্রেণি' :
                      selectedClass === 'সপ্তম' ? '৭ম শ্রেণি' :
                      selectedClass === 'ষষ্ঠ' ? '৬ষ্ঠ শ্রেণি' :
                      selectedClass === 'পঞ্চম' ? '৫ম শ্রেণি' :
                      selectedClass === 'চতুর্থ' ? '৪র্থ শ্রেণি' :
                      selectedClass === 'তৃতীয়' ? '৩য় শ্রেণি' :
                      selectedClass === 'দ্বিতীয়' ? '২য় শ্রেণি' :
                      selectedClass === 'প্রথম' ? '১ম শ্রেণি' :
                      selectedClass === 'কেজি' ? 'কেজি' : 'শ্রেণির'
                    } PDF
                  </span>
                </a>
              )}

              {/* Quick Class Selector Tabs */}
              <div className="flex items-center gap-1 bg-blue-950/80 p-1 rounded-xl border border-white/15 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedClass('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'all'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  সকল
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('কেজি')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'কেজি'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  কেজি
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('প্রথম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'প্রথম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ১ম
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('দ্বিতীয়')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'দ্বিতীয়'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ২য়
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('তৃতীয়')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'তৃতীয়'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৩য়
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('চতুর্থ')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'চতুর্থ'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৪র্থ
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('পঞ্চম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'পঞ্চম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৫ম
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('ষষ্ঠ')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'ষষ্ঠ'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৬ষ্ঠ
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('সপ্তম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'সপ্তম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৭ম
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('অষ্টম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'অষ্টম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৮ম
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('নবম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'নবম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ৯ম
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('দশম')}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'দশম'
                      ? 'bg-yellow-400 text-blue-950 shadow-md'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  ১০ম
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Primary Search Input */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wider mb-2">
                রোল নম্বর / শিক্ষার্থীর নাম / বিদ্যালয় / শ্রেণি
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(true);
                  }}
                  placeholder={
                    selectedClass === 'দশম'
                      ? "যেমন: রোল 2003, জাইমা রহমান প্রভা, সাতক্ষীরা সরকারি উচ্চ বালিকা বিদ্যালয়..."
                      : selectedClass === 'নবম'
                      ? "যেমন: রোল 902, হাসান ফারহান সামি, রোজ গার্ডেন স্কুল..."
                      : selectedClass === 'অষ্টম'
                      ? "যেমন: রোল 2547, ফাহিম শাহরিয়ার, সাতক্ষীরা সরকারি উচ্চ বিদ্যালয়..."
                      : selectedClass === 'সপ্তম'
                      ? "যেমন: রোল 1745, আফরা ইসলাম, সাতক্ষীরা সরকারি উচ্চ বালিকা বিদ্যালয়..."
                      : selectedClass === 'ষষ্ঠ'
                      ? "যেমন: রোল 692, ইশরাত জামান, সাতক্ষীরা সরকারি উচ্চ বালিকা বিদ্যালয়..."
                      : selectedClass === 'পঞ্চম'
                      ? "যেমন: রোল 594, সাবিহা ইসলাম, সাতক্ষীরা সরকারি উচ্চ বিদ্যালয়..."
                      : selectedClass === 'চতুর্থ'
                      ? "যেমন: রোল 434, এসএম তাহমিদ রেজা, রোজ গার্ডেন স্কুল..."
                      : selectedClass === 'তৃতীয়'
                      ? "যেমন: রোল 357, ইফফা ইনাইয়া, সাতক্ষীরা কালেক্টরেট স্কুল এন্ড কলেজ..."
                      : selectedClass === 'দ্বিতীয়'
                      ? "যেমন: রোল 262, তাবাসসুম ইমরোজ, সাতক্ষীরা রেসিডেন্সিয়াল মডেল স্কুল এন্ড কলেজ..."
                      : selectedClass === 'প্রথম'
                      ? "যেমন: রোল 2104, জুবায়ের হোসেন, ব্লিস ইন্টারন্যাশনাল একাডেমি..."
                      : selectedClass === 'কেজি'
                      ? "যেমন: রোল 88, কত্তরীন কায়নাত, সাতক্ষীরা কিন্ডার গার্টেন..."
                      : "রোল নম্বর, শিক্ষার্থীর নাম বা বিদ্যালয় লিখে খুঁজুন..."
                  }
                  className="w-full bg-white text-blue-950 placeholder-slate-400 font-bold px-4 py-3.5 pl-11 rounded-2xl text-base sm:text-lg focus:outline-none focus:ring-3 focus:ring-yellow-400 shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-md font-bold"
                  >
                    মুছুন
                  </button>
                )}
              </div>
            </div>

            {/* Multi-Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Class Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  শ্রেণি নির্বাচন
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-blue-900/60 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all" className="bg-blue-950 text-white">সকল শ্রেণি</option>
                  <option value="কেজি" className="bg-blue-950 text-white">কেজি</option>
                  <option value="প্রথম" className="bg-blue-950 text-white">১ম শ্রেণি</option>
                  <option value="দ্বিতীয়" className="bg-blue-950 text-white">২য় শ্রেণি</option>
                  <option value="তৃতীয়" className="bg-blue-950 text-white">৩য় শ্রেণি</option>
                  <option value="চতুর্থ" className="bg-blue-950 text-white">৪র্থ শ্রেণি</option>
                  <option value="পঞ্চম" className="bg-blue-950 text-white">৫ম শ্রেণি</option>
                  <option value="ষষ্ঠ" className="bg-blue-950 text-white">৬ষ্ঠ শ্রেণি</option>
                  <option value="সপ্তম" className="bg-blue-950 text-white">৭ম শ্রেণি</option>
                  <option value="অষ্টম" className="bg-blue-950 text-white">৮ম শ্রেণি</option>
                  <option value="নবম" className="bg-blue-950 text-white">৯ম শ্রেণি</option>
                  <option value="দশম" className="bg-blue-950 text-white">১০ম শ্রেণি</option>
                </select>
              </div>

              {/* School Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  বিদ্যালয় নির্বাচন ({schoolsList.length}টি প্রতিষ্ঠান)
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full bg-blue-900/60 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all" className="bg-blue-950 text-white">সকল বিদ্যালয়</option>
                  {schoolsList.map((school) => (
                    <option key={school} value={school} className="bg-blue-950 text-white">
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scholarship Type Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  বৃত্তির ধরন
                </label>
                <div className="flex rounded-xl bg-blue-900/60 p-1 border border-white/20">
                  <button
                    type="button"
                    onClick={() => setScholarshipType('all')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scholarshipType === 'all' 
                        ? 'bg-yellow-400 text-blue-950 shadow-sm' 
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    সকল ({toBengaliNumber(stats.awarded)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScholarshipType('ট্যালেন্টপুল')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scholarshipType === 'ট্যালেন্টপুল' 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    ট্যালেন্টপুল ({toBengaliNumber(stats.talentpool)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScholarshipType('সাধারণ')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scholarshipType === 'সাধারণ' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    সাধারণ ({toBengaliNumber(stats.general)})
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Reset Controls */}
            {(searchQuery || selectedSchool !== 'all' || scholarshipType !== 'all' || selectedClass !== 'all') && (
              <div className="pt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold transition-all cursor-pointer border border-yellow-300 text-xs shadow-md hover:scale-105 active:scale-95"
                >
                  <RefreshCw size={13} className="animate-spin-once" />
                  <span>সব ফিল্টার রিসেট করুন</span>
                </button>
              </div>
            )}
          </form>

          {/* Results Status Notice */}
          <div className="mt-4 p-3 rounded-xl bg-blue-950/70 border border-blue-400/20 text-xs text-blue-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                {selectedClass === 'দশম'
                  ? 'দশম শ্রেণির ফলাফল: ১৬ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৮, সাধারণ ৮)'
                  : selectedClass === 'নবম'
                  ? 'নবম শ্রেণির ফলাফল: ৪১ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ২০, সাধারণ ২১)'
                  : selectedClass === 'অষ্টম'
                  ? 'অষ্টম শ্রেণির ফলাফল: ৬৫ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৪৪, সাধারণ ২১)'
                  : selectedClass === 'সপ্তম'
                  ? 'সপ্তম শ্রেণির ফলাফল: ৫০ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৩৩, সাধারণ ১৭)'
                  : selectedClass === 'ষষ্ঠ'
                  ? 'ষষ্ঠ শ্রেণির ফলাফল: ৭৭ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৪৯, সাধারণ ২৮)'
                  : selectedClass === 'পঞ্চম'
                  ? 'পঞ্চম শ্রেণির ফলাফল: ১০৭ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৭৬, সাধারণ ৩১)'
                  : selectedClass === 'চতুর্থ'
                  ? 'চতুর্থ শ্রেণির ফলাফল: ৭৩ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৪৪, সাধারণ ২৯)'
                  : selectedClass === 'তৃতীয়'
                  ? 'তৃতীয় শ্রেণির ফলাফল: ৭৬ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৪১, সাধারণ ৩৫)'
                  : selectedClass === 'দ্বিতীয়'
                  ? 'দ্বিতীয় শ্রেণির ফলাফল: ৮৪ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৫১, সাধারণ ৩৩)'
                  : selectedClass === 'প্রথম' 
                  ? 'প্রথম শ্রেণির ফলাফল: ৫৬ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ৩১, সাধারণ ২৫)'
                  : selectedClass === 'কেজি'
                  ? 'কেজি শ্রেণির ফলাফল: ৪৬ জন বৃত্তিপ্রাপ্ত (ট্যালেন্টপুল ২৮, সাধারণ ১৮)'
                  : 'মোট ৬৯১ জন মেধা বৃত্তিপ্রাপ্ত শিক্ষার্থীর অফিসিয়াল ফলাফল সংরক্ষিত রয়েছে'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Single Student Certificate View */}
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="max-w-3xl mx-auto space-y-6 mb-12"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/15"
                >
                  <ArrowLeft size={14} />
                  <span>সকল বৃত্তিপ্রাপ্তদের তালিকায় ফিরুন</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-950 bg-yellow-400 px-3 py-1 rounded-full shadow-xs">
                    শ্রেণি: {selectedStudent.classDisplayBn}
                  </span>
                  <span className="text-xs font-bold text-yellow-300 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                    রোল: {selectedStudent.codeNumber}
                  </span>
                </div>
              </div>

              {/* Printable Result Card */}
              <div 
                id="printable-result-card"
                className="bg-white text-blue-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 relative overflow-hidden"
              >
                {/* Background Watermark */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
                  <img 
                    src={logoUrl} 
                    alt="Watermark" 
                    className="w-80 h-80 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Result Card Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5 mb-5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={logoUrl} 
                      alt="STAR KIDS" 
                      className="w-14 h-14 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h2 className="text-2xl font-black text-blue-950 tracking-tight">STAR KIDS</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        স্টার বৃত্তি উৎসব ২০২৬ • মেধা স্বীকৃতি পত্র
                      </p>
                      <p className="text-[11px] font-semibold text-blue-700">সাতক্ষীরা সদর ও সকল উপজেলা, সাতক্ষীরা</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-yellow-400 text-blue-950 px-3 py-1 rounded-full text-xs font-black shadow-xs">
                      মেধা ফলাফল
                    </span>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">শ্রেণি: {selectedStudent.classDisplayBn}</p>
                  </div>
                </div>

                {/* Congratulations Banner */}
                <div className={`rounded-2xl p-4 mb-6 shadow-md flex items-center gap-3.5 text-white ${
                  selectedStudent.scholarshipType === 'ট্যালেন্টপুল'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
                }`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Award size={28} className="text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      অভিনন্দন! {selectedStudent.studentNameBn}
                    </h3>
                    <p className="text-xs text-white/90 font-medium">
                      স্টার বৃত্তি উৎসব ২০২৬-এ {selectedStudent.classDisplayBn}-এ সফলভাবে {selectedStudent.scholarshipType} বৃত্তি অর্জন করায় আপনাকে আন্তরিক অভিনন্দন।
                    </p>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 mb-6">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">রোল নম্বর</span>
                    <span className="text-base font-mono font-black text-blue-900 bg-yellow-400/20 px-2.5 py-0.5 rounded-md inline-block">
                      {selectedStudent.codeNumber}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">শিক্ষার্থীর নাম</span>
                    <span className="text-base font-black text-blue-950">{selectedStudent.studentNameBn}</span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">শ্রেণি</span>
                    <span className="text-sm font-black text-blue-950">{selectedStudent.classDisplayBn}</span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">বিদ্যালয় / প্রতিষ্ঠান</span>
                    <span className="text-sm font-bold text-slate-800">{selectedStudent.schoolName}</span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">মেধা তালিকা ক্রমিক নং</span>
                    <span className="text-sm font-black text-blue-900">
                      {selectedStudent.scholarshipType} ক্রমিক: {toBengaliNumber(selectedStudent.serialNo)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">বৃত্তি পরীক্ষার বছর</span>
                    <span className="text-sm font-bold text-slate-700">২০২৬ সাল</span>
                  </div>
                </div>

                {/* Merit Status Box */}
                <div className={`rounded-2xl p-4 sm:p-5 border-2 text-center mb-6 ${
                  selectedStudent.scholarshipType === 'ট্যালেন্টপুল'
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                }`}>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block mb-1">
                    অর্জিত বৃত্তি ও সম্মাননা গ্রেড
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-blue-950 mb-1">
                    {selectedStudent.categoryGrade}
                  </h4>
                  <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-950 font-black px-4 py-1 rounded-full text-xs sm:text-sm shadow-xs mt-2">
                    <Sparkles size={15} />
                    <span>
                      {selectedStudent.classDisplayBn}-এর মোট {toBengaliNumber(selectedStudent.totalExaminees)} জন পরীক্ষার্থীর মধ্যে মেধা স্থান অর্জন
                    </span>
                  </div>
                </div>

                {/* Footer Authority Signatures */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
                  <div className="text-center">
                    <div className="w-28 border-b-2 border-slate-400 mx-auto mb-1" />
                    <span className="font-bold text-blue-950">পরীক্ষা নিয়ন্ত্রক</span>
                    <span className="block text-[10px] text-slate-400">স্টার বৃত্তি উৎসব ২০২৬</span>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-yellow-500 flex items-center justify-center mx-auto text-[9px] font-black text-yellow-800 uppercase leading-none p-1">
                      STAR KIDS OFFICIAL SEAL
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-28 border-b-2 border-slate-400 mx-auto mb-1" />
                    <span className="font-bold text-blue-950">পরিচালক</span>
                    <span className="block text-[10px] text-slate-400">STAR KIDS ক্যাডেট কেয়ার</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handlePrint}
                  disabled={isExporting}
                  className="w-full sm:flex-1 bg-yellow-400 hover:bg-yellow-300 text-blue-950 py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />
                      <span>পিডিএফ প্রস্তুত হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>ফলাফল স্লিপ ডাউনলোড (PDF)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCertificateDownload}
                  disabled={isExportingCert}
                  className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isExportingCert ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>সনদপত্র প্রস্তুত হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Award size={18} className="text-yellow-300" />
                      <span>সনদপত্র ডাউনলোড</span>
                    </>
                  )}
                </button>

                {selectedStudent.pdfSourceUrl && (
                  <a
                    href={selectedStudent.pdfSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 border border-red-500/40 transition-all cursor-pointer"
                  >
                    <FileText size={16} />
                    <span>অফিসিয়াল PDF</span>
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={18} className="text-emerald-400" />
                      <span className="text-emerald-300">লিংক কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} />
                      <span>শেয়ার</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results List / Grid of Matching Awarded Students */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Award className="text-yellow-400" size={24} />
              <span>
                {selectedClass === 'দ্বিতীয়'
                  ? 'দ্বিতীয় শ্রেণির বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা'
                  : selectedClass === 'প্রথম' 
                  ? 'প্রথম শ্রেণির বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা'
                  : selectedClass === 'কেজি'
                  ? 'কেজি শ্রেণির বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা'
                  : 'সকল প্রকাশিত বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা'}
              </span>
              <span className="text-xs font-bold bg-yellow-400 text-blue-950 px-2.5 py-0.5 rounded-full">
                {toBengaliNumber(filteredResults.length)} জন
              </span>
            </h3>

            {filteredResults.length > 0 && (
              <span className="text-xs text-blue-200">
                যেকোনো শিক্ষার্থীর নামের ওপর ক্লিক করে ফলাফল কার্ড ও সনদ দেখুন
              </span>
            )}
          </div>

          {/* If No Results Found */}
          {filteredResults.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-8 sm:p-12 border border-white/10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                <AlertCircle size={32} />
              </div>
              <h4 className="text-xl font-black text-white mb-2">কোনো ফলাফল পাওয়া যায়নি</h4>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                স্টার বৃত্তি উৎসব ২০২৬-এ বর্তমানে কেজি হতে ১০ম শ্রেণি পর্যন্ত মোট ৬৯১ জন বৃত্তিপ্রাপ্ত শিক্ষার্থীর অফিসিয়াল ফলাফল সংরক্ষিত রয়েছে।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-xl font-black text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>সকল ৬৯১ জন বৃত্তিপ্রাপ্তদের দেখুন</span>
                </button>
              </div>
            </div>
          ) : (
            /* Results Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((student) => {
                const isTalentpool = student.scholarshipType === 'ট্যালেন্টপুল';
                return (
                  <motion.div
                    key={student.id}
                    layout
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:border-yellow-400/60 shadow-lg hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-black bg-yellow-400 text-blue-950 px-2.5 py-0.5 rounded-md shadow-xs">
                            রোল {student.codeNumber}
                          </span>
                          <span className="text-[11px] font-bold text-slate-200 bg-white/15 px-2 py-0.5 rounded-md">
                            {student.classDisplayBn}
                          </span>
                        </div>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                          isTalentpool 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                        }`}>
                          {student.scholarshipType}
                        </span>
                      </div>

                      {/* Student Name */}
                      <h4 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors mb-1.5 flex items-center gap-2">
                        <span>{student.studentNameBn}</span>
                      </h4>

                      {/* School Name */}
                      <div className="flex items-start gap-2 text-xs text-blue-200 mb-4">
                        <School size={15} className="shrink-0 text-yellow-400 mt-0.5" />
                        <span className="font-medium line-clamp-2">{student.schoolName}</span>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-400">
                        ক্রমিক নং: {toBengaliNumber(student.serialNo)}
                      </span>
                      <button 
                        type="button"
                        className="text-yellow-400 group-hover:text-yellow-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>ফলাফল দেখুন</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informational Guidance Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mb-3">
              <Award size={22} />
            </div>
            <h4 className="text-white font-black text-base mb-1.5">বৃত্তি ও পুরস্কার প্রদান</h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              কেজি হতে ১০ম শ্রেণি পর্যন্ত সকল ট্যালেন্টপুল ও সাধারণ মেধা বৃত্তিপ্রাপ্ত শিক্ষার্থীদের জমকালো অনুষ্ঠানের মাধ্যমে ক্রেস্ট, সনদপত্রসহ একাধিক পুরস্কার প্রদান করা হবে।
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center mb-3">
              <Calendar size={22} />
            </div>
            <h4 className="text-white font-black text-base mb-1.5">আগামী ২০২৭ উৎসব</h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              আগামী ৮ অক্টোবর, ২০২৭ অনুষ্ঠিত হবে পরবর্তী মেধা উৎসব। বিস্তারিত সময়সূচি জানতে টাইমলাইন ও নোটিশ দেখুন।
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center mb-3">
              <Phone size={22} />
            </div>
            <h4 className="text-white font-black text-base mb-1.5">হেল্পলাইন ও সহায়তা</h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              ফলাফল সংক্রান্ত কোনো প্রশ্ন বা তথ্য সংশোধনের প্রয়োজন হলে যোগাযোগ করুন: 01711624478, 01712994462।
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-blue-300">
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | স্টার বৃত্তি উৎসব ২০২৬</p>
      </footer>
    </div>
  );
};
