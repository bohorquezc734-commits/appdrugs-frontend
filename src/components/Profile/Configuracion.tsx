import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { toast } from 'react-toastify';
import { APP_CONSTANTS } from '../../constants/appConstants';

const Configuracion: React.FC = () => {
  const [user, setUser] = useState(authService.getUser());
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const getRoleName = (role: string) => {
    if (role === APP_CONSTANTS.ROLES.ADMIN) return APP_CONSTANTS.ROLE_NAMES.ADMIN;
    if (role === APP_CONSTANTS.ROLES.PHARMACIST) return APP_CONSTANTS.ROLE_NAMES.PHARMACIST;
    if (role === APP_CONSTANTS.ROLES.USER) return APP_CONSTANTS.ROLE_NAMES.USER;
    return role;
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.warn(APP_CONSTANTS.MESSAGES.PROFILE_NAME_EMPTY);
      return;
    }
    
    setUpdatingProfile(true);
    try {
      await authService.updateProfile(fullName);
      
      // Update local storage
      const updatedUser = { ...user, fullName };
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success(APP_CONSTANTS.MESSAGES.PROFILE_UPDATE_SUCCESS);
    } catch (err: any) {
      toast.error(err.response?.data?.error || APP_CONSTANTS.MESSAGES.PROFILE_UPDATE_ERROR);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warn(APP_CONSTANTS.MESSAGES.PASSWORD_FIELDS_EMPTY);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warn(APP_CONSTANTS.MESSAGES.PASSWORD_MISMATCH);
      return;
    }
    if (newPassword.length < 6) {
      toast.warn(APP_CONSTANTS.MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success(APP_CONSTANTS.MESSAGES.PASSWORD_UPDATE_SUCCESS);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || APP_CONSTANTS.MESSAGES.PASSWORD_UPDATE_ERROR);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">
        {APP_CONSTANTS.UI.PROFILE_SETTINGS_TITLE}
      </h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/20 shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">
              {user?.fullName || APP_CONSTANTS.UI.NAME_NOT_AVAILABLE}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {user?.email || APP_CONSTANTS.UI.EMAIL_NOT_AVAILABLE}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide">
              {getRoleName(user?.role || '')}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-8">
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">
            {APP_CONSTANTS.UI.ACCOUNT_INFO}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {APP_CONSTANTS.UI.FULL_NAME}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none transition-colors focus:border-blue-600 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {APP_CONSTANTS.UI.EMAIL_READONLY}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpdateProfile}
              disabled={updatingProfile || fullName === user?.fullName}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                updatingProfile || fullName === user?.fullName
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              {updatingProfile ? APP_CONSTANTS.UI.SAVING : APP_CONSTANTS.UI.SAVE_CHANGES}
            </button>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">
          {APP_CONSTANTS.UI.SECURITY}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {APP_CONSTANTS.UI.SECURITY_DESC}
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          {APP_CONSTANTS.UI.CHANGE_PASSWORD_BTN}
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {APP_CONSTANTS.UI.CHANGE_PASSWORD_TITLE}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {APP_CONSTANTS.UI.CHANGE_PASSWORD_DESC}
            </p>
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  {APP_CONSTANTS.UI.CURRENT_PASSWORD}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  {APP_CONSTANTS.UI.NEW_PASSWORD}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  {APP_CONSTANTS.UI.CONFIRM_NEW_PASSWORD}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  {APP_CONSTANTS.UI.CANCEL}
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    updatingPassword
                      ? 'bg-blue-400 dark:bg-blue-800 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  {updatingPassword ? APP_CONSTANTS.UI.SAVING : APP_CONSTANTS.UI.UPDATE}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
