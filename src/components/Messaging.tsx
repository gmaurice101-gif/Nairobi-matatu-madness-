import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Lock } from 'lucide-react';

// Simple symmetric encryption for demo purposes
const SECRET_KEY = 'NGANYA-SECURE-KEY';
const xorCipher = (text: string, key: string) => {
  return text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
};

const encrypt = (text: string) => btoa(xorCipher(text, SECRET_KEY));
const decrypt = (text: string) => {
  try {
    return xorCipher(atob(text), SECRET_KEY);
  } catch {
    return text;
  }
};

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

export const Messaging: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Default open but minimized
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: encrypt(newMessage),
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div 
            key="minimized"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsMinimized(false)}
            className="w-64 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-3 cursor-pointer hover:bg-slate-800/90 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock size={10} className="text-green-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Encrypted Feed</span>
            </div>
            <div className="flex flex-col gap-1">
              {messages.slice(-2).map((msg, i) => (
                <div key={msg.id} className="text-[10px] truncate text-slate-300">
                  <span className="font-bold text-yellow-400 mr-2">{msg.senderName}:</span>
                  {decrypt(msg.text)}
                </div>
              ))}
              {messages.length === 0 && <span className="text-[10px] text-slate-600 italic">No messages yet...</span>}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-80 h-[450px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">Secure Matatu Line</span>
              </div>
              <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-hide bg-slate-950/20"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={`${msg.id}-${idx}`}
                  className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-slate-500 mb-0.5 px-1 font-bold">{msg.senderName}</span>
                  <div 
                    className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                      msg.senderId === auth.currentUser?.uid 
                        ? 'bg-yellow-400 text-slate-950 rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {decrypt(msg.text)}
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type an encrypted message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-full px-4 py-2 pr-10 text-[11px] text-white focus:outline-none focus:border-yellow-400 placeholder:text-slate-600"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500/50">
                  <Lock size={12} />
                </div>
              </div>
              <button 
                type="submit"
                className="w-8 h-8 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-yellow-900/10"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
