export type ItemType = 'lost' | 'found';

export type AppTab = 'feed' | 'desk' | 'leaderboard' | 'how_it_works' | 'admin_guide' | 'admin_panel' | 'admin';

export type ItemCategory =
  | 'Electronics & Gadgets'
  | 'ID Cards & Documents'
  | 'Keys & Access Cards'
  | 'Bags & Luggage'
  | 'Books & Stationery'
  | 'Clothing & Accessories'
  | 'Wallets & Money'
  | 'Bottles & Containers'
  | 'Medical & Lab Equipment'
  | 'Sports Equipment'
  | 'Other Items';

export type CampusLocation =
  | 'YU Central Library'
  | 'Yenepoya Medical College & Hospital'
  | 'Yenepoya Dental College'
  | 'YIT Campus (Engineering)'
  | 'Indoor Sports Complex & Gym'
  | 'Food Court & Cafeteria'
  | 'Pharmacy & Allied Sciences Lab'
  | 'Central Bus Bay & Transport'
  | 'Girls Hostel Complex'
  | 'Boys Hostel Complex'
  | 'Administrative Block'
  | 'YU Auditorium & Greens'
  | 'Other Campus Location';

export type ItemStatus = 'open' | 'matched' | 'resolved';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  rollNumber?: string;
  avatarColor?: string;
  points: number;
  returnsCompleted: number;
  socialShares: number;
}

export interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  location: CampusLocation;
  locationDetails?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description: string;
  secretHint?: string; // e.g., "Ask me what sticker is on the back"
  imageUrl?: string;
  status: ItemStatus;
  postedBy: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
  };
  matchedWith?: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    matchedAt: string;
  };
  handoverLocation?: 'with_student' | 'physical_desk';
  resolvedAt?: string;
  autoDeleteAt?: string; // 7 days after resolvedAt
  acknowledgmentCardId?: string;
  viewsCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface MatchThread {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  ownerId: string;
  claimantId: string;
  ownerName: string;
  claimantName: string;
  ownerEmail: string;
  claimantEmail: string;
  ownerPhone: string;
  claimantPhone: string;
  ownerDepartment: string;
  claimantDepartment: string;
  ownerConfirmed: boolean;
  claimantConfirmed: boolean;
  status: 'discussing' | 'mutually_confirmed' | 'resolved';
  messages: ChatMessage[];
  socialLinkProvided?: string;
  socialBonusAwarded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeskNoticeItem {
  id: string;
  title: string;
  category: ItemCategory;
  foundLocation: CampusLocation;
  dateReceived: string;
  storageRefNumber: string; // e.g. "DESK-BOX-14"
  description: string;
  imageUrl?: string;
  heldAt: 'Security Main Gate' | 'Dean Student Affairs Desk' | 'Library Reception' | 'YIT Helpdesk';
  claimed: boolean;
  claimedBy?: string;
  claimedDate?: string;
}

export interface StudentRosterEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  department: string;
  status: 'active' | 'suspended';
}

export interface AdminSettings {
  loginMode: 'roster_verified' | 'open_access';
  currentSemester: string;
  academicYear: string;
  adminEmail: string;
  autoDeleteDays: number;
  lastResetDate?: string;
}

export interface AdminMessage {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  message: string;
  relatedItemId?: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  adminReply?: string;
}

export interface AcknowledgmentCardData {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory: string;
  giverName: string;
  giverDepartment: string;
  giverPhone: string;
  receiverName: string;
  receiverDepartment: string;
  receiverPhone: string;
  handoverDate: string;
  handoverLocation: string;
  socialBonusEarned: boolean;
  verificationHash: string;
}
