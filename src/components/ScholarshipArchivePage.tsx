import React from 'react';
import { motion } from 'framer-motion';
import { 
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
  ArrowLeft,
  Building2,
  BookOpen,
  School,
  Clock,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface ScholarshipArchivePageProps {
  onBackToHome: () => void;
  onNavigateApply: () => void;
  onNavigateAdmitCard: () => void;
  onNavigateResult: () => void;
  onNavigateTimeline?: () => void;
}

export const ScholarshipArchivePage: React.FC<ScholarshipArchivePageProps> = ({
  onBackToHome,
  onNavigateApply,
  onNavigateAdmitCard,
  onNavigateResult,
  onNavigateTimeline,
}) => {
  const logoUrl = 'https://i.imgur.com/PmCP59l.png';

  const upazilas = [
    'সাতক্ষীরা সদর', 'আশাশুনি', 'দেবহাটা', 'কলারোয়া',
    'কালিগঞ্জ', 'তালা', 'শ্যামনগর'
  ];

  const classSyllabus = [
    {
      class: 'কেজি শ্রেণি',
      subjects: 'বাংলা, ইংরেজি, প্রাথমিক গণিত',
      details: 'নমুনা প্রশ্ন স্টার কিডস ফেসবুক পেজ অথবা অফিস থেকে সংগ্রহ করতে হবে।',
      marks: '৫০',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '১ম শ্রেণি',
      subjects: 'বাংলা (১৫), ইংরেজি (১৫), গণিত (২০)',
      details: 'বাংলা: মূলবই (৫২-৭৮) পৃষ্ঠা পর্যন্ত; ইংরেজি: মূলবই (৫১-৯১) পৃষ্ঠা পর্যন্ত; গণিত: মূলবই (৫০-১১৩) পৃষ্ঠা পর্যন্ত। (প্রয়োজনে নমুনা প্রশ্ন অফিস থেকে সংগ্রহ করতে পারবেন)।',
      marks: '৫০',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '২য় শ্রেণি',
      subjects: 'বাংলা (১৫), ইংরেজি (১৫), গণিত (২০)',
      details: 'বাংলা: পাঠ: ২১, ২৩, ২৫, ২৭; ইংরেজি: unit: 7, 8, 9; গণিত: অধ্যায়: ২, ৩, ৫, ৬। (প্রয়োজনে নমুনা প্রশ্ন অফিস থেকে সংগ্রহ করতে পারবেন)।',
      marks: '৫০',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৩য় শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বিজ্ঞান (১০), বা ও বি (১০)',
      details: 'বাংলা: কবিতা (আমার পণ, তালগাছ, আদর্শ ছেলে), গল্প (মানবের জয়ের গল্প, রবীন্দ্রনাথ ঠাকুরের ছেলেবেলা, মুক্তিযুদ্ধে রাজার বাগ); ইংরেজি: Unit-6 মূলবই ভিত্তিক; গণিত: অনুশীনী- ৮, ৯, ১১, ১২; বিজ্ঞান: অনুশীনী- ৯, ১০; বা ও বি: অনুশীনী- ১১, ১২।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৪র্থ শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বা ও বি (১০), বিজ্ঞান (১০)',
      details: 'বাংলা: গল্প (মহীয়সী নারী, লাল জামা, খলিফা উমর (রা.)), কবিতা (লিচু চোর, ভয় পেয়ো না); ইংরেজি: Unit: 15, 16, 17, 18; গণিত: অধ্যায়: ৭, ৮, ৯, ১০; বা ও বি: অধ্যায়: ৯ ও ১০; বিজ্ঞান: অধ্যায়: ১০ ও ১১।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৫ম শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বা ও বি (১০), বিজ্ঞান (১০)',
      details: 'বাংলা: পাঠ (১৭, ১৮, ২০, ২২ - মাটির নিচে পুরানো নগর, ইচ্ছামতি, শিক্ষাঙ্কুর মর্যাদা, আমরা তোমাদের ভুলবনা); ইংরেজি: Unit (16, 17, 18, 19); গণিত: অধ্যায় (৬, ৭, ৮, ৯); বা ও বি: (১৩, ১৪) অধ্যায়; বিজ্ঞান: (১২, ১৩) অধ্যায়।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৬ষ্ঠ শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বিজ্ঞান (২০)',
      details: 'বাংলা: গদ্য (মাদার তেরেসা, আমাদের লোকশিল্প, কতকাল ধরে), কবিতা (বাঁচতে দাও, পাখির কাছে ফুলের কাছে, ফাগুন মাস), ব্যাকরণ (বিরামচিহ্ন, অভিধান), Seen Passage (Lesson 20-23); ইংরেজি: Grammar (Tense, Parts of speech, Right form of verbs, Changing sentence); গণিত: ২য়, ৫ম ও ৮ম অধ্যায়; বিজ্ঞান: অধ্যায় ৪, ১১ ও ১৪।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৭ম শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বিজ্ঞান (২০)',
      details: 'বাংলা: গদ্য (ছবির রং, সেই ছেলেটি, বহু জাতির দেশ-বাংলাদেশ), কবিতা (মেলা, সিঁথি, এই অক্ষরে), ব্যাকরণ (বাক্য, বানান, শব্দার্থ); ইংরেজি: Unit (6-8), Synonym/Antonym, Preposition, Parts of speech, Voice, Changing Sentence, Narration, Right form of verb, Article; গণিত: অধ্যায় ২, ৩, ৭, ১০, ১১; বিজ্ঞান: অধ্যায় ৮, ১০, ১৩।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৮ম শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (২০), বিজ্ঞান (১০), বা ও বি (১০)',
      details: 'বাংলা: গদ্য (মঙ্গুর পথে, বাংলা নববর্ষ, বাংলা ভাষার জন্মকথা), কবিতা (আবার আসিব ফিরে, রূপাই, জাগো তবে অরন্য কন্যারা), ব্যাকরণ (বাক্য, বানান, বিরামচিহ্ন, বাগধারা); ইংরেজি: Unit (7-9), Tense, Parts of speech, Preposition, Article, Changing Sentence, Narration, Right form of verb; গণিত: অধ্যায় ৩, ৬, ৯, ১১; বিজ্ঞান: অধ্যায় ৪, ৫, ১০, ১৩; বা ও বি: অধ্যায় ৮, ৯, ১০।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '৯ম শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (৩০), ICT (১০)',
      details: 'বাংলা: গল্প (নিমগাছ, আম আটির ভেঁপু, পল্লি সাহিত্য), কবিতা (সেই দিন এই মাঠ, ওমর ফারুক, যাব আমি তোমার দেশে), ব্যাকরণ (পরিচ্ছেদ ১৭, ২১, ২২, ২৩, ৩০); ইংরেজি: 1st paper (Unit 8, 9, 10), Grammar (Right form of verbs, Changing sentences, Tag Question, Preposition); গণিত: অনুশীলনী ৪, ৮, ১২, ১৭; ICT: অধ্যায় ৪র্থ।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    },
    {
      class: '১০ম শ্রেণি',
      subjects: 'বাংলা (২০), ইংরেজি (২০), গণিত (৩০), ICT (১০)',
      details: 'বাংলা: গদ্য (পল্লি সাহিত্য, প্রবাস বন্ধু, বই পড়া, অভাগীর স্বর্গ), কবিতা (বন্দনা, বৃষ্টি, রানার, রানার গান), ব্যাকরণ (ব্যঞ্জনধ্বনি, উপসর্গ, প্রত্যয়, শব্দের শ্রেণিবিভাগ, প্রতিশব্দ, শব্দজোড়); ইংরেজি: Unit 10, 11, 12, Grammar (Parts of speech, Right form of verbs, Changing sentences, Tag Question, Preposition); গণিত: অনুশীলনী ৩, ৪, ৮, ৯, ১০, ১৬; ICT: অধ্যায় ৩, ৪।',
      marks: '৮০ (MCQ: ৮০ × ১ = ৮০)',
      duration: '১:০০ ঘণ্টা'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-blue-950/90 backdrop-blur-md border-b border-yellow-400/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
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
                  স্টার বৃত্তি উৎসব ২০২৬ • আর্কাইভ সংগ্রহশালা
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
            <button
              onClick={onNavigateResult}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Award size={14} className="text-yellow-400" />
              <span>ফলাফল</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-yellow-400 text-blue-950 shadow-md flex items-center gap-1.5">
              <Archive size={15} />
              <span>আর্কাইভ</span>
            </div>
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs sm:text-sm font-black mb-3">
            <Archive size={16} className="text-yellow-400" />
            <span>রেকর্ড, পরিসংখ্যান ও মেধা মূল্যায়ন সংগ্রহশালা</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            স্টার বৃত্তি উৎসব ২০২৬ <span className="text-yellow-400">আর্কাইভ</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            সাতক্ষীরা জেলার সর্ববৃহৎ ও নির্ভরযোগ্য মেধা বিকাশ প্রতিযোগিতা ২০২৬ এর ঐতিহাসিক বিবরণ, পরিসংখ্যান, সিলেবাস এবং গুরুত্বপূর্ণ তথ্য।
          </p>
        </div>

        {/* Highlight Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center mx-auto mb-3 font-black shadow-md">
              <MapPin size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">৭টি</h3>
            <p className="text-xs sm:text-sm text-yellow-300 font-bold uppercase tracking-wider">উপজেলা কাভারেজ</p>
            <p className="text-[11px] text-blue-200 mt-1">সাতক্ষীরা জেলার সমগ্র অঞ্চল</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-blue-950 flex items-center justify-center mx-auto mb-3 font-black shadow-md">
              <Users size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">২,৩৫০+</h3>
            <p className="text-xs sm:text-sm text-emerald-300 font-bold uppercase tracking-wider">নিবন্ধিত শিক্ষার্থী</p>
            <p className="text-[11px] text-blue-200 mt-1">শিশু শ্রেণী হতে ১০ম শ্রেণী</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-400 text-blue-950 flex items-center justify-center mx-auto mb-3 font-black shadow-md">
              <School size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">১০০+</h3>
            <p className="text-xs sm:text-sm text-blue-300 font-bold uppercase tracking-wider">শিক্ষা প্রতিষ্ঠান</p>
            <p className="text-[11px] text-blue-200 mt-1">সরকারি ও বেসরকারি স্কুল</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center mx-auto mb-3 font-black shadow-md">
              <Award size={24} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">৬৫০+</h3>
            <p className="text-xs sm:text-sm text-amber-300 font-bold uppercase tracking-wider">বৃত্তি ও সম্মাননা</p>
            <p className="text-[11px] text-blue-200 mt-1">নগদ অর্থ, ক্রেস্ট ও সনদপত্র</p>
          </div>
        </div>

        {/* Quick Portals Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {/* Result Portal Card */}
          <div className="bg-gradient-to-br from-emerald-900/60 to-teal-900/40 rounded-3xl p-6 border-2 border-emerald-400/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-400 text-blue-950 rounded-2xl flex items-center justify-center mb-4 font-black shadow-md">
                <Award size={26} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">ফলাফল ও মেধা সনদ যাচাই</h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed mb-6 font-medium">
                রোল নম্বর বা ফরম নম্বর দিয়ে ২০২৬ মেধা পরীক্ষার গ্রেড, মেধা স্থান ও ফলাফল স্লিপ অনুসন্ধান করুন।
              </p>
            </div>
            <button
              onClick={onNavigateResult}
              className="w-full bg-emerald-400 hover:bg-emerald-300 text-blue-950 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>ফলাফল পেজে যান</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Admit Card Portal Card */}
          <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/40 rounded-3xl p-6 border-2 border-blue-400/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center mb-4 font-black shadow-md">
                <Download size={26} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">প্রবেশপত্র (Admit Card) সংগ্রহ</h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-6 font-medium">
                নিবন্ধিত মোবাইল নম্বর অথবা শিক্ষার্থীর নাম দিয়ে রঙিন প্রবেশপত্র অনুসন্ধান, ছবি সংযুক্তি ও পিডিএফ ডাউনলোড।
              </p>
            </div>
            <button
              onClick={onNavigateAdmitCard}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>প্রবেশপত্র পেজে যান</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 2027 Upcoming Festival Card */}
          <div className="bg-gradient-to-br from-amber-950/60 to-indigo-950/40 rounded-3xl p-6 border-2 border-yellow-400/50 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-amber-300 text-blue-950 rounded-2xl flex items-center justify-center mb-4 font-black shadow-md">
                <Calendar size={26} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">আগামী ৮ অক্টোবর, ২০২৭</h3>
              <p className="text-xs sm:text-sm text-yellow-100 leading-relaxed mb-6 font-medium">
                পরবর্তী স্টার বৃত্তি উৎসবের সম্ভাব্য সময়সূচি, সিলেবাস প্রকাশ ও নিবন্ধন টাইমলাইন দেখুন।
              </p>
            </div>
            {onNavigateTimeline ? (
              <button
                onClick={onNavigateTimeline}
                className="w-full bg-white/20 hover:bg-white/30 text-yellow-300 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-yellow-400/40"
              >
                <span>২০২৭ টাইমলাইন দেখুন</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onNavigateApply}
                className="w-full bg-white/20 hover:bg-white/30 text-yellow-300 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-yellow-400/40"
              >
                <span>নিবন্ধন তথ্য দেখুন</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Upazila Coverage Section */}
        <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-yellow-400/20 text-yellow-400 rounded-xl">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">সাতক্ষীরা জেলার উপজেলাভিত্তিক অংশগ্রহণ</h3>
              <p className="text-xs sm:text-sm text-blue-200">সকল উপজেলার সমন্বয়ে সুশৃঙ্খল ও উৎসবমুখর পরিবেশে প্রতিযোগিতা অনুষ্ঠিত</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {upazilas.map((upazila, i) => (
              <div 
                key={i}
                className="bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl border border-white/10 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-900 text-yellow-400 flex items-center justify-center mx-auto mb-2 text-xs font-black group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <h4 className="text-sm font-black text-white">{upazila}</h4>
                <span className="text-[10px] text-blue-300 font-bold block mt-0.5">অংশগ্রহণকারী জোন</span>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus & Exam Pattern Archive */}
        <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-400/20 text-blue-400 rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">সিলেবাস ও পরীক্ষার কাঠামো সংগ্রহশালা</h3>
              <p className="text-xs sm:text-sm text-blue-200">শ্রেণীভিত্তিক বিষয় বিন্যাস ও মান বণ্টন রেকর্ড</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classSyllabus.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-lg font-black text-yellow-400">{item.class}</h4>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="bg-blue-900/80 text-yellow-300 px-2.5 py-0.5 rounded-lg text-xs font-black border border-blue-400/30">
                        পূর্ণমান: {item.marks}
                      </span>
                      <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-lg text-xs font-bold">
                        সময়: {item.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white mb-1.5">বিষয়সমূহ: {item.subjects}</p>
                  <p className="text-xs text-blue-200 leading-relaxed font-medium bg-blue-950/40 p-2.5 rounded-xl border border-white/5">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Authorities & Organization */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 border-2 border-yellow-400/30 text-center">
          <img 
            src={logoUrl} 
            alt="STAR KIDS" 
            className="w-16 h-16 mx-auto mb-3 object-contain drop-shadow-md"
            referrerPolicy="no-referrer"
          />
          <h3 className="text-2xl font-black text-white mb-2">STAR KIDS ক্যাডেট কেয়ার ও কোচিং</h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
            রাজারবাগান কলেজ মোড় বা সাতক্ষীরা সরকারি কলেজ মোড়, সাতক্ষীরা, খুলনা, বাংলাদেশ।<br/>
            মোবাইল: 01711624478, 01712994462 | ইমেইল: abuhasan14330@gmail.com
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateApply}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              অনলাইন আবেদন ফর্ম
            </button>
            <button
              onClick={onNavigateAdmitCard}
              className="bg-white/15 hover:bg-white/25 text-white px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer border border-white/20 shadow-md"
            >
              প্রবেশপত্র ডাউনলোড
            </button>
            <button
              onClick={onNavigateResult}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              ফলাফল অনুসন্ধান
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
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | স্টার বৃত্তি উৎসব ২০২৬ আর্কাইভ</p>
      </footer>
    </div>
  );
};
