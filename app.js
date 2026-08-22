/**
 * app.js - Main Application Controller for YenFind
 * Vibe Coded by Sanjeev Karthikeya (@ask_invictus)
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeTab: 'feed',
  activeZone: 'all',
  activeStatusFilter: 'all',
  selectedCategories: new Set(),
  searchQuery: '',
  selectedImageBase64: null,
  currentModalItem: null,
  isAdminLoggedIn: false,

  init() {
    this.bindEvents();
    this.updateNavbarUserPill();
    this.renderStats();
    this.renderFeed();
    this.renderLeaderboard();
    this.renderNotices();
    this.renderRosterPreview();
    this.updateAdminSettingsUI();
  },

  // --- EVENT BINDINGS ---
  bindEvents() {
    // Nav Tab Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Campus Zone Chips
    document.querySelectorAll('.zone-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.zone-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeZone = chip.dataset.zone;
        this.renderFeed();
      });
    });

    // Status Segmented Control (All / Lost / Found / Admin)
    document.querySelectorAll('.status-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.status-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeStatusFilter = btn.dataset.status;
        this.renderFeed();
      });
    });

    // Search Input
    const searchInput = document.getElementById('feedSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderFeed();
      });
    }

    // Category Checkboxes
    document.querySelectorAll('.category-filter-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          this.selectedCategories.add(cb.value);
        } else {
          this.selectedCategories.delete(cb.value);
        }
        this.renderFeed();
      });
    });

    // Reset Filters Button
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectedCategories.clear();
        document.querySelectorAll('.category-filter-checkbox').forEach(cb => cb.checked = false);
        this.activeZone = 'all';
        document.querySelectorAll('.zone-chip').forEach(c => c.classList.remove('active'));
        const allChip = document.querySelector('.zone-chip[data-zone="all"]');
        if (allChip) allChip.classList.add('active');
        this.activeStatusFilter = 'all';
        document.querySelectorAll('.status-seg-btn').forEach(b => b.classList.remove('active'));
        const allSeg = document.querySelector('.status-seg-btn[data-status="all"]');
        if (allSeg) allSeg.classList.add('active');
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        this.renderFeed();
      });
    }

    // Post Item Modal Form Submit
    const postForm = document.getElementById('postItemForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
    }

    // Image Upload input
    const imageInput = document.getElementById('itemImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
    }

    // Smart Match Radar dynamic checking
    const titleInput = document.getElementById('postItemTitle');
    if (titleInput) {
      titleInput.addEventListener('input', () => this.checkSmartMatchRadar());
    }

    // Close Modals on backdrop click or close button
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeAllModals();
      });
    });
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Custom Student Login Form
    const customStudentForm = document.getElementById('customStudentLoginForm');
    if (customStudentForm) {
      customStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customStudentName').value.trim();
        const roll = document.getElementById('customStudentRoll').value.trim();
        const email = document.getElementById('customStudentEmail').value.trim();
        db.validateStudentLogin(email, name, roll);
        this.updateNavbarUserPill();
        this.closeAllModals();
        this.playChime();
        alert(`🎓 Active student switched to: ${name} (${roll})`);
      });
    }

    // Admin PIN Form
    const adminPinForm = document.getElementById('adminPinForm');
    if (adminPinForm) {
      adminPinForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
    }

    // Admin Roster CSV Upload
    const rosterUpload = document.getElementById('rosterCsvUpload');
    if (rosterUpload) {
      rosterUpload.addEventListener('change', (e) => this.handleRosterCsvUpload(e));
    }

    // Admin Post Notice Form
    const noticeForm = document.getElementById('postNoticeForm');
    if (noticeForm) {
      noticeForm.addEventListener('submit', (e) => this.handlePostNotice(e));
    }
  },

  // --- TAB SWITCHING ---
  switchTab(tabName) {
    this.activeTab = tabName;

    // Update Nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update Tab Views
    document.querySelectorAll('.tab-page-view').forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabName}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tab-specific refreshes
    if (tabName === 'feed') this.renderFeed();
    if (tabName === 'leaderboard') this.renderLeaderboard();
    if (tabName === 'notices') this.renderNotices();
    if (tabName === 'admin') this.checkAdminViewAccess();
  },

  // --- STATS BAR ---
  renderStats() {
    const items = db.getItems();
    const lostCount = items.filter(i => i.type === 'lost' && i.status === 'open').length;
    const foundCount = items.filter(i => i.type === 'found' && i.status === 'open').length;
    const resolvedCount = items.filter(i => i.status === 'claimed').length;

    const lostEl = document.getElementById('statLostCount');
    const foundEl = document.getElementById('statFoundCount');
    const resolvedEl = document.getElementById('statResolvedCount');

    if (lostEl) lostEl.innerText = lostCount;
    if (foundEl) foundEl.innerText = foundCount;
    if (resolvedEl) resolvedEl.innerText = resolvedCount;
  },

  // --- FEED & FILTER RENDERING ---
  renderFeed() {
    const grid = document.getElementById('itemsFeedGrid');
    if (!grid) return;

    let items = db.getItems();

    // 1. Status Filter
    if (this.activeStatusFilter === 'lost') {
      items = items.filter(i => i.type === 'lost' && i.status !== 'claimed');
    } else if (this.activeStatusFilter === 'found') {
      items = items.filter(i => i.type === 'found' && i.status !== 'claimed');
    } else if (this.activeStatusFilter === 'admin') {
      items = items.filter(i => i.status === 'at_admin');
    } else if (this.activeStatusFilter === 'resolved') {
      items = items.filter(i => i.status === 'claimed');
    }

    // 2. Zone Filter
    if (this.activeZone !== 'all') {
      items = items.filter(i => i.zone && i.zone.toLowerCase().includes(this.activeZone.toLowerCase()));
    }

    // 3. Category Filter
    if (this.selectedCategories.size > 0) {
      items = items.filter(i => this.selectedCategories.has(i.category));
    }

    // 4. Search Query
    if (this.searchQuery) {
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(this.searchQuery)) ||
        (i.description && i.description.toLowerCase().includes(this.searchQuery)) ||
        (i.location && i.location.toLowerCase().includes(this.searchQuery)) ||
        (i.reportedBy && i.reportedBy.name && i.reportedBy.name.toLowerCase().includes(this.searchQuery))
      );
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🔍</div>
          <h3>No Campus Items Found</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search terms, campus zone, or filters.</p>
          <button class="btn-post-cta" style="margin: 1.25rem auto 0;" onclick="App.openPostModal('lost')">
            + Report a Lost or Found Item
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => this.createItemCardHTML(item)).join('');
  },

  createItemCardHTML(item) {
    const isClaimed = item.status === 'claimed';
    const isAtAdmin = item.status === 'at_admin';
    const typeLabel = isClaimed ? 'RESOLVED & HANDED OVER' : (isAtAdmin ? 'AT SECURITY DESK' : (item.type === 'lost' ? 'LOST ITEM' : 'FOUND ITEM'));
    const typeClass = isClaimed ? 'claimed' : (isAtAdmin ? 'at-admin' : item.type);

    const defaultImg = item.type === 'lost' 
      ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80';

    const itemImage = item.image || defaultImg;
    const tipsCount = (item.tips || []).length;

    let actionButtons = '';
    if (isClaimed) {
      actionButtons = `
        <button class="btn-card-action resolved-view" onclick="App.viewHandoverCertificate('${item.id}')">
          📜 View Handover Certificate
        </button>
      `;
    } else {
      actionButtons = `
        <button class="btn-card-action primary-claim" onclick="App.openConnectModal('${item.id}')">
          ${item.type === 'lost' ? '💬 I Found / Claim' : '🤝 Verify & Claim'}
        </button>
        <button class="btn-card-action secondary-tip" onclick="App.openTipModal('${item.id}')" title="Drop bystander tip">
          💡 Tip
        </button>
      `;
    }

    return `
      <div class="item-card type-${item.type}">
        <div class="item-image-wrapper" style="cursor: pointer;" onclick="App.openItemDetail('${item.id}')">
          <img src="${itemImage}" alt="${item.title}" loading="lazy" onerror="this.src='${defaultImg}'" />
          <span class="badge-tag-type ${typeClass}">${typeLabel}</span>
          <span class="badge-category">${item.category || 'General'}</span>
        </div>

        <div class="item-card-body">
          <h3 class="item-card-title" style="cursor: pointer;" onclick="App.openItemDetail('${item.id}')">${item.title}</h3>
          <p class="item-card-desc">${item.description || 'No description provided.'}</p>

          <div class="item-meta-row">
            <div class="item-meta-item">
              <span>📍</span>
              <span>${item.location}</span>
            </div>
            <div class="item-meta-item">
              <span>📅</span>
              <span>${item.date} • By ${item.reportedBy?.name || 'Student'}</span>
            </div>
            ${tipsCount > 0 ? `
              <div class="tips-indicator">
                💡 ${tipsCount} Bystander Tip${tipsCount > 1 ? 's' : ''} Received
              </div>
            ` : ''}
          </div>

          <div class="item-card-footer">
            ${actionButtons}
          </div>
        </div>
      </div>
    `;
  },

  // --- SMART MATCH RADAR (Auto-suggest while posting) ---
  checkSmartMatchRadar() {
    const title = (document.getElementById('postItemTitle')?.value || '').toLowerCase().trim();
    const type = document.getElementById('postItemType')?.value || 'lost';
    const radarBox = document.getElementById('smartMatchRadarBox');
    const radarText = document.getElementById('smartMatchRadarText');

    if (!radarBox || !radarText) return;

    if (title.length < 3) {
      radarBox.style.display = 'none';
      return;
    }

    // Look for opposite type items with matching keywords
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const items = db.getItems();
    const words = title.split(' ').filter(w => w.length > 2);

    const matches = items.filter(i => {
      if (i.type !== oppositeType || i.status === 'claimed') return false;
      const iTitle = (i.title || '').toLowerCase();
      return words.some(w => iTitle.includes(w));
    });

    if (matches.length > 0) {
      const topMatch = matches[0];
      radarText.innerHTML = `
        Potential Match Found: <strong>"${topMatch.title}"</strong> reported in <em>${topMatch.location}</em>.
        <a class="match-radar-item-link" onclick="App.previewAndClosePost('${topMatch.id}')">View item details</a> before posting!
      `;
      radarBox.style.display = 'block';
    } else {
      radarBox.style.display = 'none';
    }
  },

  previewAndClosePost(itemId) {
    this.closeAllModals();
    this.openConnectModal(itemId);
  },

  // --- POST ITEM FLOW ---
  openPostModal(defaultType = 'lost') {
    const modal = document.getElementById('postItemModal');
    if (!modal) return;
    document.getElementById('postItemType').value = defaultType;
    document.getElementById('postItemForm').reset();
    document.getElementById('smartMatchRadarBox').style.display = 'none';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    this.selectedImageBase64 = null;
    modal.classList.add('active');
  },

  handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to client-side base64 for instant preview & canvas integration
    const reader = new FileReader();
    reader.onload = (event) => {
      this.selectedImageBase64 = event.target.result;
      const previewImg = document.getElementById('imagePreviewThumb');
      const container = document.getElementById('imagePreviewContainer');
      if (previewImg && container) {
        previewImg.src = this.selectedImageBase64;
        container.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  },

  handlePostSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('postItemType').value;
    const title = document.getElementById('postItemTitle').value.trim();
    const category = document.getElementById('postItemCategory').value;
    const zone = document.getElementById('postItemZone').value;
    const location = document.getElementById('postItemLocation').value.trim();
    const desc = document.getElementById('postItemDesc').value.trim();
    const reporterName = document.getElementById('reporterName').value.trim();
    const reporterEmail = document.getElementById('reporterEmail').value.trim();
    const reporterRoll = document.getElementById('reporterRoll').value.trim();
    const reporterPhone = document.getElementById('reporterPhone').value.trim();

    // Check strict roster verification if enabled
    const settings = db.getSettings();
    if (settings.strictRosterVerification) {
      const roster = db.getRoster();
      const verified = roster.some(s => s.email.toLowerCase() === reporterEmail.toLowerCase());
      if (!verified) {
        alert(`❌ Campus Roster Verification Failed: ${reporterEmail} is not in the active semester roster. Please contact the administrator.`);
        return;
      }
    }

    const newItem = db.addItem({
      type,
      title,
      category,
      zone,
      location: `${zone} - ${location}`,
      date: new Date().toISOString().split('T')[0],
      description: desc,
      image: this.selectedImageBase64 || null,
      reportedBy: {
        name: reporterName,
        email: reporterEmail,
        rollNo: reporterRoll,
        phone: reporterPhone
      }
    });

    this.closeAllModals();
    this.renderStats();
    this.renderFeed();
    this.triggerConfetti();
    alert(`🎉 Successfully posted! Item ID: ${newItem.id}. Campus students have been notified.`);
  },

  // --- CONNECT & RESOLVE HANDOVER MODAL ---
  openConnectModal(itemId) {
    const item = db.getItemById(itemId);
    if (!item) return;
    this.currentModalItem = item;

    const modal = document.getElementById('connectModal');
    const titleEl = document.getElementById('connectModalItemTitle');
    const metaEl = document.getElementById('connectModalItemMeta');
    const descEl = document.getElementById('connectModalItemDesc');
    const tipsList = document.getElementById('connectModalTipsList');

    if (titleEl) titleEl.innerText = item.title;
    if (metaEl) metaEl.innerText = `Type: ${item.type.toUpperCase()} • Zone: ${item.zone} • Reported By: ${item.reportedBy?.name || 'Student'}`;
    if (descEl) descEl.innerText = item.description;

    // Render bystander tips
    if (tipsList) {
      if (item.tips && item.tips.length > 0) {
        tipsList.innerHTML = `
          <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: #38bdf8;">💡 Bystander Tips on this Item:</h4>
          ${item.tips.map(t => `
            <div style="background: rgba(0,0,0,0.3); padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.4rem; font-size: 0.82rem;">
              <strong>${t.author}:</strong> ${t.message} <span style="color: #64748b; font-size: 0.75rem; float: right;">${t.timestamp}</span>
            </div>
          `).join('')}
        `;
      } else {
        tipsList.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted);">No bystander tips reported yet.</p>`;
      }
    }

    // Render in-app private verification messages
    this.renderPrivateMessages(item.id);

    // Reset Handover form inputs
    const finderInput = document.getElementById('handoverFinderName');
    const finderRoll = document.getElementById('handoverFinderRoll');
    const ownerInput = document.getElementById('handoverOwnerName');
    const ownerRoll = document.getElementById('handoverOwnerRoll');

    if (item.type === 'lost') {
      if (ownerInput) ownerInput.value = item.reportedBy?.name || '';
      if (ownerRoll) ownerRoll.value = item.reportedBy?.rollNo || '';
    } else {
      if (finderInput) finderInput.value = item.reportedBy?.name || '';
      if (finderRoll) finderRoll.value = item.reportedBy?.rollNo || '';
    }

    if (modal) modal.classList.add('active');
  },

  // Handover Execution & Automatic Canvas Certificate Generation
  async executeHandover() {
    if (!this.currentModalItem) return;

    const finderName = document.getElementById('handoverFinderName')?.value.trim();
    const finderRoll = document.getElementById('handoverFinderRoll')?.value.trim();
    const ownerName = document.getElementById('handoverOwnerName')?.value.trim();
    const ownerRoll = document.getElementById('handoverOwnerRoll')?.value.trim();

    if (!finderName || !ownerName) {
      alert('⚠️ Please fill in both Finder and Owner names to authenticate the Handover Certificate.');
      return;
    }

    // 1. Resolve in Database (+100 Karma points to finder)
    const result = db.resolveHandover(this.currentModalItem.id, {
      finderName,
      finderRoll,
      ownerName,
      ownerRoll,
      location: this.currentModalItem.location
    });

    if (!result) return;

    // 2. Generate Canvas Certificate on the fly (Zero server storage!)
    const certDataUrl = await certGenerator.generateCertificate({
      certId: result.certId,
      itemTitle: this.currentModalItem.title,
      itemCategory: this.currentModalItem.category,
      itemZone: this.currentModalItem.zone,
      finderName,
      finderRoll,
      ownerName,
      ownerRoll,
      handoverDate: new Date().toISOString().split('T')[0]
    });

    this.closeAllModals();
    this.renderStats();
    this.renderFeed();
    this.renderLeaderboard();
    this.triggerConfetti();

    // 3. Open Handover Certificate Modal & Auto-Trigger PNG Download
    this.showCertificateDownloadModal(certDataUrl, result.certId, finderName);
  },

  showCertificateDownloadModal(certDataUrl, certId, studentName) {
    const modal = document.getElementById('certificateModal');
    const imgEl = document.getElementById('certPreviewImg');
    const certIdEl = document.getElementById('certModalSerial');

    if (imgEl) imgEl.src = certDataUrl;
    if (certIdEl) certIdEl.innerText = `Official Serial ID: ${certId}`;

    // Store data for social share bonus
    modal.dataset.certId = certId;
    modal.dataset.studentName = studentName;

    // Auto-trigger PNG download for user convenience
    certGenerator.downloadAsPNG(`Yenepoya_Handover_${certId}.png`);

    if (modal) modal.classList.add('active');
  },

  async viewHandoverCertificate(itemId) {
    const item = db.getItemById(itemId);
    if (!item || !item.handoverDetails) return;

    const certDataUrl = await certGenerator.generateCertificate({
      certId: item.handoverDetails.certificateId || 'CERT-YEN-0000',
      itemTitle: item.title,
      itemCategory: item.category,
      itemZone: item.zone,
      finderName: item.handoverDetails.finderName,
      finderRoll: item.handoverDetails.finderRoll,
      ownerName: item.handoverDetails.ownerName,
      ownerRoll: item.handoverDetails.ownerRoll,
      handoverDate: item.handoverDetails.handoverDate
    });

    this.showCertificateDownloadModal(certDataUrl, item.handoverDetails.certificateId, item.handoverDetails.finderName);
  },

  // Social Share Bonus Claim (+50 Karma Points)
  claimSocialBonus() {
    const modal = document.getElementById('certificateModal');
    const certId = modal.dataset.certId;
    const studentName = modal.dataset.studentName;

    const res = db.claimSocialShareBonus(studentName, certId);
    alert(res.message);

    if (res.success) {
      this.triggerConfetti();
      this.renderLeaderboard();
    }
  },

  // --- BYSTANDER TIP MODAL (Person 3) ---
  openTipModal(itemId) {
    const item = db.getItemById(itemId);
    if (!item) return;
    this.currentModalItem = item;

    const modal = document.getElementById('tipModal');
    const titleEl = document.getElementById('tipModalItemTitle');
    if (titleEl) titleEl.innerText = `Leave a tip for: "${item.title}"`;
    document.getElementById('tipMessageInput').value = '';
    if (modal) modal.classList.add('active');
  },

  submitBystanderTip() {
    if (!this.currentModalItem) return;
    const author = document.getElementById('tipAuthorName')?.value.trim() || 'Anonymous Student';
    const message = document.getElementById('tipMessageInput')?.value.trim();

    if (!message) {
      alert('Please enter your tip message.');
      return;
    }

    db.addTip(this.currentModalItem.id, author, message);
    this.closeAllModals();
    this.renderFeed();
    alert('💡 Thank you! Your tip has been posted to help the owner find their item.');
  },

  // --- LEADERBOARD RENDERING ---
  renderLeaderboard() {
    const list = db.getLeaderboard();
    const podiumEl = document.getElementById('leaderboardPodium');
    const tbodyEl = document.getElementById('leaderboardTableBody');

    if (!tbodyEl) return;

    // Podium (Top 3)
    if (podiumEl && list.length >= 3) {
      const first = list[0];
      const second = list[1];
      const third = list[2];

      podiumEl.innerHTML = `
        <!-- Rank 2 -->
        <div class="podium-card rank-2">
          <div class="podium-avatar">${second.avatar || '2'}</div>
          <div class="podium-name">${second.name}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">${second.badge}</div>
          <div class="podium-karma">${second.karma} pts</div>
          <span style="font-size: 0.75rem; color: #64748b;">${second.returnsCount} returns</span>
        </div>

        <!-- Rank 1 (Gold) -->
        <div class="podium-card rank-1">
          <div class="podium-crown">👑</div>
          <div class="podium-avatar">${first.avatar || '1'}</div>
          <div class="podium-name">${first.name}</div>
          <div style="font-size: 0.85rem; color: #fbbf24; font-weight: 700;">${first.badge}</div>
          <div class="podium-karma">${first.karma} pts</div>
          <span style="font-size: 0.75rem; color: #cbd5e1;">${first.returnsCount} items rescued</span>
        </div>

        <!-- Rank 3 -->
        <div class="podium-card rank-3">
          <div class="podium-avatar">${third.avatar || '3'}</div>
          <div class="podium-name">${third.name}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">${third.badge}</div>
          <div class="podium-karma">${third.karma} pts</div>
          <span style="font-size: 0.75rem; color: #64748b;">${third.returnsCount} returns</span>
        </div>
      `;
    }

    // Table rows
    tbodyEl.innerHTML = list.map((s, idx) => `
      <tr>
        <td style="font-weight: 800; color: ${idx === 0 ? '#fbbf24' : (idx === 1 ? '#cbd5e1' : (idx === 2 ? '#cd7f32' : '#94a3b8'))};">
          #${idx + 1}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="user-avatar-small">${s.avatar || 'ST'}</div>
            <div>
              <div style="font-weight: 600;">${s.name}</div>
              <div style="font-size: 0.75rem; color: #64748b;">${s.rollNo}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-category" style="position: static; font-size: 0.72rem;">${s.badge}</span>
        </td>
        <td style="font-weight: 600; color: #94a3b8;">${s.returnsCount || 0}</td>
        <td style="font-family: var(--font-heading); font-weight: 800; color: #34d399; font-size: 1.05rem;">
          ${s.karma}
        </td>
      </tr>
    `).join('');
  },

  // --- NOTICE BOARD ---
  renderNotices() {
    const container = document.getElementById('noticesFeedGrid');
    if (!container) return;
    const notices = db.getNotices();

    if (notices.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">📌</div>
          <h3>No Campus Announcements</h3>
          <p style="color: var(--text-muted);">The security desk has not posted any notices yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="notice-card">
        <div class="notice-header-row">
          <span class="notice-badge">${n.badge}</span>
          <span style="font-size: 0.78rem; color: #64748b;">📅 ${n.date}</span>
        </div>
        <h3 class="notice-title">${n.title}</h3>
        <p class="notice-body">${n.content}</p>
        <div style="margin-top: 0.75rem; font-size: 0.78rem; color: #94a3b8; font-weight: 600;">
          ✍️ Issued by: ${n.author}
        </div>
      </div>
    `).join('');
  },

  handlePostNotice(e) {
    e.preventDefault();
    const title = document.getElementById('noticeTitleInput').value.trim();
    const badge = document.getElementById('noticeBadgeInput').value;
    const author = document.getElementById('noticeAuthorInput').value.trim();
    const content = document.getElementById('noticeContentInput').value.trim();

    db.addNotice({ title, badge, author, content });
    document.getElementById('postNoticeForm').reset();
    this.renderNotices();
    alert('📢 Official Campus Notice published successfully!');
  },

  // --- ADMIN PORTAL & SECURITY VAULT ---
  checkAdminViewAccess() {
    const authBox = document.getElementById('adminAuthScreen');
    const dashboard = document.getElementById('adminDashboardScreen');

    if (this.isAdminLoggedIn) {
      if (authBox) authBox.style.display = 'none';
      if (dashboard) dashboard.style.display = 'block';
      this.renderRosterPreview();
      this.updateAdminSettingsUI();
    } else {
      if (authBox) authBox.style.display = 'block';
      if (dashboard) dashboard.style.display = 'none';
    }
  },

  handleAdminLogin(e) {
    e.preventDefault();
    const pin = document.getElementById('adminPinInput').value;
    if (db.verifyAdminPin(pin)) {
      this.isAdminLoggedIn = true;
      document.getElementById('adminPinInput').value = '';
      this.checkAdminViewAccess();
    } else {
      alert('❌ Invalid Administrator PIN. (Default Hackathon PIN: 1234)');
    }
  },

  logoutAdmin() {
    this.isAdminLoggedIn = false;
    this.checkAdminViewAccess();
  },

  updateAdminSettingsUI() {
    const settings = db.getSettings();
    const toggleRoster = document.getElementById('toggleStrictRoster');
    if (toggleRoster) {
      toggleRoster.checked = settings.strictRosterVerification;
    }
  },

  toggleStrictRosterMode() {
    const toggle = document.getElementById('toggleStrictRoster');
    if (!toggle) return;
    db.updateSettings({ strictRosterVerification: toggle.checked });
    alert(`⚙️ Campus Mode Updated: ${toggle.checked ? 'STRICT ROSTER VERIFICATION (Students must match CSV)' : 'OPEN CAMPUS MODE (Easy Guest Access)'}`);
  },

  handleRosterCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const result = db.importRosterCSV(csvText);
      if (result.success) {
        alert(`✅ Roster Updated: Imported ${result.count} student records into the database.`);
        this.renderRosterPreview();
      } else {
        alert(`❌ CSV Import Error: ${result.error}`);
      }
    };
    reader.readAsText(file);
  },

  renderRosterPreview() {
    const tbody = document.getElementById('rosterTablePreviewBody');
    if (!tbody) return;
    const roster = db.getRoster();
    document.getElementById('rosterCountBadge').innerText = `${roster.length} Students`;

    tbody.innerHTML = roster.slice(0, 10).map((s, i) => `
      <tr>
        <td style="color: #64748b;">${i + 1}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.email}</td>
        <td><span class="badge-category" style="position: static;">${s.rollNo}</span></td>
        <td>${s.department}</td>
      </tr>
    `).join('');
  },

  // Export full semester backup
  exportSemesterCSV() {
    const csvData = db.exportSemesterDataCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YenFind_Semester_Archive_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('📥 Semester Data Backup downloaded successfully as CSV.');
  },

  // Semester Wipe / Reset
  confirmSemesterReset() {
    const confirmed = confirm('⚠️ DANGER ZONE: Are you sure you want to perform a Semester Reset?\n\nThis will clear all current lost/found listings, claim messages, and reset the Karma Leaderboard. Make sure you have downloaded the CSV Backup first!');
    if (confirmed) {
      db.resetSemesterData();
      this.renderStats();
      this.renderFeed();
      this.renderLeaderboard();
      alert('🧹 Semester data successfully wiped clean for the new academic semester.');
    }
  },

  restoreDemoData() {
    db.restoreSampleData();
    this.renderStats();
    this.renderFeed();
    this.renderLeaderboard();
    this.renderNotices();
    this.renderRosterPreview();
    alert('✨ Sample campus data restored for demonstration.');
  },

  // --- STUDENT PERSONA / PROFILE SWITCHER (Demo Feature) ---
  openStudentProfileModal() {
    const modal = document.getElementById('studentProfileModal');
    const container = document.getElementById('personaListContainer');
    if (!modal || !container) return;

    const roster = db.getRoster();
    const currentUser = db.getCurrentUser() || { name: 'Sanjeev Karthikeya', email: 'sanjeev.k@yenepoya.edu.in', rollNo: 'YEN24EC012' };

    container.innerHTML = roster.slice(0, 5).map(s => `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid ${s.email === currentUser.email ? 'var(--primary)' : 'var(--border-glass)'}; padding: 0.65rem 0.95rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="App.setStudentPersona('${s.email}')">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div class="user-avatar-small">${s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">${s.name} ${s.email === currentUser.email ? '✨ (Active)' : ''}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">${s.email} • ${s.rollNo}</div>
          </div>
        </div>
        <button class="btn-card-action secondary-tip" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">Switch</button>
      </div>
    `).join('');

    modal.classList.add('active');
  },

  setStudentPersona(email) {
    const roster = db.getRoster();
    const student = roster.find(s => s.email === email);
    if (student) {
      db.validateStudentLogin(student.email, student.name, student.rollNo);
      this.updateNavbarUserPill();
      this.closeAllModals();
      this.playChime();
    }
  },

  updateNavbarUserPill() {
    const user = db.getCurrentUser() || { name: 'Sanjeev Karthikeya', email: 'sanjeev.k@yenepoya.edu.in', rollNo: 'YEN24EC012' };
    const pill = document.querySelector('.user-badge-pill');
    if (pill) {
      const initials = user.name.split(' ').map(n=>n[0]).join('').slice(0,2);
      pill.innerHTML = `
        <div class="user-avatar-small">${initials}</div>
        <span style="font-weight: 600;">${user.name.split(' ')[0]}</span>
      `;
      pill.onclick = () => App.openStudentProfileModal();
    }

    // Auto-fill post form credentials
    const repName = document.getElementById('reporterName');
    const repEmail = document.getElementById('reporterEmail');
    const repRoll = document.getElementById('reporterRoll');
    if (repName) repName.value = user.name;
    if (repEmail) repEmail.value = user.email;
    if (repRoll) repRoll.value = user.rollNo;
  },

  // --- IN-APP PRIVATE MESSAGING ---
  sendPrivateInquiryMessage() {
    if (!this.currentModalItem) return;
    const input = document.getElementById('privateMsgInput');
    const msg = input.value.trim();
    if (!msg) return;

    const user = db.getCurrentUser() || { name: 'Sanjeev Karthikeya', email: 'sanjeev.k@yenepoya.edu.in' };
    db.sendMessage(this.currentModalItem.id, user.name, user.email, msg);
    input.value = '';
    this.renderPrivateMessages(this.currentModalItem.id);
  },

  renderPrivateMessages(itemId) {
    const container = document.getElementById('connectModalMessagesList');
    if (!container) return;
    const messages = db.getMessages(itemId);

    if (messages.length === 0) {
      container.innerHTML = `<div style="font-size: 0.78rem; color: #64748b; font-style: italic;">No private verification messages yet. Ask finder/owner a question below!</div>`;
      return;
    }

    container.innerHTML = messages.map(m => `
      <div style="background: rgba(15, 23, 42, 0.7); padding: 0.4rem 0.6rem; border-radius: 6px; border-left: 2px solid #38bdf8; font-size: 0.8rem;">
        <span style="font-weight: 700; color: #38bdf8;">${m.senderName}:</span> ${m.message}
        <span style="float: right; font-size: 0.7rem; color: #64748b;">${m.timestamp}</span>
      </div>
    `).join('');
  },

  // --- ITEM DETAIL INSPECTOR MODAL ---
  openItemDetail(itemId) {
    const item = db.getItemById(itemId);
    if (!item) return;

    const modal = document.getElementById('itemDetailModal');
    const titleEl = document.getElementById('itemDetailTitle');
    const contentEl = document.getElementById('itemDetailContent');

    if (titleEl) titleEl.innerText = item.title;
    if (contentEl) {
      const defaultImg = item.type === 'lost' 
        ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80';

      contentEl.innerHTML = `
        <div style="width: 100%; height: 260px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.25rem; background: #000;">
          <img src="${item.image || defaultImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.title}" />
        </div>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <span class="badge-tag-type ${item.type}">${item.type.toUpperCase()}</span>
          <span class="badge-category" style="position: static;">${item.category}</span>
          <span class="badge-category" style="position: static;">📍 ${item.zone}</span>
        </div>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 1.25rem; line-height: 1.6;">
          ${item.description}
        </p>
        <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1.25rem;">
          <div><strong>Exact Location:</strong> ${item.location}</div>
          <div><strong>Reported By:</strong> ${item.reportedBy?.name || 'Student'} (${item.reportedBy?.rollNo || 'Yenepoya'})</div>
          <div><strong>Date:</strong> ${item.date}</div>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn-card-action primary-claim" onclick="App.closeAllModals(); App.openConnectModal('${item.id}')">
            🤝 Connect & Claim Handover
          </button>
          <button class="btn-card-action secondary-tip" onclick="App.closeAllModals(); App.openTipModal('${item.id}')">
            💡 Leave Tip
          </button>
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  },

  // --- SOUND EFFECTS (Web Audio API Synth) ---
  playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio not supported or blocked, ignore gracefully
    }
  },

  // --- MODAL UTILITIES ---
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    this.currentModalItem = null;
  },

  // --- CELEBRATION CONFETTI CANNON ---
  triggerConfetti() {
    this.playChime();
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#10b981', '#34d399', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }
};

