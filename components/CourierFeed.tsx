'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Send, 
  Plus, 
  Clock, 
  Eye, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useVero } from './VeroProvider';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '@/firebase';

interface FeedPost {
  id: string;
  uid: string;
  displayName: string;
  content: string;
  type: 'alert' | 'tip' | 'general';
  timestamp: any;
  likes: string[];
  viewCount?: number;
}

const CourierFeed = () => {
    const { user, profile, setNotification, isPro } = useVero();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [newPost, setNewPost] = useState('');
    const [postType, setPostType] = useState<'alert' | 'tip' | 'general'>('general');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'feed'), orderBy('timestamp', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snap) => {
            const feedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedPost));
            setPosts(feedPosts);
        });
        return () => unsubscribe();
    }, []);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !user || !profile) return;
        
        setIsPosting(true);
        try {
            await addDoc(collection(db, 'feed'), {
                uid: user.uid,
                displayName: profile.displayName || 'Vero Partner',
                content: newPost,
                type: postType,
                timestamp: serverTimestamp(),
                likes: [],
                viewCount: 0
            });
            setNewPost('');
            setNotification({ message: "Update shared with the network", type: 'success' });
        } catch (e) {
            console.error("Post failed", e);
            setNotification({ message: "Failed to post update", type: 'error' });
        } finally {
            setIsPosting(false);
        }
    };

    const toggleLike = async (post: FeedPost) => {
        if (!user) return;
        const postRef = doc(db, 'feed', post.id);
        const isLiked = post.likes.includes(user.uid);
        
        try {
            await updateDoc(postRef, {
                likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (e) {
            console.error("Like toggle failed", e);
        }
    };

    const getPostIcon = (type: string) => {
        switch(type) {
            case 'alert': return <AlertTriangle size={18} className="text-red-400" />;
            case 'tip': return <TrendingUp size={18} className="text-brand" />;
            default: return <MessageSquare size={18} className="text-blue-400" />;
        }
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Post Creation */}
            <div className="bg-card border border-border p-6 rounded-[32px] shadow-sm">
                <form onSubmit={handlePost} className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                            <Plus size={20} className="text-brand" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Post an update to the fleet</h4>
                    </div>
                    
                    <textarea 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="WHAT IS THE SITUATION ON THE ROAD?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-brand/40 min-h-[120px] transition-all resize-none"
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
                            {(['general', 'alert', 'tip'] as const).map((type) => (
                                <button 
                                    key={type}
                                    type="button"
                                    onClick={() => setPostType(type)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${postType === type ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={isPosting || !newPost.trim()}
                            className="bg-brand text-bg px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={16} /> BROADCAST UPDATE
                        </button>
                    </div>
                </form>
            </div>

            {/* Post Feed */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-brand opacity-50" />
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">VeroFlow Intel</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                        LIVE NETWORK
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {posts.map((post, i) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            key={post.id}
                            className="bg-card border border-border p-6 rounded-[32px] group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                        {getPostIcon(post.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black italic uppercase tracking-tighter text-white">{post.displayName}</p>
                                            {post.uid === user?.uid && <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-black uppercase tracking-widest">YOU</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Clock size={10} />
                                            {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'JUST NOW'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {post.type === 'alert' && (
                                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.1em] text-red-400">
                                            URGENT
                                        </div>
                                    )}
                                    {post.type === 'tip' && (
                                        <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[9px] font-black uppercase tracking-[0.1em] text-brand">
                                            ALPHA
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-base font-medium text-white/90 leading-relaxed mb-6">
                                {post.content}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-8">
                                    <button 
                                        onClick={() => toggleLike(post)}
                                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${post.likes.includes(user?.uid || '') ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <Heart size={16} className={post.likes.includes(user?.uid || '') ? 'fill-red-500' : ''} />
                                        {post.likes.length} LIKES
                                    </button>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        <Eye size={16} />
                                        {post.viewCount || Math.floor(Math.random() * 10) + 1} INTEL READS
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-brand transition-all">
                                    <MessageSquare size={16} />
                                    REPLY
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Premium Gating Card */}
            {!isPro && (
                <div className="bg-indigo-600 p-8 rounded-[40px] text-[#050505] flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <Zap size={48} className="animate-pulse mb-2" />
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">VeroTalk is coming</h4>
                    <p className="text-xs font-bold leading-relaxed max-w-[280px] uppercase tracking-widest">Upgrade to VeroPro to enable direct messaging & private group intel.</p>
                    <button className="px-8 py-4 bg-[#050505] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        EXPLORE PRO
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourierFeed;
