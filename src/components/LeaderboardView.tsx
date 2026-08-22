import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Share2,
  Heart,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { users, currentUser, adminSettings, addToast } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);

  // Sort users by points descending
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const handleShareApp = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    addToast('Campus Link Copied', 'Share YenFind on Instagram Story, Twitter, or WhatsApp group!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div id="leaderboard-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-red-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>{adminSettings.currentSemester} Leaderboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Campus Good Samaritan Honor Roll
          </h1>

          <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
            Recognizing Yenepoya University students who step up to reunite lost property with their peers.
            Leaderboard rankings refresh automatically each academic semester.
          </p>

          {/* Points rules badge */}
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              +50 pts for successful return
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
              +20 pts for reporting found item
            </span>
            <span className="bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30 font-bold">
              +1 Extra Point (+25 pts) for Social Share Link
            </span>
          </div>
        </div>

        {/* Decorative Golden Graphic */}
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Trophy className="w-72 h-72 text-amber-400" />
        </div>
      </div>

      {/* Share to Campus Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-amber-950">
              Help YenFind Reach More Students
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Share the platform link on your college groups. You earn +1 bonus case point on your active match!
            </p>
          </div>
        </div>

        <button
          id="btn-copy-share-link"
          onClick={handleShareApp}
          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy YenFind Share Link'}</span>
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedUsers.slice(0, 3).map((user, idx) => {
          let rankTitle = '1st Place • Campus Champion';
          let medalColor = 'from-amber-400 to-amber-600 text-amber-950';
          let borderHighlight = 'border-amber-400 ring-2 ring-amber-400/20';

          if (idx === 1) {
            rankTitle = '2nd Place • Silver Samaritan';
            medalColor = 'from-slate-300 to-slate-400 text-slate-900';
            borderHighlight = 'border-slate-300';
          } else if (idx === 2) {
            rankTitle = '3rd Place • Bronze Samaritan';
            medalColor = 'from-amber-700 to-amber-900 text-white';
            borderHighlight = 'border-amber-600/50';
          }

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between relative overflow-hidden ${borderHighlight}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r ${medalColor}`}
                >
                  {rankTitle}
                </span>
                <span className="text-xl font-black text-slate-800">#{idx + 1}</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-extrabold text-white shadow-md"
                  style={{ backgroundColor: user.avatarColor || '#8B0000' }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold text-slate-900 truncate">{user.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{user.department}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="font-extrabold text-red-900 text-sm">{user.returnsCompleted}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Reunited</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl">
                  <div className="font-extrabold text-amber-700 text-sm">{user.points}</div>
                  <div className="text-[10px] text-amber-800 font-medium">Total Points</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Semester Standings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Semester: {adminSettings.currentSemester} (Academic Year {adminSettings.academicYear})
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {sortedUsers.length} Active Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5 text-center">Items Reunited</th>
                <th className="px-6 py-3.5 text-center">Social Shares</th>
                <th className="px-6 py-3.5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((u, i) => {
                const isMe = currentUser?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isMe ? 'bg-red-50/70 font-semibold' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          i === 0
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : i === 1
                            ? 'bg-slate-300 text-slate-800 font-black'
                            : i === 2
                            ? 'bg-amber-700 text-white font-black'
                            : 'text-slate-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: u.avatarColor || '#8B0000' }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isMe && (
                              <span className="text-[10px] bg-red-800 text-white px-1.5 py-0.2 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.department}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {u.returnsCompleted}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {u.socialShares || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-sm text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                        {u.points} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
