/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Clock,
  CheckCircle2,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  MousePointer2,
  Youtube,
  Send,
  MessageCircle,
  Music2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence, animate, useInView } from 'framer-motion';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, getDocFromServer, doc, runTransaction, setDoc } from 'firebase/firestore';
import StarAIChat from './components/StarAIChat';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

// --- Types ---
interface Class {
  id: number;
  name: string;
  description: string;
  subjects: string[] | Record<string, string[]>;
}

interface Teacher {
  id: number;
  name: string;
  role: string;
  image: string;
  class?: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  link?: string;
}

// --- Data ---
const BENGALI_CLASSES = [
  'শ্রেণী ১', 'শ্রেণী ২', 'শ্রেণী ৩', 'শ্রেণী ৪', 'শ্রেণী ৫',
  'শ্রেণী ৬', 'ক্যাডেট', 'শ্রেণী ৭', 'শ্রেণী ৮', 'শ্রেণী ৯', 'শ্রেণী ১০'
];

const CLASSES: Class[] = [
  {
    id: 1,
    name: 'শ্রেণী ১',
    description: 'শ্রেণী ১র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['আমার বাংলা বই', 'English for Today', 'প্রাথমিক গণিত']
  },
  {
    id: 2,
    name: 'শ্রেণী ২',
    description: 'শ্রেণী ২র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['আমার বাংলা বই', 'English for Today', 'প্রাথমিক গণিত']
  },
  {
    id: 3,
    name: 'শ্রেণী ৩',
    description: 'শ্রেণী ৩র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['আমার বাংলা বই', 'English For Today', 'প্রাথমিক গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 4,
    name: 'শ্রেণী ৪',
    description: 'শ্রেণী ৪র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['আমার বাংলা বই', 'English For Today', 'প্রাথমিক গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 5,
    name: 'শ্রেণী ৫',
    description: 'শ্রেণী ৫র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['আমার বাংলা বই', 'English For Today', 'প্রাথমিক গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 6,
    name: 'শ্রেণী ৬',
    description: 'শ্রেণী ৬র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 7,
    name: 'ক্যাডেট',
    description: 'ক্যাডেট শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'গণিত', 'বিজ্ঞান', 'সাধারণ জ্ঞান', 'সমসাময়িক বিষয় নিয়ে আলোচনা', 'বাংলাদেশ ও বিশ্বপরিচয়']
  },
  {
    id: 8,
    name: 'শ্রেণী ৭',
    description: 'শ্রেণী ৭র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 9,
    name: 'শ্রেণী ৮',
    description: 'শ্রেণী ৮র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'গণিত', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্বপরিচয়', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা']
  },
  {
    id: 10,
    name: 'শ্রেণী ৯',
    description: 'শ্রেণী ৯র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: {
      'আবশ্যিক বিষয়': ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'সাধারণ গণিত', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা'],
      'মানবিক বিভাগ': ['বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', 'ভূগোল ও পরিবেশ', 'পৌরনীতি ও নাগরিকতা', 'অর্থনীতি', 'কৃষিশিক্ষা', 'গার্হস্থ্যবিজ্ঞান'],
      'বিজ্ঞান বিভাগ': ['জীববিজ্ঞান', 'পদার্থ বিজ্ঞান', 'উচ্চতর গণিত', 'রসায়ন']
    }
  },
  {
    id: 11,
    name: 'শ্রেণী ১০',
    description: 'শ্রেণী ১০র শিক্ষার্থীদের জন্য বিশেষ পাঠ্যক্রম, যা তাদের মেধা ও নৈতিক বিকাশে সহায়ক।',
    subjects: {
      'আবশ্যিক বিষয়': ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র', 'English 1st Paper', 'English 2nd Paper', 'সাধারণ গণিত', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ইসলাম শিক্ষা', 'হিন্দুধর্ম শিক্ষা'],
      'মানবিক বিভাগ': ['বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', 'ভূগোল ও পরিবেশ', 'পৌরনীতি ও নাগরিকতা', 'অর্থনীতি', 'কৃষিশিক্ষা', 'গার্হস্থ্যবিজ্ঞান'],
      'বিজ্ঞান বিভাগ': ['জীববিজ্ঞান', 'পদার্থ বিজ্ঞান', 'উচ্চতর গণিত', 'রসায়ন']
    }
  }
];

const COURSES = [
  { title: 'Admission পরীক্ষার প্রস্তুতি', icon: '📝', description: 'সাতক্ষীরা সরকারি উচ্চ বিদ্যালয় ও সাতক্ষীরা সরকারি উচ্চ বালিকা বিদ্যালয়ের ৩য় শ্রেণীর ভর্তি পরীক্ষায় উত্তীর্ণ হওয়ার জন্য আপনার সন্তানকে প্রস্তুত করার লক্ষ্যে এই কোর্সটি পরিচালিত হয়।' },
  { title: '৫ম শ্রেণীর বৃত্তি পরীক্ষার প্রস্তুতি', icon: '🏆', description: "৫ম শ্রেণীর শিক্ষার্থীদের জন্য শুরু হওয়া 'প্রাথমিক বৃত্তি পরীক্ষা' বা '৫ম শ্রেণীর বৃত্তি পরীক্ষা'-তে আপনার সন্তানকে সেরাদের সেরা হিসেবে প্রস্তুত করতে আমরা এই কোর্সটি শুরু করেছি।" },
  { 
    title: 'ক্যাডেট ভর্তি পরীক্ষার প্রস্তুতি', 
    icon: '🎖️', 
    description: (
      <div className="text-sm space-y-1">
        <p>সরাসরি ময়মনসিংহ থেকে পরিচালিত</p>
        <p className="mb-3">সাতক্ষীরা শাখা: STAR KIDS ক্যাডেট কেয়ার</p>
        <div className="text-center space-y-1">
          <p className="font-bold">ক্যাডেট কোচিং এ আমাদের সাফল্য:</p>
          <p className="font-bold">২০২৬ সাল</p>
        </div>
        <p>সরকারি ক্যাডেট ৭ জন, MCSK খুলনা ১২ জন, MCSF ফরিদপুর ৬ জন মোট ২৫ জন লিখিত পরীক্ষায় উত্তীর্ণ।</p>
        <div className="text-center pt-2">
          <p className="font-bold">২০২৫ সাল</p>
        </div>
        <p>ক্যাডেট লিখিত ভর্তি পরীক্ষায় প্রথম বছরেই- ১৪ জন উত্তীর্ণ</p>
      </div>
    )
  },
  { title: '৮ম শ্রেণীর বৃত্তি পরীক্ষার প্রস্তুতি', icon: '🏅', description: "৮ম শ্রেণীর শিক্ষার্থীদের জন্য শুরু হওয়া 'প্রাথমিক বৃত্তি পরীক্ষা' বা 'জুনিয়ার বৃত্তি পরীক্ষা'-তে আপনার সন্তানকে সেরাদের সেরা হিসেবে গড়ে তুলতে আমরা এই কোর্সটি সাজিয়েছি।" },
  { title: 'SSC ফাইনাল মডেল টেস্ট', icon: '🎓', description: 'SSC পরীক্ষায় সাফল্যের উত্তীর্ণ হতে ও GPA-5.00 নিশ্চিত করতে আমাদের এই কোর্সটি পরিচালিত হয়।' },
];

const ADMINS = [
  { name: 'এ.টি.এম আবু হাসান', role: 'পরিচালক, স্টার কিডস্', image: 'https://i.imgur.com/IiExcyk.jpeg' },
  { name: 'কাজী সাদিকুজ্জামান', role: 'যুগ্ম পরিচালক, স্টার কিডস্', image: 'https://i.imgur.com/HaCtMx5.jpeg' },
];

const EXPERIENCED_TEACHERS = [
  {
    name: 'ফেরদৌস স্যার',
    subject: 'গণিত',
    mobile: '01711240615',
    image: 'https://i.imgur.com/VQ0N7Su.jpeg'
  },
  {
    name: 'মেহেদী স্যার',
    subject: 'পদার্থ ও উচ্চতর গণিত',
    mobile: '01736-095925/ 01811-659033',
    image: 'https://i.imgur.com/fFD6hvE.jpeg'
  },
  {
    name: 'ময়না স্যার',
    subject: 'ইংরেজি, ৮ম শ্রেণীর ক্লাস টিচার',
    mobile: '01926-231843/ 01729644662',
    image: 'https://i.imgur.com/bD0Y9kr.jpeg'
  },
  {
    name: 'রায়হান স্যার',
    subject: 'ষষ্ঠ শ্রেণীর ক্লাস টিচার',
    mobile: '01711968401',
    image: 'https://i.imgur.com/p4yazwM.jpeg'
  },
  {
    name: 'মনি স্যার',
    subject: '৫ম শ্রেণীর ক্লাস টিচার',
    mobile: '01716806208',
    image: 'https://i.imgur.com/SVILI2V.jpeg'
  }
];

const TEACHER_IMAGES = [
  "https://i.imgur.com/RQRXvmF.jpeg",
  "https://i.imgur.com/6dUiYeN.jpeg",
  "https://i.imgur.com/1e4la5S.jpeg",
  "https://i.imgur.com/4n9FYwm.jpeg",
  "https://i.imgur.com/87yxVyp.jpeg",
  "https://i.imgur.com/p4yazwM.jpeg",
  "https://i.imgur.com/dYnhh4h.jpeg",
  "https://i.imgur.com/bD0Y9kr.jpeg",
  "https://i.imgur.com/cigw4Qw.jpeg",
  "https://i.imgur.com/wQwvICG.jpeg"
];

