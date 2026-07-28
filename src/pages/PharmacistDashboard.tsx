import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import type { AnyTab } from '../components/Layout/Sidebar';
import PharmacistCatalogTab from '../components/Pharmacist/PharmacistCatalogTab';
import PharmacistInventoryTab from '../components/Pharmacist/PharmacistInventoryTab';
import PharmacistAppointmentsTab from '../components/Pharmacist/PharmacistAppointmentsTab';
import PharmacistReportsTab from '../components/Pharmacist/PharmacistReportsTab';
import Configuracion from '../components/Profile/Configuracion';

type TabType = 'medicamentos' | 'inventarios' | 'turnos' | 'reportes' | 'configuracion';

const SECTION_LABELS: Record<TabType, string> = {
  medicamentos: 'Catálogo de Medicamentos (Solo Lectura)',
  inventarios: 'Gestión de Inventarios (Sede)',
  turnos: 'Despacho de Turnos',
  reportes: 'Reportes y Estadísticas',
  configuracion: 'Configuración de Perfil',
};

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('medicamentos');

  return (
    <MainLayout
      activeTab={activeTab as AnyTab}
      onTabChange={(tab) => setActiveTab(tab as TabType)}
      role="pharmacist"
      sectionLabel={SECTION_LABELS[activeTab]}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'medicamentos' && <PharmacistCatalogTab />}
        {activeTab === 'inventarios' && <PharmacistInventoryTab />}
        {activeTab === 'turnos' && <PharmacistAppointmentsTab />}
        {activeTab === 'reportes' && <PharmacistReportsTab />}
        {activeTab === 'configuracion' && <Configuracion />}
      </div>
    </MainLayout>
  );
};

export default PharmacistDashboard;
