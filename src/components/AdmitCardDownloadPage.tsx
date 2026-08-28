import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, ArrowLeft, CheckCircle2, 
  AlertCircle, Sparkles, Clock, Calendar, MapPin, 
  Phone, User, School, BookOpen, RefreshCw, FileText, Check, ShieldCheck, Award,
  Lock, KeyRound, Eye, EyeOff, X
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface ApplicationData {
  id: string;
  formNo?: string;
  rollNumber?: string;
  schoolName: string;
  className: string;
  studentNameBn: string;
  studentNameEn: string;
  fatherNameBn?: string;
  motherNameBn?: string;
  village?: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  mobile: string;
  religion?: string;
  nationality?: string;
  studentPhoto?: string;
  submittedAt?: any;
  paymentStatus?: string;
  trxId?: string;
}

interface AdmitCardDownloadPageProps {
  onBackToHome: () => void;
}

export const AdmitCardDownloadPage: React.FC<AdmitCardDownloadPageProps> = ({ onBackToHome }) => {
  const [searchMobile, setSearchMobile] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ApplicationData | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('https://i.imgur.com/PmCP59l.png');
  const [isAdminMode, setIsAdminMode] = useState(false); // Default to regular user mode; toggleable for Admin test
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Admin Mode PIN Protection (PIN: 119020)
  const ADMIN_PIN = '119020';
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinPassword, setShowPinPassword] = useState(false);

  const handleOpenAdminPrompt = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      setPinInput('');
      setPinError(null);
      setShowPinModal(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAdminMode(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(null);
    } else {
      setPinError('ভুল সিকিউরিটি পিন! সঠিক কোড না দিলে অ্যাডমিন মোড চালু হবে না।');
    }
  };

  // Date access window: September 20, 2026 00:00:00 to October 8, 2026 23:59:59 (রাত ১২:০০ টা)
  const startDate = new Date('2026-09-20T00:00:00');
  const endDate = new Date('2026-10-08T23:59:59');
  
  const isWithinAccessPeriod = (currentTime >= startDate && currentTime <= endDate) || isAdminMode;
  const isBeforeStart = currentTime < startDate && !isAdminMode;
  const isAfterEnd = currentTime > endDate && !isAdminMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Live timer update
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Preload logo as Data URL for clean canvas PDF generation
    const preloadLogo = async () => {
      try {
        const res = await fetch('https://i.imgur.com/PmCP59l.png');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setLogoDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn('Could not preload logo for admit card:', err);
      }
    };
    preloadLogo();

    return () => clearInterval(timer);
  }, []);

  // Calculate remaining countdown
  const getTimeRemaining = () => {
    const total = startDate.getTime() - currentTime.getTime();
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds };
  };

  const countdown = getTimeRemaining();

  // Format serial or Roll Number & Form Number (Sequential starting from 2500)
  const getFormattedRoll = (student: ApplicationData) => {
    return student.rollNumber || student.formNo || '2500';
  };

  const getFormNo = (student: ApplicationData) => {
    return student.formNo || student.rollNumber || '2500';
  };

  // Normalize mobile number for flexible searching
  const normalizeMobile = (num: string) => {
    return num.replace(/\D/g, '').replace(/^880/, '0');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = normalizeMobile(searchMobile.trim());
    const cleanName = searchName.trim().toLowerCase();

    if (!cleanMobile && !cleanName) {
      setSearchError('অনুগ্রহ করে মোবাইল নম্বর অথবা ছাত্র/ছাত্রীর নাম লিখুন।');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchAttempted(true);
    setSelectedStudent(null);
    setSearchResults([]);

    try {
      const applicationsRef = collection(db, 'scholarship_applications');
      const querySnapshot = await getDocs(applicationsRef);
      
      const allDocs: ApplicationData[] = [];
      querySnapshot.forEach((docSnap) => {
        allDocs.push({ id: docSnap.id, ...docSnap.data() } as ApplicationData);
      });

      // Sort deterministically (by submission timestamp or ID) so that applications have a consistent sequential order
      allDocs.sort((a, b) => {
        const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : 0);
        const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : 0);
        if (timeA !== timeB) return timeA - timeB;
        return a.id.localeCompare(b.id);
      });

      // Ensure each application has a guaranteed unique formNo & rollNumber starting from 2500
      allDocs.forEach((doc, idx) => {
        const fallbackNum = (2500 + idx).toString();
        const assignedNumber = doc.formNo || doc.rollNumber || fallbackNum;
        doc.formNo = assignedNumber;
        doc.rollNumber = assignedNumber;
      });

      const matched: ApplicationData[] = [];
      allDocs.forEach((data) => {
        const itemMobile = normalizeMobile(data.mobile || '');
        const itemNameBn = (data.studentNameBn || '').toLowerCase();
        const itemNameEn = (data.studentNameEn || '').toLowerCase();

        let matchesMobile = true;
        let matchesName = true;

        if (cleanMobile) {
          matchesMobile = itemMobile.includes(cleanMobile) || cleanMobile.includes(itemMobile);
        }
        if (cleanName) {
          matchesName = itemNameBn.includes(cleanName) || itemNameEn.includes(cleanName);
        }

        if (cleanMobile && cleanName) {
          if (matchesMobile && matchesName) {
            matched.push(data);
          }
        } else if (cleanMobile && matchesMobile) {
          matched.push(data);
        } else if (cleanName && matchesName) {
          matched.push(data);
        }
      });

      if (matched.length === 1) {
        setSelectedStudent(matched[0]);
        setSearchResults(matched);
      } else if (matched.length > 1) {
        setSearchResults(matched);
        setSelectedStudent(matched[0]);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Error searching admit card:', err);
      setSearchError('তথ্য অনুসন্ধানে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const studentName = selectedStudent?.studentNameEn 
        ? selectedStudent.studentNameEn.trim().replace(/\s+/g, '_') 
        : 'Admit_Card';
      const filename = `Admit_Card_${studentName}_2026.pdf`;

      await downloadElementAsPdf({
        elementId: 'printable-admit-card',
        filename,
        scale: 2.5,
        orientation: 'portrait',
        marginMm: 6,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-100 font-sans pb-24">
      {/* Top Header Bar (Hidden in Print) */}
      <header className="no-print bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white sticky top-0 z-40 shadow-xl border-b-2 border-yellow-400">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-yellow-300 flex items-center gap-1.5 text-xs md:text-sm font-bold active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>মূল পাতা</span>
            </button>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <h1 className="text-base md:text-xl font-black text-yellow-400 flex items-center gap-2">
                <span>স্টার বৃত্তি উৎসব ২০২৬</span>
                <span className="bg-yellow-400/20 text-yellow-300 text-[11px] px-2 py-0.5 rounded-full border border-yellow-400/40 font-bold hidden xs:inline-block">
                  প্রবেশপত্র পোর্টাল
                </span>
              </h1>
              <p className="text-blue-200 text-xs font-semibold">স্টার কিডস কোচিং সেন্টার, সাতক্ষীরা</p>
            </div>
          </div>

          {/* Admin / Preview Mode Toggle Button in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdminPrompt}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                isAdminMode
                  ? 'bg-amber-400 text-blue-950 border-amber-300 hover:bg-amber-300'
                  : 'bg-white/10 text-yellow-300 border-white/20 hover:bg-white/20'
              }`}
            >
              <Sparkles size={14} className={isAdminMode ? 'text-blue-950' : 'text-yellow-400'} />
              <span>{isAdminMode ? 'অ্যাডমিন: চালু' : 'অ্যাডমিন'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Mode Active Notice Banner */}
      {isAdminMode && (
        <div className="no-print max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-blue-950 px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm font-black border border-amber-400">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="shrink-0" />
              <span>অ্যাডমিন প্রিভিউ মোড সক্রিয়: আপনি এখনই ডাটাবেস অনুসন্ধান ও প্রবেশপত্র ডাউনলোড পরীক্ষা করতে পারছেন।</span>
            </div>
            <button
              onClick={() => setIsAdminMode(false)}
              className="px-3 py-1 bg-blue-950 text-yellow-300 hover:bg-blue-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              সাধারণ ব্যবহারকারী ভিউ দেখুন
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {/* Date Window Lock & Countdown Card for Regular Users */}
        {!isWithinAccessPeriod ? (
          <section className="no-print bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-amber-300 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
              <Clock size={34} />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-300 inline-block uppercase tracking-wider">
                সময়সীমা নোটিশ
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-blue-950">
                {isBeforeStart ? 'প্রবেশপত্র ডাউনলোড শীঘ্রই শুরু হবে' : 'প্রবেশপত্র ডাউনলোডের সময়সীমা সমাপ্ত হয়েছে'}
              </h2>
              <p className="text-sm md:text-base font-bold text-slate-700 max-w-xl mx-auto leading-relaxed">
                সাধারণ শিক্ষার্থীদের জন্য স্টার বৃত্তি উৎসব ২০২৬-এর প্রবেশপত্র ডাউনলোড{' '}
                <span className="text-blue-900 font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  ২০ সেপ্টেম্বর, ২০২৬
                </span>{' '}
                থেকে শুরু হয়ে{' '}
                <span className="text-blue-900 font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  ৮ অক্টোবর, ২০২৬ রাত ১২:০০ টা
                </span>{' '}
                পর্যন্ত উন্মুক্ত থাকবে।
              </p>
            </div>

            {/* Countdown Box if before start */}
            {isBeforeStart && (
              <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 p-6 rounded-3xl text-white shadow-xl max-w-lg mx-auto border border-yellow-400/40 space-y-4">
                <span className="text-xs font-black uppercase text-yellow-400 tracking-wider flex items-center justify-center gap-1.5">
                  <Calendar size={14} />
                  পোর্টাল উন্মুক্ত হওয়ার বাকি
                </span>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                  <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                      {countdown.days}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase mt-0.5">দিন</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                      {countdown.hours}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase mt-0.5">ঘণ্টা</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                      {countdown.minutes}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase mt-0.5">মিনিট</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                      {countdown.seconds}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase mt-0.5">সেকেন্ড</div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Testing Mode Trigger */}
            <div className="pt-2 max-w-md mx-auto">
              <button
                onClick={handleOpenAdminPrompt}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-yellow-400 rounded-2xl text-xs md:text-sm font-black shadow-lg transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer border border-yellow-400/30"
              >
                <Lock size={16} className="text-yellow-400" />
                <span>অ্যাডমিন</span>
              </button>
            </div>
          </section>
        ) : (
          /* Search Box Section (Visible during Sept 20 - Oct 8 OR when Admin Mode is ON) */
          <section className="no-print bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-900 rounded-2xl mb-3 shadow-inner">
                <Search size={26} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-blue-950">
                প্রবেশপত্র অনুসন্ধান করুন
              </h2>
              <p className="text-xs md:text-sm font-bold text-slate-600 mt-1.5">
                স্টার বৃত্তি উৎসব ২০২৬-এ নিবন্ধিত মোবাইল নম্বর ও শিক্ষার্থীর নাম দিয়ে প্রবেশপত্র ডাউনলোড করুন
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-blue-950 uppercase tracking-wider mb-1.5">
                    নিবন্ধিত মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={searchMobile}
                      onChange={(e) => setSearchMobile(e.target.value)}
                      placeholder="যেমন: 01712266274"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-hidden font-bold text-slate-800 text-sm transition-all"
                    />
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-blue-950 uppercase tracking-wider mb-1.5">
                    ছাত্র/ছাত্রীর নাম (বাংলা বা ইংরেজি)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="যেমন: আবির বা ABIR"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-hidden font-bold text-slate-800 text-sm transition-all"
                    />
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {searchError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs md:text-sm font-bold text-red-700">
                  <AlertCircle size={18} className="shrink-0 text-red-600" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-yellow-400 rounded-2xl font-black text-sm shadow-lg hover:shadow-blue-900/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>ডাটাবেসে খোঁজা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>অনুসন্ধান করুন</span>
                    </>
                  )}
                </button>

                {(searchMobile || searchName || searchAttempted) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMobile('');
                      setSearchName('');
                      setSearchResults([]);
                      setSelectedStudent(null);
                      setSearchAttempted(false);
                      setSearchError(null);
                    }}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </form>

            {/* Multiple Results Selector (If multiple applications found) */}
            {searchResults.length > 1 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-black text-blue-950 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span>একাধিক আবেদন পাওয়া গেছে ({searchResults.length} জন):</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedStudent(item)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                        selectedStudent?.id === item.id 
                          ? 'border-blue-600 bg-blue-50/80 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <p className="font-black text-sm text-blue-950">{item.studentNameBn}</p>
                        <p className="text-xs font-bold text-slate-600">{item.studentNameEn} | {item.className}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{item.schoolName}</p>
                      </div>
                      {selectedStudent?.id === item.id && (
                        <span className="p-1.5 bg-blue-600 text-white rounded-full">
                          <Check size={14} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results message */}
            {searchAttempted && !isSearching && searchResults.length === 0 && (
              <div className="mt-8 p-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={22} />
                </div>
                <h4 className="font-black text-amber-900 text-base">
                  আপনার প্রদত্ত তথ্য অনুযায়ী কোনো আবেদন পাওয়া যায়নি।
                </h4>
                <p className="text-xs md:text-sm font-bold text-amber-800 max-w-md mx-auto">
                  অনুগ্রহ করে আবেদনের সময় ব্যবহৃত সঠিক মোবাইল নম্বর ও শিক্ষার্থীর নাম যাচাই করে পুনরায় অনুসন্ধান করুন।
                </p>
              </div>
            )}
          </section>
        )}

        {/* Admit Card Generated View */}
        {selectedStudent && (
          <section className="space-y-6">
            {/* Actions Bar (Hidden in Print) */}
            <div className="no-print bg-white p-4 rounded-2xl shadow-md border border-blue-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-green-100 text-green-700 rounded-xl">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <h4 className="font-black text-sm text-blue-950">প্রবেশপত্র প্রস্তুত হয়েছে!</h4>
                  <p className="text-xs font-bold text-slate-500">{selectedStudent.studentNameBn} - {selectedStudent.className}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className="px-6 py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-75 text-yellow-400 rounded-xl font-black text-xs md:text-sm shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Download size={17} className={isDownloadingPDF ? 'animate-bounce' : ''} />
                  <span>{isDownloadingPDF ? 'PDF প্রস্তুত হচ্ছে...' : 'প্রবেশপত্র PDF ডাউনলোড (প্রিন্ট কপি)'}</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                THE ADMIT CARD CONTAINER
                Formatted exactly like the uploaded Star Scholarship Festival Admit Card
                ========================================================================= */}
            <div className="overflow-x-auto pb-4">
              <div 
                id="printable-admit-card"
                className="w-full max-w-[800px] mx-auto bg-white border-4 border-blue-900 p-4 md:p-6 shadow-2xl rounded-none relative text-slate-900 select-text"
                style={{ minWidth: '680px', fontFamily: 'Inter, sans-serif' }}
              >
                {/* 1. Header Blue Ribbon with Logo, Title & Photo */}
                <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 rounded-xl flex items-center justify-between border-2 border-blue-950 shadow-md">
                  {/* Left Logo */}
                  <div className="flex items-center gap-3 w-1/4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full p-2 border-2 border-yellow-400 flex items-center justify-center shrink-0 shadow-inner">
                      <img 
                        src={logoDataUrl} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Center Festival Title */}
                  <div className="text-center w-2/4">
                    <h2 className="text-3xl md:text-4xl font-black text-yellow-400 tracking-tight drop-shadow-md">
                      স্টার বৃত্তি উৎসব ২০২৬
                    </h2>
                    <p className="text-[11px] md:text-xs text-blue-100 font-bold mt-1">
                      স্টার কিডস কোচিং সেন্টার
                    </p>
                  </div>

                  {/* Right Student Photo Box */}
                  <div className="w-1/4 flex justify-end">
                    <div className="w-20 h-24 md:w-24 md:h-28 bg-white border-2 border-yellow-400 rounded-lg p-1 flex flex-col items-center justify-center overflow-hidden shadow-md">
                      {selectedStudent.studentPhoto ? (
                        <img 
                          src={selectedStudent.studentPhoto} 
                          alt="Student" 
                          className="w-full h-full object-cover rounded-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center text-blue-900">
                          <User size={36} className="text-blue-900" />
                          <span className="text-[8px] font-black text-slate-500 mt-1 uppercase">ছবি</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Sub-header Address and Phone numbers */}
                <div className="text-center py-2.5 border-b border-blue-200">
                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-tight">
                    সরকারি কলেজ রোড (জেবুন্নেছা ছাত্রী নিবাসের দক্ষিণ পাশে), সাতক্ষীরা।
                  </p>
                  <p className="text-xs font-black text-blue-900 mt-0.5 tracking-wide">
                    মোবাইল : ০১৭১১-৬২৪৪৭৮, ০১৭১১-৩৬০৯৫৬, ০১৭১২-৯৯৪৪৬২
                  </p>
                </div>

                {/* 3. "প্রবেশ পত্র" Ribbon Badge Banner */}
                <div className="my-3 flex justify-center">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-yellow-400 font-black text-lg md:text-xl px-10 py-1.5 rounded-sm border-2 border-yellow-400 shadow-md transform tracking-wider">
                      প্রবেশ পত্র
                    </div>
                  </div>
                </div>

                {/* 4. Top Meta: Form No & Date */}
                <div className="flex items-center justify-between text-xs md:text-sm font-black text-slate-800 px-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-950">ফরম নং:</span>
                    <span className="border-b-2 border-dotted border-blue-900 px-3 py-0.5 font-black text-blue-900 bg-blue-50/50">
                      {getFormNo(selectedStudent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-950">তারিখ:</span>
                    <span className="border-b-2 border-dotted border-blue-900 px-4 py-0.5 font-black text-blue-900 bg-blue-50/50">
                      ০৯/১০/২০২৬
                    </span>
                  </div>
                </div>

                {/* 5. Student Information Table Grid (Strictly structured matching the physical format) */}
                <div className="space-y-1.5 my-3 text-xs md:text-sm">
                  {/* Row 1: School & Class */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-36 shrink-0 flex items-center justify-between">
                      <span>বিদ্যালয়ের নাম</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 bg-slate-50/60 truncate">
                      {selectedStudent.schoolName || '—'}
                    </div>

                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-20 shrink-0 flex items-center justify-between">
                      <span>শ্রেণি</span>
                      <span>:</span>
                    </div>
                    <div className="w-28 border-b-2 border-slate-300 font-black text-blue-950 px-2 py-1 bg-blue-50/80 text-center">
                      {selectedStudent.className || '—'}
                    </div>
                  </div>

                  {/* Row 2: Student Name (Bengali) */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-44 shrink-0 flex items-center justify-between">
                      <span>ছাত্র/ছাত্রীর নাম (বাংলায়)</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 bg-slate-50/60">
                      {selectedStudent.studentNameBn || '—'}
                    </div>
                  </div>

                  {/* Row 3: English (Capital) */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-44 shrink-0 flex items-center justify-between">
                      <span>ইংরেজি (বড় অক্ষরে)</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 uppercase tracking-wider bg-slate-50/60">
                      {selectedStudent.studentNameEn || '—'}
                    </div>
                  </div>

                  {/* Row 4: Father's Name */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-44 shrink-0 flex items-center justify-between">
                      <span>পিতার নাম (বাংলায়)</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 bg-slate-50/60">
                      {selectedStudent.fatherNameBn || '—'}
                    </div>
                  </div>

                  {/* Row 5: Mother's Name */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-44 shrink-0 flex items-center justify-between">
                      <span>মাতার নাম (বাংলায়)</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 bg-slate-50/60">
                      {selectedStudent.motherNameBn || '—'}
                    </div>
                  </div>

                  {/* Row 6: Mobile Number & Roll Number */}
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-36 shrink-0 flex items-center justify-between">
                      <span>মোবাইল নম্বর</span>
                      <span>:</span>
                    </div>
                    <div className="flex-1 border-b-2 border-slate-300 font-black text-slate-900 px-2 py-1 bg-slate-50/60">
                      {selectedStudent.mobile || '—'}
                    </div>

                    <div className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-l-md w-24 shrink-0 flex items-center justify-between">
                      <span>রোল নম্বর</span>
                      <span>:</span>
                    </div>
                    <div className="w-28 border-b-2 border-slate-300 font-black text-blue-950 px-2 py-1 bg-yellow-50 text-center font-mono text-sm border-yellow-300">
                      {getFormattedRoll(selectedStudent)}
                    </div>
                  </div>
                </div>

                {/* 6. Examination Schedule Box */}
                <div className="mt-4 border-2 border-blue-900 rounded-lg p-3 bg-blue-50/30">
                  <div className="text-center font-black text-xs md:text-sm text-blue-950 uppercase tracking-wider mb-2 underline">
                    পরীক্ষার সময়সূচী
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    {/* Left Column: Center & Date */}
                    <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-blue-200 pb-2 md:pb-0 pr-2">
                      <div className="flex items-start gap-1.5">
                        <span className="text-blue-900 font-black">■</span>
                        <div>
                          <span className="font-black text-slate-900">পরীক্ষার কেন্দ্র :</span>
                          <span className="font-bold text-blue-950 ml-1">স্টার কিড্স কোচিং</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <span className="text-blue-900 font-black">■</span>
                        <div>
                          <span className="font-black text-slate-900">পরীক্ষার তারিখ :</span>
                          <span className="font-black text-blue-900 ml-1">০৯ অক্টোবর, ২০২৬ তারিখ শুক্রবার</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Time schedule per classes */}
                    <div className="md:col-span-7 space-y-1 pl-1">
                      <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded border border-blue-100">
                        <span className="font-black text-slate-800">■ সপ্তম, নবম ও দশম</span>
                        <span className="font-bold text-blue-900">সময়: সকাল ৭:০০- ৮:০০ টা পর্যন্ত</span>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded border border-blue-100">
                        <span className="font-black text-slate-800">■ পঞ্চম ও অষ্টম</span>
                        <span className="font-bold text-blue-900">সময়: সকাল ৯:০০- ১০:০০ টা পর্যন্ত</span>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded border border-blue-100">
                        <span className="font-black text-slate-800">■ কেজি, প্রথম ও তৃতীয়</span>
                        <span className="font-bold text-blue-900">সময়: সকাল ১১:০০- ১২:০০ টা পর্যন্ত</span>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2 py-0.5 rounded border border-blue-100">
                        <span className="font-black text-slate-800">■ দ্বিতীয়, চতুর্থ ও ষষ্ঠ</span>
                        <span className="font-bold text-blue-900">সময়: বিকাল ৪:০০- ৫:০০ টা পর্যন্ত</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Footer Authority Signatures */}
                <div className="mt-8 pt-6 flex items-end justify-between px-4 text-xs font-bold">
                  <div className="text-center">
                    <div className="w-36 border-t-2 border-dotted border-slate-500 pt-1 text-slate-700">
                      শিক্ষার্থীর স্বাক্ষর
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-44 border-t-2 border-dotted border-blue-950 pt-1 text-blue-950 font-black">
                      পরিচালকের স্বাক্ষর
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Download & Navigation buttons */}
            <div className="no-print flex flex-col items-center justify-center gap-3 pt-2">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className="px-8 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-850 disabled:opacity-75 text-yellow-400 rounded-2xl font-black text-sm md:text-base shadow-xl hover:shadow-blue-900/40 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
                >
                  <Download size={20} className={isDownloadingPDF ? 'animate-bounce' : ''} />
                  <span>{isDownloadingPDF ? 'PDF তৈরি হচ্ছে...' : 'প্রবেশপত্র PDF ডাউনলোড (প্রিন্ট কপি)'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setSearchResults([]);
                    setSearchAttempted(false);
                  }}
                  className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  অন্য শিক্ষার্থীর প্রবেশপত্র খুঁজুন
                </button>
              </div>

              <p className="text-xs font-bold text-slate-500 text-center flex items-center gap-1.5 mt-1">
                <span>💡</span>
                <span>PDF ফাইলটি ডাউনলোড করে যেকোনো কম্পিউটার, মোবাইল বা প্রিন্টারের দোকান থেকে সরাসরি প্রিন্ট করে নিতে পারবেন।</span>
              </p>
            </div>
          </section>
        )}
      </main>

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
                    সিকিউরিটি ভেরিফিকেশন
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-blue-950">অ্যাডমিন পিন কোড</h3>
                  <p className="text-xs md:text-sm font-bold text-slate-600 mt-1">
                    অ্যাডমিন প্রিভিউ মোড সক্রিয় করতে নির্ধারিত ৬ ডিজিটের গোপন সিকিউরিটি পিন প্রদান করুন।
                  </p>
                </div>

                <form onSubmit={handleVerifyPin} className="space-y-4 pt-2">
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
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 text-left"
                    >
                      <AlertCircle size={16} className="shrink-0 text-rose-600" />
                      <span>{pinError}</span>
                    </motion.div>
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
