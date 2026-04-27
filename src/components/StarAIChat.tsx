import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  User, 
  Bot,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Trash2,
  Sparkles
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

// Initialize Gemini lazily
let aiInstance: GoogleGenerativeAI | null = null;

const getAIInstance = () => {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Please set it in your environment variables.');
    }
    aiInstance = new GoogleGenerativeAI(apiKey);
  }
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `
তুমি স্টার কিডস (Star Kids) প্রতিষ্ঠানের একজন সহায়ক শিক্ষক। তোমার নাম 'Star-AI'। 
তোমার কাজ হলো শিক্ষার্থীদের সহজ ভাষায় পড়ালেখা বুঝিয়ে দেওয়া এবং স্টার কিডস সম্পর্কে তথ্য দেওয়া। 
তুমি সবসময় উৎসাহমূলক কথা বলবে এবং ছোটদের উপযোগী উদাহরণ ব্যবহার করবে। 

স্টার কিডস সম্পর্কে কিছু তথ্য:
- এটি সাতক্ষীরায় অবস্থিত একটি শিক্ষা প্রতিষ্ঠান।
- এখানে ১ম থেকে ১০ম শ্রেণী পর্যন্ত পড়ানো হয়।
- বিশেষ কোর্সসমূহ: ৩য় শ্রেণীর ভর্তি পরীক্ষার প্রস্তুতি, ৫ম ও ৮ম শ্রেণীর বৃত্তি পরীক্ষার প্রস্তুতি, ক্যাডেট ভর্তি পরীক্ষার প্রস্তুতি এবং SSC ফাইনাল মডেল টেস্ট।
- ক্যাডেট কোচিংয়ে আমাদের বিশাল সাফল্য রয়েছে। ২০২৬ সালে ২৫ জন শিক্ষার্থী লিখিত পরীক্ষায় উত্তীর্ণ হয়েছে।
- পরিচালক: এ.টি.এম আবু হাসান। সহকারী পরিচালক: কাজী সাদিকুজ্জামান।

নির্দেশনা:
১. সবসময় বাংলা ভাষায় কথা বলবে (যদি না ইউজার ইংরেজিতে কিছু জানতে চায়)।
২. ছোট বাচ্চাদের সাথে কথা বলার সময় 'তুমি' সম্বোধন করবে এবং বন্ধুসুলভ আচরণ করবে।
৩. কোনোভাবেই অনুপযুক্ত, হিংসাত্মক বা জটিল বিষয় নিয়ে আলোচনা করবে না। 
৪. যদি কেউ এমন কিছু জিজ্ঞাসা করে যা পড়ালেখা বা স্টার কিডস এর সাথে সম্পর্কিত নয়, তবে তুমি বিনয়ের সাথে বলবে যে তুমি কেবল পড়ালেখা এবং স্টার কিডস নিয়ে কথা বলতে পারো।
৫. উত্তরগুলো ছোট এবং সহজবোধ্য রাখার চেষ্টা করবে।
`;

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const StarAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'হ্যালো! আমি Star-AI। আমি তোমাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = 'bn-BD';
        rec.interimResults = false;

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        rec.onerror = () => {
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'হ্যালো! আমি Star-AI। আমি তোমাকে কীভাবে সাহায্য করতে পারি?' }]);
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input.trim();
    const userImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: userImage || undefined }]);
    setIsLoading(true);

    try {
      const genAI = getAIInstance();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }] as any[]
      }));

      const contents = history.concat([{
        role: 'user',
        parts: userImage 
          ? [
              { text: userMessage || "এই ছবিটি সম্পর্কে বলো।" },
              { inlineData: { data: userImage.split(',')[1], mimeType: userImage.split(';')[0].split(':')[1] } }
            ]
          : [{ text: userMessage }]
      }]);

      const result = await model.generateContentStream({
        contents: contents
      });

      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }

      if (isSpeechEnabled && typeof window !== 'undefined') {
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'bn-BD';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error('Gemini Error:', error);
      let errorMessage = 'দুঃখিত, আমার সার্ভারে একটু সমস্যা হচ্ছে। দয়া করে একটু পরে আবার চেষ্টা করো।';
      
      if (error?.message?.includes('API_KEY')) {
        errorMessage = 'দুঃখিত, Gemini API Key কনফিগার করা নেই। দয়া করে অ্যাডমিনের সাথে যোগাযোগ করো।';
      } else if (error?.message?.includes('safety')) {
        errorMessage = 'দুঃখিত, তোমার প্রশ্নটি আমাদের সেফটি গাইডলাইনের বাইরে। অন্যভাবে জিজ্ঞাসা করো।';
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 group border border-white/20"
      >
        <Sparkles size={20} className="group-hover:animate-pulse" />
        <span className="font-black text-sm">Ask Star-AI</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[400px] h-[500px] bg-white rounded-[2rem] shadow-2xl border-4 border-blue-600 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg flex items-center gap-2">
                    Star-AI
                  </h3>
                  <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {isSpeechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none'
                    }`}>
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="User upload" 
                          className="max-w-full h-auto rounded-lg mb-2 border border-blue-400"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500">Star-AI ভাবছে...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 bg-slate-100 border-t border-slate-200 relative"
                >
                  <div className="relative inline-block">
                    <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-blue-600" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                  title="Upload Image"
                >
                  <ImageIcon size={20} />
                </button>
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="তোমার প্রশ্ন লেখো..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isLoading || (!input.trim() && !selectedImage)
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Send size={18} className={isLoading ? 'animate-pulse' : ''} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Star-AI ভুল তথ্য দিতে পারে। প্রয়োজনে শিক্ষকদের সাথে কথা বলো।
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StarAIChat;
