import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, X, Lock } from 'lucide-react';

// Simple "encryption" for demo purposes (Base64)
const encrypt = (text: string) => btoa(text);
const decrypt = (text: string) => {
  try {
    return atob(text);
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

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
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-[450px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-bottom border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-green-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">Encrypted Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-hide"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName}</span>
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.senderId === auth.currentUser?.uid 
                        ? 'bg-yellow-400 text-slate-950 rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {decrypt(msg.text)}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/30 border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a secure message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