const CLASS_TEACHERS: Teacher[] = [
  { id: 1, name: 'বজলু স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[0], image: TEACHER_IMAGES[0] },
  { id: 2, name: 'সাদ্দাম স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[1], image: TEACHER_IMAGES[1] },
  { id: 3, name: 'আবির স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[2], image: TEACHER_IMAGES[2] },
  { id: 4, name: 'শাহ-আলম স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[3], image: 'https://i.imgur.com/cThNKjS.jpeg' },
  { id: 5, name: 'মনি স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[4], image: 'https://i.imgur.com/SVILI2V.jpeg' },
  { id: 6, name: 'রায়হান স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[5], image: TEACHER_IMAGES[5] },
  { id: 99, name: 'শরীফুল স্যার', role: 'ক্যাডেট মেন্টর', class: 'ক্যাডেট', image: 'https://i.imgur.com/R9GM5UV.jpeg' },
  { id: 7, name: 'শরিফ স্যার (বাণিজ্য)', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[6], image: TEACHER_IMAGES[6] },
  { id: 8, name: 'ময়না স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[7], image: TEACHER_IMAGES[7] },
  { id: 9, name: 'এনামুল স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[8], image: TEACHER_IMAGES[8] },
  { id: 10, name: 'আলিফ স্যার', role: 'শ্রেণী শিক্ষক', class: BENGALI_CLASSES[9], image: TEACHER_IMAGES[9] },
];

const TEACHER_NAMES = [
  "হাসান স্যার", "সাদিক স্যার", "শরিফ স্যার", "মেহেদী স্যার", "ফেরদৌস স্যার",
  "মুজাহিদুল স্যার", "মাহাবুর স্যার", "আবিদ স্যার", "আলিফ স্যার", "এনামুল স্যার",
  "সোহেল স্যার", "ময়না স্যার", "রাসেল স্যার", "জাহিদ স্যার", "শরিফ স্যার (বাণিজ্য)",
  "জগদ্বীশ স্যার", "জয় স্যার", "রায়হান স্যার", "শাওন স্যার", "অনিমেশ স্যার",
  "শরিফুল স্যার", "রাজু স্যার", "সিফাত ম্যাডাম", "আসমা খাতুন ম্যাডাম", "পলাশ স্যার",
  "মনি স্যার", "মো: হাফিজুল স্যার", "ইসমাইল স্যার", "শাহ-আলম স্যার", "মাসুম স্যার",
  "রায়হান স্যার", "শিমুল স্যার (শেফা)", "সানজিদা ম্যাডাম", "আবির স্যার", "জাহিদুল ইসলাম স্যার",
  "শহীদুল্যাহ স্যার", "রুবিনা ম্যাডাম", "ঋতুপর্ণা ম্যাডাম", "সাদ্দাম স্যার", "হালিমা ম্যাডাম",
  "মেহেদী স্যার", "লুৎফুন্নেসা ম্যাডাম", "বজলু স্যার", "মামুন স্যার", "সোলায়মান স্যার",
  "মাসুদ স্যার", "রুবেল স্যার", "খালিদ হাসান স্যার"
];

const TEACHER_MOBILES = [
  "01711-624478/ 01712-266274", "01711-360956/ 01763-870047", "01712-994462", "01736-095925/ 01811-659033", "01711-240615",
  "01717-717282", "-", "01854-009603", "01727-213609", "01927-890213",
  "01732-206182", "01926-231843/ 01729644662", "01916-305462", "01814-601690", "01724-467687",
  "01400-279822", "01342-224184", "01711-968401", "01303-486642", "-",
  "01786-046466", "01602-875437", "01866-287431", "01842-209933", "01927-166288",
  "01716- 806208", "01737-870621", "01617-482288", "01707-149536", "01931-432332",
  "01518-683377/01314-544464", "01948-108718", "01321-942869", "01946-945157", "01958-97561/ 01603-974251",
  "01571-170015", "01947-203098", "01745-715753", "01641-534261", "01738-301389",
  "01742-288652", "-", "01309-654745", "01571-378961", "01756-536803",
  "01794-495809/ 01571-468074", "-", "01819-756984"
];

const TEACHER_SUBJECTS = [
  "পরিচালক", "যুগ্ম পরিচালক", "অর্থনীতি", "পদার্থ ও উচ্চতর গণিত", "গণিত",
  "বাংলা", "রসায়ন", "বিজ্ঞান", "দশম", "নবম",
  "নবম", "অষ্টম", "অষ্টম", "অষ্টম", "সপ্তম",
  "সপ্তম", "সপ্তম", "ষষ্ঠ", "ষষ্ঠ", "ষষ্ঠ",
  "ক্যাডেট", "ক্যাডেট", "ক্যাডেট", "ক্যাডেট", "ক্যাডেট",
  "পঞ্চম", "পঞ্চম", "পঞ্চম", "চতুর্থ", "চতুর্থ",
  "চতুর্থ", "চতুর্থ", "চতুর্থ", "তৃতীয়", "তৃতীয়",
  "তৃতীয়", "তৃতীয়", "তৃতীয়", "দ্বিতীয়", "দ্বিতীয়",
  "দ্বিতীয়", "দ্বিতীয়", "প্রথম", "প্রথম", "কম্পিউটার অপারেটর",
  "কম্পিউটার অপারেটর", "কম্পিউটার অপারেটর", "ফটোকপি অপারেটর"
];

const TEACHER_LIST_DATA = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: TEACHER_NAMES[i] || '',
  subject: TEACHER_SUBJECTS[i] || '',
  mobile: TEACHER_MOBILES[i] || ''
}));

const FEES_DATA = [
  { class: '১ম শ্রেণী', monthly: '১২০০৳', admission: '১৫০০৳', total: '২৭০০৳' },
  { class: '২য় শ্রেণী', monthly: '১২০০৳', admission: '১৫০০৳', total: '২৭০০৳' },
  { class: '৩য় শ্রেণী', monthly: '১৪০০৳', admission: '২০০০৳', total: '৩৪০০৳' },
  { class: '৪র্থ শ্রেণী', monthly: '১৪০০৳', admission: '২০০০৳', total: '৩৪০০৳' },
  { class: '৫ম শ্রেণী', monthly: '১৫০০৳', admission: '২৫০০৳', total: '৪০০০৳' },
  { class: '৬ষ্ঠ শ্রেণী', monthly: '১৫০০৳', admission: '২২০০৳', total: '৩৭০০৳' },
  { class: 'ক্যাডেট', monthly: '৩৫০০৳', admission: '৩৫০০৳', total: '৭০০০৳' },
  { class: '৭ম শ্রেণী', monthly: '১৫০০৳', admission: '২২০০৳', total: '৩৭০০৳' },
  { class: '৮ম শ্রেণী', monthly: '১৫০০৳', admission: '২৩০০৳', total: '৩৮০০৳' },
  { class: '৯ম শ্রেণী', monthly: '১৬০০৳', admission: '২৩০০৳', total: '৩৯০০৳' },
  { class: '১০ম শ্রেণী', monthly: '১৬০০৳', admission: '২৩০০৳', total: '৩৯০০৳' },
];

const BLOG_POSTS: BlogPost[] = [
  { 
    id: 1, 
    title: 'সাতক্ষীরায় স্টার কিডস বৃত্তি উৎসব: সংবর্ধনা পেল ৫৫০ শিক্ষার্থী', 
    excerpt: 'মোট ৫৫০ জন শিক্ষার্থীকে বৃত্তি প্রদান করা হয়েছে। এর মধ্যে ৩৪৮ জন ট্যালেন্টপুলে এবং ২০২ জন...', 
    date: 'Dec 25, 2025', 
    image: 'https://i.imgur.com/hBGKwPY.jpeg',
    link: 'https://patradoot.net/2025/12/25/616109.html'
  },
  { 
    id: 2, 
    title: 'সাতক্ষীরায় স্টার কিডস বৃত্তি উৎসব অনুষ্ঠিত ', 
    excerpt: 'শিক্ষার মান উন্নয়নে শিক্ষার্থীদের উৎসাহ ও উদ্দীপনা বাড়াতে জেলার বিভিন্ন শিক্ষা প্রতিষ্ঠানের শিশু শ্রেণী থেকে দশম শ্রেণীর ২২০২ জন শিক্ষার্থী এ বৃত্তি উৎসবে অংশ...', 
    date: 'Nov 01, 2025', 
    image: 'https://i.imgur.com/9F4gNPL.jpeg',
    link: 'https://patradoot.net/2025/11/01/608299.html?fbclid=IwT01FWAQyRldmZGlkFlA6smXEL1TC-He4Nxyv45juSNgbh75leHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6L693cdgQumzGj45wXCmRroItqa_MmnBkqd_e-rHDNVSzIDNtcizHv8Sr8wg_aem_dCRCmJvb6RG5gaj3xaNDrA'
  },
  { 
    id: 4, 
    title: 'Science Fair: Innovation at its Best', 
    excerpt: 'Celebrating the young innovators of Star Kids who excelled in this year\'s regional science competition...', 
    date: 'February 10, 2024', 
    image: 'https://picsum.photos/seed/science/600/400' 
  },
  { 
    id: 5, 
    title: 'New Library Wing Inauguration', 
    excerpt: 'Expanding horizons with our state-of-the-art new library wing, providing a better learning environment...', 
    date: 'January 20, 2024', 
    image: 'https://picsum.photos/seed/library/600/400' 
  },
];

const ACTIVITIES_IMAGES = [
  "https://i.imgur.com/80GFfoU.jpeg",
  "https://i.imgur.com/BDCKo2d.jpeg",
  "https://i.imgur.com/66UMBHx.jpeg",
  "https://i.imgur.com/dJuMXSF.jpeg",
  "https://i.imgur.com/sCNOLVM.jpeg",
  "https://i.imgur.com/HPKHV9j.jpeg",
  "https://i.imgur.com/fRHkB7i.jpeg",
  "https://i.imgur.com/mDibZkz.jpeg",
  "https://i.imgur.com/d0VA1r0.jpeg",
  "https://i.imgur.com/urAbcus.jpeg",
  "https://i.imgur.com/n9F7QOC.jpeg",
  "https://i.imgur.com/qg6kb0e.jpeg",
  "https://i.imgur.com/Lub6Wpq.jpeg",
  "https://i.imgur.com/PoVafH2.jpeg",
  "https://i.imgur.com/ALjnWo5.jpeg",
  "https://i.imgur.com/zI6dO4s.jpeg",
  "https://i.imgur.com/MxloWnQ.jpeg",
  "https://i.imgur.com/mpZv892.jpeg"
];

// --- Helper Functions ---
function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// --- Components ---

const FreeClassModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Calendar className="text-yellow-600" size={40} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-blue-900 mb-6 leading-tight">
                ফ্রি ক্লাস সার্ভিস
              </h3>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-medium">
                আপনি আমাদের কোচিং থেকে কতটুকু উপকৃত হবেন এটা বোঝার জন্য আমরা সকল শিক্ষার্থীদেরকে এক সপ্তাহ ফ্রি ক্লাস সার্ভিস প্রদান করে থাকি। এক সপ্তাহ ফ্রি ক্লাসের পরে আপনি সিদ্ধান্ত নিতে পারেন যে আপনার সন্তানকে আমাদের কোচিং এ ভর্তি করাবেন কি না।
              </p>

              <div className="pt-8 border-t border-gray-100">
                <p className="text-blue-900 font-black text-lg mb-6">
                  আপনি আপনার সন্তানকে ভর্তি করতে চাইলে
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="bg-[#00a651] text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-500/20 hover:bg-[#008c44] transition-all flex items-center gap-3 mx-auto"
                >
                  ভর্তি নিশ্চিত করুন
                  <ChevronRight />
                </motion.button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-yellow-400/10 rounded-full"></div>
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-900/5 rounded-full"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ImageLightbox = ({ 
  src, 
  caption,
  isOpen, 
  onClose 
}: { 
  src: string | null, 
  caption?: string | null,
  isOpen: boolean, 
  onClose: () => void 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen]);

  if (!isOpen || !src) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center pointer-events-none">
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto z-10">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.5, 4))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={24} />
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={24} />
            </button>
            <button 
              onClick={() => { setZoom(1); setRotation(0); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Reset"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Image Container */}
          <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <motion.img
                src={src}
                alt="Zoomed view"
                style={{ 
                  scale: zoom,
                  rotate: `${rotation}deg`,
                }}
                className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                referrerPolicy="no-referrer"
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
              />
            </motion.div>
            
            {/* Caption */}
            {caption && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 bg-blue-900/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl border border-white/10 shadow-2xl"
              >
                <p className="text-lg font-black tracking-tight">{caption}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

const VideoModal = ({ 
  url, 
  isOpen, 
  onClose 
}: { 
  url: string | null, 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  if (!isOpen || !url) return null;

  // Try to convert share URLs to a more standard format if needed
  let finalUrl = url;
  if (url.includes('facebook.com/share/v/')) {
    const parts = url.split('/');
    const id = parts[parts.length - 1] || parts[parts.length - 2];
    if (id) {
      finalUrl = `https://www.facebook.com/video.php?v=${id}`;
    }
  }

  // Encode the URL for the Facebook plugin
  const encodedUrl = encodeURIComponent(finalUrl);
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560&t=0&autoplay=1`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 border border-white/10">
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
              title="Open in Facebook"
            >
              <ExternalLink size={20} />
            </a>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="aspect-video w-full">
            <iframe 
              src={embedUrl} 
              className="w-full h-full border-none overflow-hidden" 
              scrolling="no" 
              frameBorder="0" 
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
          
          <div className="p-4 bg-zinc-900 border-t border-white/5 flex justify-between items-center">
            <p className="text-zinc-400 text-xs md:text-sm font-medium">
              ভিডিওটি লোড না হলে উপরের আইকনে ক্লিক করে সরাসরি ফেসবুকে দেখুন।
            </p>
            <button 
              onClick={onClose}
              className="text-white text-sm font-bold hover:text-yellow-400 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

const Navbar = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'হোম', href: '#' },
    { name: 'আমাদের সম্পর্কে', href: '#about' },
    { name: 'ক্লাসসমূহ', href: '#classes' },
    { name: 'শিক্ষকবৃন্দ', href: '#faculty' },
    { name: 'ভর্তি', href: '#admission' },
    { name: 'ব্লগ', href: '#blog' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="https://i.imgur.com/PmCP59l.png" 
              alt="STAR KIDS Logo" 
              className="w-12 h-12 object-contain cursor-pointer hover:scale-110 transition-transform"
              referrerPolicy="no-referrer"
              onClick={() => onImageClick("https://i.imgur.com/PmCP59l.png")}
            />
            <span className={`text-2xl font-bold tracking-tighter ${scrolled ? 'text-blue-900' : 'text-white'}`}>
              STAR KIDS
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-yellow-400 ${scrolled ? 'text-blue-900' : 'text-white'}`}
              >
                {link.name}
              </a>
            ))}
            <a href="#admission" className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-all transform hover:scale-105">
              Apply Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={scrolled ? 'text-blue-900' : 'text-white'}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white shadow-xl absolute w-full top-full left-0 border-t border-gray-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-bold text-blue-900 border-b border-gray-50 hover:bg-blue-50"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ 
  onImageClick, 
  onVideoClick 
}: { 
  onImageClick: (src: string, caption?: string) => void,
  onVideoClick: (url: string) => void 
}) => {
  const heroImg = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=2000";
  return (
    <section className="relative h-auto flex items-start overflow-hidden pb-4 md:pb-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg}
          alt="School Background" 
          className="w-full h-full object-cover cursor-pointer"
          referrerPolicy="no-referrer"
          onClick={() => onImageClick(heroImg)}
        />
        <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white pt-32 md:pt-44">
        <div className="max-w-2xl">
          <div className="inline-flex items-start gap-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 px-4 py-2 rounded-xl text-yellow-400 font-bold text-sm mb-6 -mt-2">
            <Award size={16} className="mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span>মানসম্মত শিক্ষায় ২০১০ সাল</span>
              <span>থেকে অভিজ্ঞতায় সমৃদ্ধ, শিক্ষায় অনন্য</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tighter">
            উন্নত আগামীর লক্ষ্য, <span className="text-yellow-400">আমাদের প্রতিদিনের পথচলা</span>
          </h1>
          <div className="text-gray-200 mb-6 leading-relaxed">
            <div className="inline-block bg-[#000080] text-yellow-400 px-4 py-2 rounded-lg text-lg font-bold mb-3">
              Star Kids-এ আপনাকে স্বাগতম!
            </div>
            <p className="text-lg">
              আধুনিক পাঠদান ও নৈতিক শিক্ষার সমন্বয়ে আমরাই গড়বো আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ। যেখানে আধুনিক শিক্ষা ও শেকড়ের মূল্যবোধের হাত ধরে শুরু হয় আগামীর পথচলা।
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-2 md:gap-3 items-center justify-center mt-8">
          <button 
            onClick={() => onVideoClick("https://www.facebook.com/reel/1447504966929955/")}
            className="bg-yellow-400 text-blue-900 px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold text-[12px] md:text-base hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg shadow-yellow-400/20 whitespace-nowrap"
          >
            Explore Our Campus
          </button>
          <button 
            onClick={() => onVideoClick("https://www.facebook.com/reel/863585792893727/")}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold text-[12px] md:text-base hover:bg-white/20 transition-all whitespace-nowrap"
          >
            Watch Video Tour
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-yellow-400/10 blur-3xl rounded-full -mb-20 -mr-20"></div>
    </section>
  );
};

const NoticeBoard = () => {
  const [currentNotice, setCurrentNotice] = useState(0);
  const notices = [
    "আগামী ২৮ মার্চ, ২০২৬ থেকে কোচিং এর সময়সূচী: সকাল (৬:৩০টা থেকে ৮:৪৫) এবং বিকাল (৩:০০টা থেকে ৫:১৫)",
    "এই সপ্তাহের সাপ্তাহিক পরীক্ষা অনুষ্ঠিত হবে ২৯ মার্চ।",
    "আগামী সোমবার ৩০ মার্চ থেকে যথারীতি কোচিংয়ের কার্যক্রম চলবে।",
    "শ্রেণী কার্যক্রম নিয়ে কিংবা কোনো অনিয়ম বা অসঙ্গতি ধরা পড়লে অভিযোগের জন্য সরাসরি অফিস কক্ষে যোগাযোগ করুন।"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNotice((prev) => (prev + 1) % notices.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [notices.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-12">
      <div className="relative group">
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-yellow-400 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Title Section */}
            <div className="bg-blue-900 text-white px-8 py-6 flex items-center gap-4 shrink-0">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight">নোটিশ বোর্ড</span>
              </div>
            </div>

            {/* Content Section - Fixed Height to prevent jumping */}
            <div className="flex-1 p-6 md:px-10 flex items-center">
              <div className="w-full relative h-20 md:h-16 flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentNotice}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center"
                  >
                    <p className="text-blue-950 font-bold text-sm md:text-lg leading-snug">
                      {notices[currentNotice]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Action Section */}
            <div className="hidden lg:flex items-center px-8 border-l border-blue-900/5">
              <button className="group/btn flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">
                View All
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  const allPoints = [
    'দক্ষ ও প্রশিক্ষিত শিক্ষক',
    'ক্লাসে প্রতিটা বিষয়ের জন্য অতিরিক্ত শিক্ষক',
    'প্রতিদিনের বাড়ির কাজ পর্যবেক্ষণ',
    'বিভিন্ন বিষয়ে সাপ্তাহিক পরীক্ষা',
    'WhatsApp-এ মাসিক ফলাফল প্রকাশ',
    'সুশৃঙ্খল পরিবেশ',
    'অভিভাবকের যেকোনো অভিযোগ গুরুত্বের সাথে বিবেচনা করা',
    'স্কুলের সিলেবাসের সাথে মিল রেখে শ্রেণী কার্যক্রম পরিচালনা'
  ];

  const visiblePoints = isExpanded ? allPoints : allPoints.slice(0, 4);

  return (
    <section id="about" className="pt-4 pb-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="">
            <h2 className="text-blue-900 text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-8 h-1 bg-yellow-400"></div>
              আমাদের প্রতিষ্ঠান সম্পর্কে
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-blue-900 mb-8 leading-tight">
              <span className="block">আপনার সন্তানের</span>
              <span className="text-yellow-500">স্বপ্নের শুরু</span> এখানেই
            </h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              প্রতিটি শিশুই অদ্বিতীয়। STAR KIDS-এ আমরা প্রতিটি শিক্ষার্থীর স্বতন্ত্র মেধার মূল্যায়ন করি। পুঁথিগত বিদ্যার পাশাপাশি আমরা তাদের চিন্তাশক্তি ও ব্যক্তিত্ব বিকাশে কাজ করি, যাতে তারা আগামীর চ্যালেঞ্জ মোকাবিলায় আত্মবিশ্বাসী হয়ে ওঠে।
            </p>
            
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              {visiblePoints.map((item, index) => (
                <div 
                  key={item} 
                  className="flex items-center gap-3"
                >
                  <div className="text-yellow-500 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-blue-900 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>

            {!isExpanded && (
              <button 
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 text-yellow-600 font-bold hover:text-yellow-700 transition-colors mb-12"
              >
                আরো দেখুন <ChevronDown size={20} className="animate-bounce" />
              </button>
            )}

            {isExpanded && (
              <button 
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 text-yellow-600 font-bold hover:text-yellow-700 transition-colors mb-12"
              >
                সংক্ষিপ্ত করুন <ChevronUp size={20} />
              </button>
            )}

            {/* Activities Section */}
            <div id="activities" className="mt-12">
              <h3 className="text-3xl font-black text-blue-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-1.5 bg-yellow-400 rounded-full"></div>
                কার্যক্রম
              </h3>
              
              <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-8 px-1 custom-scrollbar snap-x scroll-smooth">
                  {ACTIVITIES_IMAGES.slice(0, 10).map((src, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="shrink-0 w-72 aspect-[4/3] rounded-3xl overflow-hidden shadow-lg cursor-pointer snap-center border-4 border-white"
                      onClick={() => onImageClick(src)}
                    >
                      <img 
                        src={src} 
                        alt={`Activity ${i+1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                  
                  {/* Arrow button for all activities - Enhanced for Mobile */}
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#fbbf24' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllActivities(true)}
                    className="shrink-0 w-32 md:w-40 aspect-[4/3] bg-blue-50 rounded-3xl flex flex-col items-center justify-center text-blue-900 transition-all shadow-lg border-4 border-white group/btn snap-center z-10"
                  >
                    <div className="bg-white/50 p-3 rounded-full group-hover/btn:bg-white transition-colors mb-2">
                      <ChevronRight size={32} className="md:w-10 md:h-10" />
                    </div>
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest">সবগুলো দেখুন</span>
                  </motion.button>
                  
                  {/* Extra padding for mobile scroll */}
                  <div className="shrink-0 w-4 md:hidden"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Activities Modal */}
      <AnimatePresence>
        {showAllActivities && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllActivities(false)}
              className="absolute inset-0 bg-blue-950/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-7xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-blue-900 p-8 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-3xl font-black text-white">আমাদের সকল কার্যক্রম</h3>
                  <p className="text-blue-200 font-bold mt-1">STAR KIDS Photo Gallery</p>
                </div>
                <button 
                  onClick={() => setShowAllActivities(false)} 
                  className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all active:scale-90 text-white"
                >
                  <X size={32} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ACTIVITIES_IMAGES.map((src, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md cursor-pointer group border-4 border-white"
                      onClick={() => onImageClick(src)}
                    >
                      <img 
                        src={src} 
                        alt={`Activity ${i+1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" size={32} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ClassesSection = () => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  return (
    <section id="classes" className="pt-4 pb-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-900 text-sm font-black uppercase tracking-widest mb-4">একাডেমিক প্রোগ্রাম</h2>
          <h3 className="text-4xl md:text-5xl font-black text-blue-900">
            <span className="block">শ্রেণীভিত্তিক</span>
            <span>বিস্তারিত তথ্য</span>
          </h3>
          <p className="text-[9px] md:text-sm font-black text-blue-900/60 mt-3 whitespace-nowrap bg-white/50 inline-block px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
            আপনার প্রয়োজনীয় ক্লাসের উপর ক্লিক করে প্রতিদিনের তথ্য সংগ্রহ করুন
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {CLASSES.map((cls) => (
            <motion.button
              key={cls.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedClass(cls)}
              className="w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] lg:w-[calc(20%-20px)] bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-blue-100 group text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400 transition-colors">
                <GraduationCap className="text-blue-900" size={32} />
              </div>
              <span className="text-xl font-black text-blue-900">{cls.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-yellow-400 p-6 md:p-8 text-blue-900 shrink-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-2xl md:text-3xl font-black">{selectedClass.name}</h4>
                  <button onClick={() => setSelectedClass(null)} className="hover:bg-blue-900/10 p-1 rounded-lg transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto">
                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">{selectedClass.description}</p>
                
                <h5 className="font-black text-blue-900 mb-4 uppercase text-xs md:text-sm tracking-widest">যে যে বিষয় পড়ানো হয়</h5>
                <div className="space-y-6 mb-8">
                  {Array.isArray(selectedClass.subjects) ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.subjects.map(s => (
                        <span key={s} className="bg-blue-50 text-blue-900 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    Object.entries(selectedClass.subjects).map(([category, subjects]) => (
                      <div key={category}>
                        <h6 className="text-blue-900/60 text-[10px] font-black mb-2 uppercase tracking-wider">{category}</h6>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map(s => (
                            <span key={s} className="bg-blue-50 text-blue-900 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h5 className="font-black text-blue-900 mb-4 uppercase text-xs md:text-sm tracking-widest">শ্রেণীর বেতন ও ভর্তি/ নোট ফি তালিকা</h5>
                <div className="bg-blue-50 p-4 md:p-6 rounded-2xl mb-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-900/60 font-bold text-xs md:text-sm">প্রতি মাসের বেতন:</span>
                      <span className="text-blue-900 font-black text-base md:text-lg">{FEES_DATA[selectedClass.id - 1]?.monthly}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-900/60 font-bold text-xs md:text-sm">ভর্তি/নোট ফি:</span>
                      <span className="text-blue-900 font-black text-base md:text-lg">{FEES_DATA[selectedClass.id - 1]?.admission}</span>
                    </div>
                    <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                      <span className="text-blue-900 font-black text-sm md:text-base">সর্বমোট:</span>
                      <span className="text-blue-900 font-black text-lg md:text-xl text-blue-600">{FEES_DATA[selectedClass.id - 1]?.total}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-blue-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors text-sm md:text-base">
                  Download Syllabus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const FacebookSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-600 text-sm md:text-base font-black uppercase tracking-widest mb-2">আপডেট</h2>
          <h3 className="text-3xl md:text-5xl font-black text-blue-900">আমাদের সাম্প্রতিক কার্যক্রম</h3>
          <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full mt-4"></div>
          <p className="text-gray-500 mt-6 max-w-2xl mx-auto font-medium">
            আমাদের ফেসবুক পেজের মাধ্যমে প্রতিষ্ঠানের প্রতিদিনের আপডেট এবং কার্যক্রম সম্পর্কে জানুন।
          </p>
        </div>

        <div className="relative max-w-[500px] mx-auto">
          {/* Decorative Frame Elements */}
          <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] -z-10 blur-2xl"></div>
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-1 md:p-4 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(30,58,138,0.15)] border border-blue-50 relative overflow-hidden"
          >
            <div className="w-full overflow-hidden rounded-xl bg-slate-50">
              <iframe 
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fstarkidssatkhira&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                width="100%" 
                height="800" 
                style={{ border: 'none', overflow: 'hidden', minHeight: '600px' }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Star Kids Facebook Page"
              ></iframe>
            </div>
            
            <div className="mt-4 md:mt-6 pb-4 text-center">
              <a 
                href="https://www.facebook.com/starkidssatkhira" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 font-black hover:text-blue-800 transition-colors"
              >
                <span>ফেসবুক পেজে ভিজিট করুন</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CoursesSection = () => {
  return (
    <section id="courses" className="pt-16 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#ff7e5f] text-sm md:text-base font-black uppercase tracking-widest mb-2">বিশেষ শিক্ষা কার্যক্রম</h2>
          <h3 className="text-3xl md:text-5xl font-black text-blue-900">আমাদের কোর্সসমূহ</h3>
          <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full mt-4"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map((course, index) => (
            <motion.div
              key={index}
              initial="initial"
              whileHover="hover"
              variants={{
                initial: { y: 0 },
                hover: { y: -10 }
              }}
              className="bg-blue-50/20 p-8 rounded-3xl border border-blue-100/50 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="text-4xl mb-6">{course.icon}</div>
              <h4 className="text-lg md:text-xl lg:text-2xl font-black text-blue-900 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                {course.title}
              </h4>
              <div className="text-gray-600 leading-relaxed flex-grow">
                {course.description}
              </div>
              
              {/* Animated Yellow Line */}
              <motion.div
                variants={{
                  initial: { width: "2rem" },
                  hover: { width: "6rem" }
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-1.5 bg-yellow-400 rounded-full mt-6"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Administration = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  return (
    <section id="administration" className="pt-4 pb-24 bg-[#1a368d] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-yellow-400 text-lg md:text-xl font-black uppercase tracking-[0.2em] mb-4">STAR KIDS এর</h2>
          <h3 className="text-4xl md:text-6xl font-black leading-tight">নেতৃত্ব ও দিকনির্দেশনায়</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-16 md:gap-12 justify-center">
          {ADMINS.map((admin, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer max-w-[340px] mx-auto w-full"
              onClick={() => onImageClick(admin.image, admin.name)}
            >
              {/* Image Container with Blurred Border / Glow Effect */}
              <div className="relative aspect-square w-full mb-6 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-yellow-500 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_60px_rgba(250,204,21,0.6)] bg-blue-950">
                <img 
                  src={admin.image} 
                  alt={admin.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              {/* Text Styling matching Screenshot 1 */}
              <div className="text-center space-y-1">
                <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {admin.name}
                </h4>
                <p className="text-yellow-400 text-lg md:text-xl font-bold">
                  {admin.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ChiefCoordinatorSection = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  const [showMobile, setShowMobile] = useState(false);

  return (
    <section id="chief-coordinator" className="pt-4 pb-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-[#ff7e5f] text-lg md:text-xl font-black uppercase tracking-widest mb-2">STAR KIDS এর</h2>
          <h3 className="text-3xl md:text-5xl font-black text-[#1e3a8a] mb-8">অ্যাডমিন প্যানেল</h3>
          <div className="w-32 h-1.5 bg-yellow-400 rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100 cursor-pointer group relative flex flex-col md:flex-row"
            onClick={() => onImageClick('https://i.imgur.com/JnVQU7z.jpeg', 'অ্যাডমিন, STAR KIDS')}
          >
            {/* Image Part */}
            <div className="relative h-[350px] md:h-[420px] w-full md:w-1/2 overflow-hidden bg-[#2d0a4e]">
              <img 
                src="https://i.imgur.com/JnVQU7z.jpeg" 
                alt="অ্যাডমিন" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Gradient Overlay for text readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:hidden"></div>
              
              {/* Zoom Icon Overlay */}
              <div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-yellow-400 p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="text-blue-900 w-6 h-6" />
                </div>
              </div>
              
              {/* Mobile Toggle Button (Only visible/needed on mobile) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobile(!showMobile);
                }}
                className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 border border-white/10 md:hidden ${
                  showMobile ? 'bg-yellow-400 text-blue-900 rotate-180' : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
                }`}
              >
                <ChevronDown size={20} />
              </button>

              {/* Text Overlay for Mobile (Hidden on Desktop) */}
              <div className="absolute bottom-8 left-8 right-8 md:hidden">
                <h4 className="text-2xl font-black text-white mb-1 tracking-tight">এ.কে.এম শরিফুজ্জামান</h4>
                <p className="text-yellow-400 font-black text-base">অ্যাডমিন, STAR KIDS</p>
              </div>
            </div>

            {/* Content Part (Desktop/Tablet) */}
            <div className="hidden md:flex w-1/2 p-8 flex-col justify-center bg-gradient-to-br from-white to-blue-50/30">
              <div className="space-y-6">
                <div>
                  <h4 className="text-3xl md:text-4xl font-black text-[#1e3a8a] mb-2 tracking-tight leading-tight">
                    এ.কে.এম <br /> শরিফুজ্জামান
                  </h4>
                  <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-1.5 rounded-full font-black text-sm mt-2">
                    অ্যাডমিন, STAR KIDS
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="bg-white rounded-3xl p-5 flex items-center gap-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <Phone size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-0.5">সরাসরি যোগাযোগ</p>
                      <p className="text-[#1e3a8a] font-black text-xl">01712994462</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Contact Info (Conditional) */}
            <AnimatePresence>
              {showMobile && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white overflow-hidden md:hidden"
                >
                  <div className="p-10 pt-0 mt-10">
                    <div className="bg-[#f0f7ff] rounded-[2rem] p-5 flex items-center gap-4 border border-blue-50">
                      <div className="w-12 h-12 bg-blue-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
                        <Phone size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-blue-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-0.5">মোবাইল নম্বর</p>
                        <p className="text-[#1e3a8a] font-black text-lg md:text-xl">01712994462</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
    </div>
  </section>
);
};

const ExperiencedTeachers = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  return (
    <section id="experienced" className="pt-4 pb-24 bg-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-200/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-[#ff7e5f] text-lg font-black mb-2 tracking-tight">STAR KIDS এর</h2>
          <h3 className="text-3xl md:text-5xl font-black text-[#1e3a8a] mb-8 leading-tight">
            সিনিয়র শিক্ষকদের প্যানেল
          </h3>
          <div className="w-32 h-1.5 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Grid Section - 2 columns on mobile, 3 on desktop/tablet */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {EXPERIENCED_TEACHERS.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`bg-white p-3 md:p-6 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center text-center border border-blue-50 hover:border-yellow-500 transition-all duration-300 cursor-pointer group ${index === 4 ? 'col-start-1 col-end-3 translate-x-0 md:col-start-auto md:col-end-auto mx-auto w-full max-w-[calc(50%-0.5rem)] md:max-w-none' : ''}`}
                onClick={() => onImageClick(teacher.image, teacher.name)}
              >
                {/* Purple Image Container */}
                <div className="w-full aspect-square bg-[#2d0a4e] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-4 relative">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  {/* Zoom Icon Overlay */}
                  <div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-yellow-400 p-2 md:p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="text-blue-900 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                </div>

              {/* Text Content */}
              <h4 className="text-xl md:text-2xl font-black text-[#1e3a8a] mb-0.5 md:mb-1">{teacher.name}</h4>
              <p className="text-blue-900/60 font-bold text-[10px] md:text-base mb-1 md:mb-2 line-clamp-1">
                {teacher.subject}
              </p>
              
              {/* Mobile Number Box */}
              <div className="w-full py-2 md:py-3 px-2 md:px-4 bg-[#f0f7ff] border-2 border-blue-50 rounded-xl md:rounded-2xl text-[#1e3a8a] font-black text-[10px] md:text-lg shadow-sm">
                {teacher.mobile.split('/')[0].trim()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ClassTeachers = ({ onImageClick, onFreeClassClick }: { onImageClick: (src: string, caption?: string) => void, onFreeClassClick: () => void }) => {
  const filteredTeachers = CLASS_TEACHERS.filter(t => BENGALI_CLASSES.includes(t.class) || t.class === 'ক্যাডেট');

  return (
    <section className="pt-4 pb-24 bg-white" id="class-teachers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-900 text-sm font-black uppercase tracking-widest mb-4">আমাদের মেন্টরবৃন্দ</h2>
          <h3 className="text-4xl md:text-5xl font-black text-blue-900">শ্রেণী শিক্ষক</h3>
        </div>

        <div className="flex flex-wrap justify-center -mx-4 gap-y-12">
          {filteredTeachers.map((teacher) => (
            <motion.div 
              key={teacher.id} 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-1/2 md:w-1/4 px-4 text-center group cursor-pointer"
              onClick={() => onImageClick(teacher.image)}
            >
              <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative w-full h-full overflow-hidden rounded-full border-4 border-white shadow-xl">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white" size={20} />
                  </div>
                </div>
              </div>
              <h4 className="text-base md:text-lg font-black text-blue-900 mb-2">{teacher.name}</h4>
              <div className="inline-block px-4 py-1.5 bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg ring-1 ring-black/5">
                <p className="text-[10px] md:text-xs text-blue-900 font-black tracking-wide">{teacher.class}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free Class CTA Button */}
        <div className="mt-20 flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFreeClassClick}
            className="bg-[#00a651] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-sm md:text-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(0,166,81,0.3)] hover:bg-[#008c44] transition-all group"
          >
            ফ্রি ক্লাস করুন
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const convertBengaliToStandard = (str: string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.split('').map(char => {
    const index = bengaliDigits.indexOf(char);
    return index !== -1 ? index : char;
  }).join('');
};

interface TeacherData {
  id: number;
  name: string;
  subject: string;
  mobile: string;
}

const GeneralFaculty = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="faculty" className="pt-4 pb-24 bg-blue-50/30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-blue-900 text-sm md:text-base font-black uppercase tracking-widest mb-2">আমাদের অভিজ্ঞ ও দক্ষ</h2>
          <h3 className="text-4xl md:text-6xl font-black text-blue-900 tracking-tighter">শিক্ষকদের প্যানেল</h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 mb-4 sticky top-0 z-10">
          <div className="col-span-3 bg-[#1e3a8a] text-white py-3 md:py-4 px-2 md:px-6 rounded-l-2xl font-black text-[10px] md:text-lg flex items-center justify-center md:justify-start">
            নাম
          </div>
          <div className="col-span-6 bg-[#facc15] text-blue-900 py-3 md:py-4 px-2 md:px-6 font-black text-[10px] md:text-lg flex items-center justify-center md:justify-start">
            মোবাইল নাম্বার
          </div>
          <div className="col-span-3 bg-[#2563eb] text-white py-3 md:py-4 px-2 md:px-6 rounded-r-2xl font-black text-[10px] md:text-lg flex items-center justify-center md:justify-start">
            শ্রেণী/বিষয়
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3 mb-12">
          {TEACHER_LIST_DATA.slice(0, 10).map((teacher) => (
            <motion.div 
              key={teacher.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-12 gap-1 group"
            >
              <div className="col-span-3 bg-[#e0f2fe] text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 rounded-l-2xl font-black text-[10px] md:text-base flex items-center justify-center md:justify-start group-hover:bg-blue-100 transition-colors">
                {teacher.name}
              </div>
              <div className={`col-span-6 bg-[#fefce8] text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 font-black flex items-center justify-center md:justify-start group-hover:bg-yellow-50 transition-colors overflow-hidden ${teacher.mobile.includes('/') ? 'text-[8px] md:text-sm' : 'text-[10px] md:text-base'}`}>
                {teacher.mobile === '-' ? (
                  <span>-</span>
                ) : (
                  <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                    {teacher.mobile.split('/').map((num, idx) => (
                      <React.Fragment key={idx}>
                        <a 
                          href={`tel:${convertBengaliToStandard(num.replace(/[-\s()]/g, ''))}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {num.trim()}
                        </a>
                        {idx < teacher.mobile.split('/').length - 1 && <span className="text-gray-400 mx-0.5 md:mx-1">/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-3 bg-[#e0f2fe] text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 rounded-r-2xl font-black text-[10px] md:text-base flex items-center justify-center md:justify-start group-hover:bg-blue-100 transition-colors">
                {teacher.subject}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(true)}
            className="bg-[#1e3a8a] text-white px-12 py-5 rounded-2xl font-black text-lg md:text-xl shadow-[0_10px_30px_rgba(30,58,138,0.3)] flex items-center gap-3 mx-auto group"
          >
            Search Your Teachers (48)
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showAll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAll(false)}
              className="absolute inset-0 bg-blue-900/40 backdrop-blur-xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col border border-white/20 h-[90vh]"
            >
              <div className="bg-blue-900 p-8 sm:p-10 text-white flex justify-between items-center">
                <div>
                  <h4 className="text-3xl sm:text-4xl font-black">শিক্ষকদের প্যানেল তালিকা</h4>
                  <p className="text-blue-200 font-bold mt-2">Total Teachers: 48</p>
                </div>
                <button 
                  onClick={() => setShowAll(false)} 
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90"
                >
                  <X size={32} />
                </button>
              </div>
              <div className="p-4 md:p-10 overflow-y-auto custom-scrollbar flex-grow bg-blue-50/30">
                {/* Table Header for Modal */}
                <div className="grid grid-cols-12 gap-1 mb-4 sticky top-0 z-10">
                  <div className="col-span-3 bg-[#1e3a8a] text-white py-3 md:py-4 px-2 md:px-6 rounded-l-2xl font-black text-[10px] md:text-lg flex items-center">
                    নাম
                  </div>
                  <div className="col-span-6 bg-[#facc15] text-blue-900 py-3 md:py-4 px-2 md:px-6 font-black text-[10px] md:text-lg flex items-center">
                    মোবাইল নাম্বার
                  </div>
                  <div className="col-span-3 bg-[#2563eb] text-white py-3 md:py-4 px-2 md:px-6 rounded-r-2xl font-black text-[10px] md:text-lg flex items-center">
                    শ্রেণী/বিষয়
                  </div>
                </div>

                <div className="space-y-2">
                  {TEACHER_LIST_DATA.map((teacher, idx) => (
                    <motion.div 
                      key={teacher.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % 10) * 0.05 }}
                      className="grid grid-cols-12 gap-1 group"
                    >
                      <div className="col-span-3 bg-white text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 rounded-l-2xl font-black text-[10px] md:text-base flex items-center group-hover:bg-blue-50 transition-colors border-y border-l border-blue-100">
                        {teacher.name}
                      </div>
                      <div className={`col-span-6 bg-white text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 font-black flex items-center justify-center md:justify-start group-hover:bg-yellow-50 transition-colors border-y border-blue-100 overflow-hidden ${teacher.mobile.includes('/') ? 'text-[8px] md:text-sm' : 'text-[10px] md:text-base'}`}>
                        {teacher.mobile === '-' ? (
                          <span>-</span>
                        ) : (
                          <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                            {teacher.mobile.split('/').map((num, idx) => (
                              <React.Fragment key={idx}>
                                <a 
                                  href={`tel:${convertBengaliToStandard(num.replace(/[-\s()]/g, ''))}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {num.trim()}
                                </a>
                                {idx < teacher.mobile.split('/').length - 1 && <span className="text-gray-400 mx-0.5 md:mx-1">/</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 bg-white text-[#1e3a8a] py-3 md:py-4 px-2 md:px-6 rounded-r-2xl font-black text-[10px] md:text-base flex items-center group-hover:bg-blue-50 transition-colors border-y border-r border-blue-100">
                        {teacher.subject}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const IT_TEAM = [
  {
    name: 'মাসুদ স্যার',
    role: 'কম্পিউটার এবং সোশ্যাল মিডিয়া অপারেটর',
    mobile: '01794495809/ 01571468074',
    image: 'https://i.imgur.com/XnhBGsS.jpeg',
    color: 'bg-blue-600'
  },
  {
    name: 'সুলাইমান স্যার',
    role: 'কম্পিউটার এবং সোশ্যাল মিডিয়া অপারেটর',
    mobile: '01756536803',
    image: 'https://i.imgur.com/iCR7vAQ.jpeg',
    color: 'bg-yellow-400'
  },
  {
    name: 'রুবেল স্যার',
    role: 'কম্পিউটার অপারেটর',
    mobile: '',
    image: 'https://i.imgur.com/80wgHM4.jpeg',
    color: 'bg-sky-500'
  },
  {
    name: 'খালিদ হাসান স্যার',
    role: 'ফটোকপি অপারেটর',
    mobile: '',
    image: 'https://i.imgur.com/yQhGbDD.jpeg',
    color: 'bg-indigo-600'
  }
];

const ITDepartment = () => {
  const [selectedMember, setSelectedMember] = useState<typeof IT_TEAM[0] | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);

  return (
    <section className="pt-4 pb-24 bg-slate-50 relative overflow-hidden border-y border-slate-200/60">
      {/* Background design */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-yellow-600 text-sm sm:text-base font-black uppercase tracking-widest mb-2"
          >
            STAR KIDS এর
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-blue-900"
          >
            IT ও কম্পিউটার সেকশন
          </motion.h3>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "6rem" }}
            viewport={{ once: true }}
            className="h-1.5 bg-yellow-400 mx-auto rounded-full mt-4"
          ></motion.div>
        </div>

        {/* Mallick Abid Hasan - Main IT Box */}
        <div className="max-w-md mx-auto mb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDesigner(true)}
            className="w-full bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl text-center group relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-400/20 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-blue-400/20 transition-all"></div>
            
            <div className="relative z-10">
              <h4 className="text-white text-2xl font-black mb-1">মল্লিক আবিদ হাসান</h4>
              <p className="text-blue-200 text-xs font-bold">IT Specialist, Web Designer & Teacher</p>
            </div>

            {/* Animated Click Icon */}
            <motion.div
              animate={{
                x: [10, -5, 10],
                y: [10, -5, 10],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-4 right-4 text-yellow-400 opacity-80 pointer-events-none"
            >
              <MousePointer2 size={32} fill="currentColor" />
            </motion.div>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          {IT_TEAM.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMember(member)}
              className={`${member.color} p-6 rounded-3xl shadow-xl cursor-pointer relative group overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] hover:scale-105 transition-transform duration-300 border border-white/20`}
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <h4 className={`text-xl sm:text-2xl font-black ${member.color === 'bg-yellow-400' ? 'text-blue-900' : 'text-white'} mb-2`}>
                {member.name}
              </h4>

              {/* Clicking Hand Animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  ease: "easeInOut"
                }}
                className={`absolute bottom-4 right-4 ${member.color === 'bg-yellow-400' ? 'text-blue-900' : 'text-white'}`}
              >
                <MousePointer2 size={24} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm"
              onClick={() => setSelectedMember(null)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative aspect-square">
                <img 
                  src={selectedMember.image} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-3xl font-black mb-1">{selectedMember.name}</h3>
                  <p className="text-yellow-400 font-bold">{selectedMember.role}</p>
                </div>
              </div>

              <div className="p-8">
                {selectedMember.mobile && (
                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl">
                    <div className="bg-blue-600 text-white p-3 rounded-xl">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900/60 uppercase tracking-widest">মোবাইল নম্বর</p>
                      <p className="text-lg font-black text-blue-900">{selectedMember.mobile}</p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="w-full mt-6 bg-blue-900 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Designer Popup Modal */}
      <AnimatePresence>
        {showDesigner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm"
              onClick={() => setShowDesigner(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowDesigner(false)}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                <div className="flex flex-col md:flex-row items-center gap-8 bg-blue-50 p-8 rounded-[2rem]">
                  <div className="relative w-32 h-32 shrink-0">
                    <img 
                      src="https://i.imgur.com/lwGOaKs.jpeg" 
                      alt="Mallick Abid Hasan" 
                      className="w-full h-full object-cover rounded-[2rem] border-4 border-white shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-black text-blue-900 mb-1">Mallick Abid Hasan</div>
                    <div className="text-sm font-bold text-blue-900 uppercase tracking-widest opacity-80 mb-4">
                      Website Designer<br/>& Star Kids Teacher<br/>
                      <span className="normal-case font-black text-xs mt-1 block">(General Science & Math)</span>
                    </div>
                    
                    <div className="flex justify-center md:justify-start gap-3">
                      <a href="https://youtube.com/@analysisbyabidhasan" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-yellow-400 hover:text-blue-900 transition-all"><Youtube size={18} /></a>
                      <a href="https://www.facebook.com/MallickAbidHasan360" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-yellow-400 hover:text-blue-900 transition-all"><Facebook size={18} /></a>
                      <a href="https://www.tiktok.com/@thehistoricalanalysis" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-yellow-400 hover:text-blue-900 transition-all"><Music2 size={18} /></a>
                      <a href="https://t.me/Granthagara" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-yellow-400 hover:text-blue-900 transition-all"><Send size={18} /></a>
                      <a href="https://wa.me/+8801854009603" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-yellow-400 hover:text-blue-900 transition-all"><Phone size={18} /></a>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowDesigner(false)}
                  className="w-full mt-8 bg-blue-900 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const BlogSection = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  const [showAllBlogs, setShowAllBlogs] = useState(false);

  return (
    <section id="blog" className="pt-4 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="max-w-xl text-left">
            <h2 className="text-blue-900 text-sm font-black uppercase tracking-widest mb-4">ক্যাম্পাস আপডেট ও নোটিশ</h2>
            <h3 className="text-4xl md:text-5xl font-black text-blue-900">আমাদের সর্বশেষ ব্লগ</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {BLOG_POSTS.slice(0, 2).map((post) => (
            <article key={post.id} className="group cursor-pointer" onClick={() => onImageClick(post.image)}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white" size={32} />
                </div>
                <div className="absolute top-4 left-4 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-xs font-black">
                  {post.date}
                </div>
              </div>
              <h4 className="text-2xl font-black text-blue-900 mb-3 group-hover:text-yellow-600 transition-colors">{post.title}</h4>
              <p className="text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
              {post.link ? (
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-900 font-bold flex items-center gap-1 hover:text-yellow-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  আরো পড়ুন <ChevronRight size={16} />
                </a>
              ) : (
                <span className="text-blue-900 font-bold flex items-center gap-1">
                  Read More <ChevronRight size={16} />
                </span>
              )}
            </article>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => setShowAllBlogs(true)}
            className="bg-blue-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 inline-flex items-center gap-2"
          >
            সকল ব্লগ দেখুন <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* All Blogs Modal */}
      <AnimatePresence>
        {showAllBlogs && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllBlogs(false)}
              className="absolute inset-0 bg-blue-950/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-blue-900 p-6 sm:p-8 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">সকল ব্লগ পোস্ট</h3>
                  <p className="text-blue-200 font-bold mt-1">STAR KIDS ক্যাম্পাস আপডেট ও নোটিশ</p>
                </div>
                <button 
                  onClick={() => setShowAllBlogs(false)} 
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90 text-white"
                >
                  <X size={32} />
                </button>
              </div>
              <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {BLOG_POSTS.map((post) => (
                    <article key={post.id} className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100">
                      <div 
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 cursor-pointer group"
                        onClick={() => onImageClick(post.image)}
                      >
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white" size={24} />
                        </div>
                        <div className="absolute top-3 left-3 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black">
                          {post.date}
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-blue-900 mb-3">{post.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      {post.link ? (
                        <a 
                          href={post.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-900 text-sm font-bold flex items-center gap-1 hover:text-yellow-600 transition-colors"
                        >
                          আরো পড়ুন <ChevronRight size={14} />
                        </a>
                      ) : (
                        <span className="text-blue-900 text-sm font-bold flex items-center gap-1">
                          Read More <ChevronRight size={14} />
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const fetched = useRef(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchAndIncrementCount = async () => {
      const visitorDocRef = doc(db, 'metadata', 'visitorCount');
      try {
        await runTransaction(db, async (transaction) => {
          const visitorDoc = await transaction.get(visitorDocRef);
          if (!visitorDoc.exists()) {
            transaction.set(visitorDocRef, { count: 1 });
            setVisitorCount(1);
          } else {
            const newCount = visitorDoc.data().count + 1;
            transaction.update(visitorDocRef, { count: newCount });
            setVisitorCount(newCount);
          }
        });
      } catch (error) {
        console.error('Error updating visitor count:', error);
        // Fallback: just read the count if increment fails (e.g. permission issues or already incremented in another tab)
        try {
          const visitorDoc = await getDocFromServer(visitorDocRef);
          if (visitorDoc.exists()) {
            setVisitorCount(visitorDoc.data().count);
          }
        } catch (readError) {
          console.error('Error reading visitor count:', readError);
        }
      }
    };
    fetchAndIncrementCount();
  }, []);

  useEffect(() => {
    if (isInView) {
      // Animate student count from 0 to 699
      const controls = animate(0, 720, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          setStudentCount(Math.floor(value));
        },
      });
      return () => controls.stop();
    }
  }, [isInView]);

  const classData = [
    { class: "১ম শ্রেণী", count: "১৯" },
    { class: "২য় শ্রেণী", count: "৩২" },
    { class: "৩য় শ্রেণী", count: "১২৯" },
    { class: "৪র্থ শ্রেণী", count: "৮০" },
    { class: "৫ম শ্রেণী", count: "৭৭" },
    { class: "৬ষ্ঠ শ্রেণী", count: "৫৯" },
    { class: "৭ম শ্রেণী", count: "৯৭" },
    { class: "৮ম শ্রেণী", count: "৭২" },
    { class: "৯ম শ্রেণী", count: "৭২" },
    { class: "১০ম শ্রেণী", count: "৩১" },
    { class: "ক্যাডেট", count: "৫২" },
  ];

  return (
    <section id="stats" ref={sectionRef} className="overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Left Side: Visitor Count */}
        <div className="flex-1 py-20 bg-yellow-400 text-center px-4 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block bg-blue-900 text-white p-4 rounded-3xl mb-6 shadow-xl"
          >
            <Users size={40} />
          </motion.div>
          <div className="text-6xl md:text-8xl font-black text-blue-900 mb-4 tracking-tighter">
            {visitorCount.toLocaleString()}+
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-blue-900">ওয়েবসাইটে ভিজিট করা</p>
            <p className="text-xl font-black text-blue-900 uppercase tracking-widest opacity-80">শিক্ষার্থী ও অভিভাবকের সংখ্যা</p>
          </div>
        </div>

        {/* Right Side: Student Count */}
        <div className="flex-1 py-20 bg-blue-900 text-center px-4 text-white flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block bg-yellow-400 text-blue-900 p-4 rounded-3xl mb-6 shadow-xl"
          >
            <GraduationCap size={40} />
          </motion.div>
          <div className="text-6xl md:text-8xl font-black text-yellow-400 mb-4 tracking-tighter">
            {studentCount}+
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-white">বর্তমানে STAR KIDS-এ</p>
            <p className="text-xl font-black text-blue-200 uppercase tracking-widest opacity-80">পাঠরত শিক্ষার্থীর সংখ্যা</p>
          </div>
        </div>
      </div>

      {/* Interactive Box */}
      <div className="bg-white pt-16 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="w-full flex flex-col sm:flex-row rounded-[2rem] overflow-hidden shadow-2xl border-4 border-blue-900 group relative"
          >
            <div className="flex-1 bg-blue-900 py-8 text-white font-black text-2xl flex items-center justify-center border-b-4 sm:border-b-0 sm:border-r-4 border-white/10">
              শ্রেণী
            </div>
            <div className="flex-1 bg-yellow-400 py-8 text-blue-900 font-black text-2xl flex items-center justify-center relative">
              শিক্ষার্থীর সংখ্যা
              <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-bounce hidden sm:block">
                <MousePointer2 size={32} className="text-blue-900 rotate-12" />
              </div>
            </div>
            {/* Click Indicator for Mobile */}
            <div className="absolute top-2 right-2 sm:hidden bg-blue-900 text-white p-2 rounded-full animate-pulse">
              <MousePointer2 size={16} />
            </div>
          </motion.button>
          <p className="text-center mt-6 text-blue-900/40 font-bold uppercase tracking-widest text-xs">
            বিস্তারিত দেখতে বক্সে ক্লিক করুন
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-blue-900 p-8 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-400 p-3 rounded-2xl text-blue-900">
                    <GraduationCap size={32} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black">শ্রেণীভিত্তিক শিক্ষার্থীর সংখ্যা</h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90"
                >
                  <X size={32} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
                  {/* Row 1: Class 1-5 */}
                  <div className="space-y-4">
                    <div className="text-xs font-black text-blue-900/30 uppercase tracking-[0.2em] mb-2 px-2">প্রাথমিক শাখা (১ম - ৫ম)</div>
                    {classData.slice(0, 5).map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="flex items-center gap-4 bg-blue-50 p-3 rounded-3xl border-2 border-blue-100 group hover:border-blue-900 transition-colors"
                      >
                        <div className="flex-1 bg-blue-900 text-white py-4 px-6 rounded-2xl font-black text-center shadow-lg group-hover:bg-blue-800 transition-colors">
                          {item.class}
                        </div>
                        <div className="flex-1 bg-yellow-400 text-blue-900 py-4 px-6 rounded-2xl font-black text-center text-2xl shadow-lg group-hover:bg-yellow-300 transition-colors">
                          {item.count}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 2: Class 6-10 */}
                  <div className="space-y-4">
                    <div className="text-xs font-black text-blue-900/30 uppercase tracking-[0.2em] mb-2 px-2">মাধ্যমিক শাখা (৬ষ্ঠ - ১০ম)</div>
                    {classData.slice(5, 10).map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="flex items-center gap-4 bg-blue-50 p-3 rounded-3xl border-2 border-blue-100 group hover:border-blue-900 transition-colors"
                      >
                        <div className="flex-1 bg-blue-900 text-white py-4 px-6 rounded-2xl font-black text-center shadow-lg group-hover:bg-blue-800 transition-colors">
                          {item.class}
                        </div>
                        <div className="flex-1 bg-yellow-400 text-blue-900 py-4 px-6 rounded-2xl font-black text-center text-2xl shadow-lg group-hover:bg-yellow-300 transition-colors">
                          {item.count}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom: Cadet */}
                <div className="mt-10 flex justify-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-4 bg-blue-50 p-3 rounded-3xl border-2 border-blue-100 w-full md:w-2/3 group hover:border-blue-900 transition-colors"
                  >
                    <div className="flex-1 bg-blue-900 text-white py-4 px-6 rounded-2xl font-black text-center shadow-lg group-hover:bg-blue-800 transition-colors">
                      {classData[10].class}
                    </div>
                    <div className="flex-1 bg-yellow-400 text-blue-900 py-4 px-6 rounded-2xl font-black text-center text-2xl shadow-lg group-hover:bg-yellow-300 transition-colors">
                      {classData[10].count}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-blue-900/60 text-sm font-bold">STAR KIDS - আপনার সন্তানের উজ্জ্বল ভবিষ্যতের নিশ্চয়তা</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    schoolName: '',
    className: '',
    mobile: '',
    religion: '',
    shift: '',
    studentEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const path = 'admissions';
      await addDoc(collection(db, path), {
        ...formData,
        submittedAt: serverTimestamp()
      });

      setIsSubmitted(true);
      setFormData({
        studentName: '',
        fatherName: '',
        motherName: '',
        schoolName: '',
        className: '',
        mobile: '',
        religion: '',
        shift: '',
        studentEmail: ''
      });
    } catch (err) {
      console.error('Admission submission error:', err);
      if (err instanceof Error && err.message.includes('permission-denied')) {
        setError('দুঃখিত, আপনার এই তথ্য পাঠানোর অনুমতি নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।');
      } else {
        setError('আবেদন পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
      
      try {
        handleFirestoreError(err, OperationType.CREATE, 'admissions');
      } catch (e) {
        // Error already logged by handleFirestoreError
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="admission" className="pt-4 pb-24 bg-blue-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-100">
          <div className="bg-blue-900 p-12 text-white text-center">
            <h3 className="text-4xl font-black mb-4">ভর্তি ফর্ম</h3>
            <p className="text-blue-200">আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য প্রথম পদক্ষেপ নিন।</p>
          </div>
          
          {isSubmitted ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} />
              </div>
              <h4 className="text-2xl font-black text-blue-900 mb-2">আবেদন সফল হয়েছে!</h4>
              <p className="text-gray-600">আপনার আবেদনটি সফলভাবে জমা দেওয়া হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-8 text-blue-900 font-bold underline"
              >
                আরেকটি আবেদন করুন
              </button>
            </div>
          ) : (
            <form className="p-12 grid md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
              {error && (
                <div className="md:col-span-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">ছাত্র/ছাত্রীর নাম</label>
                <input 
                  type="text" 
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="ছাত্র/ছাত্রীর পূর্ণ নাম লিখুন" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">পিতার নাম</label>
                <input 
                  type="text" 
                  name="fatherName"
                  required
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="পিতার নাম লিখুন" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">মাতার নাম</label>
                <input 
                  type="text" 
                  name="motherName"
                  required
                  value={formData.motherName}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="মাতার নাম লিখুন" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">স্কুলের নাম</label>
                <input 
                  type="text" 
                  name="schoolName"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="পূর্ববর্তী স্কুলের নাম লিখুন" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">শ্রেণী</label>
                <select 
                  name="className"
                  required
                  value={formData.className}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all"
                >
                  <option value="">শ্রেণী নির্বাচন করুন</option>
                  {CLASSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">অভিভাবকের মোবাইল নম্বর</label>
                <input 
                  type="tel" 
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="+880 1XXX-XXXXXX" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">শিক্ষার্থী/অভিভাবকের ইমেইল</label>
                <input 
                  type="email" 
                  name="studentEmail"
                  required
                  value={formData.studentEmail}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="example@gmail.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider">ধর্ম</label>
                <input 
                  type="text" 
                  name="religion"
                  required
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 transition-all" 
                  placeholder="ধর্ম লিখুন" 
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wider block">শিফট সেকশন</label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="shift" 
                      value="সকাল"
                      required
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" 
                    />
                    <span className="font-bold text-gray-700 group-hover:text-blue-900 transition-colors">সকাল</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="shift" 
                      value="বিকাল"
                      required
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300" 
                    />
                    <span className="font-bold text-gray-700 group-hover:text-blue-900 transition-colors">বিকাল</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-400 text-blue-900 py-5 rounded-2xl font-black text-xl hover:bg-yellow-300 transition-all transform hover:scale-[1.02] shadow-xl shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'ভর্তি নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
};

const Sponsors = () => {
  const adText = "আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিতে STAR KIDS কতৃপক্ষের সাথে যোগাযোগ করুন";
  return (
    <section className="pt-4 pb-16 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]"> বিজ্ঞাপন </h4>
      </div>
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mx-12 text-3xl font-black text-gray-300 hover:text-blue-900 transition-colors cursor-default tracking-tighter">
            {adText}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

const SocialLinks = () => {
  return (
    <section className="pt-4 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-12">
          <h3 className="text-4xl font-black text-blue-900 mb-2">সোশ্যাল মিডিয়ায়</h3>
          <p className="text-2xl font-black text-blue-900 opacity-80">STAR KIDS পরিবারের সাথে যুক্ত হোন</p>
        </div>
        
        {/* Main Social Cards */}
        <div className="flex flex-col lg:flex-row justify-center gap-8 mb-20">
          <a href="https://www.facebook.com/atmabuhasan" target="_blank" rel="noopener noreferrer" className="flex-1 group flex items-center gap-6 bg-blue-50 p-8 rounded-[2rem] hover:bg-blue-600 transition-all duration-500">
            <div className="bg-blue-600 text-white p-4 rounded-2xl group-hover:bg-white group-hover:text-blue-600 transition-colors">
              <Facebook size={32} />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-blue-900 group-hover:text-white uppercase tracking-widest opacity-60">Follow Us</div>
              <div className="text-2xl font-black text-blue-900 group-hover:text-white">Facebook Page</div>
            </div>
          </a>
          
          <a href="https://www.facebook.com/groups/1056714931072142" target="_blank" rel="noopener noreferrer" className="flex-1 group flex items-center gap-6 bg-blue-50 p-8 rounded-[2rem] hover:bg-blue-800 transition-all duration-500">
            <div className="bg-blue-800 text-white p-4 rounded-2xl group-hover:bg-white group-hover:text-blue-800 transition-colors">
              <Users size={32} />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-blue-900 group-hover:text-white uppercase tracking-widest opacity-60">Join Us</div>
              <div className="text-2xl font-black text-blue-900 group-hover:text-white">Facebook Group</div>
            </div>
          </a>
        </div>

        {/* New Section: DESIGNER / Mallick Abid Hasan */}
        <div className="mt-12 pt-12 border-t border-blue-50">
          <div className="mb-10">
            <h4 className="text-3xl font-black text-blue-900 mb-2 uppercase tracking-[0.2em]">DESIGNER</h4>
            <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="group flex flex-col md:flex-row items-center gap-8 bg-blue-50 p-10 rounded-[3rem] hover:bg-blue-900 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="relative w-36 h-36 shrink-0">
                <img 
                  src="https://i.imgur.com/lwGOaKs.jpeg" 
                  alt="Mallick Abid Hasan" 
                  className="w-full h-full object-cover rounded-[2.5rem] border-4 border-white shadow-lg group-hover:border-yellow-400 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="text-3xl font-black text-blue-900 group-hover:text-white mb-2">Mallick Abid Hasan</div>
                <div className="text-sm font-bold text-blue-900 group-hover:text-yellow-400 uppercase tracking-widest opacity-80 mb-6">
                  Website Designer<br/>& Star Kids Teacher<br/>
                  <span className="normal-case font-black text-xs mt-1 block">(General Science & Math)</span>
                </div>
                
                <div className="flex justify-center md:justify-start gap-4">
                  <a href="https://youtube.com/@analysisbyabidhasan" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl text-blue-900 group-hover:text-white hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"><Youtube size={20} /></a>
                  <a href="https://www.facebook.com/MallickAbidHasan360" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl text-blue-900 group-hover:text-white hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"><Facebook size={20} /></a>
                  <a href="https://www.tiktok.com/@thehistoricalanalysis" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl text-blue-900 group-hover:text-white hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"><Music2 size={20} /></a>
                  <a href="https://t.me/Granthagara" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl text-blue-900 group-hover:text-white hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"><Send size={20} /></a>
                  <a href="https://wa.me/+8801854009603" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-xl text-blue-900 group-hover:text-white hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"><Phone size={20} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DesignerInfo = () => {
  return (
    <div className="bg-blue-950 py-4 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex justify-center">
        <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Design By</span>
          <a 
            href="https://www.facebook.com/MallickAbidHasan360" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-black text-yellow-400 tracking-tight flex items-center gap-1 hover:text-yellow-300 transition-colors"
          >
            Mallick Abid Hasan <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};

const Footer = ({ onImageClick }: { onImageClick: (src: string, caption?: string) => void }) => {
  const logoUrl = "https://i.imgur.com/PmCP59l.png";
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const path = 'subscribers';
    try {
      await addDoc(collection(db, path), {
        email: email,
        subscribedAt: serverTimestamp(),
      });
      setStatus('success');
      setMessage('ধন্যবাদ! আপনি সফলভাবে আমাদের নিউজলেটারে যুক্ত হয়েছেন।');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error subscribing:', error);
      setStatus('error');
      setMessage('দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setTimeout(() => setStatus('idle'), 5000);
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch (e) {
        // Error already logged
      }
    }
  };

  return (
    <footer className="bg-blue-900 text-white pt-12 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logoUrl} 
                alt="STAR KIDS Logo" 
                className="w-12 h-12 object-contain cursor-pointer hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
                onClick={() => onImageClick(logoUrl)}
              />
              <span className="text-2xl font-black tracking-tighter">STAR KIDS</span>
            </div>
            <p className="text-blue-100 leading-relaxed mb-4">
              <span className="block font-bold text-white mb-1">মেধাবৃত্তি থেকে শুরু করে চূড়ান্ত পরীক্ষা—</span>
              শিক্ষার প্রতিটি ধাপে আপনার সন্তানের শতভাগ সাফল্য ও নৈতিক বিকাশে আমাদের নিরলস প্রয়াস।
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/atmabuhasan" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-blue-900 transition-all">
                <Facebook size={18} />
              </a>
              <a href="mailto:abuhasan14330@gmail.com" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-blue-900 transition-all">
                <Mail size={18} />
              </a>
              <a href="https://wa.me/+8801711624478" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-blue-900 transition-all">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-black mb-2 uppercase tracking-widest">আরো জানুন</h4>
            <ul className="space-y-2">
              {[
                { label: 'আমাদের কোর্সসমূহ', href: '#courses' },
                { label: 'STAR KIDS পরিচালনায়', href: '#administration' },
                { label: 'ব্লগ পোস্ট', href: '#blog' },
                { label: 'বর্তমানে শিক্ষার্থীর সংখ্যা', href: '#stats' },
                { label: 'গ্যালারি', href: '#activities' }
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center gap-2">
                    <ChevronRight size={14} /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-black mb-2 uppercase tracking-widest">যোগাযোগ</h4>
            <ul className="space-y-2">
              <li className="flex gap-4">
                <MapPin className="text-yellow-400 shrink-0" size={20} />
                <span className="text-blue-100">রাজারবাগান কলেজ বা সাতক্ষীরা সরকারি কলেজ মোড়, সাতক্ষীরা, খুলনা, বাংলাদেশ, ৯৪০০</span>
              </li>
              <li className="flex gap-4">
                <Phone className="text-yellow-400 shrink-0" size={20} />
                <a href="tel:+8801711624478" className="text-blue-100 hover:text-yellow-400 transition-colors">+88 01711624478</a>
              </li>
              <li className="flex gap-4">
                <Mail className="text-yellow-400 shrink-0" size={20} />
                <a href="mailto:abuhasan14330@gmail.com" className="text-blue-100 hover:text-yellow-400 transition-colors">abuhasan14330@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-black mb-2 uppercase tracking-widest">নিয়মিত আপডেট</h4>
            <p className="text-blue-100 mb-4 text-sm leading-relaxed">
              STAR KIDS-এর প্রতিদিনের কার্যক্রম ও গুরুত্বপূর্ণ আপডেট বিশেষ করে ভর্তি, পরীক্ষার রুটিন, সাপ্তাহিক পরীক্ষার মাসিক রেজাল্ট এবং প্রতিষ্ঠানের সর্বশেষ নোটিশ পেতে আমাদের নিউজলেটারে যুক্ত হোন।
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                required
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-white/10 border-none rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-2 top-2 bottom-2 bg-yellow-400 text-blue-900 px-4 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[44px]"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            </form>
            {status !== 'idle' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 text-xs font-bold ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}
              >
                {message}
              </motion.p>
            )}
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 text-center text-blue-200 text-sm">
          <p>© ২০১০ সাল থেকে সাতক্ষীরা জেলায় যাত্রা শুরু STAR KIDS-এর | এই ওয়েবসাইটির সকল অধিকার STAR KIDS কতৃপক্ষ দ্বারা সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

const FeeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-blue-900/60 backdrop-blur-xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col border border-white/20 h-[85vh]"
          >
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <h4 className="text-3xl font-black tracking-tight">বেতন ও ভর্তি/নোট ফি তালিকা</h4>
                <p className="text-blue-200 font-bold mt-1">STAR KIDS - আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ</p>
              </div>
              <button 
                onClick={onClose} 
                className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90"
              >
                <X size={32} />
              </button>
            </div>
            
            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-grow bg-blue-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEES_DATA.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-xl font-black text-blue-900">{item.class}</h5>
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-600">
                        <BookOpen size={20} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">মাসিক বেতন</span>
                        <span className="text-blue-900 font-black">{item.monthly}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">ভর্তি/নোট ফি</span>
                        <span className="text-blue-900 font-black">{item.admission}</span>
                      </div>
                      <div className="pt-3 border-t border-dashed border-blue-100 flex justify-between items-center">
                        <span className="text-blue-900 font-black">মোট</span>
                        <span className="text-xl font-black text-yellow-600">{item.total}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-blue-50 text-center shrink-0">
              <p className="text-blue-900/60 text-sm font-bold">
                * বিশেষ প্রয়োজনে অফিস কর্তৃপক্ষের সাথে যোগাযোগ করুন
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FeeSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <section className="pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-md mx-auto relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl text-center group relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-400/20 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-blue-400/20 transition-all"></div>
            
            <div className="relative z-10">
              <p className="text-blue-200 text-lg font-bold mb-1">সকল শ্রেণীর প্রতি মাসের</p>
              <h4 className="text-white text-3xl font-black tracking-tight">বেতন ও ভর্তি/নোট ফি</h4>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-yellow-400 font-black">
                <span className="text-sm uppercase tracking-widest">বিস্তারিত দেখতে ক্লিক করুন</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Animated Click Icon */}
            <motion.div
              animate={{
                x: [20, -10, 20],
                y: [20, -10, 20],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-4 right-4 text-yellow-400 opacity-80 pointer-events-none"
            >
              <MousePointer2 size={40} fill="currentColor" />
            </motion.div>
          </motion.button>
        </div>
      </div>
      
      <FeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <StarAIChat />
    </section>
  );
};

const LoadingScreen = () => {
  const logoUrl = "https://i.imgur.com/PmCP59l.png";
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-blue-900 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <img 
          src={logoUrl} 
          alt="STAR KIDS Logo" 
          className="w-32 h-32 md:w-48 md:h-48 object-contain"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">STAR KIDS</h1>
        <div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full mb-6"></div>
        <p className="text-blue-100 text-lg md:text-xl max-w-md mx-auto leading-relaxed font-bold">
          আধুনিক শিক্ষা ও নৈতিক মূল্যবোধের সমন্বয়ে আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ গড়ার বিশ্বস্ত প্রতিষ্ঠান।
        </p>
      </motion.div>
      
      {/* Loading Spinner */}
      <div className="mt-12">
        <div className="w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isFreeClassModalOpen, setIsFreeClassModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (src: string, caption?: string) => {
    setLightboxImage(src);
    setLightboxCaption(caption || null);
  };
  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxCaption(null);
  };
  const openVideo = (url: string) => setVideoUrl(url);
  const closeVideo = () => setVideoUrl(null);

  const scrollToAdmission = () => {
    const element = document.getElementById('admission');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-200 selection:text-blue-900">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <div className="">
        <Navbar onImageClick={openLightbox} />
        <Hero onImageClick={openLightbox} onVideoClick={openVideo} />
        <NoticeBoard />
        <About onImageClick={openLightbox} />
        <ClassesSection />
        <FacebookSection />
        <CoursesSection />
        <Administration onImageClick={openLightbox} />
        <ChiefCoordinatorSection onImageClick={openLightbox} />
        <ExperiencedTeachers onImageClick={openLightbox} />
        <ClassTeachers onImageClick={openLightbox} onFreeClassClick={() => setIsFreeClassModalOpen(true)} />
        <GeneralFaculty />
        <ITDepartment />
        <BlogSection onImageClick={openLightbox} />
        <VisitorCounter />
        <FeeSection />
        <AdmissionForm />
        <Sponsors />
        <SocialLinks />
        <Footer onImageClick={openLightbox} />
      </div>
      
      <ImageLightbox 
        src={lightboxImage} 
        caption={lightboxCaption}
        isOpen={!!lightboxImage} 
        onClose={closeLightbox} 
      />

      <FreeClassModal 
        isOpen={isFreeClassModalOpen}
        onClose={() => setIsFreeClassModalOpen(false)}
        onConfirm={scrollToAdmission}
      />

      <VideoModal 
        url={videoUrl} 
        isOpen={!!videoUrl} 
        onClose={closeVideo} 
      />
    </div>
  );
}
