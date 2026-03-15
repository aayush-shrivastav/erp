import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import { 
    ChevronRight, 
    ChevronDown, 
    Landmark, 
    Users, 
    Book, 
    GraduationCap, 
    MapPin,
    Calendar,
    Settings,
    Edit2,
    Trash2,
    PlusCircle,
    MoreVertical,
    Layers,
    UserCircle2,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { STUDENTS } from '../../__tests__/mockData';

const ClassTreePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState([]);

    // Logic 1.4: Dynamic Occupancy Calculation
    const getOccupancy = (groupId) => {
        // In a real system, students would have a 'groupId' property. 
        // For this demo, we use a mapping or derive it.
        // Mock logic: Divide roll numbers into ranges for groups.
        if (groupId === 'g1') return STUDENTS.filter(s => s.id <= 22).length;
        if (groupId === 'g2') return STUDENTS.filter(s => s.id > 22 && s.id <= 42).length;
        if (groupId === 'g3') return 18; // Fixed mock for others
        return 15;
    };

    const academicData = useMemo(() => ({
        name: "College of Engineering",
        semesters: [
            {
                id: 'sem-3',
                name: 'Semester 3',
                sections: [
                    {
                        id: 'sec-3c1',
                        name: 'Section 3C1',
                        branch: 'CSE',
                        capacity: 60,
                        groups: [
                            { id: 'g1', name: 'Lab Group G1', capacity: 20, teacher: 'Dr. RK Singh', room: 'L-101' },
                            { id: 'g2', name: 'Lab Group G2', capacity: 25, teacher: 'Prof. Amit Sharma', room: 'L-102' },
                            { id: 'g3', name: 'Lab Group G3', capacity: 25, teacher: 'Dr. Neha Gupta', room: 'L-103' },
                        ]
                    },
                    {
                        id: 'sec-3c2',
                        name: 'Section 3C2',
                        branch: 'CSE',
                        capacity: 60,
                        groups: [
                            { id: 'g4', name: 'Lab Group G4', capacity: 25, teacher: 'Dr. Vivek Kumar', room: 'L-104' },
                        ]
                    }
                ]
            }
        ]
    }), []);

    useEffect(() => {
        const sem = searchParams.get('sem');
        const sec = searchParams.get('sec');
        const grp = searchParams.get('grp');
        
        const nodes = [];
        if (sem) nodes.push(sem);
        if (sec) nodes.push(sec);
        if (nodes.length > 0) setExpandedNodes(prev => [...new Set([...prev, ...nodes])]);
        
        if (grp) {
            const foundGrp = academicData.semesters
                .flatMap(s => s.sections)
                .flatMap(sec => sec.groups)
                .find(g => g.id === grp);
            if (foundGrp) {
                const occupancy = getOccupancy(foundGrp.id);
                setSelectedGroup({ ...foundGrp, occupancy });
            }
        }
    }, [searchParams, academicData]);

    const updateUrl = (sem, sec, grp) => {
        const params = {};
        if (sem) params.sem = sem;
        if (sec) params.sec = sec;
        if (grp) params.grp = grp;
        setSearchParams(params);
    };

    const toggleNode = (id, type, parentId) => {
        setExpandedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
        if (type === 'sem') updateUrl(id, null, null);
        if (type === 'sec') updateUrl(parentId, id, null);
    };

    const handleSelectGroup = (group, secId, semId) => {
        const occupancy = getOccupancy(group.id);
        setSelectedGroup({ ...group, occupancy });
        updateUrl(semId, secId, group.id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader 
                title="Academic Hierarchy" 
                description="Manage the physical and logical organization of students with real-time capacity monitoring."
            />

            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-220px)]">
                {/* Left Panel: The Tree */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4">
                    <Card padding="p-0" className="flex-1 overflow-hidden flex flex-col border-slate-200 shadow-2xl shadow-slate-900/5">
                        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layers size={18} className="text-blue-600" />
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Tree</h3>
                            </div>
                            <button className="text-blue-600 hover:bg-blue-600 hover:text-white p-1.5 rounded-xl transition-all shadow-sm" title="Add Semester">
                                <PlusCircle size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {academicData.semesters.map(sem => (
                                <div key={sem.id} className="space-y-2">
                                    <div className="flex items-center group gap-2">
                                        <button 
                                            onClick={() => toggleNode(sem.id, 'sem')}
                                            className={`flex-1 flex items-center gap-3 p-3.5 rounded-[1.25rem] text-sm font-black transition-all ${expandedNodes.includes(sem.id) ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-700 hover:bg-slate-100/80 bg-slate-50 border border-slate-100'}`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${expandedNodes.includes(sem.id) ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                {expandedNodes.includes(sem.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                            <Calendar size={18} className={expandedNodes.includes(sem.id) ? 'text-blue-200' : 'text-slate-400'} />
                                            {sem.name}
                                        </button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"><Edit2 size={14} /></button>
                                        </div>
                                    </div>
                                    
                                    {expandedNodes.includes(sem.id) && (
                                        <div className="ml-5 pl-5 border-l-2 border-slate-100 space-y-3 py-1">
                                            {sem.sections.map(section => {
                                                const secOcc = section.groups.reduce((acc, g) => acc + getOccupancy(g.id), 0);
                                                const isOverCap = secOcc > section.capacity;
                                                
                                                return (
                                                    <div key={section.id} className="space-y-2">
                                                        <div className="flex items-center group gap-2">
                                                            <button 
                                                                onClick={() => toggleNode(section.id, 'sec', sem.id)}
                                                                className={`flex-1 flex items-center justify-between p-4 rounded-2xl text-[11px] font-black transition-all ${expandedNodes.includes(section.id) ? 'text-slate-900 bg-white border-2 border-blue-100 shadow-lg' : 'text-slate-500 hover:bg-slate-50 border-2 border-transparent'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Landmark size={16} className={expandedNodes.includes(section.id) ? 'text-blue-500' : 'text-slate-400'} />
                                                                    {section.name}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={isOverCap ? 'failed' : 'neutral'} className="text-[9px] rounded-lg">
                                                                        {secOcc}/{section.capacity}
                                                                    </Badge>
                                                                    {isOverCap && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                                                                </div>
                                                            </button>
                                                            <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-opacity"><MoreVertical size={14} /></button>
                                                        </div>
                                                        
                                                        {expandedNodes.includes(section.id) && (
                                                            <div className="ml-4 pl-5 border-l-2 border-slate-100 space-y-2 py-1">
                                                                {section.groups.map(group => {
                                                                    const occ = getOccupancy(group.id);
                                                                    const over = occ > group.capacity;
                                                                    const isSelected = selectedGroup?.id === group.id;

                                                                    return (
                                                                        <div key={group.id} className="flex items-center group gap-2">
                                                                            <button 
                                                                                onClick={() => handleSelectGroup(group, section.id, sem.id)}
                                                                                className={`flex-1 flex items-center justify-between p-3.5 rounded-xl text-[10px] transition-all ${
                                                                                    isSelected 
                                                                                    ? 'bg-blue-600 text-white font-black shadow-xl shadow-blue-200 ring-4 ring-blue-600/10' 
                                                                                    : 'text-slate-600 hover:bg-blue-50 font-bold bg-white/50 border border-slate-100'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <Users size={16} className={isSelected ? 'text-blue-200' : 'text-slate-400'} />
                                                                                    {group.name}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`text-[9px] font-black ${isSelected ? 'text-blue-100' : over ? 'text-red-500' : 'text-slate-400'}`}>
                                                                                        {occ} / {group.capacity}
                                                                                    </span>
                                                                                    {over && !isSelected && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Detail View */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                    {selectedGroup ? (
                        <div className="animate-in slide-in-from-right-8 duration-700 space-y-8">
                            <Card className="bg-white border-blue-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden p-10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start mb-10 relative z-10 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="active" className="uppercase tracking-widest px-3 py-1 text-[10px] rounded-full">Hierarchy Level: Group</Badge>
                                            <span className="text-slate-400 font-mono text-[9px] bg-slate-50 px-2 py-1 rounded">LOC: {selectedGroup.room}</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{selectedGroup.name}</h2>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" size="lg" className="rounded-2xl shadow-sm border-slate-100">
                                            <Settings size={18} className="mr-2" />
                                            <span>Configure</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                    {[
                                        { label: 'Primary Tutor', value: selectedGroup.teacher, icon: UserCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { 
                                            label: 'Occupancy Rate', 
                                            value: `${selectedGroup.occupancy} / ${selectedGroup.capacity} Students`, 
                                            icon: Users, 
                                            color: selectedGroup.occupancy > selectedGroup.capacity ? 'text-red-600' : 'text-blue-600', 
                                            bg: selectedGroup.occupancy > selectedGroup.capacity ? 'bg-red-50' : 'bg-blue-50',
                                            warning: selectedGroup.occupancy > selectedGroup.capacity ? 'Capacity overflow alert!' : null
                                        },
                                        { label: 'Assigned Lab', value: selectedGroup.room, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Asset Status', value: 'Nominal', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-lg shadow-slate-900/5 transition-all hover:scale-[1.02]">
                                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-inner`}>
                                                <stat.icon size={24} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-sm font-black text-slate-900">{stat.value}</p>
                                            {stat.warning && <p className="text-[9px] font-bold text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={10} /> {stat.warning}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <Card padding="p-0" className="shadow-xl shadow-slate-900/5 border-slate-200 overflow-hidden rounded-[2.5rem]">
                                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Enrolled Students</h3>
                                        <Badge variant="neutral" className="bg-white">{selectedGroup.occupancy} Total</Badge>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {STUDENTS.filter(s => s.id <= selectedGroup.occupancy).slice(0, 8).map(s => (
                                            <div key={s.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {s.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{s.name}</p>
                                                        <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{s.enrollment}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><ChevronRight size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-slate-50 text-center">
                                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Load More Students</button>
                                    </div>
                                </Card>

                                <Card title="Lab Resource Map" padding="p-8" className="shadow-xl shadow-slate-900/5 border-slate-200 rounded-[2.5rem]">
                                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                        <MapPin size={48} className="text-slate-300 mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interactive Map Placeholder</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-2">Resource allocation visualization coming soon.</p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/30 p-16 text-center">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center shadow-xl text-slate-200 mb-8 border border-slate-100">
                                <Layers size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Registry Explorer</h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-bold">
                                Select a <span className="text-blue-600">Lab Group</span> from the left hierarchy to manage assignments and audit capacity limits.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassTreePage;
