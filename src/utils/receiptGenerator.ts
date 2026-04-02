import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SaleItem {
  book_id: string;
  subject_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const getReceiptDoc = (
  studentName: string,
  division: string,
  items: SaleItem[],
  totalAmount: number,
  staffName: string,
  phone?: string,
  schoolName?: string
) => {
  const doc = new jsPDF('p', 'mm', [148, 210]); // A5 Size Portrait
  const date = new Date().toLocaleString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Darker blue-gray
  doc.setFont('helvetica', 'bold');
  doc.text('PTM HSS THRIKKADEERI', 74, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL TEXTBOOK DISTRIBUTION RECEIPT', 74, 24, { align: 'center' });
  
  doc.setDrawColor(226, 232, 240); // Lighter gray
  doc.setLineWidth(0.5);
  doc.line(10, 28, 138, 28);

  // Student Info Block
  doc.setFillColor(248, 250, 252); // Very light blue-gray
  doc.roundedRect(10, 34, 128, 28, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('DISTRIBUTED TO:', 14, 40);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${studentName} (${division})`, 14, 46);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (phone) doc.text(`Phone: ${phone}`, 14, 52);
  if (schoolName) doc.text(`School: ${schoolName}`, 14, 58);
  
  // Date and Issuer (Right Aligned)
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`DATE: ${date}`, 134, 40, { align: 'right' });
  doc.text(`ISSUER: ${staffName.toUpperCase()}`, 134, 45, { align: 'right' });

  // Table
  const tableData = items.map(item => [
    item.subject_name.length > 25 ? item.subject_name.substring(0, 22) + '...' : item.subject_name,
    item.quantity.toString(),
    `Rs. ${item.price.toFixed(1)}`,
    `Rs. ${item.subtotal.toFixed(1)}`
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['BOOK SUBJECT', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
    body: tableData,
    foot: [['', '', 'TOTAL AMOUNT', `Rs. ${totalAmount.toFixed(2)}` ]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 9 },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 50 },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Thank you for your cooperation.', 74, finalY, { align: 'center' });
  doc.text('Computer Generated Receipt - No Signature Required', 74, finalY + 5, { align: 'center' });

  return doc;
};

export const generateReceipt = (
  studentName: string,
  division: string,
  items: SaleItem[],
  totalAmount: number,
  staffName: string,
  phone?: string,
  schoolName?: string
) => {
  const doc = getReceiptDoc(studentName, division, items, totalAmount, staffName, phone, schoolName);
  const fileName = `Bill_${studentName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const getReceiptBlobUrl = (
  studentName: string,
  division: string,
  items: SaleItem[],
  totalAmount: number,
  staffName: string,
  phone?: string,
  schoolName?: string
) => {
  const doc = getReceiptDoc(studentName, division, items, totalAmount, staffName, phone, schoolName);
  return URL.createObjectURL(doc.output('blob'));
};
