import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, RefreshCw, Trash2, LogOut, CheckCircle2, AlertTriangle, Inbox, Sparkles, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignInForGmail, getGmailAccessToken, setGmailAccessToken, gmailLogout, initGmailAuth } from '../gmailAuth';
import { 
  fetchGmailProfile, 
  listGmailMessages, 
  getGmailMessageDetails, 
  sendGmailMessage, 
  deleteGmailMessage,
  GmailProfile, 
  GmailMessageDetails 
} from '../gmailService';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  initialRecipient = 'abuhasan14330@gmail.com',
  initialSubject = ''
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getGmailAccessToken());
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Gmail Data State
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageDetails[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetails | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');

  // Compose State
  const [composeTo, setComposeTo] = useState(initialRecipient);
  const [composeSubject, setComposeSubject] = useState(initialSubject);
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Confirmation Modal State (MANDATORY for mutating operations as per guidelines)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'send' | 'delete';
    title: string;
    description: string;
    data?: any;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialRecipient) setComposeTo(initialRecipient);
      if (initialSubject) setComposeSubject(initialSubject);
    }
  }, [isOpen, initialRecipient, initialSubject]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initGmailAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Data when Token is available
  useEffect(() => {
    if (isOpen && accessToken) {
      loadGmailData(accessToken);
    }
  }, [isOpen, accessToken]);

  const loadGmailData = async (token: string) => {
    setIsLoadingMessages(true);
    setNotification(null);
    try {
      const prof = await fetchGmailProfile(token);
      setProfile(prof);

      const messageItems = await listGmailMessages(token, '', 8);
      const detailsList = await Promise.all(
        messageItems.map(item => getGmailMessageDetails(token, item.id).catch(() => null))
      );
      setMessages(detailsList.filter((m): m is GmailMessageDetails => m !== null));
    } catch (err: any) {
      console.error('Error loading Gmail data:', err);
      if (err.message?.includes('401') || err.message?.includes('403')) {
        setAccessToken(null);
        setGmailAccessToken(null);
        setAuthError('অনুমতি মেয়াদোত্তীর্ণ হয়েছে। দয়া করে পুনরায় সাইন-ইন করুন।');
      } else {
        setNotification({ type: 'error', message: 'জিেইল তথ্য লোড করতে সমস্যা হয়েছে।' });
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignInForGmail();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError('گوگل সাইন-ইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await gmailLogout();
    setUser(null);
    setAccessToken(null);
    setProfile(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  // Trigger Send Confirmation Modal
  const requestSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeBody.trim()) {
      setNotification({ type: 'error', message: 'দয়া করে প্রাপক এবং বার্তার বিবরণ লিখুন।' });
      return;
    }

    setConfirmAction({
      type: 'send',
      title: 'ইমেইল পাঠানোর বিষয় নিশ্চিতকরণ',
      description: `আপনি কি নিশ্চিত যে "${composeTo}" ঠিকানায় "${composeSubject || 'no subject'}" বিষয়ক ইমেইলটি পাঠাতে চান?`,
    });
  };

  // Execute Send
  const executeSendEmail = async () => {
    if (!accessToken) return;
    setIsSending(true);
    setConfirmAction(null);
    try {
      await sendGmailMessage(accessToken, composeTo, composeSubject, composeBody);
      setNotification({ type: 'success', message: 'ইমেইল সফলভাবে পাঠানো হয়েছে!' });
      setComposeSubject('');
      setComposeBody('');
      setActiveTab('inbox');
      // Refresh inbox
      loadGmailData(accessToken);
    } catch (err: any) {
      console.error('Send email error:', err);
      setNotification({ type: 'error', message: 'ইমেইল পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' });
    } finally {
      setIsSending(false);
    }
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteEmail = (msg: GmailMessageDetails) => {
    setConfirmAction({
      type: 'delete',
      title: 'ইমেইল ডিলিট করার বিষয় নিশ্চিতকরণ',
      description: `আপনি কি নিশ্চিত যে "${msg.subject}" ইমেইলটি স্থায়ীভাবে মুছে ফেলতে চান?`,
      data: msg.id,
    });
  };

  // Execute Delete
  const executeDeleteEmail = async (messageId: string) => {
    if (!accessToken) return;
    setConfirmAction(null);
    try {
      await deleteGmailMessage(accessToken, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      setNotification({ type: 'success', message: 'ইমেইল মোছা হয়েছে।' });
    } catch (err) {
      console.error('Delete email error:', err);
      setNotification({ type: 'error', message: 'ইমেইল মুছতে ব্যর্থ হয়েছে।' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10 border border-blue-100 my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-blue-900 p-5 md:p-6 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Mail size={26} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                Gmail সেন্টার
                <span className="text-xs bg-yellow-400 text-slate-900 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                  Workspace
                </span>
              </h3>
              <p className="text-rose-100 text-xs font-bold">STAR KIDS স্পেশাল অফিসিয়াল ইমেইল কমিউনিকেশন</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogout}
                title="সাইন আউট"
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">সাইন-আউট</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-4 min-h-[420px]">
          {/* Toast Notification */}
          {notification && (
            <div className={`p-4 rounded-2xl font-bold text-sm flex items-center justify-between shadow-sm border ${
              notification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-rose-600" />}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Unauthenticated State */}
          {!accessToken ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-red-200">
                <Mail size={40} />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-blue-950">گوگل অ্যাকাউন্টে সাইন-ইন করুন</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  স্টার কিডস স্কুলের অফিসিয়াল জিমেইল সার্ভিসের সাথে সংযুক্ত হয়ে ইমেইল মেসেজ প্রেরণ এবং দেখুন।
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl">
                  {authError}
                </div>
              )}

              {/* Official Material Google Sign-In Button as mandated */}
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl border border-slate-300 shadow-md flex items-center justify-center gap-3 transition-all hover:shadow-lg active:scale-95 disabled:opacity-60"
                >
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-base text-slate-800">
                    {isAuthLoading ? 'সংযোগ স্থাপন করা হচ্ছে...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Workspace View */
            <div className="space-y-4">
              {/* Profile Card & Navigation Tabs */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">
                      {user?.displayName || 'সংযুক্ত অ্যাকাউন্ট'}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {profile?.emailAddress || user?.email}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'inbox' 
                        ? 'bg-white text-blue-900 shadow-sm font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Inbox size={16} />
                    <span>ইনবক্স</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('compose')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'compose' 
                        ? 'bg-red-600 text-white shadow-sm font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Send size={16} />
                    <span>কম্পোজ করুন</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: INBOX */}
              {activeTab === 'inbox' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      সাম্প্রতিক জিমেইল মেসেজ ({messages.length})
                    </span>
                    <button
                      onClick={() => loadGmailData(accessToken)}
                      disabled={isLoadingMessages}
                      className="text-xs font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1"
                    >
                      <RefreshCw size={14} className={isLoadingMessages ? 'animate-spin' : ''} />
                      রিফ্রেশ
                    </button>
                  </div>

                  {isLoadingMessages ? (
                    <div className="py-12 text-center text-slate-400 font-medium text-sm space-y-2">
                      <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p>জিমেইল মেসেজ লোড হচ্ছে...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200">
                      কোনো ইমেইল মেসেজ পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:border-red-300 hover:shadow-md ${
                            selectedMessage?.id === msg.id ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-slate-200'
                          }`}
                          onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-xs text-blue-950 truncate max-w-[200px]">
                                  {msg.from}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                  {msg.date}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm truncate mb-1">
                                {msg.subject}
                              </h5>
                              <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                {msg.snippet}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteEmail(msg);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="ডিলিট করুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Expanded detail */}
                          {selectedMessage?.id === msg.id && (
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-slate-700 text-xs font-medium leading-relaxed bg-slate-50/80 p-3 rounded-xl">
                              <div className="font-bold text-slate-900">বিষয়বস্তু:</div>
                              <div className="whitespace-pre-wrap break-words">{msg.bodyText || msg.snippet}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMPOSE */}
              {activeTab === 'compose' && (
                <form onSubmit={requestSendEmail} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                      প্রাপক ইমেইল (To) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="recipient@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold text-sm focus:ring-2 focus:ring-red-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                      বিষয় (Subject)
                    </label>
                    <input 
                      type="text" 
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="ইমেইলের শিরোনাম লিখুন"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-red-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                      বার্তা বিবরণ (Message Body) <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      required
                      rows={5}
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder="আপনার বিস্তারিত বার্তা বা বার্তা বিবরণ এখানে লিখুন..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-xl font-black text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send size={18} />
                    <span>ইমেইল পাঠান</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Explicit User Confirmation Modal for Mutating Workspace Operations */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 text-center shadow-2xl z-10 border border-slate-200 space-y-4"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                confirmAction.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {confirmAction.type === 'delete' ? <Trash2 size={32} /> : <Send size={32} />}
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">{confirmAction.title}</h4>
                <p className="text-slate-600 text-xs font-bold leading-relaxed">{confirmAction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'send') executeSendEmail();
                    if (confirmAction.type === 'delete') executeDeleteEmail(confirmAction.data);
                  }}
                  className={`py-3 font-black rounded-xl text-sm text-white transition-all shadow-md ${
                    confirmAction.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  হ্যাঁ, নিশ্চিত করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
