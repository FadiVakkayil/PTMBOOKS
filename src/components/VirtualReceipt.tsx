'use client';

import { IndianRupee } from 'lucide-react';

interface SaleItem {
  book_id: string;
  subject_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface VirtualReceiptProps {
  studentName: string;
  division: string;
  items: SaleItem[];
  totalAmount: number;
  staffName: string;
  date: string;
  phone?: string;
  schoolName?: string;
}

export default function VirtualReceipt({
  studentName,
  division,
  items,
  totalAmount,
  staffName,
  date,
  phone,
  schoolName
}: VirtualReceiptProps) {
  return (
    <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 max-w-lg mx-auto font-sans leading-tight">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">PTM HSS THRIKKADEERI</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Official Textbook Distribution Receipt</p>
        <div className="h-[1px] bg-slate-100 mt-4" />
      </div>

      {/* Info Block */}
      <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Distributed To:</p>
            <p className="text-sm font-bold text-slate-900 uppercase leading-none">{studentName} ({division})</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1 text-right">Date & Time:</p>
            <p className="text-[10px] font-bold text-slate-900 leading-none">{date}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {phone && (
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Parent Phone:</p>
              <p className="text-[10px] font-bold text-slate-900">{phone}</p>
            </div>
          )}
          {schoolName && (
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Student School:</p>
              <p className="text-[10px] font-bold text-slate-900 uppercase leading-none">{schoolName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2 mb-2">
          <div className="col-span-6 text-[9px] font-black text-slate-400 uppercase">Book Subject</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase text-center">Qty</div>
          <div className="col-span-4 text-[9px] font-black text-slate-400 uppercase text-right">Subtotal</div>
        </div>
        
        <div className="space-y-3 min-h-[100px]">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6 text-[11px] font-bold text-slate-700 truncate uppercase">{item.subject_name}</div>
              <div className="col-span-2 text-[11px] font-black text-slate-900 text-center">{item.quantity}</div>
              <div className="col-span-4 text-[11px] font-black text-slate-900 text-right">₹{item.subtotal.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
          <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Total Paid Amount</span>
            <div className="flex items-center gap-1">
              <IndianRupee size={14} className="text-white/60" />
              <span className="text-xl font-black">{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Issuer: {staffName.toUpperCase()}</p>
        <p className="text-[8px] text-slate-300 uppercase tracking-widest">Electronic Receipt - No Signature Required</p>
      </div>
    </div>
  );
}
