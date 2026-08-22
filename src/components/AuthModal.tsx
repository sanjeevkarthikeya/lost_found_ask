import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Mail,
  User,
  Phone,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, adminSettings, users, switchPersona, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Yenepoya Medical College');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setIsSubmitting(true);
    const success = login(email.trim(), name.trim(), phone.trim() || '+91 98450 00000', department);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleSelectQuickPersona = (userId: string) => {
    switchPersona(userId);
    onClose();
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-red-900 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md border border-red-700">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            Student Identity Sign In
          </h2>
          <p className="text-xs text-red-200 mt-1">
            Yenepoya University Lost &amp; Found Portal
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Mode Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Verification Protocol:</span>
          {adminSettings.loginMode === 'roster_verified' ? (
            <span className="text-[11px] font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded-full">
              • Verified CSV Roster Active
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
              • Open Campus Access
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              College Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="e.g. fatima.sana@yenepoya.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-900/20"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="auth-name-input"
                type="text"
                required
                placeholder="e.g. Fatima Sana"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-900/20"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Contact Phone Number
            </label>
            <div className="relative">
              <input
                id="auth-phone-input"
                type="tel"
                placeholder="+91 98450 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-900/20"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              College Department
            </label>
            <div className="relative">
              <select
                id="auth-department-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-red-900/20"
              >
                <option value="Yenepoya Medical College">Yenepoya Medical College</option>
                <option value="Yenepoya Dental College">Yenepoya Dental College</option>
                <option value="YIT - Computer Science">YIT - Computer Science</option>
                <option value="YIT - Artificial Intelligence & DS">YIT - AI &amp; Data Science</option>
                <option value="Pharmacy & Allied Sciences">Pharmacy &amp; Allied Sciences</option>
                <option value="Nursing & Physiotherapy">Nursing &amp; Physiotherapy</option>
              </select>
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-900 to-red-950 hover:from-red-950 hover:to-slate-950 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to YenFind</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Switcher Footer for Hackathon Judges & Testing */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>1-Click Hackathon Demo Switcher:</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSelectQuickPersona('user_1')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-red-600 text-left transition-all"
            >
              <div className="font-extrabold text-red-950 truncate text-[11px]">Person 1 (Lost)</div>
              <div className="text-[10px] text-slate-500 truncate">Fatima (MBBS)</div>
            </button>

            <button
              onClick={() => handleSelectQuickPersona('user_2')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 text-left transition-all"
            >
              <div className="font-extrabold text-emerald-950 truncate text-[11px]">Person 2 (Finder)</div>
              <div className="text-[10px] text-slate-500 truncate">Rahul (BDS)</div>
            </button>

            <button
              onClick={() => handleSelectQuickPersona('user_3')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-600 text-left transition-all"
            >
              <div className="font-extrabold text-blue-950 truncate text-[11px]">Person 3 (Report)</div>
              <div className="text-[10px] text-slate-500 truncate">Mohammed (YIT)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
