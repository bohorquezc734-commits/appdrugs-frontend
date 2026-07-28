import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import type { AnyTab } from '../components/Layout/Sidebar';

// Componentes modulares
import AdminOverviewTab from '../components/Admin/AdminOverviewTab';
import AdminUsersTab from '../components/Admin/AdminUsersTab';
import AdminSedesTab from '../components/Admin/AdminSedesTab';
import AdminDrugsTab from '../components/Admin/AdminDrugsTab';
import AdminInventoryTab from '../components/Admin/AdminInventoryTab';
import AdminAppointmentsTab from '../components/Admin/AdminAppointmentsTab';
import AdminReportsTab from '../components/Admin/AdminReportsTab';
import AdminAuditTab from '../components/Admin/AdminAuditTab';
import Configuracion from '../components/Profile/Configuracion';

type TabType = 'overview' | 'usuarios' | 'medicamentos' | 'sedes' | 'inventarios' | 'turnos' | 'reportes' | 'auditoria' | 'configuracion';

const SECTION_LABELS: Record<TabType, string> = {
  overview: 'Resumen y Estadísticas',
  usuarios: 'Gestión de Usuarios',
  medicamentos: 'Catálogo Maestro de Medicamentos',
  sedes: 'Gestión de Sedes (Gestores)',
  inventarios: 'Inventario Global',
  turnos: 'Supervisión de Turnos',
  reportes: 'Generación de Reportes Globales',
  auditoria: 'Logs de Auditoría y Seguridad',
  configuracion: 'Configuración de Perfil',
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <MainLayout
      activeTab={activeTab as AnyTab}
      onTabChange={(tab) => setActiveTab(tab as TabType)}
      role="admin"
      sectionLabel={SECTION_LABELS[activeTab] || 'Dashboard'}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'overview' && <AdminOverviewTab onNavigate={(tab) => setActiveTab(tab as TabType)} />}
        {activeTab === 'usuarios' && <AdminUsersTab />}
        {activeTab === 'medicamentos' && <AdminDrugsTab />}
        {activeTab === 'sedes' && <AdminSedesTab />}
        {activeTab === 'inventarios' && <AdminInventoryTab />}
        {activeTab === 'turnos' && <AdminAppointmentsTab />}
        {activeTab === 'reportes' && <AdminReportsTab />}
        {activeTab === 'auditoria' && <AdminAuditTab />}
        {activeTab === 'configuracion' && <Configuracion />}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
