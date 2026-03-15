import React from 'react';
import { Landmark, QrCode, ShieldCheck } from 'lucide-react';
import Badge from '../ui/Badge';

const AdmitCard = ({ student, session, subjects }) => {
  return (
    <div className="bg-white p-12 border-8 border-slate-900 w-[800px] min-h-[1000px] mx-auto relative overflow-hidden print:p-8 print:border-4 print:shadow-none print:m-0 print:w-full">
      {/* Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-4 bg-slate-900"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-slate-900"></div>
      
      {/* Header Segment */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
        <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Landmark size={48} />
            </div>
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">EduERP University</h1>
                <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">Office of the Controller of Examinations</p>
                <div className="flex gap-2 mt-2">
                    <Badge variant="active" className="rounded-none font-black text-[10px] bg-slate-100 text-slate-900 border-slate-900">ACADEMIC SESSION {session}</Badge>
                </div>
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Admit Card</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">End Semester Examination</p>
        </div>
      </div>

      {/* Identity Segment */}
      <div className="grid grid-cols-12 gap-10 mt-12">
        <div className="col-span-8 space-y-8">
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                    { label: 'Name of Candidate', value: student.name },
                    { label: 'Enrollment Number', value: student.enrollment },
                    { label: 'Course of Study', value: student.course },
                    { label: 'Current Semester', value: `Semester ${student.sem}` },
                    { label: 'Examination Center', value: 'Main Campus, Block A' },
                    { label: 'Roll Number', value: `2024-${student.id.toString().padStart(4, '0')}` }
                ].map((item, i) => (
                    <div key={i} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-1">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="col-span-4 flex flex-col items-center gap-6">
            <div className="w-40 h-48 bg-slate-50 border-4 border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-200 relative overflow-hidden">
                <Users size={64} className="opacity-20" />
                <p className="text-[8px] font-black uppercase text-slate-300 absolute bottom-4">Passport Size Photo</p>
            </div>
            <div className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-300 uppercase">
                Student Signature
            </div>
        </div>
      </div>

      {/* Schedule Segment */}
      <div className="mt-12 space-y-4">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] bg-slate-50 py-3 px-4 border-l-8 border-slate-900">Examination Schedule</h3>
        <table className="w-full text-left border-collapse border-2 border-slate-900">
            <thead>
                <tr className="bg-slate-900 text-white">
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Date</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Subject Code</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest">Subject Name</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold text-slate-800">
                {subjects.map((sub, i) => (
                    <tr key={i} className="border-b-2 border-slate-900">
                        <td className="p-4 text-xs font-black border-r-2 border-slate-900">TBD</td>
                        <td className="p-4 text-xs font-black border-r-2 border-slate-900 uppercase">{sub.code}</td>
                        <td className="p-4 text-xs font-black uppercase">{sub.name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Footer / Verification Segment */}
      <div className="mt-20 flex justify-between items-end border-t-2 border-slate-100 pt-10">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <QrCode size={64} className="text-slate-900" />
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Verification</p>
                    <p className="text-[10px] font-black text-slate-900">VERIFY-ID: {student.enrollment}-SEC</p>
                </div>
            </div>
            <p className="text-[8px] text-slate-400 max-w-xs leading-relaxed font-medium">
                Note: This is a computer-generated document. Original identity proof must be carried along with this admit card to the examination hall.
            </p>
        </div>
        <div className="text-center space-y-3">
            <div className="w-48 h-1 bg-slate-900 mb-6 mx-auto"></div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Controller of Examinations</p>
            <ShieldCheck size={32} className="mx-auto text-slate-900" />
        </div>
      </div>
    </div>
  );
};

export default AdmitCard;
