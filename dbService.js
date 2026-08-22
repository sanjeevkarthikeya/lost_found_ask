/**
 * dbService.js - Robust Client-Side Database & Modular Service Layer for YenFind
 * 
 * Features:
 * - LocalStorage state management with fallback to mock data
 * - Automatic 7-day pruning for resolved items to conserve storage
 * - CSV Parser for Student Roster import
 * - CSV Exporter for full semester records
 * - Complete Semester Reset with safety confirmation
 * - Gamified Karma & Leaderboard tracking
 * - Safe modular adapter ready for Firebase / Cloud SQL integration
 */

const STORAGE_KEYS = {
  ITEMS: 'yenfind_items_v1',
  LEADERBOARD: 'yenfind_leaderboard_v1',
  NOTICES: 'yenfind_notices_v1',
  ROSTER: 'yenfind_roster_v1',
  SETTINGS: 'yenfind_settings_v1',
  CURRENT_USER: 'yenfind_current_user_v1',
  CLAIM_MESSAGES: 'yenfind_messages_v1',
  SOCIAL_SHARES: 'yenfind_social_shares_v1'
};

class DatabaseService {
  constructor() {
    this.initDatabase();
    this.runAutoPrune();
  }

  // Initialize LocalStorage with seed data if empty
  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_MOCK_DATA.items));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_MOCK_DATA.leaderboard));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_MOCK_DATA.noticeBoard));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROSTER)) {
      localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(INITIAL_MOCK_DATA.studentRoster));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_MOCK_DATA.adminSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLAIM_MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.CLAIM_MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOCIAL_SHARES)) {
      localStorage.setItem(STORAGE_KEYS.SOCIAL_SHARES, JSON.stringify({}));
    }
  }

  // Auto-prune items resolved more than 7 days ago to save browser memory
  runAutoPrune() {
    try {
      const items = this.getItems();
      const settings = this.getSettings();
      const pruneDays = settings.autoPruneDays || 7;
      const pruneThreshold = Date.now() - (pruneDays * 24 * 60 * 60 * 1000);

      const activeItems = items.filter(item => {
        if (item.status === 'claimed' && item.resolvedAt) {
          const resolvedTime = new Date(item.resolvedAt).getTime();
          return resolvedTime > pruneThreshold; // Keep if younger than 7 days
        }
        return true; // Keep open or at_admin items
      });

      if (activeItems.length !== items.length) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(activeItems));
        console.log(`[YenFind Auto-Prune] Removed ${items.length - activeItems.length} old resolved items.`);
      }
    } catch (e) {
      console.error('[YenFind] Error in auto-prune:', e);
    }
  }

  // --- ITEM METHODS ---

  getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS)) || [];
    } catch {
      return [];
    }
  }

  getItemById(id) {
    return this.getItems().find(item => item.id === id) || null;
  }

  addItem(itemData) {
    const items = this.getItems();
    const newItem = {
      id: `YEN-${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`,
      ...itemData,
      status: itemData.status || 'open',
      tips: [],
      createdAt: new Date().toISOString()
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return newItem;
  }

  updateItem(id, updateData) {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updateData };
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  deleteItem(id) {
    let items = this.getItems();
    items = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return true;
  }

  // Add a bystander tip (Person 3 tip)
  addTip(itemId, authorName, tipMessage) {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    if (item) {
      if (!item.tips) item.tips = [];
      const newTip = {
        id: `tip-${Date.now()}`,
        author: authorName || 'Anonymous Student',
        message: tipMessage,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      item.tips.push(newTip);
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return newTip;
    }
    return null;
  }

  // Complete handover & award karma points
  resolveHandover(itemId, handoverDetails) {
    const item = this.getItemById(itemId);
    if (!item) return null;

    const certId = `CERT-YEN-${Math.floor(100000 + Math.random() * 900000)}`;
    const update = {
      status: 'claimed',
      resolvedAt: new Date().toISOString(),
      handoverDetails: {
        certificateId: certId,
        finderName: handoverDetails.finderName,
        finderRoll: handoverDetails.finderRoll || 'N/A',
        ownerName: handoverDetails.ownerName,
        ownerRoll: handoverDetails.ownerRoll || 'N/A',
        handoverDate: new Date().toISOString().split('T')[0],
        handoverLocation: handoverDetails.location || 'Campus Desk'
      }
    };

    const updatedItem = this.updateItem(itemId, update);

    // Award +100 Karma points to the finder
    if (handoverDetails.finderName) {
      this.awardKarma(handoverDetails.finderName, handoverDetails.finderRoll, 100, true);
    }

    return { item: updatedItem, certId };
  }

  // --- LEADERBOARD & KARMA ---

  getLeaderboard() {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) || [];
      return list.sort((a, b) => b.karma - a.karma);
    } catch {
      return [];
    }
  }

  awardKarma(studentName, rollNo, points = 50, incrementReturns = false) {
    let board = this.getLeaderboard();
    let student = board.find(s => s.name.toLowerCase() === studentName.toLowerCase() || (rollNo && s.rollNo === rollNo));

    if (student) {
      student.karma += points;
      if (incrementReturns) student.returnsCount = (student.returnsCount || 0) + 1;
    } else {
      const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
      student = {
        name: studentName,
        rollNo: rollNo || 'YEN24ST000',
        karma: points,
        returnsCount: incrementReturns ? 1 : 0,
        avatar: initials,
        badge: 'Helper 🥉'
      };
      board.push(student);
    }

    // Dynamic badge calculation based on karma points
    if (student.karma >= 300) student.badge = 'Campus Guardian 🛡️';
    else if (student.karma >= 200) student.badge = 'Master Rescuer 🥈';
    else if (student.karma >= 100) student.badge = 'Good Samaritan 🌟';
    else student.badge = 'Helper 🥉';

    // Re-rank
    board.sort((a, b) => b.karma - a.karma);
    board.forEach((s, idx) => s.rank = idx + 1);

    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(board));
    return student;
  }

  // Social Share Bonus (One time +50 points per student per certificate)
  claimSocialShareBonus(studentName, certId) {
    const shares = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOCIAL_SHARES) || '{}');
    const shareKey = `${studentName}_${certId}`;

    if (shares[shareKey]) {
      return { success: false, message: 'Points for sharing this certificate have already been claimed!' };
    }

    shares[shareKey] = { claimedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SOCIAL_SHARES, JSON.stringify(shares));

    this.awardKarma(studentName, null, 50, false);
    return { success: true, message: '🎉 +50 Karma Points awarded for spreading kindness on social media!' };
  }

  // --- PRIVATE INQUIRY MESSAGES (Finder <-> Owner) ---

  getMessages(itemId) {
    try {
      const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIM_MESSAGES)) || [];
      return allMessages.filter(m => m.itemId === itemId);
    } catch {
      return [];
    }
  }

  sendMessage(itemId, senderName, senderContact, messageText) {
    const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIM_MESSAGES) || '[]');
    const newMsg = {
      id: `msg-${Date.now()}`,
      itemId,
      senderName,
      senderContact,
      message: messageText,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    allMessages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.CLAIM_MESSAGES, JSON.stringify(allMessages));
    return newMsg;
  }

  // --- NOTICE BOARD ---

  getNotices() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTICES)) || [];
    } catch {
      return [];
    }
  }

  addNotice(noticeData) {
    const notices = this.getNotices();
    const newNotice = {
      id: `NOT-${String(notices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      author: noticeData.author || 'Campus Administration',
      badge: noticeData.badge || 'CAMPUS NOTICE',
      title: noticeData.title,
      content: noticeData.content
    };
    notices.unshift(newNotice);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    return newNotice;
  }

  deleteNotice(id) {
    let notices = this.getNotices();
    notices = notices.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    return true;
  }

  // --- STUDENT ROSTER & LOGIN AUTH ---

  getRoster() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROSTER)) || [];
    } catch {
      return [];
    }
  }

  importRosterCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { success: false, count: 0, error: 'CSV file is empty or missing headers.' };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('id'));
    const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('branch'));

    if (emailIdx === -1) {
      return { success: false, count: 0, error: 'CSV must contain an "email" column.' };
    }

    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols[emailIdx]) {
        students.push({
          name: nameIdx !== -1 ? cols[nameIdx] : 'Student',
          email: cols[emailIdx].toLowerCase(),
          rollNo: rollIdx !== -1 ? cols[rollIdx] : `YEN-${i}`,
          department: deptIdx !== -1 ? cols[deptIdx] : 'Yenepoya Campus'
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(students));
    return { success: true, count: students.length };
  }

  validateStudentLogin(email, name, rollNo) {
    const settings = this.getSettings();
    const cleanEmail = email.trim().toLowerCase();

    // If Open Campus Mode is enabled (Strict verification = false)
    if (!settings.strictRosterVerification) {
      const user = {
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        rollNo: rollNo || 'GUEST',
        role: 'student'
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user, mode: 'open' };
    }

    // Strict Mode: Check against uploaded CSV roster
    const roster = this.getRoster();
    const matched = roster.find(s => s.email.toLowerCase() === cleanEmail);

    if (matched) {
      const user = { ...matched, role: 'student' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, user, mode: 'strict_verified' };
    } else {
      return {
        success: false,
        error: `Access Denied: Email '${cleanEmail}' is not in the active semester roster. Contact Administrator or enable Open Campus Mode in settings.`
      };
    }
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // --- ADMIN SETTINGS & SEMESTER MANAGEMENT ---

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || INITIAL_MOCK_DATA.adminSettings;
    } catch {
      return INITIAL_MOCK_DATA.adminSettings;
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  verifyAdminPin(pin) {
    const settings = this.getSettings();
    return pin.trim() === settings.adminPin;
  }

  // Export full database as CSV for Admin Backup before reset
  exportSemesterDataCSV() {
    const items = this.getItems();
    let csvContent = 'ID,Type,Title,Category,Zone,Location,Reported_By_Name,Reported_By_Email,Reported_By_Roll,Status,Created_At,Resolved_At,Handover_Finder,Handover_Owner,Certificate_ID\n';

    items.forEach(item => {
      const row = [
        `"${item.id || ''}"`,
        `"${item.type || ''}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${item.category || ''}"`,
        `"${item.zone || ''}"`,
        `"${(item.location || '').replace(/"/g, '""')}"`,
        `"${item.reportedBy?.name || ''}"`,
        `"${item.reportedBy?.email || ''}"`,
        `"${item.reportedBy?.rollNo || ''}"`,
        `"${item.status || ''}"`,
        `"${item.createdAt || ''}"`,
        `"${item.resolvedAt || ''}"`,
        `"${item.handoverDetails?.finderName || ''}"`,
        `"${item.handoverDetails?.ownerName || ''}"`,
        `"${item.handoverDetails?.certificateId || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  // Full Semester Reset (Clears items, resets leaderboard, cleans notices)
  resetSemesterData() {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLAIM_MESSAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SOCIAL_SHARES, JSON.stringify({}));
    // Reset leaderboard to blank
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify([]));
    return true;
  }

  // Reload default sample data (For quick testing/demo)
  restoreSampleData() {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_MOCK_DATA.items));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_MOCK_DATA.leaderboard));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_MOCK_DATA.noticeBoard));
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(INITIAL_MOCK_DATA.studentRoster));
    return true;
  }
}

// Global single instance
const db = new DatabaseService();
