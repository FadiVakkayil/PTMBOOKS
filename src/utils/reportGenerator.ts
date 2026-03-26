import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Book {
  id: string;
  subject_name: string;
  class_number: string;
  medium: string;
  stock_total: number;
  stock_sold: number;
  price: number;
  cost_price: number;
}

export const generateReport = (books: Book[]) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Use landscape for more columns
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('PTM HSS THRIKKADEERI', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Official Textbook Inventory & Financial Audit Report | Generated: ${date}`, 14, 30);
  doc.line(14, 34, 283, 34);

  let grandTotalProfit = 0;
  let currentY = 45;

  const classes = ['9', '10'];
  const mediums = ['Malayalam', 'English'];

  // Subject Priority Sorting
  const subjectPriority: Record<string, number> = {
    'Biology': 1, 'Chemistry': 1, 'Physics': 1, 'Information Technology (IT)': 1,
    'Social Science 1': 2, 'Social Science 2': 2,
    'Maths': 3,
    'Urdu': 4, 'Malayalam 1': 4, 'Sanskrit': 4, 'Arabic': 4, 'Malayalam 2': 4
  };

  const sortBooks = (booksToSort: Book[]) => {
    return [...booksToSort].sort((a, b) => {
      const pA = subjectPriority[a.subject_name] || 99;
      const pB = subjectPriority[b.subject_name] || 99;
      if (pA !== pB) return pA - pB;
      return a.subject_name.localeCompare(b.subject_name);
    });
  };

  classes.forEach((classNum) => {
    mediums.forEach((medium) => {
      const filteredBooks = books.filter(
        (b) => b.class_number === classNum && b.medium === medium
      );

      if (filteredBooks.length > 0) {
        const sortedBooks = sortBooks(filteredBooks);

        if (currentY > 170) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(50);
        doc.setFont('helvetica', 'bold');
        doc.text(`Class ${classNum} - ${medium} Medium`, 14, currentY);
        currentY += 8;

        let sectionArrived = 0;
        let sectionSold = 0;
        let sectionTotalCost = 0;
        let sectionTotalRevenue = 0;
        let sectionProfit = 0;

        const tableData = sortedBooks.map((book) => {
          const totalCost = book.stock_total * (book.cost_price || 0);
          const totalRevenue = book.stock_sold * book.price;
          const profit = totalRevenue - totalCost; // This is the net balance for this book type
          
          sectionArrived += book.stock_total;
          sectionSold += book.stock_sold;
          sectionTotalCost += totalCost;
          sectionTotalRevenue += totalRevenue;
          sectionProfit += profit;
          grandTotalProfit += profit;

          return [
            book.subject_name,
            book.stock_total,
            book.stock_sold,
            `Rs. ${book.cost_price || 0}`,
            `Rs. ${totalCost.toFixed(2)}`,
            `Rs. ${book.price}`,
            `Rs. ${totalRevenue.toFixed(2)}`,
            `Rs. ${profit.toFixed(2)}`
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Subject', 'Arrived Qty', 'Distributed Qty', 'Unit Cost', 'Total Cost', 'Unit Price', 'Total Price', 'Net Margin']],
          body: tableData,
          foot: [[
            'TOTALS', 
            sectionArrived, 
            sectionSold, 
            '-', 
            `Rs. ${sectionTotalCost.toFixed(2)}`, 
            '-', 
            `Rs. ${sectionTotalRevenue.toFixed(2)}`,
            `Rs. ${sectionProfit.toFixed(2)}`
          ]],
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 10 },
          footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right', fontStyle: 'bold' },
            5: { halign: 'right' },
            6: { halign: 'right', fontStyle: 'bold' },
            7: { halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            currentY = (data as any).cursor.y + 15;
          }
        });
      }
    });
  });

  // Grand Total Summary
  if (currentY > 180) {
    doc.addPage();
    currentY = 20;
  }

  doc.line(14, currentY, 283, currentY);
  currentY += 15;
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL SCHOOL ACCOUNT BALANCE: Rs. ${grandTotalProfit.toFixed(2)}`, 14, currentY);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Note: Net Margin = (Distributed Price) - (Arrived Cost). Positive values indicate profit, negative indicate remaining inventory cost.', 14, currentY + 10);

  doc.save(`PTM_HSS_Audit_${date.replace(/\//g, '-')}.pdf`);
};
