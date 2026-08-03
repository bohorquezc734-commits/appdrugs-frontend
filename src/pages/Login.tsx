import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';
import { APP_CONSTANTS } from '../constants/appConstants';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [focusEmail, setFocusEmail]   = useState(false);
  const [focusPwd, setFocusPwd]       = useState(false);
  const navigate = useNavigate();

  // Modal de recuperación
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      // Guardar usuario Y tokens explícitamente
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(response));
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Credenciales incorrectas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success(APP_CONSTANTS.MESSAGES.FORGOT_PASSWORD_SUCCESS);
      setForgotStep(2);
    } catch (err: any) {
      toast.error('Error al intentar enviar el correo');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.warn(APP_CONSTANTS.MESSAGES.PASSWORD_MISMATCH);
      return;
    }
    if (newPassword.length < 6) {
      toast.warn(APP_CONSTANTS.MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail, resetToken, newPassword);
      toast.success(APP_CONSTANTS.MESSAGES.RESET_PASSWORD_SUCCESS);
      closeForgotModal();
    } catch (err: any) {
      toast.error(err.response?.data?.error || APP_CONSTANTS.MESSAGES.RESET_PASSWORD_ERROR);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 20%, #dbeafe 0%, #eef2fb 45%, #f0fdf4 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '24px',
    }}>
      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        padding: '40px 36px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            borderRadius: 18,
            boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
            marginBottom: 14,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: 28, color: '#1e293b', letterSpacing: '-1px', lineHeight: 1 }}>
            Drugs
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: 400 }}>
            Sistema de Gestión Farmacéutica
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6,
            }}>
              Correo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              placeholder="nombre@ejemplo.com"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: `1.5px solid ${focusEmail ? '#2563eb' : '#e2e8f0'}`,
                fontSize: 14,
                color: '#1e293b',
                outline: 'none',
                background: focusEmail ? '#f8fbff' : '#f9fafb',
                transition: 'all 0.2s',
                boxShadow: focusEmail ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: '#374151', marginBottom: 6,
            }}>
              Contraseña <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusPwd(true)}
                onBlur={() => setFocusPwd(false)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${focusPwd ? '#2563eb' : '#e2e8f0'}`,
                  fontSize: 14,
                  color: '#1e293b',
                  outline: 'none',
                  background: focusPwd ? '#f8fbff' : '#f9fafb',
                  transition: 'all 0.2s',
                  boxShadow: focusPwd ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  padding: 2,
                }}
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? '#93c5fd'
                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '0.3px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
          </button>

          {/* Forgot password */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              style={{
                background: 'none', border: 'none',
                color: '#2563eb', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Divider + Register */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          marginTop: 16,
          paddingTop: 16,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>¿No tienes cuenta? </span>
          <Link
            to="/register"
            style={{
              fontSize: 13, fontWeight: 700,
              color: '#2563eb',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
              {forgotStep === 1 ? APP_CONSTANTS.UI.FORGOT_PASSWORD_TITLE : APP_CONSTANTS.UI.RESET_PASSWORD_TITLE}
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px 0' }}>
              {forgotStep === 1 ? APP_CONSTANTS.UI.FORGOT_PASSWORD_DESC : APP_CONSTANTS.UI.RESET_PASSWORD_DESC}
            </p>
            
            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    style={{
                      padding: '10px 16px', background: '#f1f5f9', color: '#475569',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    {APP_CONSTANTS.UI.CANCEL}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: '10px 16px', background: forgotLoading ? '#93c5fd' : '#2563eb', color: '#fff',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: forgotLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {forgotLoading ? APP_CONSTANTS.UI.SAVING : APP_CONSTANTS.UI.SEND_CODE}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    {APP_CONSTANTS.UI.VERIFICATION_CODE}
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                      fontSize: 14, outline: 'none', boxSizing: 'border-box', letterSpacing: '2px'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    {APP_CONSTANTS.UI.NEW_PASSWORD}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 42px 10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                        fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2
                      }}
                    >
                      <EyeIcon open={showNewPwd} />
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    {APP_CONSTANTS.UI.CONFIRM_NEW_PASSWORD}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 42px 10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                        fontSize: 14, outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2
                      }}
                    >
                      <EyeIcon open={showConfirmPwd} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      padding: '10px 16px', background: '#f1f5f9', color: '#475569',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    {APP_CONSTANTS.UI.CANCEL}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: '10px 16px', background: forgotLoading ? '#93c5fd' : '#2563eb', color: '#fff',
                      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: forgotLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {forgotLoading ? APP_CONSTANTS.UI.SAVING : APP_CONSTANTS.UI.UPDATE}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;