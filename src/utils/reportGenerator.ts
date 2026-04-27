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
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  const date = new Date().toLocaleDateString();

  // --- CONFIGURATION ---
  const displayMap: Record<string, string> = {
    'Malayalam 1': 'Adisthana Padavali',
    'Malayalam 2': 'Kerala Padavali',
    'Adisthana Padavali (Mal 1)': 'Adisthana Padavali',
    'Kerala Padavali (Mal 2)': 'Kerala Padavali',
    'Adisthana Padavali Malayalam': 'Adisthana Padavali',
    'Kerala Padavali Malayalam': 'Kerala Padavali',
    'കേരള പാഠാവലി': 'Kerala Padavali',
    'അടിസ്ഥാന പാഠാവലി': 'Adisthana Padavali',
    'Maths': 'Mathematics',
    'Mathematics (Eng)': 'Mathematics',
    'Mathematics (Mal)': 'Mathematics',
    'Mathematics (M)': 'Mathematics',
    'Mathematics (E)': 'Mathematics',
    'IT': 'Information Technology (IT)',
    'I.C.T.': 'Information Technology (IT)',
    'I.C.T. (M)': 'Information Technology (IT)',
    'I.C.T. (E)': 'Information Technology (IT)',
    'I.C.T. Mal': 'Information Technology (IT)',
    'I.C.T. Eng': 'Information Technology (IT)',
    'Chemistry (M)': 'Chemistry',
    'Chemistry (E)': 'Chemistry',
    'Chemistry (Mal)': 'Chemistry',
    'Chemistry (Eng)': 'Chemistry',
    'Physics (M)': 'Physics',
    'Physics (E)': 'Physics',
    'Physics (Mal)': 'Physics',
    'Physics (Eng)': 'Physics',
    'Biology (M)': 'Biology',
    'Biology (E)': 'Biology',
    'Biology (Mal)': 'Biology',
    'Biology (Eng)': 'Biology',
    'Social Science (1) Mal': 'Social Science 1',
    'Social Science (1) Eng': 'Social Science 1',
    'Social Science (2) Mal': 'Social Science 2',
    'Social Science (2) Eng': 'Social Science 2',
    'Social Science (1) (M)': 'Social Science 1',
    'Social Science (1) (E)': 'Social Science 1',
    'Social Science (2) (M)': 'Social Science 2',
    'Social Science (2) (E)': 'Social Science 2',
    'Kerala Reader English': 'English',
    'Kerala Reader Hindi': 'Hindi',
    'Kerala Reader Arabic (Academic)': 'Arabic',
    'Kerala Reader Urdu': 'Urdu',
    'Kerala Reader Sanskrit': 'Sanskrit',
    'Work Education (Agriculture)': 'Work Education (Agriculture)',
    'Work education (agriculture)': 'Work Education (Agriculture)',
    'Work education clothing(M)': 'Work Education (Clothing)',
    'Work education Printing(M)': 'Work Education (Printing)',
    'Work Integrated Education - Activity Book (Eng)': 'Work Education',
    'Work Education (Others)': 'Work Education'
  };

  const subjectPriority: Record<string, number> = {
    'Biology': 1, 'Chemistry': 1, 'Physics': 1, 'Information Technology (IT)': 1,
    'Social Science 1': 2, 'Social Science 2': 2,
    'Mathematics': 3,
    'English': 4, 'Hindi': 5, 'Urdu': 6, 'Arabic': 7, 'Sanskrit': 8,
    'Kerala Padavali': 9, 'Adisthana Padavali': 10,
    'Physical Education': 11, 'Art Education': 12, 'Work Education': 13,
    'Work Education (Agriculture)': 13, 'Work Education (Clothing)': 13, 'Work Education (Printing)': 13
  };

  // --- STATS TRACKING ---
  const stats = {
    class9: { revenue: 0, cost: 0, stockValue: 0 },
    class10: { revenue: 0, cost: 0, stockValue: 0 },
    languages: { revenue: 0, cost: 0, stockValue: 0 },
    grand: { revenue: 0, cost: 0, stockValue: 0 }
  };

  const classes = ['9', '10'];
  const mediums = ['Malayalam', 'English', 'Shared'];
  let firstPage = true;

  classes.forEach((classNum) => {
    mediums.forEach((medium) => {
      // 1. Filter and Group
      const sectionBooks = books.filter(b => b.class_number === classNum && b.medium === medium);
      if (sectionBooks.length === 0) return;

      const grouped = sectionBooks.reduce((acc, current) => {
        const name = displayMap[current.subject_name] || current.subject_name;
        if (!acc[name]) {
          acc[name] = { ...current, subject_name: name, stock_total: 0, stock_sold: 0 };
        }
        acc[name].stock_total += Number(current.stock_total || 0);
        acc[name].stock_sold += Number(current.stock_sold || 0);
        return acc;
      }, {} as Record<string, any>);

      const sorted = Object.values(grouped).sort((a: any, b: any) => {
        const pA = subjectPriority[a.subject_name] || 99;
        const pB = subjectPriority[b.subject_name] || 99;
        return pA !== pB ? pA - pB : a.subject_name.localeCompare(b.subject_name);
      });

      // 2. Page Management
      if (!firstPage) doc.addPage();
      firstPage = false;

      // 3. Header for Page
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('PTM HSS THRIKKADEERI', 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Inventory Audit Report | ${date} | Class ${classNum} - ${medium === 'Shared' ? 'Languages' : medium + ' Medium'}`, 14, 25);
      doc.line(14, 28, 283, 28);

      // 4. Table Data
      let sArrived = 0, sSold = 0, sCost = 0, sRev = 0;
      const tableData = sorted.map((b: any) => {
        const qty = b.stock_total;
        const sold = b.stock_sold;
        const cost = b.cost_price;
        const price = b.price;
        const rem = qty - sold;
        const tCost = qty * cost;
        const tRev = sold * price;
        const bal = tRev - tCost;

        sArrived += qty; sSold += sold; sCost += tCost; sRev += tRev;
        
        // Update stats
        const target = classNum === '9' ? stats.class9 : stats.class10;
        target.revenue += tRev;
        target.cost += tCost;
        target.stockValue += (rem * cost);
        
        if (medium === 'Shared') {
          stats.languages.revenue += tRev;
          stats.languages.cost += tCost;
          stats.languages.stockValue += (rem * cost);
        }

        stats.grand.revenue += tRev;
        stats.grand.cost += tCost;
        stats.grand.stockValue += (rem * cost);

        return [
          b.subject_name, qty, sold, rem, 
          `Rs. ${cost.toFixed(1)}`, `Rs. ${tCost.toFixed(1)}`,
          `Rs. ${price.toFixed(1)}`, `Rs. ${tRev.toFixed(1)}`,
          { content: `Rs. ${bal.toFixed(1)}`, styles: { textColor: bal < 0 ? [220, 38, 38] : [22, 163, 74] } }
        ];
      });

      autoTable(doc, {
        startY: 35,
        head: [['Subject', 'Arrived', 'Sold', 'Rem', 'U.Cost', 'Total Cost', 'U.Price', 'Revenue', 'Balance']],
        body: tableData,
        foot: [[
          'TOTALS', sArrived, sSold, sArrived - sSold, '-', 
          `Rs. ${sCost.toFixed(0)}`, '-', `Rs. ${sRev.toFixed(0)}`,
          { content: `Rs. ${(sRev - sCost).toFixed(0)}`, styles: { textColor: (sRev - sCost) < 0 ? [220, 38, 38] : [22, 163, 74] } }
        ]],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 9 },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, cellPadding: 2.5, halign: 'center' },
        columnStyles: { 0: { cellWidth: 45, halign: 'left' } }
      });
    });
  });

  // --- FINAL SUMMARY PAGE ---
  doc.addPage();
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235);
  doc.text('CONSOLIDATED FINANCIAL SUMMARY', 14, 25);
  doc.line(14, 30, 283, 30);

  const summaryData = [
    ['Class 9 Total', `Rs. ${stats.class9.cost.toLocaleString()}`, `Rs. ${stats.class9.revenue.toLocaleString()}`, `Rs. ${(stats.class9.revenue - stats.class9.cost).toLocaleString()}`, `Rs. ${stats.class9.stockValue.toLocaleString()}`],
    ['Class 10 Total', `Rs. ${stats.class10.cost.toLocaleString()}`, `Rs. ${stats.class10.revenue.toLocaleString()}`, `Rs. ${(stats.class10.revenue - stats.class10.cost).toLocaleString()}`, `Rs. ${stats.class10.stockValue.toLocaleString()}`],
    ['Languages (Shared)', `Rs. ${stats.languages.cost.toLocaleString()}`, `Rs. ${stats.languages.revenue.toLocaleString()}`, `Rs. ${(stats.languages.revenue - stats.languages.cost).toLocaleString()}`, `Rs. ${stats.languages.stockValue.toLocaleString()}`],
    ['GRAND TOTAL (SCHOOL)', `Rs. ${stats.grand.cost.toLocaleString()}`, `Rs. ${stats.grand.revenue.toLocaleString()}`, `Rs. ${(stats.grand.revenue - stats.grand.cost).toLocaleString()}`, `Rs. ${stats.grand.stockValue.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: 45,
    head: [['Section', 'Total Procurement Cost', 'Total Revenue Collected', 'Net Cash Balance', 'Current Inventory Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });

  // Profit/Loss Explanation
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Insights:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const insights = [
    `1. Total School Revenue: Rs. ${stats.grand.revenue.toFixed(2)}`,
    `2. Total School Procurement Investment: Rs. ${stats.grand.cost.toFixed(2)}`,
    `3. Net Cash Position: ${stats.grand.revenue - stats.grand.cost >= 0 ? 'Surplus' : 'Deficit'} of Rs. ${Math.abs(stats.grand.revenue - stats.grand.cost).toFixed(2)}`,
    `4. Estimated Profit on Distributed Books: Rs. ${(stats.grand.revenue - (stats.grand.cost - stats.grand.stockValue)).toFixed(2)}`,
    `5. Current Stock Asset Value: Rs. ${stats.grand.stockValue.toFixed(2)}`
  ];
  insights.forEach((line, i) => doc.text(line, 14, finalY + 8 + (i * 6)));

  doc.save(`PTM_HSS_Audit_Report_${date.replace(/\//g, '-')}.pdf`);
};
