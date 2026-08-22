// Initial Seed Data for YenFind (Yenepoya University Lost & Found)

const INITIAL_MOCK_DATA = {
  items: [
    {
      id: "YEN-2026-001",
      type: "lost", // 'lost' or 'found'
      title: "Apple AirPods Pro (2nd Gen)",
      category: "Electronics",
      location: "Central Library - 2nd Floor Reading Area",
      zone: "Central Library",
      date: "2026-08-20",
      description: "White charging case with a transparent Spigen case. Lost around 4:30 PM near the corner study desks.",
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80",
      reportedBy: {
        name: "Rahul Sharma",
        email: "rahul.cs24@yenepoya.edu.in",
        rollNo: "YEN24CS089",
        phone: "+91 98765 43210"
      },
      status: "open", // 'open', 'claimed', 'handed_over', 'at_admin'
      tips: [
        {
          id: "tip-1",
          author: "Anonymous Student",
          message: "I saw a white case near desk #14 around 5 PM yesterday.",
          timestamp: "2026-08-21 10:15 AM"
        }
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "YEN-2026-002",
      type: "found",
      title: "Yenepoya Student ID Card & Metro Pass",
      category: "Cards & IDs",
      location: "Main Food Court / Canteen",
      zone: "Campus Canteen",
      date: "2026-08-21",
      description: "Found an ID card on table 7 in the canteen. Name on ID: Ananya Roy (Biotech Dept).",
      image: "https://images.unsplash.com/photo-1578873375969-d71a6e3557e4?w=500&auto=format&fit=crop&q=80",
      reportedBy: {
        name: "Vikram Menon",
        email: "vikram.m23@yenepoya.edu.in",
        rollNo: "YEN23ME045",
        phone: "+91 91234 56789"
      },
      status: "open",
      tips: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "YEN-2026-003",
      type: "lost",
      title: "Casio FX-991CW Scientific Calculator",
      category: "Stationery & Books",
      location: "Lecture Hall Complex - Room 302",
      zone: "Lecture Hall Complex",
      date: "2026-08-19",
      description: "Black scientific calculator with initials 'SK' scratched on the back cover. Left after Engineering Mathematics lecture.",
      image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80",
      reportedBy: {
        name: "Sanjeev Karthikeya",
        email: "sanjeev.k@yenepoya.edu.in",
        rollNo: "YEN24EC012",
        phone: "+91 99887 76655"
      },
      status: "open",
      tips: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "YEN-2026-004",
      type: "found",
      title: "Dell 65W USB-C Laptop Charger",
      category: "Electronics",
      location: "Indoor Sports Arena - Bleachers",
      zone: "Sports Arena",
      date: "2026-08-21",
      description: "Found plugged in near court 2 bleachers. Black Dell charger with standard braided cable.",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80",
      reportedBy: {
        name: "Farhan Ali",
        email: "farhan.a@yenepoya.edu.in",
        rollNo: "YEN22EE033",
        phone: "+91 97766 55443"
      },
      status: "at_admin",
      tips: [
        {
          id: "tip-2",
          author: "Security Officer Joseph",
          message: "Item safely handed over to Central Security Desk Room 101.",
          timestamp: "2026-08-21 06:00 PM"
        }
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "YEN-2026-005",
      type: "lost",
      title: "Navy Blue Wildcraft Backpack",
      category: "Bags & Luggage",
      location: "Medical Sciences Block Ground Floor Lobby",
      zone: "Medical Sciences Block",
      date: "2026-08-18",
      description: "Contains Anatomy textbook and a yellow steel water bottle. Left near water fountain.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
      reportedBy: {
        name: "Priya Nair",
        email: "priya.n@yenepoya.edu.in",
        rollNo: "YEN25MB078",
        phone: "+91 94455 66778"
      },
      status: "claimed",
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      handoverDetails: {
        finderName: "Vikram Menon",
        ownerName: "Priya Nair",
        handoverDate: "2026-08-20",
        certificateId: "CERT-YEN-7890"
      },
      tips: [],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  leaderboard: [
    { rank: 1, name: "Vikram Menon", rollNo: "YEN23ME045", karma: 350, returnsCount: 3, badge: "Campus Guardian 🛡️", avatar: "VM" },
    { rank: 2, name: "Farhan Ali", rollNo: "YEN22EE033", karma: 250, returnsCount: 2, badge: "Master Rescuer 🥈", avatar: "FA" },
    { rank: 3, name: "Sanjeev Karthikeya", rollNo: "YEN24EC012", karma: 200, returnsCount: 2, badge: "Good Samaritan 🌟", avatar: "SK" },
    { rank: 4, name: "Ayesha Siddiqui", rollNo: "YEN24CS102", karma: 150, returnsCount: 1, badge: "Helper 🥉", avatar: "AS" },
    { rank: 5, name: "Rohan Varma", rollNo: "YEN23BT019", karma: 100, returnsCount: 1, badge: "Helper 🥉", avatar: "RV" }
  ],

  noticeBoard: [
    {
      id: "NOT-001",
      title: "📢 Official Notice: High-Value Items in Security Office",
      date: "2026-08-21",
      author: "Chief Security Officer, Yenepoya Campus",
      badge: "OFFICIAL SECURITY",
      content: "3 unclaimed laptops and 2 smartwatches deposited over the last 10 days are currently preserved at Central Security Office Room 101. Students must bring original ID and purchase receipt/serial number proof to claim before Friday 5:00 PM."
    },
    {
      id: "NOT-002",
      title: "🚲 Unlocked Bicycles at Parking Bay B",
      date: "2026-08-20",
      author: "Campus Transport Committee",
      badge: "CAMPUS ALERT",
      content: "A silver Hero mountain cycle and a blue Montra hybrid found unlocked near Sports Arena Parking Bay B have been tagged for safe custody."
    },
    {
      id: "NOT-003",
      title: "🎓 Convocation Gowns & Folders",
      date: "2026-08-19",
      author: "Academic Registrar",
      badge: "ACADEMIC DESK",
      content: "Found folders with certificates from the rehearsal day have been deposited with the Student Affairs Desk at Yenepoya Main Block."
    }
  ],

  studentRoster: [
    { name: "Sanjeev Karthikeya", email: "sanjeev.k@yenepoya.edu.in", rollNo: "YEN24EC012", department: "Electronics & Comm" },
    { name: "Rahul Sharma", email: "rahul.cs24@yenepoya.edu.in", rollNo: "YEN24CS089", department: "Computer Science" },
    { name: "Vikram Menon", email: "vikram.m23@yenepoya.edu.in", rollNo: "YEN23ME045", department: "Mechanical Eng" },
    { name: "Priya Nair", email: "priya.n@yenepoya.edu.in", rollNo: "YEN25MB078", department: "MBBS / Medicine" },
    { name: "Farhan Ali", email: "farhan.a@yenepoya.edu.in", rollNo: "YEN22EE033", department: "Electrical Eng" },
    { name: "Ananya Roy", email: "ananya.roy@yenepoya.edu.in", rollNo: "YEN24BT067", department: "Biotechnology" }
  ],

  adminSettings: {
    adminPin: "1234",
    strictRosterVerification: false, // Default: Easy Access (Open Campus Mode)
    autoPruneDays: 7,
    firebaseEnabled: false,
    firebaseConfig: {
      apiKey: "",
      authDomain: "yenepoya-lostfound.firebaseapp.com",
      projectId: "yenepoya-lostfound",
      storageBucket: "yenepoya-lostfound.appspot.com"
    }
  }
};
