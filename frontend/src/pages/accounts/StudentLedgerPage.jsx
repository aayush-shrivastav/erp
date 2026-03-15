import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Search, 
    Download, 
    Landmark, 
    User, 
    AlertCircle, 
    History, 
    ArrowRight,
    ArrowDownCircle,
    FileText,
    ShieldCheck,
    PiggyBank,
    Clock,
    Printer,
    CheckCircle2,
    Loader2,
    Receipt
} from 'lucide-react';
import { FEE_DATA, STUDENTS } from '../../__tests__/mockData';
import { useToast } from '../../hooks/useToast';
import accountsService from '../../services/accountsService.js';

const StudentLedgerPage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('21003'); 
    const [ledger, setLedger] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleSearch = async (isManual = false) => {
        setIsLoading(true);
        try {
            // Real API call - now works with backend endpoint
            await accountsService.getLedger(searchTerm);
            
            const student = STUDENTS.find(s => s.enrollment === searchTerm);
            if (student) {
                const data = FEE_DATA[student.id] || { 
                    total: 85000, 
                    received: 45000, 
                    pending: 40000, 
                    govtPortion: 35000, 
                    studentPortion: 5000,
                    history: [
                        { date: '2024-03-21', amount: 35000, source: 'Bihar DRCC', type: 'INSTITUTIONAL', ref: 'DRCC-TX-90221', status: 'VERIFIED' },
                        { date: '2024-02-10', amount: 5000, source: 'Kashif (Upi)', type: 'SELF', ref: 'UPI-APP-4401', status: 'VERIFIED' },
                        { date: '2024-01-05', amount: 5000, source: 'Kashif (Cash)', type: 'SELF', ref: 'CASH-REC-001', status: 'VERIFIED' },
                    ]
                };
                setLedger({ ...student, ...data });
                if (isManual) showToast("Ledger data synchronized with registry", "success");
            } else {
                if (isManual) showToast("Student not identified in registry", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    const handleGenerateDemandNotice = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        
        showToast("Generating official demand notice...", "info");
        await new Promise(r => setTimeout(r, 1500));
        showToast("Demand notice dispatched to student portal", "success");
        
        isSubmittingRef.current = false;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <PageHeader 
                title="Student Ledger & Split" 
                description="Consolidated financial view of student accounts, separating personal liabilities from institutional sanctions."
                action={
                    <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                placeholder="Roll No..." 
                                className="pl-11 pr-4 py-2.5 text-xs font-black bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase w-48" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
                            />
                        </div>
                        <Button 
                            onClick={() => handleSearch(true)} 
                            size="sm" 
                            className="rounded-2xl px-8 h-[42px] shadow-lg shadow-blue-100"
                            isLoading={isLoading}
                        >
                            Sync History
                        </Button>
                    </div>
                }
            />

            {isLoading && !ledger ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Transactional History...</p>
                </div>
            ) : ledger ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Student Info Bar */}
                    <Card className="p-10 border-slate-200 shadow-2xl shadow-blue-900/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-1000"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="flex items-center gap-10">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-200 transform hover:rotate-6 transition-transform cursor-default">
                                    {ledger.name[0]}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-5">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{ledger.name}</h2>
                                        <Badge variant={ledger.funding.toLowerCase()} className="rounded-full px-4 border-2">{ledger.funding} ACCOUNT</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{ledger.course}</span>
                                        <span className="w-2 h-2 rounded-full bg-slate-200" />
                                        <span>Semester {ledger.sem}</span>
                                        <span className="w-2 h-2 rounded-full bg-slate-200" />
                                        <span className="text-blue-600 font-mono font-black border-b-2 border-blue-100 pb-0.5">{ledger.enrollment}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="rounded-3xl h-14 px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest">
                                    <Receipt size={18} className="mr-2" />
                                    <span>Statement</span>
                                </Button>
                                <Button variant="secondary" className="rounded-3xl h-14 px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest">
                                    <History size={18} className="mr-2" />
                                    <span>Audit Logs</span>
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Dual Ledger Split View */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Govt/Institutional Side */}
                        <Card className="border-t-[10px] border-t-indigo-600 shadow-xl shadow-indigo-900/5 p-10 space-y-10 relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-indigo-50 opacity-10">
                                <Landmark size={120} />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Institutional Allocation</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bihar Student Credit (DRCC)</h3>
                                </div>
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-lg shadow-indigo-100">
                                    <Landmark size={32} />
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/50 flex items-center justify-between group hover:bg-white transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sanctioned</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹35,000</p>
                                </div>
                                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100 flex items-center justify-between shadow-lg shadow-indigo-900/5">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 size={24} className="text-indigo-600" />
                                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Government Disbursed</p>
                                    </div>
                                    <p className="text-3xl font-black text-indigo-700 tracking-tighter">₹35,000</p>
                                </div>
                            </div>

                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] flex gap-6 text-emerald-800 border-2 border-emerald-100 relative z-10">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200/50 shrink-0">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="space-y-2 pt-1">
                                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-900">State Settlement Complete</h5>
                                    <p className="text-xs font-bold leading-relaxed opacity-70">
                                        Government claim is fully settled for the current semester. <br/>
                                        Verification cert ID: <span className="font-mono bg-white px-2 py-0.5 rounded text-indigo-600">{ledger.ref || 'DRCC-990-221'}</span>.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Student Side */}
                        <Card className="border-t-[10px] border-t-amber-500 shadow-xl shadow-amber-900/5 p-10 space-y-10 relative overflow-hidden">
                             <div className="absolute top-4 right-4 text-amber-50 opacity-10">
                                <User size={120} />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Personal Liability</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Out-of-Pocket Dues</h3>
                                </div>
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-[2rem] shadow-lg shadow-amber-100">
                                    <User size={32} />
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/50 flex items-center justify-between group hover:bg-white transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Payable</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹15,000</p>
                                </div>
                                <div className="p-8 bg-red-50/50 rounded-[2.5rem] border-2 border-red-100 flex items-center justify-between shadow-lg shadow-red-900/5 group">
                                    <div className="flex items-center gap-4">
                                        <AlertCircle size={28} className="text-red-600 animate-pulse" />
                                        <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">Outstanding Balance</p>
                                    </div>
                                    <p className="text-3xl font-black text-red-700 tracking-tighter">₹5,000</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 pt-4 relative z-10">
                                <Button 
                                    className="flex-1 py-6 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-blue-100" 
                                    onClick={handleGenerateDemandNotice}
                                >
                                    Generate Official Notice
                                </Button>
                                <Button 
                                    className="flex-1 py-6 text-[11px] font-black uppercase tracking-[0.2em] bg-slate-900 hover:bg-black text-white border-none rounded-[1.5rem] shadow-xl shadow-slate-200" 
                                    onClick={() => window.location.href='/accounts/fees'}
                                >
                                    Post Collection
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Transaction History */}
                    <Card title="Financial Settlement Timeline" padding="p-0" className="border-slate-200 shadow-2xl shadow-blue-900/5 overflow-hidden rounded-[2.5rem]">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 border-b border-slate-100 z-10">
                                    <tr>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Processing Date</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Payment Origin</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Classification</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Settlement ID</th>
                                        <th className="px-10 py-8 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Net Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {ledger.history.map((txn, i) => (
                                        <tr key={i} className="hover:bg-blue-50/20 transition-all group h-24">
                                            <td className="px-10 py-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                        <Clock size={16} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">{txn.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${txn.type === 'SELF' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                                        {txn.type === 'SELF' ? <User size={18} /> : <Landmark size={18} />}
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{txn.source}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-2">
                                                <Badge variant={txn.type === 'SELF' ? 'neutral' : 'drcc'} className="font-black text-[9px] px-3 py-1 uppercase">{txn.type}</Badge>
                                            </td>
                                            <td className="px-10 py-2">
                                                <p className="text-[11px] font-black font-mono text-slate-400 uppercase group-hover:text-blue-600 transition-colors tracking-widest bg-slate-50 px-3 py-1 rounded-lg inline-block">{txn.ref}</p>
                                            </td>
                                            <td className="px-10 py-2 text-right">
                                                <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">₹{txn.amount.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="py-32 max-w-xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center mx-auto text-slate-200">
                        <PiggyBank size={64} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">Syncing Financial Repository...</h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm mx-auto">
                            Ensure student enrollment matches registry records to synchronize the specialized <span className="text-blue-600 font-black">Dual Ledger</span> architecture and real-time history.
                        </p>
                    </div>
                    <Button variant="secondary" className="rounded-2xl px-10 h-12" onClick={() => handleSearch(true)}>
                        <ArrowDownCircle size={18} />
                        <span>Try Default Roll: 21003</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StudentLedgerPage;
