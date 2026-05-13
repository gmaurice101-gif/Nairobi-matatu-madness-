import React, { useState, useEffect, useRef } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Lock, Users, User as UserIcon, MessageSquare } from 'lucide-react';

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
  recipientId: string | 'all';
  chatId: string;
  timestamp: any;
}

interface OnlineUser {
  uid: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
}

export const Messaging: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Default open but minimized
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<OnlineUser | null>(null); // null means Group Chat
  const [viewMode, setViewMode] = useState<'chat' | 'users'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch users
  useEffect(() => {
    if (!isLoggedIn) return;
    const path = 'users';
    // Remove the where filter to show all players, but indicate online status
    const q = query(collection(db, path), orderBy('lastSeen', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => doc.data() as OnlineUser)
        .filter(u => u.uid !== auth.currentUser?.uid);
      setOnlineUsers(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [isLoggedIn]);

  // Fetch messages
  useEffect(() => {
    if (!isLoggedIn) return;

    const currentChatId = selectedRecipient 
      ? [auth.currentUser!.uid, selectedRecipient.uid].sort().join('_')
      : 'group';

    const path = 'messages';
    const q = query(
      collection(db, path),
      where('chatId', '==', currentChatId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [isLoggedIn, selectedRecipient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized, viewMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const currentChatId = selectedRecipient 
      ? [auth.currentUser.uid, selectedRecipient.uid].sort().join('_')
      : 'group';

    const path = 'messages';
    try {
      await addDoc(collection(db, path), {
        text: encrypt(newMessage),
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous',
        recipientId: selectedRecipient ? selectedRecipient.uid : 'all',
        chatId: currentChatId,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {selectedRecipient ? `Private: ${selectedRecipient.displayName}` : 'Live Encrypted Feed'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {messages.slice(-2).map((msg, i) => (
                <div key={msg.id} className="text-[10px] truncate text-slate-300">
                  <span className="font-bold text-yellow-400 mr-2">{msg.senderName}:</span>
                  {decrypt(msg.text)}
                </div>
              ))}
              {messages.length === 0 && <span className="text-[10px] text-slate-600 italic">No fresh messages...</span>}
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
            <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode(viewMode === 'chat' ? 'users' : 'chat')}
                  className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  {viewMode === 'chat' ? <Users size={16} /> : <MessageSquare size={16} />}
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                    {viewMode === 'users' ? 'Online Players' : (selectedRecipient ? selectedRecipient.displayName : 'Group Chat')}
                  </span>
                  {viewMode === 'chat' && (
                    <span className="text-[8px] text-green-400 animate-pulse uppercase font-black">
                      {selectedRecipient ? 'Encrypted Link' : 'Public Channel'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {viewMode === 'users' ? (
              /* User List */
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 bg-slate-950/20">
                <button 
                  onClick={() => { setSelectedRecipient(null); setViewMode('chat'); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${!selectedRecipient ? 'bg-yellow-400/20 border border-yellow-400/30' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-200">Group Chat</span>
                    <span className="text-[8px] uppercase">Everyone on the highway</span>
                  </div>
                </button>
                <div className="text-[8px] text-slate-600 uppercase font-black px-2 mt-4 mb-2">Available Drivers</div>
                {onlineUsers.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => { setSelectedRecipient(u); setViewMode('chat'); }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative ${selectedRecipient?.uid === u.uid ? 'bg-yellow-400 border border-yellow-500' : 'hover:bg-slate-800'}`}
                  >
                    <div className="relative">
                      <img src={u.photoURL} alt={u.displayName} className="w-8 h-8 rounded-full border border-slate-700" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${u.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className={`text-xs font-bold ${selectedRecipient?.uid === u.uid ? 'text-slate-900' : 'text-slate-200'}`}>{u.displayName}</span>
                      <span className={`text-[8px] uppercase ${selectedRecipient?.uid === u.uid ? 'text-slate-900/60' : 'text-slate-500'}`}>
                        {u.isOnline ? 'Online now' : 'Offline'}
                      </span>
                    </div>
                  </button>
                ))}
                {onlineUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <UserIcon size={32} className="mb-2" />
                    <span className="text-xs">No other drivers online</span>
                  </div>
                )}
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-hide bg-slate-950/20"
                >
                  {messages.map((msg, idx) => (
                    <div 
                      key={`${msg.id}-${idx}`}
                      className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
                    >
                      {(!selectedRecipient && msg.senderId !== auth.currentUser?.uid) && (
                        <span className="text-[9px] text-slate-500 mb-0.5 px-1 font-bold">{msg.senderName}</span>
                      )}
                      <div 
                        className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                          msg.senderId === auth.currentUser?.uid 
                            ? 'bg-yellow-400 text-slate-950 rounded-tr-none shadow-lg shadow-yellow-900/10' 
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                        }`}
                      >
                        {decrypt(msg.text)}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                      <Lock size={32} className="mb-2" />
                      <span className="text-xs uppercase tracking-widest font-black">Encrypted Line Ready</span>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={selectedRecipient ? `Chat with ${selectedRecipient.displayName.split(' ')[0]}...` : "Send to all drivers..."}
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
