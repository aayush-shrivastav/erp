import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, UserRound, Edit2, Trash2, Loader2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editStudentId, setEditStudentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: 'password123', collegeRollNo: '', universityRollNo: '', department: '', course: '', currentSemester: '', section: '', fundingType: 'SELF', phone: '', admissionDate: ''
    });

    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sections, setSections] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [allSemesters, setAllSemesters] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);

    const fetchData = async () => {
        try {
            const [stuRes, deptRes, courseRes, semRes, secRes] = await Promise.all([
                api.get('/students'),
                api.get('/academic/departments'),
                api.get('/academic/courses'),
                api.get('/academic/semesters'),
                api.get('/sections')
            ]);
            setStudents(stuRes.data.data);
            setDepartments(deptRes.data.data);
            setAllCourses(courseRes.data.data);
            setAllSemesters(semRes.data.data);
            setAllSections(secRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.universityRollNo && student.universityRollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.user?.email && student.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(filtered);
    }, [students, searchTerm]);

    // Filter courses based on selected department
    useEffect(() => {
        if (formData.department) {
            const filtered = allCourses.filter(course => course.departmentId === formData.department);
            setCourses(filtered);
            // Reset dependent fields
            setFormData(prev => ({ ...prev, course: '', currentSemester: '', section: '' }));
            setSemesters([]);
            setSections([]);
        } else {
            setCourses(allCourses);
        }
    }, [formData.department, allCourses]);

    // Filter semesters based on selected course
    useEffect(() => {
        if (formData.course) {
            const filtered = allSemesters.filter(semester => semester.courseId === formData.course);
            setSemesters(filtered);
            // Reset dependent field
            setFormData(prev => ({ ...prev, currentSemester: '', section: '' }));
            setSections([]);
        } else {
            setSemesters(allSemesters);
        }
    }, [formData.course, allSemesters]);

    // Filter sections based on selected semester
    useEffect(() => {
        if (formData.currentSemester) {
            const filtered = allSections.filter(section => section.semesterId === formData.currentSemester);
            setSections(filtered);
            // Reset dependent field
            setFormData(prev => ({ ...prev, section: '' }));
        } else {
            setSections(allSections);
        }
    }, [formData.currentSemester, allSections]);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditStudentId(null);
        setFormData({ name: '', email: '', password: 'password123', collegeRollNo: '', universityRollNo: '', department: '', course: '', currentSemester: '', section: '', fundingType: 'SELF', phone: '', admissionDate: '' });
        setCourses(allCourses);
        setSemesters(allSemesters);
        setSections(allSections);
    };

    const openEditModal = (student) => {
        setIsEdit(true);
        setEditStudentId(student._id);
        const depId = student.department && typeof student.department === 'object' ? student.department._id : student.department;
        const crsId = student.course && typeof student.course === 'object' ? student.course._id : student.course;
        const semId = student.currentSemester && typeof student.currentSemester === 'object' ? student.currentSemester._id : student.currentSemester;
        const secId = student.section && typeof student.section === 'object' ? student.section._id : student.section;

        // Set form data first
        setFormData({
            name: student.name || student.user?.name || '',
            email: student.user?.email || '',
            password: '',
            collegeRollNo: student.enrollmentNo || '',
            universityRollNo: student.universityRollNo || '',
            department: depId || '',
            course: crsId || '',
            currentSemester: semId || '',
            section: secId || '',
            fundingType: student.fundingType || 'SELF',
            phone: student.phone || '',
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : ''
        });

        // Filter cascading data for edit mode
        if (depId) {
            const filteredCourses = allCourses.filter(course => course.departmentId === depId);
            setCourses(filteredCourses);
            
            if (crsId) {
                const filteredSemesters = allSemesters.filter(semester => semester.courseId === crsId);
                setSemesters(filteredSemesters);
                
                if (semId) {
                    const filteredSections = allSections.filter(section => section.semesterId === semId);
                    setSections(filteredSections);
                } else {
                    setSections(allSections);
                }
            } else {
                setSemesters(allSemesters);
                setSections(allSections);
            }
        } else {
            setCourses(allCourses);
            setSemesters(allSemesters);
            setSections(allSections);
        }

        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = { 
                name: formData.name,
                email: formData.email,
                password: formData.password,
                enrollmentNo: formData.collegeRollNo, // Map collegeRollNo to enrollmentNo
                universityRollNo: formData.universityRollNo,
                phone: formData.phone,
                admissionDate: formData.admissionDate,
                departmentId: formData.department,
                courseId: formData.course,
                currentSemesterId: formData.currentSemester, // Map currentSemester to currentSemesterId
                sectionId: formData.section,
                fundingType: formData.fundingType
            };

            // Only include password in payload for new students
            if (!isEdit && !payload.password) {
                payload.password = 'password123'; // Default password
            }
            if (isEdit && !payload.password) {
                delete payload.password; // Remove password if empty for edit
            }

            if (isEdit) {
                await api.put(`/students/${editStudentId}`, payload);
                setSuccessMessage('Student updated successfully!');
            } else {
                await api.post('/students', payload);
                setSuccessMessage('Student created successfully!');
            }
            closeModal();
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Student creation error:', err);
            alert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} student`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            await api.delete(`/students/${id}`);
            setSuccessMessage('Student deleted successfully!');
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Students Record</h1>
                    <p className="text-slate-500 mt-1">Manage student profiles, import data, and allocate sections.</p>
                </div>
                <div className="flex items-center gap-3">
                    {successMessage && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                            {successMessage}
                        </div>
                    )}
                    <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium">
                        <Upload className="w-5 h-5" />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => { closeModal(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Student
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, college roll no, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student Info</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">College Roll No.</th>
                                <th className="px-6 py-4 font-medium">Univ Roll No.</th>
                                <th className="px-6 py-4 font-medium">Admission Date</th>
                                <th className="px-6 py-4 font-medium">Course</th>
                                <th className="px-6 py-4 font-medium">Semester/Section</th>
                                <th className="px-6 py-4 font-medium">Funding</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                            <span className="ml-2 text-slate-500">Loading students...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <UserRound className="w-12 h-12 text-slate-300 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-800 mb-2">No students found</h3>
                                            <p className="text-slate-500">
                                                {searchTerm ? 'No students match your search criteria.' : 'Get started by adding your first student.'}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                                                    className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Student
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <UserRound className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-800">{student.user?.name || student.name || 'N/A'}</span>
                                                    <div className="text-xs text-slate-500">{student.user?.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">{student.phone || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{student.enrollmentNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{student.universityRollNo || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">
                                                {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{student.course?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {student.currentSemester?.name || 'N/A'} - <span className="font-semibold">Sec {student.section?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${student.fundingType === 'DRCC' ? 'bg-blue-50 text-blue-700' :
                                                    student.fundingType === 'SCHOLARSHIP' ? 'bg-purple-50 text-purple-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {student.fundingType || 'SELF'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    Total {students.length} entries
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEdit ? "Edit Student" : "Add New Student"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="student-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                        <input id="student-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="student-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                        <input id="student-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            autoComplete="new-password"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    {isEdit && (
                        <div>
                            <label htmlFor="student-password" className="block text-sm font-medium text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                            <input id="student-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="******" autoComplete="new-password"
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                        </div>
                    )}
                    {!isEdit && (
                        <>
                            <div>
                                <label htmlFor="student-college-roll" className="block text-sm font-medium text-slate-700 mb-1">College Roll No. *</label>
                                <input id="student-college-roll" type="text" required value={formData.collegeRollNo} onChange={(e) => setFormData({ ...formData, collegeRollNo: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                            </div>
                            <div>
                                <label htmlFor="student-university-roll" className="block text-sm font-medium text-slate-700 mb-1">University Roll No.</label>
                                <input id="student-university-roll" type="text" value={formData.universityRollNo} onChange={(e) => setFormData({ ...formData, universityRollNo: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="student-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input id="student-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="student-admission-date" className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                        <input id="student-admission-date" type="date" value={formData.admissionDate} onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm" />
                    </div>
                    <div>
                        <label htmlFor="student-department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <select id="student-department" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Department...</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student-course" className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                        <select id="student-course" required value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student-semester" className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                        <select id="student-semester" required value={formData.currentSemester} onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>{s.name} ({s.academicSession?.name})</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student-section" className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                        <select id="student-section" required value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="">Select Section...</option>
                            {sections.map(sec => <option key={sec._id} value={sec._id}>{sec.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="student-funding-type" className="block text-sm font-medium text-slate-700 mb-1">Funding Type</label>
                        <select id="student-funding-type" required value={formData.fundingType} onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white text-sm">
                            <option value="SELF">Self-Paid</option>
                            <option value="DRCC">DRCC Funded</option>
                            <option value="SCHOLARSHIP">Scholarship</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-sm text-sm flex items-center gap-2">
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {actionLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Student')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
