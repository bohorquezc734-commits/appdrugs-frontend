import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { toast } from 'react-toastify';
import { APP_CONSTANTS } from '../../constants/appConstants';

const Premium3DLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(response));
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, response.token);
      toast.success('¡Inicio de sesión exitoso!');
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Credenciales incorrectas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex items-center justify-end px-8 md:px-24 overflow-hidden font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-4xl mx-auto h-96">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Glassmorphism Form Container */}
      <div className="relative z-10 w-full max-w-md p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido a AppDrugs</h1>
          <p className="text-slate-300 mt-2 text-sm font-medium">Gestión integral de tu farmacia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              placeholder="admin@appdrugs.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium hover:text-white transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-500 bg-white/10 border-white/20 focus:ring-emerald-500 focus:ring-offset-0" />
              Recordarme
            </label>
            <button 
              type="button" 
              onClick={() => navigate('/forgot-password')}
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-white rounded-full font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm font-medium">
          <span className="text-slate-300">¿Aún no tienes cuenta? </span>
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-all"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium3DLogin;
