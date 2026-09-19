import React, { useState, useEffect } from 'react';
import { usersService, UserDto } from '../../services/users';
import { toast } from 'react-toastify';
import { PremiumTable, ColumnDef } from '../Common/PremiumTable';

const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : ((data as any)?.items || (data as any)?.$values || (data as any)?.data || (data as any)?.results || []));
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await usersService.changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Rol actualizado correctamente');
    } catch (err: unknown) {
      // Log for debugging; the UI still functions without the role change
      console.error('Error al actualizar el rol:', err);
      toast.error('Error al actualizar el rol');
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await usersService.toggleStatus(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success('Estado actualizado correctamente');
    } catch (err: unknown) {
      // Log for debugging; the UI still functions without the status change
      console.error('Error al actualizar el estado:', err);
      toast.error('Error al actualizar el estado');
    }
  };

  const columns: ColumnDef<UserDto>[] = [
    {
      header: 'ID',
      render: (u) => <span className="font-bold text-slate-400 dark:text-slate-500">#{u.id}</span>,
      width: '80px',
    },
    {
      header: 'Nombre',
      accessor: 'fullName',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Rol',
      render: (u) => {
        let roleClass = 'bg-blue-50 text-blue-600 border-blue-200';
        if (u.role === 'Admin') roleClass = 'bg-rose-50 text-rose-600 border-rose-200';
        else if (u.role === 'Gestor' || u.role === 'Pharmacist') roleClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
        return (
          <select
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
            className={`px-3 py-1 rounded-full text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors cursor-pointer ${roleClass}`}
          >
          <option value="User">Usuario</option>
          <option value="Pharmacist">Farmacéutico (Gestor)</option>
          <option value="Admin">Administrador</option>
          </select>
        );
      },
    },
    {
      header: 'Estado',
      render: (u) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleStatusToggle(u.id, u.isActive)}
            className={`w-10 h-5 flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ${u.isActive ? 'bg-emerald-500 dark:bg-emerald-500' : ''}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${u.isActive ? 'translate-x-5' : ''}`}></div>
          </button>
          <span className={`font-semibold text-sm ${u.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {u.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Usuarios del Sistema</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión y control de accesos de la plataforma.</p>
        </div>
        
        <button 
          onClick={fetchUsers} 
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 hover:text-emerald-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refrescar
        </button>
      </div>

      <PremiumTable
        columns={columns}
        data={users}
        loading={loading}
        keyExtractor={(u) => u.id}
        emptyMessage="No hay usuarios registrados en el sistema."
      />
    </div>
  );
};

export default AdminUsersTab;
