import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Landmark, Book, Calendar, Library, Users, Search, RefreshCw, Layers } from 'lucide-react';
import api from '../utils/api';

const ClassTree = () => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({}); // { 'course_id': true, 'sem_id': true }
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTree = async () => {
        setLoading(true);
        try {
            // We fetch Departments -> Courses -> Semesters -> Sections -> Groups
            // Note: In a real app, we might have an optimized tree endpoint. 
            // Here we'll reconstruct it or fetch what we can.
            const [deptRes, courseRes, semRes, secRes, groupRes] = await Promise.all([
                api.get('/academic/departments'),
                api.get('/academic/courses'),
                api.get('/academic/semesters'),
                api.get('/sections'),
                api.get('/groups')
            ]);

            const departments = deptRes.data.data;
            const courses = courseRes.data.data;
            const semesters = semRes.data.data;
            const sections = secRes.data.data;
            const groups = groupRes.data.data;

            // Build hierarchy
            const hierarchy = departments.map(dept => ({
                id: dept._id,
                name: dept.name,
                type: 'department',
                children: courses.filter(c => c.department?._id === dept._id).map(course => ({
                    id: course._id,
                    name: `${course.name} (${course.code})`,
                    type: 'course',
                    children: semesters.filter(s => s.course?._id === course._id).map(sem => ({
                        id: sem._id,
                        name: `${sem.name} (${sem.academicSession?.name || ''})`,
                        type: 'semester',
                        children: sections.filter(sec => sec.semester?._id === sem._id).map(section => ({
                            id: section._id,
                            name: `Section ${section.name}`,
                            type: 'section',
                            children: groups.filter(g => g.section === section.name && g.semester?._id === sem._id).map(group => ({
                                id: group._id || group.id,
                                name: `Group ${group.name}`,
                                type: 'group'
                            }))
                        }))
                    }))
                }))
            }));

            setTreeData(hierarchy);
        } catch (err) {
            console.error("Failed to build tree", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const toggle = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node, level = 0) => {
        const isExpanded = expanded[node.id];
        const hasChildren = node.children && node.children.length > 0;
        const Icon = node.type === 'department' ? Landmark :
                     node.type === 'course' ? Book :
                     node.type === 'semester' ? Calendar :
                     node.type === 'section' ? Library :
                     node.type === 'group' ? Users : Layers;

        const colors = {
            department: 'text-indigo-600 bg-indigo-50',
            course: 'text-emerald-600 bg-emerald-50',
            semester: 'text-amber-600 bg-amber-50',
            section: 'text-rose-600 bg-rose-50',
            group: 'text-cyan-600 bg-cyan-50'
        };

        return (
            <div key={node.id} className="select-none">
                <div 
                    onClick={() => hasChildren && toggle(node.id)}
                    className={`
                        flex items-center gap-3 py-2 px-3 rounded-xl transition-all cursor-pointer group
                        ${level === 0 ? 'mb-2' : 'mb-1'}
                        ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}
                    `}
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    <div className="flex items-center justify-center w-6 h-6">
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
                        ) : (
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                        )}
                    </div>

                    <div className={`p-1.5 rounded-lg ${colors[node.type] || 'bg-slate-100'}`}>
                        <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold truncate ${level === 0 ? 'text-slate-800 text-base' : 'text-slate-700'}`}>
                            {node.name}
                        </span>
                        {node.type === 'section' && (
                            <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">Class</span>
                        )}
                    </div>

                    {hasChildren && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {node.children.length} sub-items
                        </span>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-slate-100 ml-6 pl-2 animate-in slide-in-from-left-2 duration-200">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Academic Hierarchy Tree</h1>
                    <p className="text-slate-500 mt-1">Full structural view from Departments down to Lab Groups.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchTree} 
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Refresh Tree"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary-500' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter nodes..." 
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all w-48 focus:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
                {loading && treeData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Building academic tree...</p>
                    </div>
                ) : treeData.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 italic">
                        No structural data found. Please ensure departments and courses are created.
                    </div>
                ) : (
                    <div className="max-w-4xl space-y-2">
                        {treeData.map(dept => renderNode(dept))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassTree;
