import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Wallet, 
    TrendingUp, 
    Users, 
    AlertCircle, 
    ArrowUpRight, 
    ArrowDownRight,
    CreditCard,
    Landmark,
    Filter,
    Search,
    PiggyBank,
    ShieldCheck,
    FileText,
    TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AccountsDashboard = () => {
    const navigate = useNavigate();
    const data = [
        { name: 'Jan', amount: 450000 },
        { name: 'Feb', amount: 520000 },
        { name: 'Mar', amount: 480000 },
        { name: 'Apr', amount: 610000 },
        { name: 'May', amount: 550000 },
        { name: 'Jun', amount: 670000 },
    ];

    const stats = [
        { label: 'Gross Revenue', value: '₹42.5L', icon: Wallet, color: 'blue', trend: 12.5, trendLabel: 'vs last mon' },
        { label: 'DRCC Pipeline', value: '₹15.4L', icon: Landmark, color: 'purple', trend: 2.1, trendLabel: 'processed' },
        { label: 'Student Dues', value: '₹8.2L', icon: AlertCircle, color: 'amber', trend: -4.2, trendLabel: 'collection' },
        { label: 'Active Grants', value: '28', icon: PiggyBank, color: 'green' },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader 
                title="Finance Command" 
                description="Real-time oversight of institutional cashflow, government credit schemes, and scholarship distributions."
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => navigate('/accounts/ledger')}>
                            <FileText size={16} />
                            <span>Audit Files</span>
                        </Button>
                        <Button onClick={() => navigate('/accounts/fees')}>
                            <Wallet size={16} />
                            <span>Collect Fees</span>
                        </Button>
                    </div>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Charts & Collection Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Trajectory</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Semi-Annual Performance Index</p>
                        </div>
                        <Badge variant="active" className="rounded-lg">H1 2024</Badge>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '12px' }}
                                    cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" dot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="border-slate-200">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Funding Source Split</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Direct Student Pay', value: 45, color: 'bg-blue-600', sub: 'UPI, Cash, Bank Transfer' },
                                { label: 'Bihar DRCC (Credit)', value: 35, color: 'bg-purple-600', sub: 'Government Sanctioned' },
                                { label: 'Internal Scholarship', value: 20, color: 'bg-emerald-600', sub: 'Merit & Need Based' },
                            ].map((source, i) => (
                                <div key={i} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black text-slate-700 tracking-tight">{source.label}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{source.sub}</p>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{source.value}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${source.color} transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${source.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4 shadow-2xl shadow-slate-200 overflow-hidden relative group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Internal Audit</h4>
                            <p className="text-xl font-black tracking-tight leading-tight">Reconcile Daily Logs</p>
                            <p className="text-xs text-slate-400 font-medium mt-1 mb-6">Verify 14 pending bank settlements from yesterday.</p>
                            <Button className="w-full bg-white text-slate-900 border-none hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl">
                                Run Reconciliation
                            </Button>
                        </div>
                        <ShieldCheck size={120} className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;
