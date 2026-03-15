import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/layout/PageHeader';
import { 
    FileText, 
    Download, 
    ShieldCheck, 
    ScrollText, 
    Award, 
    ChevronRight,
    Printer,
    Clock,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DocumentsPage = () => {
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);

    const documentCategories = [
        {
            title: "Academic Credentials",
            docs: [
                { id: 'marksheet', name: "Consolidated Marksheet", type: "OFFICIAL", desc: "Aggregated results across all cleared semesters.", available: true },
                { id: 'admit', name: "Hall Ticket / Admit Card", type: "SESSIONAL", desc: "Examination credential for active session.", available: true },
                { id: 'transcript', name: "Academic Transcript", type: "PREVIEW", desc: "Detailed record of courses and grades.", available: false, why: "Request via Office" }
            ]
        },
        {
            title: "Institutional Certificates",
            docs: [
                { id: 'bonafide', name: "Bonafide Certificate", type: "AUTOMATED", desc: "Proof of active student status for bus/railway/visa.", available: true },
                { id: 'character', name: "Character Certificate", type: "MANUAL", desc: "Verified conduct record from the Principal's office.", available: false, why: "Under Review" },
                { id: 'noc', name: "No Objection Certificate", type: "PURPOSE-BASED", desc: "For internships or external participation.", available: true }
            ]
        }
    ];

    const handleDownload = async (docName) => {
        setIsGenerating(true);
        // Simulate PDF generation delay
        await new Promise(r => setTimeout(r, 2000));
        setIsGenerating(false);
        alert(`Generating official PDF for: ${docName}. In a real app, this would trigger a file download.`);
    };

    return (
        <div className="space-y-10 animate-fade-in mb-20">
            <PageHeader 
                title="Institutional Repository" 
                description="Securely access, verify, and download official university documentation and credentials."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    {documentCategories.map((cat, i) => (
                        <div key={i} className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">{cat.title}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {cat.docs.map((doc, di) => (
                                    <Card key={di} className={`p-0 border-slate-100 shadow-xl shadow-slate-900/5 transition-all group overflow-hidden ${!doc.available ? 'opacity-60 saturate-50' : 'hover:border-blue-200'}`}>
                                        <div className="p-6 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${doc.available ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-300'}`}>
                                                    {doc.id === 'marksheet' ? <ScrollText size={28} /> : doc.id === 'bonafide' ? <UserCheck size={28} /> : <FileText size={28} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-slate-900 leading-tight">{doc.name}</h4>
                                                        <Badge variant="neutral" className="text-[7px] font-black uppercase py-0 px-1.5">{doc.type}</Badge>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed font-medium">
                                                        {doc.available ? doc.desc : `Unavailable: ${doc.why}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                {doc.available ? (
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        className="rounded-xl border-slate-100 hover:bg-blue-50 hover:text-blue-600 p-2 h-10 w-10"
                                                        onClick={() => handleDownload(doc.name)}
                                                        isLoading={isGenerating}
                                                    >
                                                        <Download size={18} />
                                                    </Button>
                                                ) : (
                                                    <div className="p-2 text-slate-300">
                                                        <AlertCircle size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar: Status & Info */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-slate-900/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mt-16 blur-2xl opacity-20"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={24} className="text-blue-400" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Security & Validity</h4>
                            </div>
                            <p className="text-xs font-medium leading-relaxed text-slate-300">
                                All downloaded documents are <span className="text-white font-black">Digitally Signed</span> and contain QR codes for institutional verification.
                            </p>
                            <div className="pt-4 border-t border-slate-800 space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Verification Status</span>
                                    <span className="text-emerald-400">Active</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Identity Proof</span>
                                    <span className="text-white">Verified</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-slate-100 shadow-xl shadow-slate-900/5 rounded-[2rem] space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Timeline</h4>
                        <div className="space-y-6">
                            {[
                                { event: 'Consolidated Marksheet Generated', time: '2h ago', icon: Clock },
                                { event: 'Degree Application Received', time: '1d ago', icon: FileText },
                                { event: 'NOC for Internship Approved', time: '3d ago', icon: ShieldCheck },
                            ].map((evt, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <evt.icon size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-black text-slate-700 leading-tight">{evt.event}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{evt.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem]">
                        <p className="text-[10px] font-bold text-blue-700 leading-relaxed text-center">
                            Facing issues with generating documents? Visit the <span className="font-black underline cursor-pointer">Registrar's Office</span> for manual verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsPage;
