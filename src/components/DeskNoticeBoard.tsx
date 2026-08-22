import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeskNoticeItem, ItemCategory } from '../types';
import {
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Tag,
  Search,
  CheckCircle2,
  Box,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const DeskNoticeBoard: React.FC<{ onOpenContactAdmin: () => void }> = ({ onOpenContactAdmin }) => {
  const { deskItems, currentUser, claimDeskItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeskItem, setSelectedDeskItem] = useState<DeskNoticeItem | null>(null);

  const filteredItems = deskItems.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.storageRefNumber.toLowerCase().includes(q) ||
      d.foundLocation.toLowerCase().includes(q)
    );
  });

  return (
    <div id="desk-notice-board" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Physical Lost &amp; Found Inventory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Campus Desk Notice Board
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Items physically deposited at Yenepoya Security Gates, Central Library Reception, and Dean Student Affairs Desk.
            To claim, visit the listed location with your student ID.
          </p>
        </div>

        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Campus Claim Procedure Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-900 flex items-center justify-center font-bold shrink-0">
            1
          </div>
          <div>
            <div className="font-bold text-slate-900">Note the Storage Ref #</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Identify the exact box number (e.g. DESK-BOX-A12).
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-900 flex items-center justify-center font-bold shrink-0">
            2
          </div>
          <div>
            <div className="font-bold text-slate-900">Carry YU Student ID Card</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Security verification is required for all physical handovers.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-900 flex items-center justify-center font-bold shrink-0">
            3
          </div>
          <div>
            <div className="font-bold text-slate-900">Sign Campus Ledger</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Security will mark the item as returned in the digital registry.
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            id="desk-search-input"
            type="text"
            placeholder="Search desk items, box #, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <button
          onClick={onOpenContactAdmin}
          className="text-xs font-bold text-red-900 hover:text-red-950 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          Contact Lost &amp; Found Officer
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((deskItem) => (
          <div
            key={deskItem.id}
            id={`desk-item-${deskItem.id}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {deskItem.imageUrl ? (
                  <img
                    src={deskItem.imageUrl}
                    alt={deskItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <Box className="w-10 h-10 text-slate-300 mb-1" />
                    <span className="text-xs font-semibold">Physical Storage Deposit</span>
                  </div>
                )}

                {/* Storage Ref Pill */}
                <div className="absolute top-2.5 left-2.5 bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm border border-slate-700 flex items-center gap-1">
                  <Box className="w-3 h-3 text-amber-400" />
                  <span>{deskItem.storageRefNumber}</span>
                </div>

                {/* Claimed status badge */}
                <div className="absolute top-2.5 right-2.5">
                  {deskItem.claimed ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Claimed
                    </span>
                  ) : (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      Available at Desk
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-red-900 bg-red-50 px-2 py-0.5 rounded">
                    {deskItem.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {deskItem.dateReceived}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {deskItem.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {deskItem.description}
                </p>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">Held At: </span>
                    <span className="truncate">{deskItem.heldAt}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">Found: {deskItem.foundLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 pt-0">
              {!deskItem.claimed ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">To Claim: Visit {deskItem.heldAt}</span>
                  <span className="text-[11px] font-bold text-red-800">Show ID</span>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold text-center border border-emerald-200">
                  Claimed by {deskItem.claimedBy} on {deskItem.claimedDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
