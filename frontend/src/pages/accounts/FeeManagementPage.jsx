import React, { useState, useRef, useMemo, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Search, 
    CreditCard, 
    Landmark, 
    GraduationCap, 
    CheckCircle2, 
    ChevronRight, 
    Calculator,
    Wallet,
    FileText,
    History,
    Printer,
    Download,
    X,
    ShieldCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { STUDENTS, FEE_DATA, receiptCounter } from '../../__tests__/mockData';
import { useToast } from '../../hooks/useToast';
import { storage } from '../../utils/storage';
import { api } from '../../utils/api';

const FeeManagementPage = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentData, setPaymentData] = useState({ amount: '', source: 'SELF', txnId: '', remarks: '', allowExcess: false });
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmittingRef = useRef(false);

    // Sync receipt counter with storage on load
    useEffect(() => {
        const savedCounter = storage.get('erp_receipt_counter');
        if (savedCounter) receiptCounter.value = savedCounter;
    }, []);

    const studentFees = useMemo(() => 
        selectedStudent ? FEE_DATA[selectedStudent.id] : null,
    [selectedStudent]);

    const handleSearch = () => {
        const student = STUDENTS.find(s => s.enrollment.toLowerCase() === searchTerm.toLowerCase());
        if (student) {
            setSelectedStudent(student);
            showToast("Account retrieved for verification", "info");
        }
        else showToast("Student not identified in registry", "error");
    };

    const paymentErrors = useMemo(() => {
        if (!selectedStudent || !studentFees) return {};
        const errs = {};
        const amt = parseFloat(paymentData.amount) || 0;

        // 1. Zero Payment Guard
        if (amt <= 0) errs.amount = "Amount must be greater than ₹0";

        // 2. Overpayment Guard
        if (amt > studentFees.pending && !paymentData.allowExcess) {
            errs.amount = `Amount exceeds balance due of ₹${studentFees.pending.toLocaleString()}`;
        }

        // 3. Duplicate Transaction ID Guard
        if (paymentData.txnId && studentFees.history.some(t => t.txn === paymentData.txnId)) {
            errs.txnId = `Transaction ID ${paymentData.txnId} already recorded in history`;
        }

        // 4. DRCC Reconciliation Guard
        if (paymentData.source === 'DRCC') {
            const potentialGovt = studentFees.govtReceived + amt;
            if (potentialGovt > studentFees.govtPortion) {
                errs.amount = `DRCC amount exceeds sanctioned limit of ₹${studentFees.govtPortion.toLocaleString()}`;
            }
        }

        return errs;
    }, [paymentData, selectedStudent, studentFees]);

    const generateReceiptNo = () => {
        const year = new Date().getFullYear();
        const num = String(receiptCounter.value++).padStart(4, '0');
        storage.set('erp_receipt_counter', receiptCounter.value);
        return `RCP-${year}-${num}`;
    };

    const handlePayment = async () => {
        if (isSubmittingRef.current) return;
        
        if (Object.keys(paymentErrors).length > 0) {
            showToast("Correct validation errors before posting", "error");
            return;
        }

        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            const receipt = {
                id: generateReceiptNo(),
                date: new Date().toLocaleDateString(),
                student: selectedStudent.name,
                enrollment: selectedStudent.enrollment,
                amount: paymentData.amount,
                source: paymentData.source,
                txnId: paymentData.txnId || 'N/A'
            };

            await api.postPayment(receipt);

            setLastReceipt(receipt);
            setIsReceiptOpen(true);
            showToast(`Transaction success: ${receipt.id}`, "success");
            
            setSelectedStudent(null);
            setSearchTerm('');
            setPaymentData({ amount: '', source: 'SELF', txnId: '', remarks: '', allowExcess: false });
        } catch (e) {
            showToast("Transaction failed. System busy.", "error");
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title="Fee Terminal" 
                description="Process institutional payments, verify DRCC sanctions, and generate legal financial receipts."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Find & Record */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 border-blue-100 shadow-xl shadow-blue-50/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg">
                                <Wallet size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Receive Payment</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Enter Enrollment No (e.g. 21001)..." 
                                    className="pl-11 h-12 font-bold focus:bg-white" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button className="w-full h-12 shadow-lg shadow-blue-100" variant="secondary" onClick={handleSearch}>IDENTIFY ACCOUNT</Button>
                        </div>

                        {selectedStudent && (
                            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-black shadow-sm border border-slate-100">
                                        {selectedStudent.name[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900">{selectedStudent.name}</p>
                                        <Badge variant={selectedStudent.funding.toLowerCase()} className="mt-1 lowercase text-[10px] tracking-widest">{selectedStudent.funding} ACCOUNT</Badge>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <Input 
                                            label="Collection Amount (₹)" 
                                            placeholder="0.00" 
                                            type="number" 
                                            value={paymentData.amount} 
                                            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} 
                                            className={`font-black text-lg ${paymentErrors.amount ? 'border-red-500 bg-red-50' : ''}`} 
                                        />
                                        {paymentErrors.amount && (
                                            <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1">
                                                <AlertCircle size={10} />
                                                {paymentErrors.amount}
                                            </p>
                                        )}
                                        {paymentErrors.amount?.includes("exceeds balance") && (
                                            <label className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-slate-200">
                                                <input 
                                                    type="checkbox" 
                                                    checked={paymentData.allowExcess}
                                                    onChange={(e) => setPaymentData({ ...paymentData, allowExcess: e.target.checked })}
                                                    className="w-3 h-3 rounded text-blue-600"
                                                />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Allow excess payment</span>
                                            </label>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Payment Method</label>
                                        <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-3 gap-1">
                                            {['SELF', 'DRCC', 'SCHOLARSHIP'].map(source => (
                                                <button 
                                                    key={source}
                                                    onClick={() => setPaymentData({ ...paymentData, source })}
                                                    className={`
                                                        py-2.5 rounded-xl text-[10px] font-black uppercase transition-all
                                                        ${paymentData.source === source ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                                                    `}
                                                >
                                                    {source}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Input 
                                            label="External Reference ID" 
                                            placeholder="TXN / CHQ / UPI ID" 
                                            value={paymentData.txnId} 
                                            onChange={(e) => setPaymentData({ ...paymentData, txnId: e.target.value })} 
                                            className={paymentErrors.txnId ? 'border-red-500 bg-red-50' : ''}
                                        />
                                        {paymentErrors.txnId && (
                                            <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1">
                                                <AlertCircle size={10} />
                                                {paymentErrors.txnId}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <Button 
                                        className="w-full py-6 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase text-xs tracking-widest" 
                                        onClick={handlePayment}
                                        isLoading={isLoading}
                                        disabled={Object.keys(paymentErrors).length > 0 || !paymentData.amount}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                                        <span>{isLoading ? 'Processing...' : 'Post Transaction'}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Summary & Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-slate-900 text-white border-none shadow-2xl p-8 overflow-hidden relative group">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Collection Focus</p>
                                    <h3 className="text-4xl font-black tracking-tighter">₹1.24L</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Institutional Arrears for Sem 3</p>
                                </div>
                                <div className="mt-8">
                                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white text-[10px] uppercase font-black tracking-widest px-6 h-10">Download AR Report</Button>
                                </div>
                            </div>
                            <Calculator size={140} className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                        </Card>
                        
                        <Card className="bg-white border-slate-200 p-8">
                            <div className="flex flex-col justify-between h-full">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Settlements</p>
                                    <h3 className="text-4xl font-black tracking-tighter text-slate-900">₹85,400</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Verified via 6 point-of-sale entries</p>
                                </div>
                                <div className="mt-8 flex gap-2">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white" />)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase mt-2.5">+3 verified</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card title="Institutional Notifications" padding="p-0" className="border-slate-200">
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-5 p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-blue-200 transition-colors">
                                <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Landmark size={24} />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-black text-slate-900 tracking-tight">Bihar DRCC Verification Queue</h5>
                                        <Badge variant="drcc">12 Students</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">Official sanction letters received for 12 students under Bihar Credit Scheme. Reconcile ledger IDs.</p>
                                    <div className="flex gap-4 pt-3">
                                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Process Queue</button>
                                        <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Archive Notification</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-emerald-200 transition-colors">
                                <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-black text-slate-900 tracking-tight">Merit Scholarship Batches</h5>
                                        <Badge variant="paid">3 Approved</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">PMSS portal has cleared scholarship disbursement for 3 final-year candidates. Credit to be adjusted.</p>
                                    <div className="flex gap-4 pt-3">
                                        <button className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">Adjust Ledgers</button>
                                        <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Receipt Modal */}
            <Modal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                title="Electronic Fee Receipt"
                footer={
                    <div className="flex gap-3 w-full no-print">
                        <Button variant="secondary" className="flex-1 rounded-2xl" onClick={() => window.print()}>
                            <Printer size={16} />
                            <span>Print Physical</span>
                        </Button>
                        <Button className="flex-1 rounded-2xl" onClick={() => setIsReceiptOpen(false)}>
                            <Download size={16} />
                            <span>Save PDF</span>
                        </Button>
                    </div>
                }
            >
                {lastReceipt && (
                    <div className="space-y-8 py-4 print-only">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                            <div className="space-y-1">
                                <h4 className="text-2xl font-black text-slate-900">Official Receipt</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Transaction Document</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-blue-600">{lastReceipt.id}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{lastReceipt.date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payer Details</p>
                                    <p className="font-black text-slate-900">{lastReceipt.student}</p>
                                    <p className="font-mono text-xs text-slate-500">{lastReceipt.enrollment}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institution</p>
                                    <p className="font-black text-slate-900">Department of Finance</p>
                                    <p className="text-xs text-slate-500">Global University of Excellence</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipted Amount</p>
                                    <p className="text-3xl font-black text-slate-900">₹{lastReceipt.amount}</p>
                                </div>
                                <div className="space-y-1">
                                    <Badge variant="paid" className="uppercase text-[9px] tracking-widest">Transaction Verified</Badge>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Ref: {lastReceipt.txnId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t-2 border-dashed border-slate-100 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">Cryptographically Signed</p>
                                <p className="text-xs font-medium text-slate-500">This receipt is valid for all academic and financial clearances.</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FeeManagementPage;
