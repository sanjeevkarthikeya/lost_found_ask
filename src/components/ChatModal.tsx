import React, { useState, useEffect, useRef } from 'react';
import { MatchThread, LostFoundItem, AcknowledgmentCardData } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Share2,
  Sparkles,
  Award,
  Lock,
  Download,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface ChatModalProps {
  thread: MatchThread | null;
  item: LostFoundItem | null;
  onClose: () => void;
  onTriggerAcknowledgment: (cardData: AcknowledgmentCardData, threadId: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  thread,
  item,
  onClose,
  onTriggerAcknowledgment,
}) => {
  const {
    currentUser,
    sendMessage,
    confirmMatchSide,
    submitSocialBonusLink,
    threads,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [showSocialInput, setShowSocialInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync latest thread from context
  const activeThread = threads.find((t) => t.id === thread?.id) || thread;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  if (!activeThread || !currentUser) return null;

  const isOwner = currentUser.id === activeThread.ownerId;
  const isClaimant = currentUser.id === activeThread.claimantId;
  const myConfirmed = isOwner ? activeThread.ownerConfirmed : activeThread.claimantConfirmed;
  const otherConfirmed = isOwner ? activeThread.claimantConfirmed : activeThread.ownerConfirmed;
  const bothConfirmed = activeThread.ownerConfirmed && activeThread.claimantConfirmed;

  const otherPersonName = isOwner ? activeThread.claimantName : activeThread.ownerName;
  const otherPersonDept = isOwner ? activeThread.claimantDepartment : activeThread.ownerDepartment;
  const otherPersonEmail = isOwner ? activeThread.claimantEmail : activeThread.ownerEmail;
  const otherPersonPhone = isOwner ? activeThread.claimantPhone : activeThread.ownerPhone;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeThread.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleConfirmMatch = () => {
    confirmMatchSide(activeThread.id, isOwner);
  };

  const handleApplySocialBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialLink.trim()) return;
    submitSocialBonusLink(activeThread.id, socialLink.trim());
    setSocialLink('');
    setShowSocialInput(false);
  };

  const handleInitiateResolution = () => {
    // Generate unique acknowledgment payload
    const verificationId = `YU-LF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const giverName = activeThread.itemType === 'found' ? activeThread.claimantName : activeThread.claimantName;
    const giverDept = activeThread.itemType === 'found' ? activeThread.claimantDepartment : activeThread.claimantDepartment;
    const giverPhone = activeThread.itemType === 'found' ? activeThread.claimantPhone : activeThread.claimantPhone;

    const receiverName = activeThread.itemType === 'found' ? activeThread.ownerName : activeThread.ownerName;
    const receiverDept = activeThread.itemType === 'found' ? activeThread.ownerDepartment : activeThread.ownerDepartment;
    const receiverPhone = activeThread.itemType === 'found' ? activeThread.ownerPhone : activeThread.ownerPhone;

    const cardData: AcknowledgmentCardData = {
      id: verificationId,
      itemId: activeThread.itemId,
      itemTitle: activeThread.itemTitle,
      itemCategory: item?.category || 'Campus Item',
      giverName: giverName || 'Finder',
      giverDepartment: giverDept || 'Yenepoya Campus',
      giverPhone: giverPhone || 'Verified',
      receiverName: receiverName || 'Verified Owner',
      receiverDepartment: receiverDept || 'Yenepoya Campus',
      receiverPhone: receiverPhone || 'Verified',
      handoverDate: new Date().toISOString().slice(0, 10),
      handoverLocation: item?.location || 'Yenepoya Campus',
      socialBonusEarned: !!activeThread.socialBonusAwarded,
      verificationHash: `AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    onTriggerAcknowledgment(cardData, activeThread.id);
  };

  return (
    <div id="chat-thread-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[92vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-red-600/50">
              {otherPersonName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white truncate">
                  Chat with {otherPersonName}
                </span>
                <span className="text-[10px] bg-red-950 text-red-200 px-2 py-0.5 rounded-full font-bold border border-red-800 shrink-0">
                  {otherPersonDept}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Item: <span className="text-slate-200 font-medium">{activeThread.itemTitle}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-chat-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mutual Verification Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5">
          {!bothConfirmed ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dual Verification Step (Contact Privacy Protected)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm ownership in chat first. Direct phone/email will unlock once both students click "Approve Match".
                </p>
              </div>

              <button
                id="btn-confirm-match-step"
                onClick={handleConfirmMatch}
                disabled={myConfirmed}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-all ${
                  myConfirmed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{myConfirmed ? 'You Approved Match (Waiting...)' : 'Approve Match / Ownership'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>✓ Verified Bilateral Match — Direct Contact Unlocked!</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Ready for Handover
                </span>
              </div>

              {/* Revealed Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${otherPersonPhone}`}
                  className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 text-slate-800 font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Call: {otherPersonPhone}</span>
                </a>

                <a
                  href={`mailto:${otherPersonEmail}`}
                  className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 text-slate-800 font-semibold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Email: {otherPersonEmail}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/50">
          {/* Secret hint reminder if poster set one */}
          {item?.secretHint && (
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Anti-Theft Check Reminder: </span>
                <span>Ask: "{item.secretHint}"</span>
              </div>
            </div>
          )}

          {activeThread.messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-3 rounded-2xl bg-slate-200/70 border border-slate-300 text-slate-800 text-xs text-center font-medium my-2 animate-in fade-in"
                >
                  {msg.text}
                </div>
              );
            }

            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in`}
              >
                <span className="text-[10px] text-slate-400 font-medium px-1 mb-0.5">
                  {isMe ? 'You' : msg.senderName} •{' '}
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    isMe
                      ? 'bg-red-800 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Resolution & Social Bonus Action Tray */}
        {bothConfirmed && (
          <div className="bg-white border-t border-slate-200 p-3 sm:px-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Extra Points Social Bonus */}
              <button
                id="btn-toggle-social-bonus"
                type="button"
                onClick={() => setShowSocialInput(!showSocialInput)}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {activeThread.socialBonusAwarded
                    ? '✓ Social Bonus Added (+1 Point Earned)'
                    : '+1 Extra Point: Paste Social Share Link'}
                </span>
              </button>

              {/* Handover Complete / Generate Acknowledgment Card */}
              {activeThread.status !== 'resolved' ? (
                <button
                  id="btn-trigger-resolution"
                  type="button"
                  onClick={handleInitiateResolution}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Mark "Received / Given" &amp; Generate Card</span>
                </button>
              ) : (
                <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Case Reunited (Certificate Generated)</span>
                </div>
              )}
            </div>

            {/* Social Link Input Dropdown */}
            {showSocialInput && !activeThread.socialBonusAwarded && (
              <form onSubmit={handleApplySocialBonus} className="flex gap-2 pt-2 animate-in fade-in">
                <input
                  id="input-social-link"
                  type="url"
                  placeholder="Paste your Instagram / Twitter / WhatsApp share link..."
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-amber-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  id="btn-submit-social-link"
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0"
                >
                  Claim +1 Bonus Point
                </button>
              </form>
            )}
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            id="chat-message-input"
            type="text"
            placeholder="Type your message to coordinate handover or ask verification questions..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-xs sm:text-sm font-medium"
          />
          <button
            id="btn-chat-send"
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-red-800 hover:bg-red-900 disabled:opacity-40 text-white transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
