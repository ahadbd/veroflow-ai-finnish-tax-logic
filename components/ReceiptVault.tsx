'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, Euro, Trash2, X, FileText, Calendar, Tag, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVero } from './VeroProvider';
import { db, OperationType, handleFirestoreError } from '@/firebase';
import { doc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { performOCR } from '@/lib/ocr-service';
import { saveReceiptOffline } from '@/lib/offline-storage';
import { Receipt } from '@/types';

export default function ReceiptVault() {
  const { user, profile, receipts, setNotification, refreshData } = useVero();
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cachedReceipts, setCachedReceipts] = useState<Receipt[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [vat, setVat] = useState('');
  const [category, setCategory] = useState('Fuel');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) {
      setCachedReceipts([]);
      return;
    }

    try {
      const activeDataKey = profile?.activeDataKey || 'primary';
      const cached = localStorage.getItem(`receipts_${user.uid}_${activeDataKey}`);
      setCachedReceipts(cached ? JSON.parse(cached) as Receipt[] : []);
    } catch (error) {
      console.error('Failed to read cached receipts:', error);
      setCachedReceipts([]);
    }
  }, [user, profile?.activeDataKey, receipts]);

  const displayReceipts = receipts.length > 0 ? receipts : cachedReceipts;
  const sortedReceipts = [...displayReceipts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const totalPages = Math.ceil(sortedReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = sortedReceipts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [receipts, cachedReceipts]);

  const handleDeleteReceipt = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Delete this receipt?")) return;
    try {
      await deleteDoc(doc(db, 'receipts', id));
      setNotification({ message: "Receipt deleted", type: 'info' });
      setSelectedReceipt(null);
      refreshData();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `receipts/${id}`);
    }
  };

  const handleSaveReceipt = async () => {
    if (!user) return;
    
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      setNotification({ message: "Amount must be greater than 0 €", type: 'error' });
      return;
    }
    
    const receiptData = {
      uid: user.uid,
      scopeUid: `${user.uid}_${profile?.activeDataKey || 'primary'}`,
      date: new Date(date).toISOString(),
      merchant,
      amount: amt,
      vat: parseFloat(vat) || 0,
      category,
      description
    };

    try {
      if (navigator.onLine) {
        await addDoc(collection(db, 'receipts'), receiptData);
        setNotification({ message: "Receipt saved!", type: 'success' });
      } else {
        await saveReceiptOffline(receiptData as any);
        setNotification({ message: "Receipt saved offline. Will sync when online.", type: 'info' });
      }
      
      setShowAddReceipt(false);
      setMerchant('');
      setAmount('');
      setVat('');
      setDescription('');
      refreshData();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'receipts');
    }
  };

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await performOCR(base64, 'receipt');
        
        setMerchant(result.merchant || '');
        setAmount((result.amount || 0).toString());
        setVat((result.vat || 0).toString());
        setCategory(result.category || 'Other');
        setDescription(result.description || '');
        if (result.date) setDate(new Date(result.date).toISOString().split('T')[0]);
        
        setShowAddReceipt(true);
        setNotification({ message: "Receipt scanned!", type: 'success' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Receipt OCR Failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase truncate">Receipt Vault</h2>
        <div className="flex gap-2 flex-shrink-0">
          <label 
            aria-label="Scan receipt with camera"
            className="p-4 bg-white/10 rounded-2xl border border-border cursor-pointer hover:bg-white/20 transition-colors"
          >
            <input type="file" accept="image/*" className="hidden" aria-hidden="true" onChange={handleOCR} disabled={isScanning} />
            {isScanning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full" />
            ) : (
              <Camera size={24} className="text-brand" />
            )}
          </label>
          <button 
            onClick={() => setShowAddReceipt(true)} 
            aria-label="Add receipt manually"
            className="p-4 bg-brand rounded-2xl text-bg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {paginatedReceipts.map((r, index) => (
          <motion.div 
            key={r.id || `${r.date}-${r.merchant}-${r.amount}-${index}`} 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedReceipt(r)}
            className="bg-card p-4 rounded-2xl flex justify-between items-center border border-border group hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:text-brand transition-colors">
                <Euro size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{r.merchant}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
                  {r.category} • {new Date(r.date).toLocaleDateString('en-GB')}
                </p>
                {r.description && (
                  <p className="text-[9px] text-gray-600 font-medium truncate mt-0.5 italic">
                    {r.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-white whitespace-nowrap">€{r.amount.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">VAT €{r.vat.toFixed(2)}</p>
              </div>
              <button 
                onClick={(e) => r.id && handleDeleteReceipt(r.id, e)}
                aria-label="Delete receipt"
                className="p-3 text-gray-400 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
        {sortedReceipts.length === 0 && (
          <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No receipts stored yet</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-3 bg-white/10 rounded-xl border border-border text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentPage}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">of</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-3 bg-white/10 rounded-xl border border-border text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Add Receipt Modal */}
      <AnimatePresence>
        {showAddReceipt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 md:p-8 border border-border shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">Log Expense</h3>
                <button onClick={() => setShowAddReceipt(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Merchant</label>
                  <input 
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Neste, ABC, DNA"
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Amount (€)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">VAT (€)</label>
                    <input 
                      type="number"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none"
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                    <option value="Work Gear">Work Gear</option>
                    <option value="Phone Bill">Phone Bill</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about this expense..."
                    rows={2}
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">Date</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>

                <button 
                  onClick={handleSaveReceipt}
                  className="w-full bg-brand text-bg py-4 rounded-2xl font-black text-lg shadow-lg shadow-brand/20 hover:brightness-110 transition-all mt-4 uppercase tracking-widest"
                >
                  SAVE RECEIPT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl p-8 border border-border shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedReceipt(null)} 
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                  <Euro size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none">{selectedReceipt.merchant}</h3>
                  <p className="text-[10px] text-brand font-black uppercase tracking-[0.2em] mt-1">{selectedReceipt.category}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={12} className="text-gray-500" />
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Date</p>
                    </div>
                    <p className="font-bold text-white">{new Date(selectedReceipt.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={12} className="text-gray-500" />
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Category</p>
                    </div>
                    <p className="font-bold text-white">{selectedReceipt.category}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Amount</p>
                    <p className="text-2xl font-display font-black text-white">€{selectedReceipt.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">VAT (Included)</p>
                    <p className="text-lg font-bold text-gray-400">€{selectedReceipt.vat.toFixed(2)}</p>
                  </div>
                </div>

                {selectedReceipt.description && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={12} className="text-gray-500" />
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Description</p>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      &quot;{selectedReceipt.description}&quot;
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white/10 transition-all"
                  >
                    CLOSE
                  </button>
                  <button 
                    onClick={() => selectedReceipt.id && handleDeleteReceipt(selectedReceipt.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
