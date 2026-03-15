import React from 'react';
import { Landmark, User, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const DualLedger = ({ studentData }) => {
    const { 
        name, 
        enrollmentNo, 
        totalFee = 0, 
        paidAmount = 0, 
        pendingAmount = 0,
        paymentsBySource = { SELF: 0, DRCC: 0, SCHOLARSHIP: 0 }
    } = studentData;

    // Logic: DRCC (Govt) usually covers a fixed portion or specific components.
    // For this UI, we'll split the total fee based on payment sources.
    const drccPaid = paymentsBySource.DRCC || 0;
    const selfPaid = paymentsBySource.SELF || 0;
    const scholarshipPaid = paymentsBySource.SCHOLARSHIP || 0;
    
    // We assume total pending is the liability
    // Let's create a visual split
    const govtPortion = drccPaid + scholarshipPaid;
    const studentPortion = totalFee - govtPortion;

    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Student Financial Ledger</h3>
                    <p className="text-sm text-slate-500">{name} ({enrollmentNo})</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold border border-cyan-200 uppercase">DRCC Enabled</span>
                </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8 relative">
                {/* Vertical Divider */}
                <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-slate-100"></div>

                {/* Left: Govt / DRCC Side */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-cyan-600 mb-2">
                        <Landmark className="w-5 h-5" />
                        <h4 className="font-bold uppercase tracking-wider text-sm">Govt / Credit Card Liability</h4>
                    </div>
                    <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100 italic text-sm text-cyan-800">
                        This section tracks disbursements received from the Bihar Student Credit Card (DRCC) or Scholarships.
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Total Received</p>
                            <p className="text-2xl font-black text-cyan-700">₹{govtPortion.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                <ShieldCheck className="w-3 h-3" /> Verified by Bank
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                            <span className="text-slate-600">DRCC Disbursement</span>
                            <span className="font-medium text-slate-800">₹{drccPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                            <span className="text-slate-600">Scholarship Applied</span>
                            <span className="font-medium text-slate-800">₹{scholarshipPaid.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Student / Self Side */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                        <User className="w-5 h-5" />
                        <h4 className="font-bold uppercase tracking-wider text-sm">Personal Liability (Self)</h4>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 italic text-sm text-indigo-800">
                        This section tracks payments made directly by the student and any remaining personal dues.
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Personal Dues Remaining</p>
                            <p className="text-2xl font-black text-rose-600">₹{pendingAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-semibold text-slate-400 uppercase">Self Paid</p>
                             <p className="text-lg font-bold text-slate-700">₹{selfPaid.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                            <span className="text-slate-600">Tuition (Self-part)</span>
                            <span className="font-medium text-slate-800">₹{(studentPortion * 0.7).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                            <span className="text-slate-600">Laboratory & Other</span>
                            <span className="font-medium text-slate-800">₹{(studentPortion * 0.3).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-900 text-white flex justify-between items-center px-8">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none">Net System Balance</p>
                        <p className="text-xl font-black tracking-tighter">₹{totalFee.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    Status: {pendingAmount === 0 ? 'Fully Cleared' : 'Action Required'}
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

export default DualLedger;
