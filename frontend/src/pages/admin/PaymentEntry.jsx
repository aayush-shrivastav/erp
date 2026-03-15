import React, { useState, useEffect } from 'react';
import { Search, CreditCard, AlertCircle, FileText, PlusCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import DualLedger from '../../components/DualLedger';

const PaymentEntry = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [studentFees, setStudentFees] = useState([]);
    const [selectedFee, setSelectedFee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [fineModalOpen, setFineModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [paymentData, setPaymentData] = useState({ amountPaid: '', paymentMode: 'CASH', transactionId: '', paymentSource: 'SELF' });
    const [fineData, setFineData] = useState({ amount: '', reason: 'Late Payment', description: '' });

    // Mock search function since we don't have a direct "search by name" endpoint optimized yet,
    // practically it works by searching the specific student ID or enrollment if we build an index, 
    // but for this MVP dashboard we can load all students or search by direct ID if we know it.
    // In a real scenario, we'd add `GET /students?search=...` then get their fees.
    // For demo/simplicity, we'll fetch fees for a specific known student ID.
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setLoading(true);
        try {
            // First find the student
            const studentRes = await api.get(`/students?search=${searchQuery}`);
            if (studentRes.data.data.length > 0) {
                const studentId = studentRes.data.data[0]._id;
                const res = await api.get(`/accounts/student-fees/${studentId}`);
                setStudentFees(res.data.data);
            } else {
                setStudentFees([]);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/accounts/payments', {
                studentFeeId: selectedFee._id,
                amountPaid: Number(paymentData.amountPaid),
                paymentMode: paymentData.paymentMode,
                transactionId: paymentData.transactionId,
                paymentSource: paymentData.paymentSource
            });
            setSuccessMessage('Payment processed successfully! Receipt generated.');
            setPaymentModalOpen(false);
            setPaymentData({ amountPaid: '', paymentMode: 'CASH', transactionId: '', paymentSource: 'SELF' });
            // Refresh data
            handleSearch({ preventDefault: () => { } });
        } catch (err) {
            alert(err.response?.data?.message || 'Payment processing failed');
        }
    };

    const handleAddFine = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/accounts/student-fees/${selectedFee._id}/manual-fine`, {
                amount: Number(fineData.amount),
                reason: fineData.reason,
                description: fineData.description
            });
            setSuccessMessage('Manual fine added successfully.');
            setFineModalOpen(false);
            setFineData({ amount: '', reason: 'Late Payment', description: '' });
            // Refresh
            handleSearch({ preventDefault: () => { } });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add fine');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Process Payments</h2>
                    <p className="text-slate-500 text-sm mt-1">Search student to view/process fees</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or enrollment..."
                        className="w-80 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 h-10 w-10 flex items-center justify-center">
                        <Search className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 text-green-700 bg-opacity-90 rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {successMessage}
                </div>
            )}

            {studentFees.length > 0 && (
                <div className="space-y-6">
                    {/* Integrated Dual Ledger for the found student */}
                    <DualLedger 
                        studentData={{
                            name: studentFees[0].student?.name,
                            enrollmentNo: studentFees[0].student?.enrollmentNo,
                            totalFee: studentFees.reduce((acc, f) => acc + f.totalPayable, 0),
                            paidAmount: studentFees.reduce((acc, f) => acc + f.paidAmount, 0),
                            pendingAmount: studentFees.reduce((acc, f) => acc + f.remainingBalance, 0),
                            paymentsBySource: {
                                SELF: studentFees.reduce((acc, f) => acc + (f.payments?.filter(p => p.paymentSource === 'SELF').reduce((sum, p) => sum + p.amountPaid, 0) || 0), 0),
                                DRCC: studentFees.reduce((acc, f) => acc + (f.payments?.filter(p => p.paymentSource === 'DRCC').reduce((sum, p) => sum + p.amountPaid, 0) || 0), 0),
                                SCHOLARSHIP: studentFees.reduce((acc, f) => acc + (f.payments?.filter(p => p.paymentSource === 'SCHOLARSHIP').reduce((sum, p) => sum + p.amountPaid, 0) || 0), 0)
                            }
                        }}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {studentFees.map(fee => (
                        <div key={fee._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            {/* Decorative header stripe */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${fee.status === 'PAID' ? 'bg-green-500' : fee.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'}`} />

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{fee.feeStructure?.course?.code || 'Course'} - Sem {fee.feeStructure?.semester?.number} Fee</h3>
                                    <p className="text-sm text-slate-500">Due: {new Date(fee.feeStructure?.dueDate).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                    fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {fee.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Base</p>
                                    <p className="text-lg font-bold text-slate-800">Rs. {fee.totalAmount}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Fines</p>
                                    <p className="text-lg font-bold text-red-600">Rs. {fee.totalFineAmount}</p>
                                    {(fee.autoFineAmount > 0 || fee.totalManualFineAmount > 0) && (
                                        <p className="text-xs text-slate-400 border-t border-slate-200 mt-1 pt-1">
                                            Auto: {fee.autoFineAmount} | Manual: {fee.totalManualFineAmount}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Paid</p>
                                    <p className="text-lg font-bold text-green-600">Rs. {fee.paidAmount}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg border-l-4 border-l-primary-500">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Remaining</p>
                                    <p className="text-xl font-black text-slate-900">Rs. {fee.remainingBalance}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-auto">
                                <button
                                    disabled={fee.status === 'PAID'}
                                    onClick={() => { setSelectedFee(fee); setPaymentData(p => ({ ...p, amountPaid: fee.remainingBalance, paymentSource: fee.student?.fundingType || 'SELF' })); setPaymentModalOpen(true); }}
                                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                                >
                                    <CreditCard className="w-4 h-4" /> Collect Payment
                                </button>
                                <button
                                    disabled={fee.status === 'PAID'}
                                    onClick={() => { setSelectedFee(fee); setFineModalOpen(true); }}
                                    className="px-4 py-2.5 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-orange-200"
                                    title="Add Manual Fine"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

            {/* Modals for Payment and Fines could go here - abbreviated for scaffold logic */}
            {paymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Process Payment</h3>
                            <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay</label>
                                <input type="number" required max={selectedFee?.remainingBalance} value={paymentData.amountPaid} onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })} className={`w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500 ${Number(paymentData.amountPaid) > selectedFee?.remainingBalance ? 'border-red-500 ring-2 ring-red-100' : ''}`} />
                                {Number(paymentData.amountPaid) > selectedFee?.remainingBalance && <p className="text-[10px] text-red-600 mt-1 font-bold italic">⚠️ Amount exceeds remaining balance!</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                                <select required value={paymentData.paymentMode} onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500">
                                    <option value="CASH">CASH</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK">BANK/CHECK</option>
                                    <option value="CARD">CARD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Source</label>
                                <select required value={paymentData.paymentSource} onChange={(e) => setPaymentData({ ...paymentData, paymentSource: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500">
                                    <option value="SELF">SELF</option>
                                    <option value="DRCC">DRCC</option>
                                    <option value="SCHOLARSHIP">SCHOLARSHIP</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID (Optional for Cash)</label>
                                <input type="text" value={paymentData.transactionId} onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {fineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border-t-4 border-orange-500">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Add Manual Fine</h3>
                            <button onClick={() => setFineModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleAddFine} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fine Amount</label>
                                <input type="number" required min="1" value={fineData.amount} onChange={(e) => setFineData({ ...fineData, amount: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <select required value={fineData.reason} onChange={(e) => setFineData({ ...fineData, reason: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500">
                                    <option value="Late Payment">Late Payment</option>
                                    <option value="Library Damage">Library Damage</option>
                                    <option value="ID Card Reissue">ID Card Reissue</option>
                                    <option value="Hostel Late">Hostel Late</option>
                                    <option value="Manual Penalty">Other Manual Penalty</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description (Optional)</label>
                                <textarea value={fineData.description} onChange={(e) => setFineData({ ...fineData, description: e.target.value })} className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500" rows="3" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setFineModalOpen(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Apply Fine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentEntry;
