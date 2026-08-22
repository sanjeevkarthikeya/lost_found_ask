import React from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  MessageCircle,
  Eye,
  CheckCircle,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface ItemCardProps {
  item: LostFoundItem;
  onSelectItem: (item: LostFoundItem) => void;
  onStartMatching: (item: LostFoundItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelectItem, onStartMatching }) => {
  const { currentUser } = useApp();

  const isOwner = currentUser?.id === item.postedBy.userId;
  const isLost = item.type === 'lost';

  return (
    <div
      id={`item-card-${item.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col hover:border-red-300 relative"
    >
      {/* Top Media / Thumbnail Section */}
      <div
        className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onSelectItem(item)}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <ShieldAlert className="w-10 h-10 mb-1 text-slate-300" />
            <span className="text-xs font-semibold text-slate-500">No Image Uploaded</span>
            <span className="text-[10px] text-slate-400">Verified campus description available</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-sm ${
              isLost
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost ? '• Lost Item' : '✓ Found Item'}
          </span>

          {item.status === 'matched' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> In Verification
            </span>
          )}

          {item.status === 'resolved' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-emerald-400 shadow-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Reunited
            </span>
          )}
        </div>

        {/* Views Count Pill */}
        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
          <Eye className="w-3 h-3" />
          <span>{item.viewsCount}</span>
        </div>

        {/* Secret Verification Hint Indicator */}
        {item.secretHint && (
          <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Anti-Theft Verification Set</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="font-semibold text-red-900 bg-red-50 px-2 py-0.5 rounded-md">
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.date}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectItem(item)}
            className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-red-800 cursor-pointer transition-colors"
          >
            {item.title}
          </h3>

          {/* Location Pin */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Card Footer: Poster info and Action CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Poster Avatar & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {item.postedBy.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-800 truncate">
                {isOwner ? 'You (Poster)' : item.postedBy.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {item.postedBy.department}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          {item.status !== 'resolved' ? (
            <button
              id={`btn-match-${item.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onStartMatching(item);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isOwner
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : isLost
                  ? 'bg-red-800 hover:bg-red-900 text-white shadow-xs'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>
                {isOwner
                  ? 'Manage / Chats'
                  : isLost
                  ? 'I Found This!'
                  : 'This is Mine!'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onSelectItem(item)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              View Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
