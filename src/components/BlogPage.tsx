import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronRight, Maximize2, Sparkles, Download, Award, Archive, ExternalLink } from 'lucide-react';

interface BlogPageProps {
  onBackToHome: () => void;
  onImageClick: (src: string, caption?: string) => void;
  onNavigateApply?: () => void;
  onNavigateAdmitCard?: () => void;
  onNavigateResult?: () => void;
  onNavigateArchive?: () => void;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  link?: string;
  content?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  { 
    id: 1, 
    title: 'সাতক্ষীরায় স্টার কিডস বৃত্তি উৎসব: সংবর্ধনা পেল ৫৫০ শিক্ষার্থী', 
    excerpt: 'সাতক্ষীরায় জাঁকজমকপূর্ণ অনুষ্ঠানের মাধ্যমে স্টার কিডস মেধা বৃত্তি উৎসবের কৃতি শিক্ষার্থীদের সংবর্ধনা প্রদান করা হয়েছে। অনুষ্ঠানে মোট ৫৫০ জন শিক্ষার্থীকে বৃত্তি প্রদান করা হয়েছে। এর মধ্যে ৩৪৮ জন ট্যালেন্টপুলে এবং ২০২ জন সাধারণ গ্রেডে সম্মাননা ও মেডেল লাভ করে।', 
    date: 'Dec 25, 2025', 
    image: 'https://i.imgur.com/hBGKwPY.jpeg',
    link: 'https://patradoot.net/2025/12/25/616109.html',
    content: 'শিক্ষার গুণগত মান বৃদ্ধি ও কোমলমতি শিক্ষার্থীদের পড়ার প্রতি আগ্রহ ও মেধা মূল্যায়নের লক্ষে সাতক্ষীরায় সফলভাবে অনুষ্ঠিত হয়েছে স্টার কিডস বৃত্তি উৎসব। এতে বিভিন্ন স্কুলের সহস্রাধিক শিক্ষার্থী অংশগ্রহণ করে।'
  },
  { 
    id: 2, 
    title: 'সাতক্ষীরায় স্টার কিডস বৃত্তি উৎসব অনুষ্ঠিত ', 
    excerpt: 'শিক্ষার মান উন্নয়নে শিক্ষার্থীদের উৎসাহ ও উদ্দীপনা বাড়াতে জেলার বিভিন্ন শিক্ষা প্রতিষ্ঠানের শিশু শ্রেণী থেকে দশম শ্রেণীর ২২০২ জন শিক্ষার্থী এ বৃত্তি উৎসবে অংশ নেয়। প্রতিযোগীদের অভিভাবক ও শিক্ষকদের উপস্থিতিতে উৎসবমুখর পরিবেশ সৃষ্টি হয়।', 
    date: 'Nov 01, 2025', 
    image: 'https://i.imgur.com/9F4gNPL.jpeg',
    link: 'https://patradoot.net/2025/11/01/608299.html?fbclid=IwT01FWAQyRldmZGlkFlA6smXEL1TC-He4Nxyv45juSNgbh75leHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6L693cdgQumzGj45wXCmRroItqa_MmnBkqd_e-rHDNVSzIDNtcizHv8Sr8wg_aem_dCRCmJvb6RG5gaj3xaNDrA',
    content: 'সাতক্ষীরা সরকারি উচ্চ বিদ্যালয় ও বালিকা বিদ্যালয়সহ বিভিন্ন ক্যাডেট ও রেসিডেন্সিয়াল একাডেমির কৃতি শিক্ষার্থীদের চমৎকার মেধা মূল্যায়ন প্রদর্শনী।'
  },
  { 
    id: 4, 
    title: 'Science Fair & Innovation Showcase', 
    excerpt: 'Celebrating the young innovators of Star Kids who excelled in this year\'s regional science & talent competitions.', 
    date: 'February 10, 2024', 
    image: 'https://picsum.photos/seed/science/600/400',
    content: 'Star Kids continuously inspires young minds through practical science exhibitions, debate platforms, and Cadet College admission support.'
  },
  { 
    id: 5, 
    title: 'New Digital Classroom & Library Wing Inauguration', 
    excerpt: 'Expanding horizons with our state-of-the-art new library and digital multimedia classroom facilities.', 
    date: 'January 20, 2024', 
    image: 'https://picsum.photos/seed/library/600/400',
    content: 'Modern study environment equipped with audio-visual equipment, curated Cadet exam guidebooks, and personalized mentor support.'
  },
];

export const BlogPage: React.FC<BlogPageProps> = ({
  onBackToHome,
  onImageClick,
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
                  ক্যাম্পাস আপডেট, নোটিশ ও সর্বশেষ ব্লগ
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
            <BookOpen size={16} className="text-yellow-400" />
            <span>দৈনিক সমকাল, পাত্রদূত ও পত্রিকায় প্রকাশিত খবর ও ফিচার</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            আমাদের সর্বশেষ <span className="text-yellow-400">ব্লগ পোস্ট ও সংবাদ সমাচার</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            স্টার কিডস্ ক্যাডেট কেয়ারের সাম্প্রতিক অর্জন, কৃতি শিক্ষার্থী সংবর্ধনা ও শিক্ষামূলক নিবন্ধগুলো বিস্তারিত পড়ুন।
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {BLOG_POSTS.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-yellow-400/60 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div 
                  className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 cursor-pointer bg-slate-900 border border-white/10"
                  onClick={() => onImageClick(post.image, post.title)}
                >
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={28} />
                  </div>
                  <span className="absolute top-3 left-3 bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                    {post.date}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-yellow-400 transition-colors mb-3 leading-snug">
                  {post.title}
                </h3>

                <p className="text-sm text-blue-100 leading-relaxed mb-4 font-medium">
                  {post.excerpt}
                </p>

                {post.content && (
                  <p className="text-xs text-blue-200/80 leading-relaxed mb-4 bg-blue-950/40 p-3 rounded-xl border border-white/5 font-medium">
                    {post.content}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                {post.link ? (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    <span>পত্রিকায় মূল খবরটি পড়ুন</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                    <span>স্টার কিডস অফিসিয়াল ব্লগ</span>
                  </span>
                )}

                <button
                  onClick={() => onImageClick(post.image, post.title)}
                  className="text-xs font-bold text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>ছবি বড় করুন</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.article>
          ))}
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
        <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | ক্যাম্পাস ব্লগ ও নোটিশ</p>
      </footer>
    </div>
  );
};
