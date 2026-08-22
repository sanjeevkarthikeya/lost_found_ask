import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { FlipkartFilters } from './components/FlipkartFilters';
import { ItemCard } from './components/ItemCard';
import { PostItemModal } from './components/PostItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ChatModal } from './components/ChatModal';
import { AcknowledgmentModal } from './components/AcknowledgmentModal';
import { LeaderboardView } from './components/LeaderboardView';
import { DeskNoticeBoard } from './components/DeskNoticeBoard';
import { AdminPanel } from './components/AdminPanel';
import { ContactAdminModal } from './components/ContactAdminModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { LostFoundItem, MatchThread, AcknowledgmentCardData, ItemType } from './types';
import {
  Search,
  Plus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Inbox,
  Building2,
  Flame,
  MessageSquare,
  Lock,
  Compass,
} from 'lucide-react';

function MainAppContent() {
  const {
    items,
    activeTab,
    setActiveTab,
    selectedItemType,
    setSelectedItemType,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    setSearchQuery,
    currentUser,
    startMatchingThread,
    threads,
    deskItems,
    users,
  } = useApp();

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalDefaultType, setPostModalDefaultType] = useState<ItemType>('lost');
  const [selectedDetailItem, setSelectedDetailItem] = useState<LostFoundItem | null>(null);
  const [activeChatThread, setActiveChatThread] = useState<MatchThread | null>(null);
  const [activeChatItem, setActiveChatItem] = useState<LostFoundItem | null>(null);
  const [acknowledgmentData, setAcknowledgmentData] = useState<AcknowledgmentCardData | null>(null);
  const [acknowledgmentThreadId, setAcknowledgmentThreadId] = useState<string | null>(null);
  const [isContactAdminOpen, setIsContactAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filter items based on active tabs and filters
  const filteredItems = items.filter((item) => {
    // Tab filter (Lost vs Found)
    if (selectedItemType !== 'all' && item.type !== selectedItemType) return false;

    // Category filter
    if (selectedCategory && item.category !== selectedCategory) return false;

    // Location filter
    if (selectedLocation && item.location !== selectedLocation) return false;

    // Search text query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchPoster = item.postedBy.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory && !matchLoc && !matchPoster) {
        return false;
      }
    }

    return true;
  });

  // Calculate Metrics
  const lostCount = items.filter((i) => i.type === 'lost' && i.status !== 'resolved').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status !== 'resolved').length;
  const reunitedCount = items.filter((i) => i.status === 'resolved').length;

  const handleOpenPostModal = (type: ItemType = 'lost') => {
    setPostModalDefaultType(type);
    setIsPostModalOpen(true);
  };

  const handleStartMatching = (item: LostFoundItem) => {
    const thread = startMatchingThread(item);
    setActiveChatItem(item);
    setActiveChatThread(thread);
  };

  const handleTriggerAcknowledgment = (cardData: AcknowledgmentCardData, threadId: string) => {
    setActiveChatThread(null);
    setAcknowledgmentData(cardData);
    setAcknowledgmentThreadId(threadId);
  };

  const handleOpenThreadFromNav = (thread: MatchThread) => {
    const relatedItem = items.find((i) => i.id === thread.itemId) || null;
    setActiveChatItem(relatedItem);
    setActiveChatThread(thread);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-red-900 selection:text-white">
      {/* Universal Campus Navbar */}
      <Navbar
        onOpenPostModal={() => handleOpenPostModal('lost')}
        onOpenContactAdmin={() => setIsContactAdminOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenThread={handleOpenThreadFromNav}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: Main Feed (Lost & Found) */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Campus Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setSelectedItemType('lost')}
                className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedItemType === 'lost'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Lost Reports
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                </div>
                <div className="mt-1 text-2xl font-black text-rose-900">{lostCount}</div>
                <div className="text-[10px] text-slate-400 font-medium">Looking for owners</div>
              </div>

              <div
                onClick={() => setSelectedItemType('found')}
                className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedItemType === 'found'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Found Objects
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                </div>
                <div className="mt-1 text-2xl font-black text-emerald-900">{foundCount}</div>
                <div className="text-[10px] text-slate-400 font-medium">Safe in custody</div>
              </div>

              <div
                onClick={() => setActiveTab('desk')}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Security Desk
                  </span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900">{deskItems.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Physical box deposits</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Reunited
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-1 text-2xl font-black text-emerald-700">{reunitedCount}</div>
                <div className="text-[10px] text-slate-400 font-medium">Cases solved</div>
              </div>
            </div>

            {/* Quick Action CTA Banner */}
            <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-red-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Yenepoya University Verified Network</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Lost something or spotted an unclaimed item on campus?
                </h2>
                <p className="text-xs text-red-100/90 leading-relaxed">
                  Post with anti-theft verification questions. Once matched, contact details unlock and a verified handover certificate is issued.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  id="btn-quick-post-lost"
                  onClick={() => handleOpenPostModal('lost')}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>I Lost Something (Person 1)</span>
                </button>

                <button
                  id="btn-quick-post-found"
                  onClick={() => handleOpenPostModal('found')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>I Found Item (Person 2/3)</span>
                </button>
              </div>
            </div>

            {/* Layout: Sidebar Flipkart Filters + Product/Item Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Flipkart-Style Filter Sidebar */}
              <div className="lg:col-span-1">
                <FlipkartFilters onResetAll={() => {}} />
              </div>

              {/* Feed Grid */}
              <div className="lg:col-span-3 space-y-4">
                {/* Result header & count */}
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      Showing {filteredItems.length} Campus Notices
                    </span>
                    {selectedItemType !== 'all' && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        Filtered: {selectedItemType === 'lost' ? 'Lost Only' : 'Found Only'}
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 text-[11px] font-medium hidden sm:block">
                    Anti-theft verification enabled on notices
                  </div>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                    <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-extrabold text-slate-800">No items match your active filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try adjusting the category, location, or search keywords. You can also broadcast a new notice.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedItemType('all');
                        setSelectedCategory(null);
                        setSelectedLocation(null);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onSelectItem={(selected) => setSelectedDetailItem(selected)}
                        onStartMatching={(selected) => handleStartMatching(selected)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Physical Desk Notice Board */}
        {activeTab === 'desk' && (
          <DeskNoticeBoard onOpenContactAdmin={() => setIsContactAdminOpen(true)} />
        )}

        {/* VIEW 3: Campus Leaderboard */}
        {activeTab === 'leaderboard' && <LeaderboardView />}

        {/* VIEW 4: How It Works Guide */}
        {activeTab === 'how_it_works' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-2xl">
                <span className="bg-red-50 text-red-900 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Campus Protocol
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  How YenFind Works for Yenepoya Students
                </h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  A university-grade lost and found system engineered for student privacy, anti-theft verification, and zero contact spam.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-800 text-white flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Person 1 (Lost an item)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Posts details with an optional secret verification question (e.g. "What sticker is on the back cover?"). Personal contact details remain <strong>strictly masked</strong> until verified.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Person 2 (Found &amp; Matching)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Spots the listing and clicks "I Found This". An encrypted private chat opens where both students confirm ownership. Once mutually accepted, phone numbers and emails unlock.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Person 3 (Desk Deposit / Unclaimed)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Can drop items directly at campus security or Dean's office. Security issues a Box Reference ID (e.g., DESK-BOX-14) logged into the physical desk board.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">Official Handover Certificate &amp; Karma Bonus</h4>
                  <p className="text-xs text-amber-800">
                    Resolving a case generates an official Yenepoya Handover Acknowledgment Card. Sharing the return on campus social media awards +25 Bonus Points!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
                >
                  Explore Active Feed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: Admin Workflow Guide */}
        {activeTab === 'admin_guide' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-2xl">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Admin &amp; Proctor Guide
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Campus Admin Operations &amp; Verification
                </h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Management workflows for University Security, Student Welfare Officers, and Department HODs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>CSV Roster Access Control</span>
                  </h3>
                  <p className="leading-relaxed">
                    Admins can switch between <strong>Verified Roster Mode</strong> (only college emails listed in the university CSV can log in) and <strong>Open Access Mode</strong> (any @yenepoya.edu.in email).
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                    Admin Passkey: <span className="font-bold text-red-900">sanjeev007</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Physical Desk Inventory Tracking</span>
                  </h3>
                  <p className="leading-relaxed">
                    Security guards log unclaimed wallets, keys, and laptops with designated storage box reference tags (Security Main Gate, Dean Student Affairs Desk, Library Reception).
                  </p>
                  <p className="leading-relaxed">
                    Students can claim items at the desk with their physical Yenepoya Student ID card.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('admin_panel')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Open Admin Control Center</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: Admin Control Center */}
        {(activeTab === 'admin' || activeTab === 'admin_panel') && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-2">
              <span>YenFind • Yenepoya (Deemed to be University)</span>
              <span className="bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Campus Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Deralakatte, Mangaluru, Karnataka 575018. Designed for student security and zero database bloat.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsContactAdminOpen(true)}
              className="hover:text-white transition-colors"
            >
              Lost &amp; Found Officer Helpdesk
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-amber-400 transition-colors font-semibold"
            >
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* Global Toast System */}
      <ToastContainer />

      {/* Modals & Overlays */}
      <PostItemModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        defaultType={postModalDefaultType}
      />

      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onStartMatching={(item) => handleStartMatching(item)}
      />

      <ChatModal
        thread={activeChatThread}
        item={activeChatItem}
        onClose={() => setActiveChatThread(null)}
        onTriggerAcknowledgment={handleTriggerAcknowledgment}
      />

      <AcknowledgmentModal
        cardData={acknowledgmentData}
        threadId={acknowledgmentThreadId}
        onClose={() => {
          setAcknowledgmentData(null);
          setAcknowledgmentThreadId(null);
        }}
      />

      <ContactAdminModal
        isOpen={isContactAdminOpen}
        onClose={() => setIsContactAdminOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
