import { StudentRosterEntry, LostFoundItem, DeskNoticeItem, MatchThread } from '../types';

export function parseRosterCSV(csvText: string): StudentRosterEntry[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const nameIdx = headers.findIndex((h) => h.includes('name'));
  const emailIdx = headers.findIndex((h) => h.includes('email'));
  const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
  const rollIdx = headers.findIndex((h) => h.includes('roll') || h.includes('reg') || h.includes('id'));
  const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('department') || h.includes('course'));

  const entries: StudentRosterEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((val) => val.trim().replace(/^["']|["']$/g, ''));
    if (row.length < 2) continue;

    const email = (emailIdx !== -1 ? row[emailIdx] : row[1] || '').toLowerCase().trim();
    if (!email || !email.includes('@')) continue;

    entries.push({
      id: `roster-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      name: nameIdx !== -1 ? row[nameIdx] : row[0] || 'Yenepoya Student',
      email,
      phone: phoneIdx !== -1 ? row[phoneIdx] : row[2] || '9845012345',
      rollNumber: rollIdx !== -1 ? row[rollIdx] : `YU2026-${1000 + i}`,
      department: deptIdx !== -1 ? row[deptIdx] : 'Yenepoya Campus',
      status: 'active',
    });
  }

  return entries;
}

export function generateSampleRosterCSV(): string {
  return `Name,College Email,Phone Number,Roll Number,Department
Ayesha Zoya,ayesha.zoya@yenepoya.edu.in,+91 98451 23456,YU24MED042,Yenepoya Medical College
Rahul Shenoy,rahul.shenoy@yenepoya.edu.in,+91 98765 43210,YU23ENG108,YIT Engineering (CSE)
Dr. Vikram Pai,vikram.pai@yenepoya.edu.in,+91 94481 99887,YU22DEN015,Yenepoya Dental College
Sneha Hegde,sneha.hegde@yenepoya.edu.in,+91 97412 88776,YU24PHM033,Yenepoya Pharmacy College
Mohammed Farhan,farhan.m@yenepoya.edu.in,+91 99001 55443,YU23AHS077,Allied Health Sciences
Ananya Rao,ananya.rao@yenepoya.edu.in,+91 98860 11223,YU24NUR019,Yenepoya Nursing College
Karthik Acharya,karthik.a@yenepoya.edu.in,+91 94800 66778,YU23ENG145,YIT Engineering (ECE)
Pooja Shetty,pooja.s@yenepoya.edu.in,+91 96112 33445,YU24PT021,Physiotherapy Department`;
}

export function exportFullSystemCSVBackup(
  items: LostFoundItem[],
  deskItems: DeskNoticeItem[],
  threads: MatchThread[],
  roster: StudentRosterEntry[]
): { filename: string; content: string } {
  let csv = '=== YENFIND DATABASE EXPORT & SEMESTER ARCHIVE ===\n';
  csv += `Export Date: ${new Date().toISOString()}\n`;
  csv += `Institution: Yenepoya (Deemed to be University)\n\n`;

  csv += '--- SECTION 1: LOST AND FOUND POSTINGS ---\n';
  csv += 'Item ID,Type,Title,Category,Campus Location,Date,Status,Posted By Name,Posted By Email,Matched With,Resolved At,Card ID\n';
  items.forEach((item) => {
    csv += `"${item.id}","${item.type}","${item.title.replace(/"/g, '""')}","${item.category}","${item.location}","${item.date}","${item.status}","${item.postedBy.name}","${item.postedBy.email}","${item.matchedWith?.name || 'None'}","${item.resolvedAt || 'N/A'}","${item.acknowledgmentCardId || 'N/A'}"\n`;
  });

  csv += '\n--- SECTION 2: PHYSICAL DESK NOTICE BOARD ITEMS ---\n';
  csv += 'Desk ID,Storage Ref,Title,Category,Found Location,Date Received,Held At,Claimed Status,Claimed By\n';
  deskItems.forEach((desk) => {
    csv += `"${desk.id}","${desk.storageRefNumber}","${desk.title.replace(/"/g, '""')}","${desk.category}","${desk.foundLocation}","${desk.dateReceived}","${desk.heldAt}","${desk.claimed ? 'YES' : 'NO'}","${desk.claimedBy || 'N/A'}"\n`;
  });

  csv += '\n--- SECTION 3: RESOLVED CASES AND HANDOVER AUDIT ---\n';
  csv += 'Thread ID,Item Title,Owner Name,Owner Email,Claimant Name,Claimant Email,Status,Social Bonus Awarded,Created Date\n';
  threads.forEach((th) => {
    csv += `"${th.id}","${th.itemTitle.replace(/"/g, '""')}","${th.ownerName}","${th.ownerEmail}","${th.claimantName}","${th.claimantEmail}","${th.status}","${th.socialBonusAwarded ? 'YES' : 'NO'}","${th.createdAt}"\n`;
  });

  csv += '\n--- SECTION 4: STUDENT ROSTER DIRECTORY ---\n';
  csv += 'Roster ID,Name,Email,Phone,Roll Number,Department,Status\n';
  roster.forEach((r) => {
    csv += `"${r.id}","${r.name}","${r.email}","${r.phone}","${r.rollNumber}","${r.department}","${r.status}"\n`;
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `YenFind_Full_Backup_${timestamp}.csv`;
  return { filename, content: csv };
}

export function triggerDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
