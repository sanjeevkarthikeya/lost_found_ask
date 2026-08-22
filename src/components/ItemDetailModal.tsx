import React from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Lock,
  MessageCircle,
  Eye,
  ShieldCheck,
  AlertCircle,
  Building2,
  Share2,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  onClose: () => void;
  onStartMatching: (item: LostFoundItem) => void;
  onViewAcknowledgment?: (item: LostFoundItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onStartMatching,
  onViewAcknowledgment,
}) => {
  const { currentUser, deleteItem, addToast } = useApp();

  if (!item) return null;

  const isOwner = currentUser?.id === item.postedBy.userId;
  const isLost = item.type === 'lost';

  // Calculate 7-day countdown if resolved
  let autoDeleteText = '';
  if (item.status === 'resolved' && item.autoDeleteAt) {
    const diffMs = new Date(item.autoDeleteAt).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    autoDeleteText = `Auto-deletes from database in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (Privacy Protocol)`;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Link Copied', `Campus link for "${item.title}" copied to clipboard!`, 'success');
  };

  return (
    <div id="item-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isLost ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isLost ? '• Lost Property Notice' : '✓ Found Property Report'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">• ID #{item.id.slice(-6)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Share listing link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isOwner && (
              <button
                onClick={() => {
                  deleteItem(item.id);
                  onClose();
                }}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete this notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Image if available */}
          {item.imageUrl ? (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>{item.viewsCount} campus views</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700">No Image Uploaded</p>
              <p className="text-[11px] text-slate-500">
                To protect against fraudulent claims, descriptive matching is used.
              </p>
            </div>
          )}

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold text-red-900 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                {item.category}
              </span>
              {item.status === 'matched' && (
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                  ⚡ In Verification Process
                </span>
              )}
              {item.status === 'resolved' && (
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> Case Reunited &amp; Resolved
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {item.title}
            </h1>
          </div>

          {/* Location & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-800 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">{item.location}</div>
                {item.locationDetails && (
                  <div className="text-slate-500 text-[11px] mt-0.5">{item.locationDetails}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-red-800 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Reported Date: {item.date}</div>
                {item.time && (
                  <div className="text-slate-500 text-[11px] mt-0.5">Approx. {item.time}</div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Notice Description
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* Secret Hint Box */}
          {item.secretHint && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Anti-Theft Question Hint:</span>
              </div>
              <p className="text-[11px] text-amber-800">
                "{item.secretHint}"
              </p>
              <p className="text-[10px] text-amber-700 italic">
                * Claimant will be asked to answer this in private chat to verify genuine ownership.
              </p>
            </div>
          )}

          {/* Handover & Custody Status */}
          {item.type === 'found' && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="font-bold">Current Custody: </span>
                <span>
                  {item.handoverLocation === 'physical_desk'
                    ? 'Submitted to Yenepoya Security / Admin Lost & Found Desk'
                    : 'Safely kept with reporting student'}
                </span>
              </div>
            </div>
          )}

          {/* Poster & Privacy Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {item.postedBy.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {item.postedBy.name} {isOwner && '(You)'}
                  </div>
                  <div className="text-[11px] text-slate-500">{item.postedBy.department}</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                YU Verified Student
              </span>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact phone &amp; email remain hidden until bilateral match confirmation.</span>
            </div>
          </div>

          {/* Auto-delete banner if resolved */}
          {autoDeleteText && (
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
              <span className="font-medium text-slate-300">{autoDeleteText}</span>
              {onViewAcknowledgment && (
                <button
                  onClick={() => onViewAcknowledgment(item)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  View Certificate
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          {item.status !== 'resolved' ? (
            <button
              id="btn-detail-start-matching"
              onClick={() => {
                onClose();
                onStartMatching(item);
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all ${
                isOwner
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : isLost
                  ? 'bg-red-800 text-white hover:bg-red-900'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isOwner
                  ? 'Open Chat / Manage Inquiries'
                  : isLost
                  ? 'I Found This Item (Message Owner)'
                  : 'This is Mine (Claim Item)'}
              </span>
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              ✓ Successfully Handed Over
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
