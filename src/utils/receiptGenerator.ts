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
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text('PTM HSS THRIKKADEERI', 74, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Textbook Distribution Receipt', 74, 26, { align: 'center' });
  
  doc.setDrawColor(200);
  doc.line(10, 32, 138, 32);

  // Student Info
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student: ${studentName}`, 14, 42);
  doc.text(`Division: ${division}`, 14, 48);
  if (phone) doc.text(`Phone: ${phone}`, 14, 54);
  if (schoolName) doc.text(`School: ${schoolName}`, 14, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${date}`, 138, 42, { align: 'right' });
  doc.text(`Issuer: ${staffName}`, 138, 48, { align: 'right' });

  // Table
  const tableData = items.map(item => [
    item.subject_name.length > 25 ? item.subject_name.substring(0, 22) + '...' : item.subject_name,
    item.quantity.toString(),
    `Rs. ${item.price.toFixed(1)}`,
    `Rs. ${item.subtotal.toFixed(1)}`
  ]);

  autoTable(doc, {
    startY: schoolName ? 65 : (phone ? 60 : 55),
    head: [['Subject', 'Qty', 'Price', 'Subtotal']],
    body: tableData,
    foot: [['', '', 'TOTAL AMOUNT', `Rs. ${totalAmount.toFixed(1)}`]],
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
