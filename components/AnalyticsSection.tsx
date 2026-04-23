
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Calendar, Activity, BarChart3, TrendingUp, UserCheck, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  liveNow: number;
  todayUnique: number;
  monthTotal: number;
  chartData: { name: string; visits: number }[];
}

export const AnalyticsSection: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch ALL rows unconditionally
      const { data: allData, error: fetchError } = await supabase
        .from('site_stats')
        .select('session_id, last_ping');

      if (fetchError) throw fetchError;

      const now = new Date();
      const twoMinutesAgoMs = now.getTime() - 2 * 60 * 1000;
      const twentyFourHoursAgoMs = now.getTime() - 24 * 60 * 60 * 1000;
      const thirtyDaysAgoMs = now.getTime() - 30 * 24 * 60 * 60 * 1000;

      let liveNowCount = 0;
      let monthTotalCount = 0;
      const todayUniqueKeys = new Set<string>();

      // Prepare Chart Data array (Last 7 days)
      const last7Days: { name: string; date: string; visits: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = d.toISOString().split('T')[0];
        last7Days.push({ name: dayLabel, date: dateStr, visits: 0 });
      }

      // Filter locally based ONLY on last_ping
      (allData || []).forEach(row => {
        if (!row.last_ping) return;
        const pingDate = new Date(row.last_ping);
        const pingMs = pingDate.getTime();

        if (pingMs >= thirtyDaysAgoMs) monthTotalCount++;
        if (pingMs >= twentyFourHoursAgoMs) todayUniqueKeys.add(row.session_id);
        if (pingMs >= twoMinutesAgoMs) liveNowCount++;

        // Fill chart
        const rowDateStr = pingDate.toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.date === rowDateStr);
        if (dayMatch) {
          dayMatch.visits++;
        }
      });

      setData({
        liveNow: liveNowCount,
        todayUnique: todayUniqueKeys.size,
        monthTotal: monthTotalCount,
        chartData: last7Days.map(({ name, visits }) => ({ name, visits }))
      });
    } catch (err: any) {
      console.error('Analytics Error:', err);
      setError(err.message || 'Failed to connect to site_stats table');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-serif animate-pulse">Gathering studio insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-lg mx-auto mt-12">
        <BarChart3 className="w-12 h-12 text-rose-200 mx-auto mb-4" />
        <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Analytics Connection Needed</h3>
        <p className="text-stone-500 text-sm mb-6 font-light leading-relaxed">
          The <code className="bg-stone-50 px-2 py-0.5 rounded text-rose-500">site_stats</code> table was not found or accessible. 
          Please ensure the table exists in your Supabase project with columns: 
          <code className="block mt-2 text-[10px] text-stone-400 font-mono">session_id, last_ping, created_at</code>
        </p>
        <button 
          onClick={fetchAnalytics}
          className="bg-stone-900 text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-all flex items-center gap-2 mx-auto"
        >
          <Activity size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Live Now" 
          value={data?.liveNow || 0} 
          icon={<Activity className="text-emerald-500" />} 
          label="Active Visitors"
          trend="Real-time"
          trendColor="emerald"
        />
        <StatCard 
          title="Unique Today" 
          value={data?.todayUnique || 0} 
          icon={<UserCheck className="text-rose-400" />} 
          label="Last 24 Hours"
          trend="Daily" 
          trendColor="neutral"
        />
        <StatCard 
          title="This Month" 
          value={data?.monthTotal || 0} 
          icon={<Calendar className="text-stone-800" />} 
          label="Total Sessions"
          trend="Monthly"
          trendColor="neutral"
        />
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Traffic Vibes</h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">Weekly studio activity</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-[9px] uppercase tracking-widest font-bold text-stone-500">Sessions</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full focus:outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%" className="focus:outline-none [&_*]:outline-none">
            <AreaChart 
              data={data?.chartData || []} 
              style={{ outline: 'none' }}
              className="outline-none select-none"
              tabIndex={-1}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FB7185" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }}
                allowDecimals={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] uppercase tracking-widest font-black text-rose-300 mb-1">{payload[0].payload.name}</p>
                        <p className="text-lg font-serif font-bold">{payload[0].value} <span className="text-xs font-sans font-normal text-stone-400">Visits</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="visits" 
                stroke="#FB7185" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVisits)" 
                animationDuration={1500}
                dot={{ fill: '#FB7185', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, label, trend, isPositive, trendColor }: any) => (
  <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-stone-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 w-20 h-20 bg-stone-50 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-rose-50/50 transition-colors" />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-lg shadow-inner border border-stone-100/50">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
          trendColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
          trendColor === 'neutral' ? 'bg-stone-100 text-stone-500' : 
          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
        }`}>
          {trendColor !== 'emerald' && trendColor !== 'neutral' && (isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />)}
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-[9px] uppercase tracking-widest font-black text-stone-400 mb-0.5">{title}</h4>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-serif font-bold text-stone-900">{value}</span>
          <span className="text-stone-400 text-[10px] font-light">{label}</span>
        </div>
      </div>
    </div>
  </div>
);
