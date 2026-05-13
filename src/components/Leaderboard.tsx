import React, { useEffect, useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { Trophy, Medal, User } from 'lucide-react';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  highScore: number;
  isOnline: boolean;
}

export const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const path = 'users';
    const q = query(
      collection(db, path),
      orderBy('highScore', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as LeaderboardUser);
      setTopUsers(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="text-yellow-400" size={18} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Highway Legends</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {topUsers.map((user, idx) => (
          <motion.div 
            key={user.uid}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {idx === 0 ? (
                  <Medal className="absolute -top-2 -left-2 text-yellow-400 z-10" size={14} />
                ) : null}
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-slate-700" />
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white truncate max-w-[100px]">{user.displayName}</span>
                <span className="text-[8px] text-slate-500 uppercase font-black">Rank #{idx + 1}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-display font-bold text-yellow-400">{user.highScore.toLocaleString()}</span>
              <span className="text-[7px] text-slate-600 uppercase font-bold">Points</span>
            </div>
          </motion.div>
        ))}
        {topUsers.length === 0 && (
          <div className="flex flex-col items-center py-4 opacity-30 text-slate-500">
            <User size={24} className="mb-1" />
            <span className="text-[10px] uppercase font-bold">Awaiting Challengers</span>
          </div>
        )}
      </div>
    </div>
  );
};
