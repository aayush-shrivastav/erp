import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { 
    Landmark, 
    Calendar, 
    Layers, 
    Users, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft,
    ShieldCheck,
    GraduationCap,
    MapPin
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const OnboardingWizard = () => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        collegeName: '',
        shortCode: '',
        location: '',
        activeSession: '2024–2025',
        startDate: '',
        endDate: '',
        departments: ['CSE', 'ECE', 'ME'],
        adminUser: 'SuperAdmin'
    });

    const steps = [
        { id: 1, title: 'Identity', icon: Landmark, desc: 'College branding & location' },
        { id: 2, title: 'Session', icon: Calendar, desc: 'Academic year definition' },
        { id: 3, title: 'Structure', icon: Layers, desc: 'Departments & branches' },
        { id: 4, title: 'Verification', icon: ShieldCheck, desc: 'Final review & deploy' }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleComplete = () => {
        showToast("Institutional Configuration Deployed!", "success");
        window.location.href = '/admin/dashboard';
    };

    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center p-6 animate-fade-in mb-20">
            <div className="w-full max-w-4xl space-y-12">
                {/* Progress Header */}
                <div className="flex justify-between items-center px-4">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-4 group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${step >= s.id ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                {step > s.id ? <CheckCircle2 size={24} /> : <s.icon size={22} />}
                            </div>
                            <div className="hidden md:block">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-blue-600' : 'text-slate-300'}`}>Step 0{s.id}</p>
                                <h4 className={`text-sm font-black tracking-tight ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</h4>
                            </div>
                            {i < steps.length - 1 && <div className={`hidden md:block w-12 h-0.5 rounded-full mx-4 ${step > s.id ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>

                <Card className="p-10 border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
                    
                    <div className="relative z-10 space-y-10">
                        <div className="space-y-2">
                             <Badge variant="active" className="uppercase tracking-[0.2em] font-black py-1 px-3 mb-2 rounded-full">Deployment Phase</Badge>
                             <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{steps[step-1].title}: {steps[step-1].desc}</h2>
                        </div>

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                <Input 
                                    label="Institutional Name" 
                                    placeholder="e.g. Bihar Institute of Technology" 
                                    value={formData.collegeName}
                                    onChange={e => setFormData({...formData, collegeName: e.target.value})}
                                />
                                <Input 
                                    label="Administrative Code" 
                                    placeholder="e.g. BIT-CE" 
                                    value={formData.shortCode}
                                    onChange={e => setFormData({...formData, shortCode: e.target.value})}
                                />
                                <div className="md:col-span-2">
                                     <Input 
                                        label="Primary Campus Location" 
                                        placeholder="City, State, Country" 
                                        icon={MapPin}
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Session */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Academic Session</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm">
                                        <option>2024–2025</option>
                                        <option>2023–2024-EX</option>
                                    </select>
                                </div>
                                <Input label="Cycle Start Date" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                <Input label="Cycle End Date" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                            </div>
                        )}

                        {/* Step 3: Structure */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-wrap gap-3">
                                    {formData.departments.map((dept, i) => (
                                        <Badge key={i} variant="neutral" className="bg-white border text-blue-600 font-black py-2 px-4 rounded-xl flex items-center gap-3">
                                            {dept}
                                            <button className="text-slate-300 hover:text-red-500 transition-colors">×</button>
                                        </Badge>
                                    ))}
                                    <button className="p-2 border-2 border-slate-200 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all border-dashed">
                                        <PlusCircle size={18} />
                                    </button>
                                </div>
                                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-blue-100 flex gap-6 text-blue-800">
                                    <GraduationCap size={40} className="shrink-0" />
                                    <div className="space-y-1">
                                        <h5 className="text-[11px] font-black uppercase tracking-widest">Automatic Node Generation</h5>
                                        <p className="text-xs font-medium leading-relaxed opacity-70">
                                            The system will automatically generate standard Section units (C1, C2) and Lab Groups (G1, G2) for each branch established above.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Verification */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/30">
                                    {[
                                        { label: 'College', value: formData.collegeName || 'BIT University' },
                                        { label: 'Location', value: formData.location || 'Patna, Bihar' },
                                        { label: 'Active Session', value: formData.activeSession },
                                        { label: 'Departments', value: formData.departments.join(', ') },
                                        { label: 'Primary Admin', value: formData.adminUser },
                                    ].map((item, i) => (
                                        <div key={i} className="px-8 py-5 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-sm font-black text-slate-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 flex gap-6 text-emerald-800">
                                    < ShieldCheck size={40} className="shrink-0" />
                                    <div className="space-y-1">
                                        <h5 className="text-[11px] font-black uppercase tracking-widest">Readiness Check Complete</h5>
                                        <p className="text-xs font-medium leading-relaxed opacity-70">
                                            Baseline database migrations and institutional schemas are ready for deployment. Proceed to initialize the dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-10 border-t border-slate-100">
                            <Button variant="secondary" onClick={prevStep} disabled={step === 1} className="rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-widest border-slate-200">
                                <ArrowLeft size={18} className="mr-2" />
                                <span>Back</span>
                            </Button>
                            {step < 4 ? (
                                <Button onClick={nextStep} className="rounded-2xl h-14 px-10 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100">
                                    <span>Continue</span>
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleComplete} className="rounded-2xl h-14 px-14 font-black text-[11px] uppercase tracking-widest bg-slate-900 hover:bg-black text-white border-none shadow-2xl shadow-slate-900/20">
                                    <span>Initialize System</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const PlusCircle = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default OnboardingWizard;
