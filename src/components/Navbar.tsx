import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Building2,
  Trophy,
  HelpCircle,
  ShieldCheck,
  PlusCircle,
  LogOut,
  User,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Search,
} from 'lucide-react';

import { AppTab, MatchThread } from '../types';

interface NavbarProps {
  activeTab?: AppTab;
  setActiveTab?: (tab: AppTab) => void;
  onOpenPostModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenContactAdminModal?: () => void;
  onOpenContactAdmin?: () => void;
  onOpenThread?: (thread: MatchThread) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onOpenPostModal,
  onOpenLoginModal,
  onOpenAuthModal,
  onOpenContactAdminModal,
  onOpenContactAdmin,
}) => {
  const {
    activeTab: contextActiveTab,
    setActiveTab: contextSetActiveTab,
    currentUser,
    users,
    switchDemoUser,
    logoutStudent,
    isAdmin,
    deskItems,
    items,
    adminSettings,
  } = useApp();

  const activeTab = propActiveTab || contextActiveTab;
  const setActiveTab = propSetActiveTab || contextSetActiveTab;

  const handleOpenAuth = onOpenLoginModal || onOpenAuthModal || (() => {});
  const handleOpenContact = onOpenContactAdminModal || onOpenContactAdmin || (() => {});

  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unclaimedDeskCount = deskItems.filter((d) => !d.claimed).length;
  const activeItemsCount = items.filter((i) => i.status === 'open').length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top University Announcement & Demo Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">
            Official
          </span>
          <span>Yenepoya (Deemed to be University) • Campus Lost & Found Platform</span>
          <span className="hidden sm:inline text-red-200 text-[11px]">• Mangalore Campus</span>
        </div>

        {/* Quick Demo Switcher & Mode Indicator */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                adminSettings.loginMode === 'roster_verified' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            Mode: {adminSettings.loginMode === 'roster_verified' ? 'Verified Roster (CSV)' : 'Open Campus Access'}
          </span>

          {/* Switch Persona Dropdown */}
          <div className="relative">
            <button
              id="demo-persona-toggle"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-md transition-colors border border-white/20 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Demo Persona: {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>

            {isDemoDropdownOpen && (
              <div
                id="demo-persona-menu"
                className="absolute right-0 mt-1 w-72 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Test Different Campus Roles (Person 1 / 2 / 3)
                </div>
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    id={`switch-user-${u.id}`}
                    onClick={() => {
                      switchDemoUser(u.id);
                      setIsDemoDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-800 transition-colors ${
                      currentUser?.id === u.id ? 'bg-red-900/40 border-l-2 border-amber-400 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: u.avatarColor || '#8B0000' }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center justify-between">
                        <span>{u.name}</span>
                        <span className="text-[10px] text-amber-400 font-bold">{u.points} pts</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{u.department}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-red-950 text-white flex items-center justify-center font-black text-xl shadow-md border border-red-700/50 shrink-0">
              YF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">YenFind</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  YU Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Yenepoya University Lost &amp; Found
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-feed"
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Campus Feed</span>
              {activeItemsCount > 0 && (
                <span className="bg-red-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {activeItemsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-desk"
              onClick={() => setActiveTab('desk')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'desk'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Desk Notice Board</span>
              {unclaimedDeskCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {unclaimedDeskCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Leaderboard</span>
            </button>

            <button
              id="nav-tab-how-it-works"
              onClick={() => setActiveTab('how_it_works')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'how_it_works'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works</span>
            </button>

            <button
              id="nav-tab-admin-guide"
              onClick={() => setActiveTab('admin_guide')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin_guide'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Admin Guide</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Contact Admin */}
            <button
              id="btn-contact-admin"
              onClick={handleOpenContact}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Help Desk</span>
            </button>

            {/* Admin Panel Toggle */}
            <button
              id="btn-nav-admin"
              onClick={() => setActiveTab('admin_panel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === 'admin_panel' || isAdmin
                  ? 'bg-slate-900 text-amber-400 border-slate-800 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{isAdmin ? 'Admin Portal (Active)' : 'Admin'}</span>
            </button>

            {/* "+ Post" Button */}
            <button
              id="btn-nav-post-item"
              onClick={onOpenPostModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ Post Item</span>
            </button>

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold leading-tight">
                      {currentUser.points} pts
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: currentUser.avatarColor || '#8B0000' }}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.department}</p>
                      <div className="mt-2 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] px-2 py-0.5 rounded-full font-bold border border-amber-200">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        <span>{currentUser.points} Leaderboard Points</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="user-menu-logout"
                        onClick={() => {
                          logoutStudent();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Student Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-login-trigger"
                onClick={handleOpenAuth}
                className="flex items-center gap-1.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'feed' ? 'bg-red-800 text-white' : 'text-slate-600'
            }`}
          >
            Feed ({activeItemsCount})
          </button>
          <button
            onClick={() => setActiveTab('desk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'desk' ? 'bg-red-800 text-white' : 'text-slate-600'
            }`}
          >
            Desk Board ({unclaimedDeskCount})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'leaderboard' ? 'bg-red-800 text-white' : 'text-slate-600'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('how_it_works')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'how_it_works' ? 'bg-slate-200 text-slate-900' : 'text-slate-600'
            }`}
          >
            How It Works
          </button>
        </div>
      </div>
    </header>
  );
};
