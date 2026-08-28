import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, GraduationCap, Users, MapPin, Phone, 
  ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, 
  Sparkles, ChevronRight, AlertCircle, FileText,
  Home, Copy, Check, Download
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDocs } from 'firebase/firestore';
import { downloadElementAsPdf } from '../utils/pdfExport';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
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
        photoUrl: provider.photoURL,
      }))
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
}

const BENGALI_CLASSES = [
  'কেজি / শিশু শ্রেণী', 'শ্রেণী ১', 'শ্রেণী ২', 'শ্রেণী ৩', 'শ্রেণী ৪', 'শ্রেণী ৫',
  'শ্রেণী ৬', 'ক্যাডেট', 'শ্রেণী ৭ম', 'শ্রেণী ৮ম', 'শ্রেণী ৯ম', 'শ্রেণী ১০ম'
];

interface ScholarshipApplicationPageProps {
  onBackToHome: () => void;
}

export const ScholarshipApplicationPage: React.FC<ScholarshipApplicationPageProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('https://i.imgur.com/PmCP59l.png');

  useEffect(() => {
    // Preload logo as base64 Data URL to guarantee html2canvas never taints the canvas
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
        console.warn('Could not preload logo as base64:', err);
      }
    };
    preloadLogo();
  }, []);

  // Application Form State
  const [formData, setFormData] = useState({
    schoolName: '',
    className: 'কেজি / শিশু শ্রেণী',
    studentNameBn: '',
    studentNameEn: '',
    fatherNameBn: '',
    motherNameBn: '',
    village: '',
    postOffice: '',
    upazila: '',
    district: '',
    mobile: '',
    religion: 'ইসলাম',
    nationality: 'বাংলাদেশী',
    isAgreed: false
  });

  const [submittedDocId, setSubmittedDocId] = useState<string | null>(null);
  const [assignedFormRollNo, setAssignedFormRollNo] = useState<string>('2500');

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    method: 'bKash' as 'bKash' | 'Nagad',
    senderNumber: '',
    trxId: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'studentNameEn') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isAgreed) {
      setErrorMessage('আবেদন সম্পন্ন করতে অঙ্গীকারনামার বক্সে টিক দিন।');
      return;
    }
    if (!formData.studentNameBn || !formData.mobile || !formData.schoolName || !formData.studentNameEn) {
      setErrorMessage('দয়া করে প্রয়োজনীয় সব ক্ষেত্রগুলো (বিদ্যালয়, বাংলা ও ইংরেজি নাম, মোবাইল নম্বর) সঠিকভাবে পূরণ করুন।');
      return;
    }

    setErrorMessage(null);
    // Proceed to Step 2 (Payment) without saving to Firestore yet
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.senderNumber || !paymentData.trxId) {
      alert('দয়া করে আপনার প্রেরকের নম্বর এবং TrxID প্রদান করুন।');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      // Determine next sequential Form No & Roll No starting from 2500
      let nextNumber = 2500;
      try {
        const appsSnapshot = await getDocs(collection(db, 'scholarship_applications'));
        let maxVal = 2499;
        appsSnapshot.forEach((d) => {
          const data = d.data();
          const val = parseInt(data.formNo || data.rollNumber || '0', 10);
          if (!isNaN(val) && val > maxVal) {
            maxVal = val;
          }
        });
        if (maxVal >= 2500) {
          nextNumber = maxVal + 1;
        } else {
          nextNumber = 2500 + appsSnapshot.size;
        }
      } catch (cntErr) {
        console.warn('Could not query existing applications count, defaulting to 2500:', cntErr);
      }

      const assignedNumberStr = nextNumber.toString();
      setAssignedFormRollNo(assignedNumberStr);

      // Save full application to Firestore ONLY when both Step 1 and Step 2 are completed
      let docId = '';
      try {
        const completeData = {
          ...formData,
          formNo: assignedNumberStr,
          rollNumber: assignedNumberStr,
          paymentMethod: paymentData.method,
          senderNumber: paymentData.senderNumber,
          trxId: paymentData.trxId,
          paymentStatus: 'paid_pending_verification',
          submittedAt: serverTimestamp(),
          paymentSubmittedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'scholarship_applications'), completeData);
        docId = docRef.id;
        setSubmittedDocId(docId);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.CREATE, 'scholarship_applications');
      }

      // Call backend email notification route (asynchronous)
      try {
        await fetch('/api/send-scholarship-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            formNo: assignedNumberStr,
            rollNumber: assignedNumberStr,
            paymentMethod: paymentData.method,
            senderNumber: paymentData.senderNumber,
            trxId: paymentData.trxId,
          })
        });
      } catch (emailErr) {
        console.warn('Scholarship email request notice:', emailErr);
      }

      // Move to Step 3 (Success confirmation and printable slip)
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting application and payment:', err);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('+8801712266274');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDownloadAndWhatsApp = async () => {
    setIsDownloadingPDF(true);
    try {
      const filename = `Scholarship_Slip_${formData.studentNameEn ? formData.studentNameEn.trim().replace(/\s+/g, '_') : '2026'}.pdf`;
      await downloadElementAsPdf({
        elementId: 'printable-slip',
        filename,
        scale: 2,
        orientation: 'portrait',
        marginMm: 8,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloadingPDF(false);
    }

    // Prepare WhatsApp message with all filled details
    const message = `*স্টার বৃত্তি উৎসব ২০২৬ - আবেদন স্লিপ*

🔢 *ফরম ও রোল নং:* ${assignedFormRollNo || '২৫০০'}
👤 *ছাত্র/ছাত্রীর নাম:* ${formData.studentNameBn} (${formData.studentNameEn})
📚 *শ্রেণী:* ${formData.className}
🏫 *বিদ্যালয়ের নাম:* ${formData.schoolName}
👨‍👦 *পিতার নাম:* ${formData.fatherNameBn}
👩‍👦 *মাতার নাম:* ${formData.motherNameBn}
📍 *ঠিকানা:* গ্রাম: ${formData.village}, ডাকঘর: ${formData.postOffice}, উপজেলা: ${formData.upazila}, জেলা: ${formData.district}
📱 *মোবাইল/WhatsApp:* ${formData.mobile}
🕌 *ধর্ম:* ${formData.religion}
🇧🇩 *জাতীয়তা:* ${formData.nationality}
💳 *পেমেন্ট মেথড:* ${paymentData.method}
📞 *প্রেরকের নম্বর:* ${paymentData.senderNumber}
🔢 *TrxID:* ${paymentData.trxId}`;

    const waUrl = `https://wa.me/+8801712266274?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab after starting download
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans pb-20">
      {/* Top Header Navigation Bar */}
      <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-xl border-b-4 border-yellow-400 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <img 
                src="https://i.imgur.com/PmCP59l.png" 
                alt="STAR KIDS Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-yellow-400 tracking-tight flex items-center gap-2">
                <span>স্টার বৃত্তি উৎসব ২০২৬</span>
                <span className="hidden sm:inline bg-yellow-400/20 text-yellow-300 text-xs px-2.5 py-1 rounded-full border border-yellow-400/40">আবেদন পোর্টাল</span>
              </h1>
              <p className="text-blue-200 text-xs md:text-sm font-semibold">স্টার কিডস কোচিং সেন্টার</p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-5 py-2.5 rounded-full font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-yellow-400/40 transform hover:-translate-x-0.5 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </button>
        </div>
      </header>

      {/* Stepper Workflow Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-4 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            {/* Horizontal Line behind steps */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-900 via-indigo-800 to-yellow-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
              }}
            />

            {/* Step 1 */}
            <div className={`relative z-10 flex flex-col items-center gap-1.5 ${currentStep >= 1 ? 'text-blue-900' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base border-2 transition-all ${
                currentStep === 1 
                  ? 'bg-blue-950 text-yellow-400 border-yellow-400 ring-4 ring-blue-100 shadow-lg' 
                  : currentStep > 1 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-slate-400 border-slate-300'
              }`}>
                {currentStep > 1 ? <CheckCircle2 size={22} /> : '১'}
              </div>
              <span className="text-xs md:text-sm font-black whitespace-nowrap bg-white px-2 py-0.5 rounded-md shadow-xs">১. আবেদন ফর্ম</span>
            </div>

            {/* Step 2 */}
            <div className={`relative z-10 flex flex-col items-center gap-1.5 ${currentStep >= 2 ? 'text-blue-900' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base border-2 transition-all ${
                currentStep === 2 
                  ? 'bg-blue-950 text-yellow-400 border-yellow-400 ring-4 ring-blue-100 shadow-lg' 
                  : currentStep > 2 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-slate-400 border-slate-300'
              }`}>
                {currentStep > 2 ? <CheckCircle2 size={22} /> : '২'}
              </div>
              <span className="text-xs md:text-sm font-black whitespace-nowrap bg-white px-2 py-0.5 rounded-md shadow-xs">২. ফি ও ট্রানজেকশন</span>
            </div>

            {/* Step 3 */}
            <div className={`relative z-10 flex flex-col items-center gap-1.5 ${currentStep === 3 ? 'text-green-700' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base border-2 transition-all ${
                currentStep === 3 
                  ? 'bg-green-600 text-white border-green-600 ring-4 ring-green-100 shadow-lg' 
                  : 'bg-white text-slate-400 border-slate-300'
              }`}>
                ৩
              </div>
              <span className="text-xs md:text-sm font-black whitespace-nowrap bg-white px-2 py-0.5 rounded-md shadow-xs">৩. নিশ্চিতকরণ স্লিপ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* STEP 1: Application Form */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
          >
            {/* Form Title Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 md:p-8 text-white border-b-2 border-yellow-400 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="bg-yellow-400 text-blue-950 text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-2">
                  ধাপ - ১
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-tight">
                  শিক্ষার্থী আবেদন ফর্ম
                </h2>
                <p className="text-blue-100 font-medium text-sm mt-1">
                  স্টার বৃত্তি উৎসব ২০২৬ এ অংশগ্রহণের জন্য আপনার সকল সঠিক তথ্য নিচে প্রদান করুন।
                </p>
              </div>

              <div className="hidden sm:block">
                <FileText className="w-12 h-12 text-yellow-400/80" />
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 md:p-10 space-y-8">
              {errorMessage && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold rounded-2xl text-sm flex items-center gap-3">
                  <AlertCircle size={22} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-8">
                {/* School & Class Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-blue-950 border-b-2 border-yellow-400/40 pb-2 flex items-center gap-2">
                    <Building2 className="text-yellow-500" size={20} />
                    <span>বিদ্যালয় ও শ্রেণী সংক্রান্ত তথ্য</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        বিদ্যালয়ের নাম <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        placeholder="আপনার বর্তমান স্কুলের পূর্ণ নাম লিখুন"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        শ্রেণী <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="className"
                        value={formData.className}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-xs"
                      >
                        {BENGALI_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Student Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-blue-950 border-b-2 border-yellow-400/40 pb-2 flex items-center gap-2">
                    <Users className="text-yellow-500" size={20} />
                    <span>ছাত্র/ছাত্রীর ব্যক্তিগত তথ্য</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        ছাত্র/ছাত্রীর নাম (বাংলায়) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        name="studentNameBn"
                        value={formData.studentNameBn}
                        onChange={handleInputChange}
                        placeholder="বাংলায় পূর্ণ নাম লিখুন"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        ছাত্র/ছাত্রীর নাম (ইংরেজি বড় অক্ষরে) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        name="studentNameEn"
                        value={formData.studentNameEn}
                        onChange={handleInputChange}
                        placeholder="FULL NAME IN CAPITAL LETTERS"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-bold uppercase focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        পিতার নাম (বাংলায়) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        name="fatherNameBn"
                        value={formData.fatherNameBn}
                        onChange={handleInputChange}
                        placeholder="পিতার নাম লিখুন"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                        মাতার নাম (বাংলায়) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        name="motherNameBn"
                        value={formData.motherNameBn}
                        onChange={handleInputChange}
                        placeholder="মাতার নাম লিখুন"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-4">
                  <h3 className="text-base font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={20} className="text-yellow-600" />
                    <span>স্থায়ী/বর্তমান ঠিকানা</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      placeholder="গ্রাম / এলাকা"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                    <input 
                      type="text" 
                      name="postOffice"
                      value={formData.postOffice}
                      onChange={handleInputChange}
                      placeholder="ডাকঘর"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                    <input 
                      type="text" 
                      name="upazila"
                      value={formData.upazila}
                      onChange={handleInputChange}
                      placeholder="উপজেলা"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                    <input 
                      type="text" 
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="জেলা"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                  </div>
                </div>

                {/* Contact & Religion */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={16} className="text-yellow-500" />
                      মোবাইল বা WhatsApp নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="০১৭XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">ধর্ম</label>
                    <select 
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                    >
                      <option value="ইসলাম">ইসলাম</option>
                      <option value="হিন্দু">হিন্দু</option>
                      <option value="খ্রিস্টান">খ্রিস্টান</option>
                      <option value="বৌদ্ধ">বৌদ্ধ</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">জাতীয়তা</label>
                    <input 
                      type="text" 
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3.5 p-5 bg-yellow-50/80 border-2 border-yellow-300 rounded-2xl cursor-pointer hover:bg-yellow-100/60 transition-colors shadow-xs">
                    <input 
                      type="checkbox" 
                      name="isAgreed"
                      checked={formData.isAgreed}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-900 rounded border-gray-300 focus:ring-yellow-400 accent-blue-900 shrink-0 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed">
                      এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও সঠিক। কোনো তথ্য মিথ্যা বা ভুল প্রমাণিত হলে কতৃপক্ষের যে কোনো সিদ্ধান্ত মেনে নিতে বাধ্য থাকবো।
                    </span>
                  </label>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    <span>ফিরে যান</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingForm || !formData.isAgreed}
                    className={`px-8 py-4 rounded-xl font-black text-base md:text-lg transition-all shadow-xl flex items-center gap-3 ${
                      formData.isAgreed && !isSubmittingForm
                        ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-yellow-400 hover:from-blue-900 hover:to-indigo-900 shadow-blue-950/30 active:scale-98'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmittingForm ? (
                      <>
                        <div className="w-5 h-5 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <span>তথ্য সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>পরবর্তী ধাপ (পেমেন্ট করুন)</span>
                        <ChevronRight size={22} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Payment System */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-700 to-blue-950 p-6 md:p-8 text-white border-b-2 border-yellow-400">
              <span className="bg-yellow-400 text-blue-950 text-xs font-black uppercase px-3 py-1 rounded-full inline-block mb-2">
                ধাপ - ২
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-yellow-300 tracking-tight">
                পেমেন্ট তথ্য ও ট্রানজেকশন নিশ্চিতকরণ
              </h2>
              <p className="text-pink-100 font-medium text-sm mt-1">
                স্টার বৃত্তি উৎসব ২০২৬ ফি জমা দিন এবং ট্রানজেকশন তথ্য প্রবেশ করুন।
              </p>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              {/* Official Number Box */}
              <div className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-300 rounded-3xl text-center space-y-3 shadow-sm relative overflow-hidden">
                <span className="text-xs font-black uppercase text-pink-700 tracking-wider block">
                  অফিসিয়াল বিকাশ / নগদ নম্বর (Send Money)
                </span>

                <div className="flex items-center justify-center gap-3">
                  <div className="text-3xl md:text-4xl font-black text-blue-950 tracking-wider font-mono">
                    +8801712266274
                  </div>

                  <button
                    onClick={handleCopyNumber}
                    className="p-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    title="নম্বর কপি করুন"
                  >
                    {copiedNumber ? <Check size={18} /> : <Copy size={18} />}
                    <span className="hidden sm:inline">{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed max-w-xl mx-auto">
                  আপনার মোবাইল থেকে বিকাশ অথবা নগদ মোবাইল ব্যাংকিং ব্যবহার করে <b>+8801712266274</b> নম্বরে ফি পাঠান। অতপর নিচে আপনার পেমেন্ট নম্বর ও TrxID লিখে জমা দিন।
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-950 uppercase tracking-wider block">
                    পেমেন্ট মেথড সিলেক্ট করুন <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentData(prev => ({ ...prev, method: 'bKash' }))}
                      className={`p-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 border-2 transition-all ${
                        paymentData.method === 'bKash'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-200 scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-pink-300'
                      }`}
                    >
                      <CreditCard size={22} />
                      <span>বিকাশ (bKash)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData(prev => ({ ...prev, method: 'Nagad' }))}
                      className={`p-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 border-2 transition-all ${
                        paymentData.method === 'Nagad'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200 scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-orange-300'
                      }`}
                    >
                      <CreditCard size={22} />
                      <span>নগদ (Nagad)</span>
                    </button>
                  </div>
                </div>

                {/* Sender Mobile Number */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-950 uppercase tracking-wider block">
                    আপনার {paymentData.method === 'bKash' ? 'বিকাশ' : 'নগদ'} নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    value={paymentData.senderNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, senderNumber: e.target.value }))}
                    placeholder="যেমন: ০১৭XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 font-bold text-base focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none shadow-xs"
                  />
                </div>

                {/* TrxID Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-blue-950 uppercase tracking-wider block">
                    TrxID (Transaction ID) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={paymentData.trxId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, trxId: e.target.value.toUpperCase() }))}
                    placeholder="যেমন: B7X9K2L0M"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 font-black uppercase tracking-wider text-base focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none shadow-xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    <span>পূর্বে ফিরে যান</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className="px-8 py-4 bg-gradient-to-r from-blue-950 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 text-yellow-400 rounded-xl font-black text-base md:text-lg transition-all shadow-xl flex items-center gap-2 active:scale-98"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <div className="w-5 h-5 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <span>পেমেন্ট যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={22} />
                        <span>পেমেন্ট নিশ্চিত করুন & আবেদন সম্পূর্ণ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Success Confirmation Slip */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-green-300 overflow-hidden space-y-6"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-green-700 via-emerald-800 to-blue-950 p-8 text-white text-center relative overflow-hidden">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner border border-white/30">
                <CheckCircle2 size={48} className="text-yellow-400 animate-bounce" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-yellow-300">আবেদন সফলভাবে সম্পন্ন হয়েছে!</h2>
              <p className="text-green-100 font-bold text-base mt-2">
                স্টার বৃত্তি উৎসব ২০২৬ পোর্টালে আপনার নিবন্ধন জমা হয়েছে।
              </p>
            </div>

            {/* Printable Receipt Ticket Card */}
            <div className="p-6 md:p-10 space-y-6">
              <div id="printable-slip" className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 md:p-8 space-y-6 text-slate-800">
                {/* School Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={logoDataUrl} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-black text-lg text-blue-950">স্টার কিডস কোচিং সেন্টার</h3>
                      <p className="text-xs text-slate-600 font-bold">স্টার বৃত্তি উৎসব ২০২৬ - আবেদন স্লিপ</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-300 inline-block">
                      পেমেন্ট স্ট্যাটাস: ফি যাচাইকরণাধীন
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-900 font-bold block">নির্ধারিত ফরম নং ও রোল নম্বর:</span>
                      <span className="text-xs text-slate-600 font-semibold">আবেদন ও প্রবেশপত্রের জন্য নির্ধারিত কোড</span>
                    </div>
                    <span className="text-xl font-black text-blue-950 font-mono tracking-widest bg-white px-4 py-1 rounded-lg border border-amber-400 shadow-inner">
                      {assignedFormRollNo || '2500'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">ছাত্র/ছাত্রীর নাম:</span>
                    <span className="text-base font-black text-blue-950">{formData.studentNameBn} ({formData.studentNameEn})</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">শ্রেণী:</span>
                    <span className="text-base font-black text-blue-950">{formData.className}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">বিদ্যালয়ের নাম:</span>
                    <span className="text-base font-black text-blue-950">{formData.schoolName}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">মোবাইল নম্বর:</span>
                    <span className="text-base font-black text-blue-950">{formData.mobile}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">পেমেন্ট মেথড & প্রেরকের নম্বর:</span>
                    <span className="text-base font-black text-blue-950">{paymentData.method} - {paymentData.senderNumber}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block">TrxID (ট্রানজেকশন আইডি):</span>
                    <span className="text-base font-black text-pink-700 font-mono tracking-wider">{paymentData.trxId}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 font-bold leading-relaxed">
                  💡 <b>বিশেষ দ্রষ্টব্য:</b> আপনার প্রদানকৃত ট্রানজেকশন তথ্য যাচাইয়ের পর আপনার ফোনে এসএমএস এর মাধ্যমে নিশ্চিতকরণ পাঠানো হবে। এই স্লিপটি সংরক্ষণ করুন।
                </div>
              </div>

              {/* Printable / Navigation Actions */}
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={handleDownloadAndWhatsApp}
                    disabled={isDownloadingPDF}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-75 text-yellow-400 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-900/30 active:scale-95 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download size={18} className={isDownloadingPDF ? 'animate-bounce' : ''} />
                    <span>{isDownloadingPDF ? 'PDF তৈরি হচ্ছে...' : 'স্লিপ PDF ডাউনলোড (প্রিন্ট কপি)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      window.location.hash = 'admit-card';
                    }}
                    className="px-6 py-3.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <FileText size={18} className="text-yellow-400" />
                    <span>প্রবেশপত্র ডাউনলোড করুন</span>
                  </button>

                  <button
                    onClick={onBackToHome}
                    className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Home size={18} />
                    <span>মূল পাতা</span>
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-500 text-center flex items-center gap-1.5 mt-1">
                  <span>💡</span>
                  <span>PDF ফাইলটি ডাউনলোড করে আপনার ডিভাইস বা যেকোনো প্রিন্ট দোকান থেকে সরাসরি প্রিন্ট করে নিতে পারবেন।</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
