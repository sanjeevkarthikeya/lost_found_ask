import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Mail, ShieldAlert, CheckCircle2, User, Phone } from 'lucide-react';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, sendAdminMessage, addToast } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [studentPhone, setStudentPhone] = useState(currentUser?.phone || '');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    sendAdminMessage({
      studentName: studentName.trim() || 'Yenepoya Student',
      studentEmail: studentEmail.trim() || 'student@yenepoya.edu.in',
      studentPhone: studentPhone.trim() || '+91 98450 00000',
      subject: subject.trim(),
      message: message.trim(),
    });

    setIsSent(true);
    addToast('Message Dispatched', 'Your inquiry was sent to the Yenepoya Lost & Found Administration.', 'success');

    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div id="contact-admin-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-extrabold">Contact Campus Lost &amp; Found Officers</h3>
              <p className="text-[11px] text-slate-400">Security Gate &amp; Dean Student Affairs Desk</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Message Delivered</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              The university officer on duty will review your inquiry and follow up shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Subject / Query Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Lost passport near medical library / Dispute verification"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-900/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Your Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Message Details</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your inquiry or case reference number in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-900/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-900 hover:bg-red-950 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Administration</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
