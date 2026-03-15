import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, CreditCard, Receipt, FileText, TrendingUp, Wallet, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);

    const [filters, setFilters] = useState({ session: '', status: '', fromDate: '', toDate: '' });

    const [feeForm, setFeeForm] = useState({
        session: '',
        sectionId: '',
        student: '',
        dueDate: '',
        tuitionFee: 0,
        libraryFee: 0,
        transportFee: 0,
        otherFee: 0
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'CASH',
        paymentSource: 'SELF',
        transactionId: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchFees();
        fetchMetrics();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [sessionsRes, sectionsRes] = await Promise.all([
                api.get('/academic/sessions'),
                api.get('/sections')
            ]);
            setSessions(sessionsRes.data.data);
            setSections(sectionsRes.data.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchFees = async () => {
        try {
            let query = '';
            if (filters.session) query += `session=${filters.session}&`;
            if (filters.status) query += `status=${filters.status}&`;
            if (filters.fromDate) query += `fromDate=${filters.fromDate}&`;
            if (filters.toDate) query += `toDate=${filters.toDate}&`;

            // Adjust to the right endpoint based on your backend routing if necessary.
            // Using /accounts/student-fees logic or fallback to old /fees if unchanged.
            // Assuming old /fees works or replacing it with accounts/student-fees endpoint.
            // If the old one is at /fees, sticking to it. If it's the new accounts one, it would be /accounts/student-fees.
            // We will use the existing /fees endpoint as per prior code, but ideally the new one.
            const res = await api.get(`/fees?${query}`);
            setFees(res.data.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
        }
    };

    const fetchMetrics = async () => {
        try {
            let query = '';
            if (filters.fromDate) query += `fromDate=${filters.fromDate}&`;
            if (filters.toDate) query += `toDate=${filters.toDate}&`;

            const res = await api.get(`/accounts/dashboard?${query}`);
            setMetrics(res.data.data);
        } catch (error) {
            console.error('Error fetching metrics', error);
        }
    };

    const handleSectionChange = async (sectionId) => {
        setFeeForm({ ...feeForm, sectionId, student: '' });
        if (!sectionId) {
            setStudents([]);
            return;
        }
        try {
            const res = await api.get(`/students?section=${sectionId}`);
            setStudents(res.data.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleCreateFee = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const totalAmount = Number(feeForm.tuitionFee) + Number(feeForm.libraryFee) + Number(feeForm.transportFee) + Number(feeForm.otherFee);

            const payload = {
                student: feeForm.student,
                session: feeForm.session,
                dueDate: feeForm.dueDate,
                totalAmount,
                components: {
                    tuitionFee: Number(feeForm.tuitionFee),
                    libraryFee: Number(feeForm.libraryFee),
                    transportFee: Number(feeForm.transportFee),
                    otherFee: Number(feeForm.otherFee)
                }
            };

            await api.post('/fees', payload);
            setIsCreateModalOpen(false);
            fetchFees();
            fetchMetrics();
            setFeeForm({
                session: '', sectionId: '', student: '', dueDate: '',
                tuitionFee: 0, libraryFee: 0, transportFee: 0, otherFee: 0
            });
        } catch (error) {
            console.error('Error creating fee:', error);
            alert(error.response?.data?.message || 'Failed to create fee structure');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!selectedFee) return;
        setIsLoading(true);
        try {
            // Updated to the new accounts/payments endpoint 
            // In the backend, we built /accounts/payments for processPayment
            // We will map studentFeeId to the selectedFee ID. If selectedFee uses a different ID scheme, adjust.
            // Using the old /fees/:id/payments if the route was not updated, but we created accounts routes.
            // We'll use the new /accounts/payments endpoint for robust feature support.

            await api.post('/accounts/payments', {
                studentFeeId: selectedFee._id, // Assuming selectedFee is a StudentFee / Fee doc
                amountPaid: Number(paymentForm.amount),
                paymentMode: paymentForm.paymentMethod,
                paymentSource: paymentForm.paymentSource,
                transactionId: paymentForm.transactionId
            });
            setIsPaymentModalOpen(false);
            fetchFees();
            fetchMetrics();
            setPaymentForm({ amount: '', paymentMethod: 'CASH', paymentSource: 'SELF', transactionId: '' });
            setSelectedFee(null);
        } catch (error) {
            console.error('Error recording payment:', error);
            alert(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = Number(feeForm.tuitionFee) + Number(feeForm.libraryFee) + Number(feeForm.transportFee) + Number(feeForm.otherFee);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Fee Management</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        Financial Overview & Collections <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 hover:shadow-md transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Assign Fee structure
                </button>
            </div>

            {/* Dashboard Metrics */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title="Total Revenue" amount={metrics.totalRevenue} icon={<TrendingUp className="text-blue-600" />} color="bg-blue-50" />
                    <MetricCard title="Total Pending" amount={metrics.totalPending} icon={<AlertCircle className="text-rose-600" />} color="bg-rose-50" />
                    <MetricCard title="Total Collected" amount={metrics.totalCollected} icon={<CheckCircle2 className="text-emerald-600" />} color="bg-emerald-50" />
                    <MetricCard title="Today's Collection" amount={metrics.todayCollection} icon={<Clock className="text-purple-600" />} color="bg-purple-50" />

                    {/* Collection Breakdown Cards */}
                    <MetricCard title="Self-Paid" amount={metrics.selfCollection} icon={<Wallet className="text-slate-600" />} color="bg-slate-50" />
                    <MetricCard title="DRCC Funds" amount={metrics.drccCollection} icon={<DollarSign className="text-cyan-600" />} color="bg-cyan-50" />
                    <MetricCard title="Scholarship Credits" amount={metrics.scholarshipCollection} icon={<FileText className="text-amber-600" />} color="bg-amber-50" />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date Range From</label>
                    <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                        value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date Range To</label>
                    <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                        value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Session</label>
                    <select
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                        value={filters.session}
                        onChange={(e) => setFilters({ ...filters, session: e.target.value })}
                    >
                        <option value="">All Sessions</option>
                        {sessions.map(s => <option key={s._id} value={s._id}>{s.year || s.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending (Unpaid)</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="PAID">Paid Full</option>
                    </select>
                </div>
            </div>

            {/* Fee Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Student Name</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Total Fee</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Paid Amount</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Pending Balance</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Due Date</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                            <span className="font-medium text-lg text-slate-600">No fee records found</span>
                                            <p className="text-sm">Try adjusting your filters or assigning new fees.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : fees.map(fee => {
                                // Adapt calculation whether it is the old Fee model or new StudentFee model. Data mapping might vary.
                                // Assuming compatibility with old model property names.
                                const total = fee.totalAmount || fee.totalPayable;
                                const paid = fee.paidAmount || 0;
                                const balance = fee.remainingBalance !== undefined ? fee.remainingBalance : (total - paid);
                                const status = fee.status || 'UNPAID';

                                return (
                                    <tr key={fee._id} className="hover:bg-slate-50/50 transition duration-200">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{fee.student?.name || 'N/A'}</p>
                                            <p className="text-sm font-mono text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-0.5">{fee.student?.enrollmentNo}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700 tracking-tight">
                                            ₹{total?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600 tracking-tight">
                                            ₹{paid?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold tracking-tight ${balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                ₹{balance?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {new Date(fee.dueDate || fee.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {status === 'PAID' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold tracking-wide">PAID</span>}
                                            {status === 'PARTIAL' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wide">PARTIAL</span>}
                                            {(status === 'PENDING' || status === 'UNPAID') && <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold tracking-wide">PENDING</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {status !== 'PAID' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedFee(fee);
                                                        setPaymentForm({ ...paymentForm, amount: balance });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-lg font-bold text-sm transition-all duration-300 shadow-sm"
                                                >
                                                    <CreditCard className="w-4 h-4" /> Collect
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Fee Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Assign Fee to Student">
                <form onSubmit={handleCreateFee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={feeForm.session}
                                onChange={(e) => setFeeForm({ ...feeForm, session: e.target.value })}
                            >
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s._id} value={s._id}>{s.year || s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={feeForm.dueDate}
                                onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Section</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={feeForm.sectionId}
                                onChange={(e) => handleSectionChange(e.target.value)}
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                value={feeForm.student}
                                onChange={(e) => setFeeForm({ ...feeForm, student: e.target.value })}
                                disabled={!feeForm.sectionId}
                            >
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.enrollmentNo})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                        <h3 className="font-semibold text-slate-700 border-b pb-2">Fee Components</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tuition Fee (₹)</label>
                                <input
                                    type="number" min="0" required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    value={feeForm.tuitionFee}
                                    onChange={(e) => setFeeForm({ ...feeForm, tuitionFee: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Library Fee (₹)</label>
                                <input
                                    type="number" min="0" required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    value={feeForm.libraryFee}
                                    onChange={(e) => setFeeForm({ ...feeForm, libraryFee: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Transport Fee (₹)</label>
                                <input
                                    type="number" min="0" required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    value={feeForm.transportFee}
                                    onChange={(e) => setFeeForm({ ...feeForm, transportFee: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Other Fee (₹)</label>
                                <input
                                    type="number" min="0" required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                    value={feeForm.otherFee}
                                    onChange={(e) => setFeeForm({ ...feeForm, otherFee: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-md border text-lg font-bold text-slate-800">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={isLoading || totalAmount === 0} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">Assign Fee</button>
                    </div>
                </form>
            </Modal>

            {/* Record Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
                {selectedFee && (() => {
                    const balance = selectedFee.remainingBalance !== undefined ? selectedFee.remainingBalance : (selectedFee.totalAmount - (selectedFee.paidAmount || 0));
                    return (
                        <form onSubmit={handleRecordPayment} className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm mb-4 border border-slate-200 shadow-inner flex flex-col gap-2">
                                <p className="flex justify-between border-b pb-2"><span className="font-semibold text-slate-700">Student:</span> <span className="font-bold">{selectedFee.student?.name}</span></p>
                                <p className="flex justify-between text-lg"><span className="font-semibold text-slate-700">Pending Amount:</span> <span className="font-black text-rose-600">₹{balance.toLocaleString()}</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Payment Amount (₹) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={balance}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-300 shadow-sm rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg text-slate-800"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Status after pay: {
                                        Number(paymentForm.amount) === balance ? <span className="text-emerald-600 font-bold uppercase">Paid</span> :
                                            (Number(paymentForm.amount) > 0 ? <span className="text-amber-600 font-bold uppercase">Partial</span> : '-')
                                    }</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Payment Source *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-300 shadow-sm rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-700"
                                        value={paymentForm.paymentSource}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentSource: e.target.value })}
                                    >
                                        <option value="SELF">Self-Paid</option>
                                        <option value="DRCC">DRCC Funded</option>
                                        <option value="SCHOLARSHIP">Scholarship Credits</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Payment Method *</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-300 shadow-sm rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-700"
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="ONLINE">Online (UPI/Netbanking)</option>
                                    <option value="DD">Demand Draft</option>
                                </select>
                            </div>

                            {['CARD', 'ONLINE', 'DD'].includes(paymentForm.paymentMethod) && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Transaction ID / DD Number *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-300 shadow-sm rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-700"
                                        value={paymentForm.transactionId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                                <button type="submit" disabled={isLoading || !paymentForm.amount || paymentForm.amount <= 0} className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2">
                                    {isLoading ? 'Processing...' : <><CreditCard className="w-5 h-5" /> Confirm Payment</>}
                                </button>
                            </div>
                        </form>
                    );
                })()}
            </Modal>
        </div>
    );
};

// Reusable Metric Card Component
const MetricCard = ({ title, amount, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">₹{(amount || 0).toLocaleString()}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
    </div>
);

export default Fees;
