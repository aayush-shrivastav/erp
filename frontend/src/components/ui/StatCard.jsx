import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color = "blue", trend, trendLabel }) => {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500"   },
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500"  },
    amber:  { bg: "bg-amber-50",  text: "text-amber-700",  icon: "text-amber-500"  },
    red:    { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-500"    },
    slate:  { bg: "bg-slate-50",  text: "text-slate-700",  icon: "text-slate-400"  },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div className={`p-2.5 rounded-xl ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}% {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
