import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LostFoundItem,
  UserProfile,
  DeskNoticeItem,
  StudentRosterEntry,
  AdminSettings,
  AdminMessage,
  MatchThread,
  AcknowledgmentCardData,
  AppTab,
  ItemCategory,
  CampusLocation,
  ItemType,
} from '../types';
import {
  INITIAL_STUDENT_ROSTER,
  DEMO_USERS,
  INITIAL_ITEMS,
  INITIAL_DESK_ITEMS,
  INITIAL_MATCH_THREADS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_ADMIN_MESSAGES,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  items: LostFoundItem[];
  deskItems: DeskNoticeItem[];
  threads: MatchThread[];
  roster: StudentRosterEntry[];
  adminSettings: AdminSettings;
  adminMessages: AdminMessage[];
  resolvedArchive: AcknowledgmentCardData[];
  isAdmin: boolean;
  toasts: ToastMessage[];

  // Navigation & Global Filters
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedItemType: ItemType | 'all';
  setSelectedItemType: (type: ItemType | 'all') => void;
  selectedCategory: ItemCategory | null;
  setSelectedCategory: (category: ItemCategory | null) => void;
  selectedLocation: CampusLocation | null;
  setSelectedLocation: (location: CampusLocation | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Student Auth
  loginStudent: (payload: { email: string; name: string; phone: string; department?: string; rollNumber?: string }) => {
    success: boolean;
    error?: string;
  };
  switchDemoUser: (userId: string) => void;
  logoutStudent: () => void;

  // Admin Auth
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Items
  postItem: (
    item: Omit<
      LostFoundItem,
      'id' | 'status' | 'postedBy' | 'viewsCount' | 'createdAt'
    >
  ) => LostFoundItem;
  updateItem: (id: string, updates: Partial<LostFoundItem>) => void;
  deleteItem: (id: string) => void;
  incrementItemViews: (id: string) => void;

  // Match & Messaging
  startOrGetMatchThread: (itemId: string) => MatchThread;
  startMatchingThread: (item: LostFoundItem) => MatchThread;
  sendMessage: (threadId: string, text: string) => void;
  confirmMatchSide: (threadId: string, isOwnerSide: boolean) => void;
  submitSocialBonusLink: (threadId: string, link: string) => { success: boolean; message: string };
  resolveCase: (
    threadId: string,
    cardData: AcknowledgmentCardData
  ) => void;

  // Desk Notices
  addDeskItem: (
    item: Omit<DeskNoticeItem, 'id' | 'claimed' | 'claimedBy' | 'claimedDate'>
  ) => void;
  claimDeskItem: (id: string, studentName: string) => void;
  deleteDeskItem: (id: string) => void;

  // Admin Controls
  updateAdminSettings: (updates: Partial<AdminSettings>) => void;
  uploadRosterCSV: (newEntries: StudentRosterEntry[]) => void;
  addRosterEntry: (entry: Omit<StudentRosterEntry, 'id'>) => void;
  updateRosterEntry: (id: string, updates: Partial<StudentRosterEntry>) => void;
  deleteRosterEntry: (id: string) => void;
  sendContactAdminMessage: (
    payload: Omit<AdminMessage, 'id' | 'timestamp' | 'status' | 'adminReply'>
  ) => void;
  replyAdminMessage: (id: string, reply: string) => void;
  resetSemesterData: () => void;

  // Toast
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'yenfind_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage with fallbacks
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}currentUser`);
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Default to Ayesha for instant hackathon showcase
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [items, setItems] = useState<LostFoundItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}items`);
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [deskItems, setDeskItems] = useState<DeskNoticeItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}deskItems`);
    return saved ? JSON.parse(saved) : INITIAL_DESK_ITEMS;
  });

  const [threads, setThreads] = useState<MatchThread[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}threads`);
    return saved ? JSON.parse(saved) : INITIAL_MATCH_THREADS;
  });

  const [roster, setRoster] = useState<StudentRosterEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}roster`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_ROSTER;
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}adminSettings`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_SETTINGS;
  });

  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}adminMessages`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_MESSAGES;
  });

  const [resolvedArchive, setResolvedArchive] = useState<AcknowledgmentCardData[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}resolvedArchive`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}isAdmin`);
    return saved === 'true';
  });

  // Navigation & Global Filters State
  const [activeTab, setActiveTab] = useState<AppTab>('feed');
  const [selectedItemType, setSelectedItemType] = useState<ItemType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}deskItems`, JSON.stringify(deskItems));
  }, [deskItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}threads`, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}roster`, JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}adminSettings`, JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}adminMessages`, JSON.stringify(adminMessages));
  }, [adminMessages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}resolvedArchive`, JSON.stringify(resolvedArchive));
  }, [resolvedArchive]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}isAdmin`, String(isAdmin));
  }, [isAdmin]);

  // Clean 7-day old resolved items automatically
  useEffect(() => {
    const now = new Date().getTime();
    setItems((prevItems) => {
      return prevItems.filter((item) => {
        if (item.status === 'resolved' && item.autoDeleteAt) {
          const deleteTime = new Date(item.autoDeleteAt).getTime();
          return now < deleteTime;
        }
        return true;
      });
    });
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student Login
  const loginStudent = ({
    email,
    name,
    phone,
    department,
    rollNumber,
  }: {
    email: string;
    name: string;
    phone: string;
    department?: string;
    rollNumber?: string;
  }) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if verified roster mode is active
    if (adminSettings.loginMode === 'roster_verified') {
      const matched = roster.find((r) => r.email.toLowerCase() === cleanEmail);
      if (!matched) {
        return {
          success: false,
          error: `Access Denied: "${cleanEmail}" is not found in the verified Yenepoya University student roster. Contact Admin or switch to Open Access mode in demo settings.`,
        };
      }
      if (matched.status === 'suspended') {
        return {
          success: false,
          error: 'Your student account is temporarily inactive. Please contact the Student Affairs Office.',
        };
      }

      // Existing or new User profile
      let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        user = {
          id: `usr-${Date.now()}`,
          name: matched.name || name,
          email: matched.email,
          phone: matched.phone || phone,
          department: matched.department || department || 'Yenepoya Campus',
          rollNumber: matched.rollNumber || rollNumber,
          avatarColor: '#8B0000',
          points: 50,
          returnsCompleted: 0,
          socialShares: 0,
        };
        setUsers((prev) => [...prev, user!]);
      }
      setCurrentUser(user);
      addToast('Welcome to YenFind', `Signed in as ${user.name} (${user.department})`, 'success');
      return { success: true };
    }

    // Open mode
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || '+91 98450 00000',
        department: department || 'Yenepoya Campus',
        rollNumber: rollNumber || `YU${Math.floor(1000 + Math.random() * 9000)}`,
        avatarColor: '#059669',
        points: 50,
        returnsCompleted: 0,
        socialShares: 0,
      };
      setUsers((prev) => [...prev, user!]);
    } else {
      // update phone/name if provided
      user = { ...user, name: name || user.name, phone: phone || user.phone };
      setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }
    setCurrentUser(user);
    addToast('Welcome to YenFind', `Signed in as ${user.name}`, 'success');
    return { success: true };
  };

  const switchDemoUser = (userId: string) => {
    const target = users.find((u) => u.id === userId) || DEMO_USERS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addToast('Persona Switched', `Now acting as ${target.name} (${target.department})`, 'info');
    }
  };

  const logoutStudent = () => {
    setCurrentUser(null);
    addToast('Logged Out', 'You have been signed out from YenFind', 'info');
  };

  // Admin Auth
  const loginAdmin = (password: string) => {
    const cleanPass = password.trim();
    if (
      cleanPass === 'sanjeev007' ||
      cleanPass === 'yenadmin2026' ||
      cleanPass === 'admin123' ||
      cleanPass === 'admin'
    ) {
      setIsAdmin(true);
      addToast('Admin Portal Unlocked', 'Authenticated as Campus Lost & Found Administrator (Sanjeev / Security Head)', 'success');
      return true;
    }
    addToast('Authentication Failed', 'Invalid admin security passkey. Try: sanjeev007', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    addToast('Admin Exited', 'Logged out of admin panel', 'info');
  };

  // Item Management
  const postItem = (
    itemData: Omit<
      LostFoundItem,
      'id' | 'status' | 'postedBy' | 'viewsCount' | 'createdAt'
    >
  ): LostFoundItem => {
    if (!currentUser) {
      throw new Error('Must be logged in to post an item');
    }

    const newItem: LostFoundItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      status: 'open',
      postedBy: {
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        department: currentUser.department,
      },
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);

    // Award initial Good Samaritan points if finding an unclaimed item
    if (newItem.type === 'found') {
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, points: u.points + 20 } : u))
      );
      setCurrentUser((prev) => (prev ? { ...prev, points: prev.points + 20 } : prev));
      addToast('Item Listed & +20 Points!', 'Thank you for reporting a found campus item!', 'success');
    } else {
      addToast('Item Posted', 'Your lost item notice is now broadcasted to the campus feed.', 'success');
    }

    return newItem;
  };

  const updateItem = (id: string, updates: Partial<LostFoundItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    addToast('Item Removed', 'The item notice has been deleted.', 'info');
  };

  const incrementItemViews = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, viewsCount: (item.viewsCount || 0) + 1 } : item))
    );
  };

  // Match & Messaging Threads
  const startOrGetMatchThread = (itemId: string): MatchThread => {
    if (!currentUser) {
      throw new Error('Please sign in to initiate communication');
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    // Existing thread for this item and current user
    const existing = threads.find(
      (t) =>
        t.itemId === itemId &&
        (t.claimantId === currentUser.id || t.ownerId === currentUser.id)
    );

    if (existing) {
      return existing;
    }

    // Create new thread
    // If item is 'lost', poster is owner, current user is claimant/finder
    // If item is 'found', poster is claimant/finder, current user is owner
    const isPosterOwner = item.type === 'lost';
    const owner = isPosterOwner ? item.postedBy : currentUser;
    const claimant = isPosterOwner ? currentUser : item.postedBy;

    const newThread: MatchThread = {
      id: `thread-${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      itemType: item.type,
      ownerId: owner.userId || (owner as UserProfile).id,
      claimantId: claimant.userId || (claimant as UserProfile).id,
      ownerName: owner.name,
      claimantName: claimant.name,
      ownerEmail: owner.email,
      claimantEmail: claimant.email,
      ownerPhone: owner.phone,
      claimantPhone: claimant.phone,
      ownerDepartment: owner.department,
      claimantDepartment: claimant.department,
      ownerConfirmed: false,
      claimantConfirmed: false,
      status: 'discussing',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text:
            item.type === 'lost'
              ? `Hi ${item.postedBy.name}! I believe I found your "${item.title}". Let's verify details to arrange a safe handover.`
              : `Hi ${item.postedBy.name}! I lost my "${item.title}" and believe this found item is mine. Let's verify ownership.`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setThreads((prev) => [newThread, ...prev]);
    return newThread;
  };

  const startMatchingThread = (item: LostFoundItem): MatchThread => {
    return startOrGetMatchThread(item.id);
  };

  const sendMessage = (threadId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const confirmMatchSide = (threadId: string, isOwnerSide: boolean) => {
    if (!currentUser) return;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;

        const nextOwnerConfirmed = isOwnerSide ? true : t.ownerConfirmed;
        const nextClaimantConfirmed = !isOwnerSide ? true : t.claimantConfirmed;
        const bothConfirmed = nextOwnerConfirmed && nextClaimantConfirmed;

        const systemMessage = bothConfirmed
          ? {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'YenFind Security Bot',
              text: '🎉 DUAL CONFIRMATION COMPLETE: Verified match! Direct student contact details (College Email & Phone) have been unlocked below. You can now coordinate handover location on campus.',
              timestamp: new Date().toISOString(),
              isSystem: true,
            }
          : {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'YenFind Security Bot',
              text: `${currentUser.name} has approved and confirmed this match. Awaiting reciprocal confirmation to reveal phone & email.`,
              timestamp: new Date().toISOString(),
              isSystem: true,
            };

        // Also update the item status to 'matched' if both confirmed
        if (bothConfirmed) {
          setItems((prevItems) =>
            prevItems.map((i) =>
              i.id === t.itemId
                ? {
                    ...i,
                    status: 'matched',
                    matchedWith: {
                      userId: t.claimantId === currentUser.id ? t.ownerId : t.claimantId,
                      name: t.claimantId === currentUser.id ? t.ownerName : t.claimantName,
                      email: t.claimantId === currentUser.id ? t.ownerEmail : t.claimantEmail,
                      phone: t.claimantId === currentUser.id ? t.ownerPhone : t.claimantPhone,
                      department: t.claimantId === currentUser.id ? t.ownerDepartment : t.claimantDepartment,
                      matchedAt: new Date().toISOString(),
                    },
                  }
                : i
            )
          );
        }

        return {
          ...t,
          ownerConfirmed: nextOwnerConfirmed,
          claimantConfirmed: nextClaimantConfirmed,
          status: bothConfirmed ? 'mutually_confirmed' : 'discussing',
          messages: [...t.messages, systemMessage],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addToast('Confirmation Recorded', 'Your verification approval has been saved.', 'success');
  };

  const submitSocialBonusLink = (threadId: string, link: string) => {
    if (!currentUser || !link.trim()) {
      return { success: false, message: 'Please enter a valid social media or status share link.' };
    }

    let updated = false;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId && !t.socialBonusAwarded) {
          updated = true;
          return {
            ...t,
            socialLinkProvided: link.trim(),
            socialBonusAwarded: true,
            messages: [
              ...t.messages,
              {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'YenFind Campus Social',
                text: `🌟 +1 Extra Case Point & +25 Bonus Leaderboard Pts awarded to ${currentUser.name} for sharing YenFind on social media (${link.trim()}).`,
                timestamp: new Date().toISOString(),
                isSystem: true,
              },
            ],
          };
        }
        return t;
      })
    );

    if (updated) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, points: u.points + 25, socialShares: (u.socialShares || 0) + 1 }
            : u
        )
      );
      setCurrentUser((prev) =>
        prev ? { ...prev, points: prev.points + 25, socialShares: (prev.socialShares || 0) + 1 } : prev
      );
      addToast('Bonus Point Awarded! 🌟', '+1 Extra Case Point & +25 Pts added to your semester leaderboard ranking!', 'success');
      return { success: true, message: 'Bonus points awarded!' };
    }

    return { success: false, message: 'Social bonus was already applied to this thread.' };
  };

  const resolveCase = (
    threadId: string,
    cardData: AcknowledgmentCardData
  ) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    const resolvedDate = new Date();
    const autoDeleteDate = new Date(resolvedDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    // Update thread
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              status: 'resolved',
              messages: [
                ...t.messages,
                {
                  id: `sys-resolved-${Date.now()}`,
                  senderId: 'system',
                  senderName: 'YenFind Official',
                  text: `🏆 CASE OFFICIALLY RESOLVED! Acknowledgment Card ${cardData.id} was generated & signed. Case data will auto-prune in 7 days.`,
                  timestamp: new Date().toISOString(),
                  isSystem: true,
                },
              ],
            }
          : t
      )
    );

    // Update Item
    setItems((prev) =>
      prev.map((i) =>
        i.id === thread.itemId
          ? {
              ...i,
              status: 'resolved',
              resolvedAt: resolvedDate.toISOString(),
              autoDeleteAt: autoDeleteDate.toISOString(),
              acknowledgmentCardId: cardData.id,
            }
          : i
      )
    );

    // Record in admin safety audit archive
    setResolvedArchive((prev) => [cardData, ...prev]);

    // Award +50 points to the finder/giver and update returnsCompleted count
    const giverUser = users.find(
      (u) =>
        u.name.toLowerCase() === cardData.giverName.toLowerCase() ||
        u.phone === cardData.giverPhone ||
        u.id === thread.claimantId ||
        u.id === thread.ownerId
    );

    if (giverUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === giverUser.id
            ? { ...u, points: u.points + 50, returnsCompleted: u.returnsCompleted + 1 }
            : u
        )
      );
      if (currentUser?.id === giverUser.id) {
        setCurrentUser((prev) =>
          prev ? { ...prev, points: prev.points + 50, returnsCompleted: prev.returnsCompleted + 1 } : prev
        );
      }
    }

    addToast('Case Resolved & Card Generated', `Acknowledgment #${cardData.id} created! +50 Points awarded to Good Samaritan.`, 'success');
  };

  // Desk Notices
  const addDeskItem = (item: Omit<DeskNoticeItem, 'id' | 'claimed' | 'claimedBy' | 'claimedDate'>) => {
    const newItem: DeskNoticeItem = {
      ...item,
      id: `desk-${Date.now()}`,
      claimed: false,
    };
    setDeskItems((prev) => [newItem, ...prev]);
    addToast('Desk Notice Published', `Item stored under Ref ${newItem.storageRefNumber}`, 'success');
  };

  const claimDeskItem = (id: string, studentName: string) => {
    setDeskItems((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              claimed: true,
              claimedBy: studentName,
              claimedDate: new Date().toISOString().slice(0, 10),
            }
          : d
      )
    );
    addToast('Desk Item Handed Over', `Item marked as claimed by ${studentName}`, 'success');
  };

  const deleteDeskItem = (id: string) => {
    setDeskItems((prev) => prev.filter((d) => d.id !== id));
    addToast('Desk Item Removed', 'Item record removed from desk notice board.', 'info');
  };

  // Admin Operations
  const updateAdminSettings = (updates: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...updates }));
    addToast('Admin Settings Saved', 'Configuration updated successfully.', 'success');
  };

  const uploadRosterCSV = (newEntries: StudentRosterEntry[]) => {
    setRoster(newEntries);
    addToast('Roster Updated', `Imported ${newEntries.length} verified students from CSV.`, 'success');
  };

  const addRosterEntry = (entry: Omit<StudentRosterEntry, 'id'>) => {
    const newEntry: StudentRosterEntry = {
      ...entry,
      id: `roster-${Date.now()}`,
    };
    setRoster((prev) => [newEntry, ...prev]);
    addToast('Student Added', `${entry.name} added to verified roster.`, 'success');
  };

  const updateRosterEntry = (id: string, updates: Partial<StudentRosterEntry>) => {
    setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addToast('Student Updated', 'Student roster profile modified.', 'success');
  };

  const deleteRosterEntry = (id: string) => {
    setRoster((prev) => prev.filter((r) => r.id !== id));
    addToast('Student Removed', 'Student entry removed from roster.', 'info');
  };

  const sendContactAdminMessage = (
    payload: Omit<AdminMessage, 'id' | 'timestamp' | 'status' | 'adminReply'>
  ) => {
    const newMsg: AdminMessage = {
      ...payload,
      id: `adm-msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'unread',
    };
    setAdminMessages((prev) => [newMsg, ...prev]);
    addToast('Message Sent to Admin', 'Campus Lost & Found office has received your communication.', 'success');
  };

  const replyAdminMessage = (id: string, reply: string) => {
    setAdminMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'replied', adminReply: reply } : m))
    );
    addToast('Reply Sent', 'Student grievance response dispatched.', 'success');
  };

  const resetSemesterData = () => {
    // Reset items, threads, and reset student points for new semester
    setItems([]);
    setThreads([]);
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        points: 0,
        returnsCompleted: 0,
        socialShares: 0,
      }))
    );
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, points: 0, returnsCompleted: 0, socialShares: 0 } : prev));
    }
    setAdminSettings((prev) => ({
      ...prev,
      lastResetDate: new Date().toISOString().slice(0, 10),
    }));
    addToast('Semester Reset Complete', 'All active postings & leaderboard points reset for the new academic semester.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        items,
        deskItems,
        threads,
        roster,
        adminSettings,
        adminMessages,
        resolvedArchive,
        isAdmin,
        toasts,
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
        loginStudent,
        switchDemoUser,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        postItem,
        updateItem,
        deleteItem,
        incrementItemViews,
        startOrGetMatchThread,
        startMatchingThread,
        sendMessage,
        confirmMatchSide,
        submitSocialBonusLink,
        resolveCase,
        addDeskItem,
        claimDeskItem,
        deleteDeskItem,
        updateAdminSettings,
        uploadRosterCSV,
        addRosterEntry,
        updateRosterEntry,
        deleteRosterEntry,
        sendContactAdminMessage,
        replyAdminMessage,
        resetSemesterData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
