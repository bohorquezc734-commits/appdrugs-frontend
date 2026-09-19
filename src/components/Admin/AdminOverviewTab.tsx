import React, { useState, useEffect } from 'react';
import { usersService } from '../../services/users';

import { gestoresService } from '../../services/gestores';
import { drugsService } from '../../services/drugs';
import { appointmentsService } from '../../services/appointments';
import { inventoriesService } from '../../services/inventories';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminOverviewTabProps {
  onNavigate?: (tab: string) => void;
}

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    users: 0,
    sedes: 0,
    drugs: 0,
    appointments: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, sedesRes, drugsRes, aptsRes, invRes] = await Promise.all([
          usersService.getAll(),
          gestoresService.getAll(),
          drugsService.getAll({}),
          appointmentsService.getAll(),
          inventoriesService.getAll()
        ]);

        const safeUsers = Array.isArray(usersRes) ? usersRes : ((usersRes as any)?.items || (usersRes as any)?.$values || (usersRes as any)?.data || (usersRes as any)?.results || []);
        const safeSedes = Array.isArray(sedesRes) ? sedesRes : ((sedesRes as any)?.items || (sedesRes as any)?.$values || (sedesRes as any)?.data || (sedesRes as any)?.results || []);
        const safeInv = Array.isArray(invRes) ? invRes : ((invRes as any)?.items || (invRes as any)?.$values || (invRes as any)?.data || (invRes as any)?.results || []);

        const lowStockCount = safeInv.filter((i: any) => i.quantity < 10).length;

        setStats({
          users: (usersRes as any)?.totalCount || safeUsers.length || 0,
          sedes: (sedesRes as any)?.totalCount || safeSedes.length || 0,
          drugs: (drugsRes as any)?.totalCount || (drugsRes as any)?.items?.length || 0,
          appointments: (aptsRes as any)?.totalCount || (aptsRes as any)?.items?.length || 0,
          lowStock: lowStockCount
        });
      } catch (err) {
        console.error('Error fetching stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ color: '#64748b' }}>Cargando métricas del sistema...</div>;

  const KpiCard = ({ title, value, color, icon, onClick, trend = "+12% este mes" }: any) => (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex flex-col gap-4 z-0 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : 'cursor-default'}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-60 -z-10" />
      <div className="flex items-center gap-4">
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 24
        }}>
          {icon}
        </div>
        <div>
          <h3 className="m-0 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
          <p className="m-0 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md mt-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
        {trend}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Panel de Control Global</h2>
        <p className="text-slate-500 dark:text-slate-400 m-0">Bienvenido de nuevo. Aquí tienes el resumen en tiempo real de tu red de farmacias.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Usuarios Registrados" value={stats.users} color="#059669" icon="👥" onClick={() => onNavigate?.('usuarios')} trend="+5% este mes" />
        <KpiCard title="Sedes (Gestores)" value={stats.sedes} color="#0d9488" icon="🏥" onClick={() => onNavigate?.('sedes')} trend="Estable" />
        <KpiCard title="Total Medicamentos" value={stats.drugs} color="#0284c7" icon="💊" onClick={() => onNavigate?.('medicamentos')} trend="+24 nuevos" />
        <KpiCard title="Turnos Generados" value={stats.appointments} color="#6366f1" icon="📋" onClick={() => onNavigate?.('turnos')} trend="+12% hoy" />
        <KpiCard title="Reportes y Analytics" value="Ver" color="#059669" icon="📊" onClick={() => onNavigate?.('reportes')} trend="Actualizado" />
      </div>

      {stats.lowStock > 0 && (
        <div 
          onClick={() => onNavigate?.('inventarios')}
          style={{
            marginTop: 24, background: '#fef2f2', border: '1px solid #fca5a5', padding: 20, borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#991b1b', fontSize: 16, fontWeight: 700 }}>Atención Requerida</h3>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: 14 }}>
              Hay <strong>{stats.lowStock}</strong> registros en inventario con stock crítico (menor a 10 unidades). 
              <strong> Haz clic aquí para gestionar el reabastecimiento en la pestaña de Inventarios.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Analytics Chart */}
      <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Métricas Generales</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { name: 'Usuarios', total: stats.users },
                { name: 'Sedes', total: stats.sedes },
                { name: 'Medicamentos', total: stats.drugs },
                { name: 'Turnos', total: stats.appointments },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip 
                cursor={{ fill: 'var(--sidebar-item-hover)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
