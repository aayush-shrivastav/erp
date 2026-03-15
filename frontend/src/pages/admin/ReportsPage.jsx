import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { 
    FileText, 
    Users, 
    Backpack, 
    CreditCard, 
    GraduationCap, 
    Briefcase,
    Printer,
    Download,
    ChevronRight,
    Search
} from 'lucide-react';

const ReportsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const reportCategories = [
        {
            title: "Academic & Curriculum",
            icon: GraduationCap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            reports: [
                { id: 'admit', name: "Examination Admit Cards", desc: "Batch generate student credentials for active session", type: "PDF" },
                { id: 'workload', name: "Faculty Workload Audit", desc: "Detailed credit distribution across departments", type: "Official" },
                { id: 'schedule', name: "Master Class Timetable", desc: "Coherent view of section-wise lectures", type: "CSV" }
            ]
        },
        {
            title: "Financial Governance",
            icon: CreditCard,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            reports: [
                { id: 'ledger', name: "Institutional Split Ledger", desc: "Government vs Student liability breakdown", type: "Audit" },
                { id: 'receipts', name: "Bulk Fee Receipts", desc: "Consolidated transaction history for current month", type: "PDF" },
                { id: 'overdue', name: "Pending Dues Analysis", desc: "Identify students with critical balance alerts", type: "Actionable" }
            ]
        },
        {
            title: "Student Administration",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            reports: [
                { id: 'backlog', name: "Consolidated Backlog Registry", desc: "Track pending clearance across all years", type: "Registry" },
                { id: 'bonafide', name: "Bonafide Certificates", desc: "Institutional proof of active enrollment", type: "Official" },
                { id: 'attendance', name: "Critical Attendance Report", desc: "Warning list for students below 75% threshold", type: "Alert" }
            ]
        }
    ];

    return (
        <div className="space-y-10 animate-fade-in mb-20">
            <PageHeader 
                title="Institutional Reports Hub" 
                description="Secure portal for generating high-fidelity audit reports, academic credentials, and financial statements."
            />

            <div className="relative max-w-2xl mx-auto mb-16">
                 <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    placeholder="Search report templates (e.g. 'Backlog', 'DRCC Ledger')..."
                    className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-12">
                {reportCategories.map((cat, i) => (
                    <div key={i} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className={`p-2.5 rounded-xl ${cat.bg} ${cat.color} shadow-sm border border-current/10`}>
                                <cat.icon size={20} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{cat.title}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {cat.reports.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((report, ri) => (
                                <Card key={ri} className="p-0 border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group overflow-hidden rounded-[2rem]">
                                    <div className="p-8 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                <FileText size={24} />
                                            </div>
                                            <Badge variant="neutral" className="text-[8px] font-black uppercase bg-white border shadow-sm">{report.type}</Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-900 leading-tight">{report.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 leading-relaxed">{report.desc}</p>
                                        </div>
                                    </div>
                                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
                                        <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                            <Printer size={14} />
                                            <span>Generate</span>
                                        </button>
                                        <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-slate-900 rounded-[3rem] text-center space-y-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <Badge className="absolute top-10 left-10 rotate-12 scale-150">OFFICIAL</Badge>
                    <Badge className="absolute bottom-10 right-20 -rotate-12 scale-150">SECURE</Badge>
                </div>
                <h4 className="text-2xl font-black text-white tracking-tight">Need a Custom Report Specification?</h4>
                <p className="text-sm text-slate-400 font-bold max-w-lg mx-auto leading-relaxed">
                    Institutional administrators can request ad-hoc reporting modules via the central technical support channel. All data exports follow GDPR and local data privacy standards.
                </p>
                <div className="flex justify-center flex-wrap gap-4 pt-4">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-widest">
                        Contact Support
                    </Button>
                    <Button variant="secondary" className="border-slate-700 text-slate-400 hover:text-white rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-widest">
                        View Audit Logs
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
