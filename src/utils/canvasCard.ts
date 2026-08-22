import { AcknowledgmentCardData } from '../types';

/**
 * Generates an official Yenepoya University Acknowledgment Card as a downloadable PNG image.
 * Uses HTML5 Canvas on-the-fly without storing any image blobs in the database.
 */
export function generateAcknowledgmentCard(data: AcknowledgmentCardData): Promise<{ dataUrl: string; filename: string }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve({ dataUrl: '', filename: 'acknowledgment.png' });
      return;
    }

    // Background - Elegant Ivory Parchment with refined double border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#FAFAFA');
    bgGrad.addColorStop(0.5, '#F4F7F6');
    bgGrad.addColorStop(1, '#EDF2F7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Decorative University Maroon / Crimson Border
    ctx.strokeStyle = '#8B0000'; // Yenepoya Crimson
    ctx.lineWidth = 10;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Thin Inner Gold Accent Border
    ctx.strokeStyle = '#D97706'; // Amber Gold
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(25, 0);
      ctx.lineTo(0, 25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawCorner(45, 45, 0);
    drawCorner(canvas.width - 45, 45, 90);
    drawCorner(canvas.width - 45, canvas.height - 45, 180);
    drawCorner(45, canvas.height - 45, 270);

    // Top University Header
    ctx.textAlign = 'center';

    // University Logo Badge Emblem
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 95, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px serif';
    ctx.fillText('YU', canvas.width / 2, 103);

    // University Text
    ctx.fillStyle = '#1A202C';
    ctx.font = 'bold 30px "Plus Jakarta Sans", -apple-system, sans-serif';
    ctx.fillText('YENEPOYA (DEEMED TO BE UNIVERSITY)', canvas.width / 2, 160);

    ctx.fillStyle = '#4A5568';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('CAMPUS LOST & FOUND NETWORK • YENFIND OFFICIAL ACKNOWLEDGMENT', canvas.width / 2, 185);

    // Certificate Number & Tag
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`VERIFICATION ID: ${data.id}  •  AUTHENTICATED RECOVERY`, canvas.width / 2, 215);

    // Divider Line with Gold Diamond
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, 230);
    ctx.lineTo(canvas.width - 120, 230);
    ctx.stroke();

    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 222);
    ctx.lineTo(canvas.width / 2 + 10, 230);
    ctx.lineTo(canvas.width / 2, 238);
    ctx.lineTo(canvas.width / 2 - 10, 230);
    ctx.closePath();
    ctx.fill();

    // Item Highlight Box
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, 255, canvas.width - 160, 115);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 255, canvas.width - 160, 115);

    // Left Colored bar for Item box
    ctx.fillStyle = '#059669'; // Emerald
    ctx.fillRect(80, 255, 8, 115);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '600 14px sans-serif';
    ctx.fillText('RETURNED ITEM DESCRIPTION', 110, 282);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(data.itemTitle, 110, 315);

    ctx.fillStyle = '#475569';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(`Category: ${data.itemCategory}    |    Location: ${data.handoverLocation}`, 110, 345);

    // Date tag on right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`DATE: ${data.handoverDate}`, canvas.width - 110, 285);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('STATUS: SUCCESSFULLY REUNITED', canvas.width - 110, 315);

    // Two Columns for Giver and Receiver
    const colWidth = (canvas.width - 190) / 2;

    // Giver Box
    const drawPartyBox = (x: number, y: number, role: string, name: string, dept: string, phone: string, isFinder: boolean) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, colWidth, 195);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, colWidth, 195);

      // Top Accent banner
      ctx.fillStyle = isFinder ? '#1E3A8A' : '#8B0000';
      ctx.fillRect(x, y, colWidth, 34);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(role.toUpperCase(), x + 15, y + 22);

      // Names & Info
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(name, x + 15, y + 72);

      ctx.fillStyle = '#475569';
      ctx.font = '500 15px sans-serif';
      ctx.fillText(`Department: ${dept || 'Yenepoya Campus'}`, x + 15, y + 102);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 14px sans-serif';
      ctx.fillText(`Verified Phone: ${phone || 'Confidential'}`, x + 15, y + 130);

      // Signature line
      ctx.strokeStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 175);
      ctx.lineTo(x + colWidth - 20, y + 175);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText('Digital Handover Signature Verified', x + 15, y + 168);
    };

    drawPartyBox(80, 395, 'Handed Over By (Finder / Custodian)', data.giverName, data.giverDepartment, data.giverPhone, true);
    drawPartyBox(80 + colWidth + 30, 395, 'Received By (Verified Owner)', data.receiverName, data.receiverDepartment, data.receiverPhone, false);

    // Official Stamp / Security Seal on bottom center
    ctx.save();
    ctx.translate(canvas.width / 2, 645);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#059669';
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★ YENFIND ★', 0, -20);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('CAMPUS VERIFIED', 0, 2);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('YENEPOYA UNIV', 0, 20);
    ctx.restore();

    // Footer notice
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(
      'This document serves as proof of safe property return under Yenepoya University Campus Integrity Guidelines.',
      canvas.width / 2,
      720
    );

    const dataUrl = canvas.toDataURL('image/png');
    const cleanItemName = data.itemTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `YenFind_Acknowledgment_${cleanItemName}_${data.id}.png`;

    resolve({ dataUrl, filename });
  });
}
