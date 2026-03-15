import React from 'react';
import { Landmark, ShieldCheck, Mail, Phone, Users } from 'lucide-react';
import Badge from '../ui/Badge';

const WorkloadReport = ({ teachers, assignments, session }) => {
  return (
    <div className="bg-white p-16 border border-slate-200 w-[1000px] mx-auto print:p-8 print:border-none print:w-full">
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-8 mb-10">
        <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <Landmark size={32} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Workload Distribution</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Academic Year {session} • Official Report</p>
            </div>
        </div>
        <div className="text-right">
            <Badge variant="active" className="px-4 py-1.5 rounded-full">CONFIDENTIAL</Badge>
            <p className="text-[9px] font-bold text-slate-400 mt-2">Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-12">
        {teachers.map(teacher => {
            const facultyAssignments = assignments.filter(a => a.teacher === teacher.name);
            const totalLoad = facultyAssignments.length;

            return (
                <div key={teacher.id} className="space-y-6 break-inside-avoid px-2">
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                {teacher.name.split(' ').slice(-1)[0][0]}
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{teacher.name}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Department of {teacher.dept} • {teacher.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Total Load</p>
                                <p className="text-lg font-black text-slate-900">{totalLoad} Subjects</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Subject</th>
                                <th className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Class Unit</th>
                                <th className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Type</th>
                                <th className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Venue</th>
                                <th className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Credits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {facultyAssignments.map((a, i) => (
                                <tr key={i}>
                                    <td className="p-4 text-xs font-black text-slate-800 uppercase">{a.subject}</td>
                                    <td className="p-4 text-xs font-bold text-slate-600">Section {a.section}</td>
                                    <td className="p-4"><Badge variant="neutral" className="text-[8px]">{a.type}</Badge></td>
                                    <td className="p-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-tight">{a.room}</td>
                                    <td className="p-4 text-xs font-black text-slate-900 text-right">4.0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        })}
      </div>

      <div className="mt-24 pt-10 border-t-2 border-slate-100 flex justify-between items-start">
        <div className="flex gap-4 items-center opacity-40">
            <ShieldCheck size={40} />
            <div className="text-[9px] font-bold text-slate-400 max-w-xs uppercase leading-relaxed tracking-tighter">
                Authenticated Workload Audit. Synchronized with the central curriculum deployment engine and academic hierarchy settings.
            </div>
        </div>
        <div className="text-center space-y-4">
            <div className="w-48 h-0.5 bg-slate-200 mb-6 mx-auto"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dean Academics Signature</p>
        </div>
      </div>
    </div>
  );
};

export default WorkloadReport;
