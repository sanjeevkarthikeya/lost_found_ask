import React, { useState, useEffect } from 'react';
import { AcknowledgmentCardData } from '../types';
import { generateAcknowledgmentCard } from '../utils/canvasCard';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface AcknowledgmentModalProps {
  cardData: AcknowledgmentCardData | null;
  threadId: string | null;
  onClose: () => void;
}

export const AcknowledgmentModal: React.FC<AcknowledgmentModalProps> = ({
  cardData,
  threadId,
  onClose,
}) => {
  const { resolveCase, addToast } = useApp();
  const [cardImage, setCardImage] = useState<string>('');
  const [downloadFilename, setDownloadFilename] = useState<string>('YenFind_Acknowledgment.png');
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!cardData) return;

    setIsGenerating(true);
    // Fire festive campus confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B0000', '#059669', '#D97706', '#1E3A8A'],
    });

    // Generate high-resolution certificate on canvas
    generateAcknowledgmentCard(cardData).then(({ dataUrl, filename }) => {
      setCardImage(dataUrl);
      setDownloadFilename(filename);
      setIsGenerating(false);
    });
  }, [cardData]);

  if (!cardData) return null;

  const handleDownload = () => {
    if (!cardImage) return;

    const link = document.createElement('a');
    link.href = cardImage;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHasDownloaded(true);
    addToast('Certificate Downloaded', 'Official Yenepoya handover card saved to your device.', 'success');
  };

  const handleFinalizeResolution = () => {
    if (!hasDownloaded) {
      addToast('Download Required', 'Please download the official acknowledgment card first to finalize the return.', 'warning');
      return;
    }

    if (threadId) {
      resolveCase(threadId, cardData);
    }
    onClose();
  };

  return (
    <div id="acknowledgment-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white p-5 text-center relative">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official University Handover Certificate</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Property Reunited &amp; Acknowledged!
          </h2>
          <p className="text-xs text-red-200 mt-1 max-w-lg mx-auto">
            Generated on-the-spot with verified Yenepoya University security seal.
          </p>
        </div>

        {/* Certificate Display Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
          {isGenerating ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Generating High-Res Canvas Certificate...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Generated Image Preview */}
              <div className="bg-white p-2 rounded-2xl border border-slate-300 shadow-md overflow-hidden">
                <img
                  src={cardImage}
                  alt="Yenepoya University Acknowledgment Card"
                  className="w-full h-auto rounded-xl shadow-xs"
                />
              </div>

              {/* Security & Auto-Delete Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Zero Database Bloat Protocol</div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      This certificate is rendered strictly in client memory and is not stored in the cloud.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">7-Day Auto-Purge Activated</div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Case metadata will permanently auto-delete in 7 days to maintain student privacy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Mandatory Download & Finish */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {hasDownloaded ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Card successfully downloaded! You can now conclude the case.</span>
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Mandatory Step: You must download the card to proceed.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Download Button */}
            <button
              id="btn-download-acknowledgment-card"
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-red-900 hover:bg-red-950 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Card (PNG)</span>
            </button>

            {/* Complete Resolution Button */}
            <button
              id="btn-finalize-resolution"
              type="button"
              onClick={handleFinalizeResolution}
              disabled={!hasDownloaded}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                hasDownloaded
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Complete &amp; Archive Case</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
