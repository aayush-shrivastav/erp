import React, { useState, useEffect } from 'react';
import { Banknote, FileText, Loader2, AlertCircle, Calendar, Download } from 'lucide-react';
import api from '../../utils/api';

const StudentFees = () => {
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [receipts, setReceipts] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const feeRes = await api.get('/fees/my-fees');
            setFees(feeRes.data.data);

            // To fetch receipts, we can either make a dedicated endpoint for "my receipts" 
            // or simply fetch all payments related to the student.
            // For now we'll assume the payments endpoint or a new receipts endpoint exists.
            // Since we didn't explicitly build `/receipts/my-receipts` we can fetch the payments 
            // history using `/accounts/payments` or similar if authorized, but let's assume 
            // the payments array is nested or we'll mock it if not present.
            // Note: The new model doesn't embed 'payments' inside 'StudentFee' directly like the old one,
            // so we'd normally need a `GET /accounts/student-fees/:id/payments` route. 
            // For MVP, we'll display the balance summary.

        } catch (err) {
            console.error("Failed to load fees:", err);
            setError("Could not load fee records.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold border-b-2 border-primary-500 pb-1 inline-block">My Fees</h1>
                <p className="text-slate-500 mt-2">View your assigned fee structures, outstanding balances, and auto-generated fines.</p>
            </div>

            {fees.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                    <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No Fee Records Found</h3>
                    <p className="text-slate-500 mt-1">You currently do not have any active fee assignments.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {fees.map((fee) => {
                        const structure = fee.feeStructure || {};
                        const isPaid = fee.status === 'PAID';
                        const isDue = fee.remainingBalance > 0 && new Date(structure.dueDate) < new Date();

                        return (
                            <div key={fee._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* Header */}
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${isPaid ? 'bg-green-100 text-green-600' : isDue ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                                            <Banknote className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Fee Assignment</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> Due: {structure.dueDate ? new Date(structure.dueDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-500">Balance Due</p>
                                            <h4 className={`text-2xl font-bold ${isPaid ? 'text-green-600' : isDue ? 'text-red-600' : 'text-slate-800'}`}>
                                                ₹{fee.remainingBalance}
                                            </h4>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${isPaid ? 'bg-green-100 text-green-800 border border-green-200' :
                                            fee.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                'bg-red-100 text-red-800 border border-red-200'
                                            }`}>
                                            {fee.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 grid md:grid-cols-2 gap-8">
                                    {/* Breakdown */}
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" /> Fee Breakdown
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                                                <span className="text-slate-600">Tuition Fee</span>
                                                <span className="font-medium text-slate-800">₹{structure.tuitionFee || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                                                <span className="text-slate-600">Lab & Library Fee</span>
                                                <span className="font-medium text-slate-800">₹{(structure.labFee || 0) + (structure.libraryFee || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                                                <span className="text-slate-600">Auto Late Fine Applied</span>
                                                <span className="font-medium text-red-600">₹{fee.autoFineAmount || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                                                <span className="text-slate-600">Manual Penalties</span>
                                                <span className="font-medium text-red-600">₹{fee.totalManualFineAmount || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-1 border-b border-slate-100 bg-green-50 px-2 rounded">
                                                <span className="text-green-700 font-medium">Already Paid</span>
                                                <span className="font-bold text-green-700">- ₹{fee.paidAmount || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-black pt-2 text-slate-900 border-t-2 border-slate-200 mt-2">
                                                <span>Total Payable Balance</span>
                                                <span>₹{fee.remainingBalance}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                        <h4 className="font-semibold text-slate-800 mb-2">Payment Instruction</h4>
                                        <p className="text-sm text-slate-500 mb-6">
                                            To clear your dues, please visit the Accounts office or pay via the designated university portal.
                                        </p>
                                        {fee.paidAmount > 0 && (
                                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 shadow-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                                <Download className="w-4 h-4" /> Request Receipts from Accounts
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentFees;
