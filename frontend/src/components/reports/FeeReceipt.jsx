import React from 'react';
import { Landmark, ShieldCheck, QrCode } from 'lucide-react';

const numberToWords = (n) => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (n === 0) return 'Zero';
  if (n < 20) return units[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '');
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numberToWords(n % 100000) : '');
  return n.toString(); // Fallback for very large numbers
};

const FeeReceipt = ({ student, transaction }) => {
  const amountStr = numberToWords(transaction.amount) + " Rupees Only";

  return (
    <div className="bg-white p-12 border-2 border-slate-200 w-[600px] mx-auto shadow-2xl relative print:p-8 print:border-none print:shadow-none print:w-full receipt-printable">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
        <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Landmark size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">EduERP Institution</h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Official Payment Receipt</p>
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase">Receipt</h2>
            <p className="text-[9px] font-bold text-slate-500">#{transaction.ref}</p>
        </div>
      </div>

      <div className="py-8 space-y-6">
        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Received From</p>
                <p className="text-sm font-black text-slate-900 uppercase">{student.name}</p>
                <p className="text-[10px] font-bold text-slate-500">{student.enrollment}</p>
            </div>
            <div className="space-y-1 text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date of Transaction</p>
                <p className="text-sm font-black text-slate-900">{transaction.date}</p>
            </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payment Description</p>
                <p className="text-sm font-black text-slate-800 uppercase">Semester Fees • {transaction.source}</p>
                <p className="text-[10px] font-bold text-slate-400">Mode: {transaction.type}</p>
            </div>
            <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</p>
                <div className="relative">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter currency">
                        ₹{transaction.amount.toLocaleString()}
                    </p>
                    <span className="sr-only text-[10px] text-slate-400">INR {transaction.amount.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="px-6 py-2 border-l-2 border-slate-100 italic">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Amount in words:</p>
            <p className="text-xs font-black text-slate-800">{amountStr}</p>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
        <div className="flex gap-4 items-center">
            <QrCode size={48} className="text-slate-300" />
            <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Token</p>
                <p className="text-[9px] font-mono font-bold text-slate-900">{transaction.ref.split('-').join('')}</p>
            </div>
        </div>
        <div className="text-center">
            <div className="w-32 h-0.5 bg-slate-900 mb-4 mx-auto opacity-20 no-print"></div>
            <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Accounts Department</p>
            <ShieldCheck size={20} className="mx-auto mt-2 text-slate-900" />
        </div>
      </div>
      
      <div className="mt-8 text-[7px] text-slate-400 text-center font-medium uppercase tracking-widest">
        This is a digitally signed document. No physical signature required.
      </div>
    </div>
  );
};

export default FeeReceipt;
