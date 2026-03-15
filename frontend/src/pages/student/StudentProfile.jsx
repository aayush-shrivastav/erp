import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Building, BookOpen, Clock, Loader2, Key, Star, ShieldCheck, Edit3, Save, X } from 'lucide-react';
import { storage } from '../../utils/storage';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StudentProfile = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Get email from local storage user object
                const user = storage.get('user');
                if (user) setUserEmail(user.email);

                const data = await api.getProfile();
                setProfile(data);

                // Check for draft in storage
                const draft = storage.get('profile_draft');
                if (draft) {
                    setFormData(draft);
                    showToast("Restored unsaved changes from draft", "info");
                    setIsEditing(true);
                } else {
                    setFormData(data);
                }
            } catch (error) {
                showToast("Failed to load profile details", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [showToast]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateProfile(formData);
            setProfile(formData);
            storage.remove('profile_draft');
            setIsEditing(false);
            showToast("Profile updated successfully", "success");
        } catch (e) {
            showToast("Update failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        storage.set('profile_draft', newData);
    };

    if (loading && !profile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Encrypting profile data...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center text-slate-500 bg-white rounded-3xl shadow-xl border border-slate-200 mt-10">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                <p className="font-black text-lg text-slate-900 italic">"Profile not found in central registry"</p>
                <p className="text-sm mt-2">Please contact the academic office for enrollment verification.</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Identity</h1>
                    <p className="text-slate-500 font-medium mt-1">Registry verified student profile & performance index.</p>
                </div>
                {!isEditing ? (
                    <Button variant="secondary" onClick={() => setIsEditing(true)} className="rounded-2xl px-8">
                        <Edit3 size={18} />
                        <span>Update Information</span>
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => {setIsEditing(false); storage.remove('profile_draft');}} className="rounded-2xl px-6 border-red-100 text-red-600 hover:bg-red-50">
                            <X size={18} />
                            <span>Discard Changes</span>
                        </Button>
                        <Button onClick={handleSave} isLoading={loading} className="rounded-2xl px-8 shadow-xl shadow-blue-200">
                            <Save size={18} />
                            <span>Commit Update</span>
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Identity Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-8 text-center overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

                        <div className="w-32 h-32 mx-auto rounded-3xl bg-white p-1.5 shadow-2xl relative z-10 mt-12 flex items-center justify-center overflow-hidden border border-white/50">
                            <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                <User className="w-16 h-16" />
                            </div>
                        </div>

                        <div className="mt-6 relative z-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">{profile.enrollmentNo || profile.enrollment}</p>
                            <Badge variant="active" className="mt-4 px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100">
                                <ShieldCheck size={12} className="mr-1.5" />
                                Verified Profile
                            </Badge>
                        </div>

                        <div className="mt-10 space-y-4 text-left border-t border-slate-50 pt-8">
                            <div className="flex items-center text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-4 text-slate-400"><Mail size={16} /></div>
                                <span className="text-sm font-bold tracking-tight">{userEmail}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-4 text-slate-400"><GraduationCap size={16} /></div>
                                <span className="text-sm font-bold tracking-tight">{profile.course?.name || profile.course || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Performance Index</p>
                                <Star className="text-amber-400 fill-amber-400" size={20} />
                            </div>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-6xl font-black tracking-tighter">
                                    {profile.cgpa ? profile.cgpa : <span className="text-slate-600">0.0</span>}
                                </h3>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">CGPA / 10.0</p>
                                    {!profile.cgpa && <Badge variant="pending" className="text-[8px] px-2 py-0 border-slate-700 text-slate-500">Awaiting Results</Badge>}
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                                    <p className="text-xl font-black italic">#{profile.rank || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Credits</p>
                                    <p className="text-xl font-black italic">{profile.credits || '0'}<span className="text-[10px] text-slate-500 not-italic ml-1">/ 180</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Academic & Personal Details */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Academic Details</h3>
                            </div>
                            {isEditing && <Badge variant="info" className="animate-pulse">Editing Draft</Badge>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {[
                                { label: 'Full Official Name', field: 'name', icon: User },
                                { label: 'Enrollment Number', field: 'enrollmentNo', icon: Key, disabled: true },
                                { label: 'Department', field: 'department', icon: Building, isSubField: true },
                                { label: 'Degree / Course', field: 'course', icon: GraduationCap, isSubField: true },
                                { label: 'Current Semester', field: 'currentSemester', icon: Clock, isSubField: true },
                                { label: 'Assigned Section', field: 'section', icon: LayoutGrid, isSubField: true },
                            ].map((item) => (
                                <div key={item.field} className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <item.icon size={12} />
                                        {item.label}
                                    </label>
                                    {isEditing && !item.disabled ? (
                                        <input 
                                            value={item.isSubField ? (formData[item.field]?.name || formData[item.field] || '') : (formData[item.field] || '')}
                                            onChange={(e) => handleInputChange(item.field, item.isSubField ? { ...formData[item.field], name: e.target.value } : e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-sm"
                                            placeholder={`Enter ${item.label.toLowerCase()}...`}
                                        />
                                    ) : (
                                        <div className="px-5 py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                            <span className={`text-sm font-black tracking-tight ${item.disabled ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                                {item.isSubField ? (profile[item.field]?.name || profile[item.field] || 'Unassigned') : (profile[item.field] || 'Unassigned')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-12 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-5">
                            <Info className="text-blue-600 shrink-0" size={24} />
                            <p className="text-xs font-bold text-blue-800/70 leading-relaxed">
                                <strong>Privacy Notice:</strong> Changes to Enrollment Number, Department, or Course require administrative approval and physical document verification at the Registrar's office.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default StudentProfile;
