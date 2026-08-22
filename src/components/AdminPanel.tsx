import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  StudentRosterEntry,
  DeskNoticeItem,
  AdminSettings,
  ItemCategory,
  CampusLocation,
} from '../types';
import {
  parseRosterCSV,
  generateSampleRosterCSV,
  exportFullSystemCSVBackup,
  triggerDownload,
} from '../utils/csvHelper';
import { generateAcknowledgmentCard } from '../utils/canvasCard';
import {
  ShieldCheck,
  Lock,
  Upload,
  Download,
  Users,
  Building2,
  FileCheck,
  Mail,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key,
  ToggleLeft,
  ToggleRight,
  Eye,
  Search,
  Sparkles,
  Inbox,
  Send,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    isAdmin,
    loginAdmin,
    logoutAdmin,
    adminSettings,
    updateAdminSettings,
    roster,
    uploadRosterCSV,
    addRosterEntry,
    updateRosterEntry,
    deleteRosterEntry,
    deskItems,
    addDeskItem,
    claimDeskItem,
    deleteDeskItem,
    resolvedArchive,
    adminMessages,
    replyAdminMessage,
    resetSemesterData,
    items,
    threads,
    addToast,
  } = useApp();

  const [passwordInput, setPasswordInput] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<
    'roster' | 'access' | 'desk' | 'archive' | 'inbox' | 'reset'
  >('roster');

  // Search & Filter in Admin
  const [rosterSearch, setRosterSearch] = useState('');
  const [deskSearch, setDeskSearch] = useState('');

  // Add Student Form State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    department: 'Yenepoya Medical College',
  });

  // Edit Student Form State
  const [editingStudent, setEditingStudent] = useState<StudentRosterEntry | null>(null);

  // Add Desk Notice State
  const [showAddDeskModal, setShowAddDeskModal] = useState(false);
  const [newDeskItem, setNewDeskItem] = useState({
    title: '',
    category: 'ID Cards & Documents' as ItemCategory,
    foundLocation: 'YU Central Library' as CampusLocation,
    dateReceived: new Date().toISOString().slice(0, 10),
    storageRefNumber: `DESK-BOX-${Math.floor(10 + Math.random() * 90)}`,
    description: '',
    heldAt: 'Security Main Gate' as const,
    imageUrl: '',
  });

  // Reply State for Inbox
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Semester Reset safety confirmation
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Handle Admin Passkey Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(passwordInput.trim());
    setPasswordInput('');
  };

  // CSV Roster File Upload
  const handleRosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseRosterCSV(text);
      if (parsed.length === 0) {
        addToast('CSV Parse Error', 'Could not parse student roster. Ensure standard CSV headers: Name, Email, Phone, RollNumber, Department.', 'error');
        return;
      }
      uploadRosterCSV(parsed);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleRoster = () => {
    const sample = generateSampleRosterCSV();
    triggerDownload(sample, 'Yenepoya_Student_Roster_Sample.csv');
    addToast('Sample Downloaded', 'Sample roster CSV template saved.', 'info');
  };

  const handleBackupExport = () => {
    const backup = exportFullSystemCSVBackup(items, deskItems, threads, roster);
    triggerDownload(backup.content, backup.filename);
    setHasDownloadedBackup(true);
    addToast('Full Backup Downloaded', 'All semester records, roster, chats, and desk logs exported to CSV.', 'success');
  };

  const handleExecuteSemesterReset = () => {
    if (!hasDownloadedBackup) {
      addToast('Safety Guard Active', 'You must download the Full System CSV Backup first before initiating reset.', 'error');
      return;
    }
    if (resetConfirmText.trim().toLowerCase() !== 'reset semester') {
      addToast('Confirmation Mismatch', 'Type "RESET SEMESTER" to confirm database wipe.', 'warning');
      return;
    }

    resetSemesterData();
    setResetConfirmText('');
    setHasDownloadedBackup(false);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    addRosterEntry({
      ...newStudent,
      status: 'active',
    });

    setNewStudent({
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      department: 'Yenepoya Medical College',
    });
    setShowAddStudentModal(false);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateRosterEntry(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  const handleAddDeskItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeskItem.title || !newDeskItem.storageRefNumber) return;

    addDeskItem({
      ...newDeskItem,
      imageUrl: newDeskItem.imageUrl || undefined,
    });

    setNewDeskItem({
      title: '',
      category: 'ID Cards & Documents',
      foundLocation: 'YU Central Library',
      dateReceived: new Date().toISOString().slice(0, 10),
      storageRefNumber: `DESK-BOX-${Math.floor(10 + Math.random() * 90)}`,
      description: '',
      heldAt: 'Security Main Gate',
      imageUrl: '',
    });
    setShowAddDeskModal(false);
  };

  const handleDownloadArchivedCard = (cardData: any) => {
    generateAcknowledgmentCard(cardData).then(({ dataUrl, filename }) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Card Re-generated', `Downloaded safety record for ${cardData.itemTitle}`, 'success');
    });
  };

  const handleSendReply = (messageId: string) => {
    if (!replyText.trim()) return;
    replyAdminMessage(messageId, replyText.trim());
    setReplyText('');
    setReplyingMessageId(null);
  };

  // If NOT authenticated as admin, show password challenge
  if (!isAdmin) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-950 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg border border-red-800">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Admin Portal Authentication
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Access restricted to Yenepoya University Lost &amp; Found Officers, Security Heads, and Student Affairs.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Admin Passkey
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type="password"
                required
                placeholder="Enter security passkey..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-sm"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold">Admin Passkey:</span>
              <button
                type="button"
                onClick={() => setPasswordInput('sanjeev007')}
                className="text-[11px] font-bold text-red-900 hover:text-red-700 bg-amber-200/80 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
              >
                Auto-fill 'sanjeev007'
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              Authorized Passkey: <code className="bg-white/90 px-1.5 py-0.5 rounded font-mono font-bold text-red-950 border border-amber-300">sanjeev007</code>
            </p>
          </div>

          <button
            id="btn-admin-login-submit"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Admin Portal</span>
          </button>
        </form>
      </div>
    );
  }

  // Filtered Roster
  const filteredRoster = roster.filter((r) => {
    const q = rosterSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.rollNumber.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  const unreadMessagesCount = adminMessages.filter((m) => m.status === 'unread').length;

  return (
    <div id="admin-panel-dashboard" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Yenepoya Campus Administration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Roster sync, security desk notice board, acknowledgment archives, and semester backups.
          </p>
        </div>

        <button
          id="btn-admin-logout"
          onClick={logoutAdmin}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'roster'
              ? 'bg-red-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Roster (CSV)</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {roster.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('access')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'access'
              ? 'bg-red-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Login Mode &amp; Access Controls</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('desk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'desk'
              ? 'bg-red-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Desk Notice Board ({deskItems.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('archive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'archive'
              ? 'bg-red-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Acknowledgment Archives</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'inbox'
              ? 'bg-red-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Student Inquiries</span>
          {unreadMessagesCount > 0 && (
            <span className="bg-amber-500 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('reset')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'reset'
              ? 'bg-rose-900 text-white shadow-xs'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Semester Reset &amp; Backup</span>
        </button>
      </div>

      {/* TAB 1: Student Roster CSV Management */}
      {activeAdminTab === 'roster' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                id="roster-search-input"
                type="text"
                placeholder="Search students by name, email, roll no, or department..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-900/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSampleRoster}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </button>

              <label className="px-4 py-2 text-xs font-bold text-white bg-red-900 hover:bg-red-950 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV Roster</span>
                <input type="file" accept=".csv" onChange={handleRosterFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Roll Number</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">College Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono font-bold text-slate-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">{student.name}</td>
                      <td className="px-5 py-3 text-slate-600">{student.email}</td>
                      <td className="px-5 py-3 text-slate-600">{student.phone}</td>
                      <td className="px-5 py-3 text-slate-600">{student.department}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {student.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Edit student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRosterEntry(student.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            title="Remove from roster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Login Mode & Access Controls */}
      {activeAdminTab === 'access' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Campus Student Access Mode
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control whether login requires an exact match on the uploaded CSV roster, or allows open access for hackathon demos.
            </p>
          </div>

          <div className="space-y-4">
            <label
              className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                adminSettings.loginMode === 'roster_verified'
                  ? 'bg-red-50 border-red-600 ring-2 ring-red-500/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="loginMode"
                    checked={adminSettings.loginMode === 'roster_verified'}
                    onChange={() => updateAdminSettings({ loginMode: 'roster_verified' })}
                    className="text-red-900"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      Restricted Mode: Verified CSV Roster Only (Recommended for Campus)
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Only students listed in the official CSV roster can sign in with their college email.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-red-200 text-red-900 px-2 py-0.5 rounded-full font-bold uppercase">
                  Verified
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                adminSettings.loginMode === 'open_access'
                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="loginMode"
                    checked={adminSettings.loginMode === 'open_access'}
                    onChange={() => updateAdminSettings({ loginMode: 'open_access' })}
                    className="text-emerald-900"
                  />
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">
                      Open Campus Access Mode (Convenient for Live Hackathon Testing)
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Any student with a valid email address can sign in instantly without pre-registration in the roster.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase">
                  Open
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Semester Academic Metadata
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Active Semester</label>
                <input
                  type="text"
                  value={adminSettings.currentSemester}
                  onChange={(e) => updateAdminSettings({ currentSemester: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Academic Year</label>
                <input
                  type="text"
                  value={adminSettings.academicYear}
                  onChange={(e) => updateAdminSettings({ academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Desk Notice Board Items */}
      {activeAdminTab === 'desk' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Security Desk Physical Inventory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register items handed in at Main Gate, Library, or Dean Office.
              </p>
            </div>

            <button
              onClick={() => setShowAddDeskModal(true)}
              className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Desk Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deskItems.map((desk) => (
              <div
                key={desk.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {desk.storageRefNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        desk.claimed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {desk.claimed ? 'CLAIMED' : 'IN STORAGE'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{desk.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{desk.description}</p>

                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 pt-2 border-t border-slate-100">
                    <div>Held At: <span className="font-semibold">{desk.heldAt}</span></div>
                    <div>Found At: <span className="font-semibold">{desk.foundLocation}</span></div>
                    <div>Date: {desk.dateReceived}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {!desk.claimed ? (
                    <button
                      onClick={() => {
                        const name = prompt('Enter the student name and roll no who claimed this:');
                        if (name) claimDeskItem(desk.id, name);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      Mark as Claimed
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Claimed by {desk.claimedBy}
                    </span>
                  )}

                  <button
                    onClick={() => deleteDeskItem(desk.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Acknowledgment Archives */}
      {activeAdminTab === 'archive' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Safety Handover Records &amp; Acknowledgment Archive
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified handover certificates for safety audits and dispute resolution.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {resolvedArchive.length} Handover Certificates
            </span>
          </div>

          {resolvedArchive.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <FileCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold">No Handover Certificates in current session yet.</p>
              <p className="text-slate-400 mt-0.5">
                Certificates appear here automatically once two students resolve an item handover.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resolvedArchive.map((card) => (
                <div
                  key={card.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="font-mono text-red-900">{card.id}</span>
                      <span className="text-slate-400 font-normal">{card.handoverDate}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{card.itemTitle}</h4>
                    <p className="text-xs text-slate-500">{card.itemCategory} • {card.handoverLocation}</p>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Giver (Finder)</div>
                        <div className="font-bold text-slate-800">{card.giverName}</div>
                        <div className="text-[10px] text-slate-500">{card.giverDepartment}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Receiver (Owner)</div>
                        <div className="font-bold text-slate-800">{card.receiverName}</div>
                        <div className="text-[10px] text-slate-500">{card.receiverDepartment}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadArchivedCard(card)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Certificate (PNG)</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Student Inquiries Inbox */}
      {activeAdminTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Contact-Admin Inquiries &amp; Help Desk Inbox
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct messages submitted by students regarding lost property or disputes.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {unreadMessagesCount} Unread
            </span>
          </div>

          <div className="space-y-3">
            {adminMessages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                  msg.status === 'unread' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{msg.studentName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{msg.studentEmail}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{msg.studentPhone}</span>
                  </div>
                  <span className="text-slate-400 font-medium">
                    {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{msg.subject}</h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {msg.message}
                  </p>
                </div>

                {msg.adminReply && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Admin Reply Dispatched:</span>
                    </span>
                    <p className="text-emerald-900">{msg.adminReply}</p>
                  </div>
                )}

                {/* Reply Box */}
                {!msg.adminReply && (
                  <div>
                    {replyingMessageId === msg.id ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={2}
                          placeholder="Type your reply to student..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-900/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendReply(msg.id)}
                            className="px-3.5 py-1.5 bg-red-900 hover:bg-red-950 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Reply</span>
                          </button>
                          <button
                            onClick={() => setReplyingMessageId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingMessageId(msg.id);
                          setReplyText('');
                        }}
                        className="text-xs font-bold text-red-900 hover:text-red-950 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
                      >
                        Reply to Student
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Semester Reset & Mandatory Backup */}
      {activeAdminTab === 'reset' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3 text-rose-900">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">
                Academic Semester Data Reset &amp; Archiving
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Resets active lost/found postings and student leaderboard points for the new academic semester.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Mandatory Safety Prerequisite</span>
            </div>
            <p className="leading-relaxed">
              To prevent accidental data loss, university policy mandates downloading the complete CSV system backup archive before data reset is enabled.
            </p>
          </div>

          {/* Step 1: Download Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                Step 1: Export Full System CSV Backup
              </span>
              {hasDownloadedBackup && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Backup Downloaded
                </span>
              )}
            </div>

            <button
              id="btn-download-admin-backup"
              onClick={handleBackupExport}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Semester CSV Backup</span>
            </button>
          </div>

          {/* Step 2: Confirm Wipe */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-opacity ${
            hasDownloadedBackup ? 'bg-white border-rose-300' : 'bg-slate-100 border-slate-200 opacity-50'
          }`}>
            <span className="text-xs font-extrabold text-slate-900 block">
              Step 2: Type "RESET SEMESTER" to Confirm Wipe
            </span>

            <input
              id="input-reset-confirm-text"
              type="text"
              disabled={!hasDownloadedBackup}
              placeholder='Type "RESET SEMESTER" here...'
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 text-xs font-bold focus:ring-2 focus:ring-rose-500/20 uppercase"
            />

            <button
              id="btn-execute-semester-reset"
              disabled={!hasDownloadedBackup || resetConfirmText.trim().toLowerCase() !== 'reset semester'}
              onClick={handleExecuteSemesterReset}
              className="w-full py-3 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Execute Semester Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Student Entry */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddStudentModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full z-10 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add Student to Roster</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Sana"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">College Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@yenepoya.edu.in"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll / Reg Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YU24MED099"
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98450 12345"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Yenepoya Medical College"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-900 hover:bg-red-950 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student Entry */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditingStudent(null)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full z-10 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Edit Student Profile</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">College Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={editingStudent.department}
                  onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-900 hover:bg-red-950 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Desk Item */}
      {showAddDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddDeskModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full z-10 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Log Physical Desk Item</h3>
            <form onSubmit={handleAddDeskItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titan Wristwatch found near Library"
                  value={newDeskItem.title}
                  onChange={(e) => setNewDeskItem({ ...newDeskItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Ref Box #</label>
                  <input
                    type="text"
                    required
                    value={newDeskItem.storageRefNumber}
                    onChange={(e) => setNewDeskItem({ ...newDeskItem, storageRefNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Held At Desk</label>
                  <select
                    value={newDeskItem.heldAt}
                    onChange={(e) => setNewDeskItem({ ...newDeskItem, heldAt: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Security Main Gate">Security Main Gate</option>
                    <option value="Dean Student Affairs Desk">Dean Student Affairs Desk</option>
                    <option value="Library Reception">Library Reception</option>
                    <option value="YIT Helpdesk">YIT Helpdesk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description &amp; Condition</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Item details..."
                  value={newDeskItem.description}
                  onChange={(e) => setNewDeskItem({ ...newDeskItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeskModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-900 hover:bg-red-950 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save to Desk Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
