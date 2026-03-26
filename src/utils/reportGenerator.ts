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

  // Header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('PTM HSS THRIKKADEERI', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Official Textbook Inventory & Financial Audit Report | Generated: ${date}`, 14, 30);
  doc.line(14, 34, 283, 34);

  let grandTotalBalance = 0;
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

  classes.forEach((classNum) => {
    mediums.forEach((medium) => {
      // 1. Filter books for this section
      const sectionBooks = books.filter(
        (b) => b.class_number === classNum && b.medium === medium
      );

      if (sectionBooks.length > 0) {
        // 2. Group by subject_name to remove duplicates
        const grouped = sectionBooks.reduce((acc, current) => {
          const key = current.subject_name;
          if (!acc[key]) {
            acc[key] = {
              subject_name: current.subject_name,
              class_number: current.class_number,
              medium: current.medium,
              stock_total: Number(current.stock_total || 0),
              stock_sold: Number(current.stock_sold || 0),
              price: Number(current.price || 0),
              cost_price: Number(current.cost_price || 0)
            };
          } else {
            acc[key].stock_total += Number(current.stock_total || 0);
            acc[key].stock_sold += Number(current.stock_sold || 0);
            acc[key].price = current.price ? Number(current.price) : acc[key].price;
            acc[key].cost_price = current.cost_price ? Number(current.cost_price) : acc[key].cost_price;
          }
          return acc;
        }, {} as Record<string, any>);

        // 3. Sort grouped books
        const sortedBooks = Object.values(grouped).sort((a: any, b: any) => {
          const pA = subjectPriority[a.subject_name] || 99;
          const pB = subjectPriority[b.subject_name] || 99;
          if (pA !== pB) return pA - pB;
          return a.subject_name.localeCompare(b.subject_name);
        });

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
        let sectionRem = 0;
        let sectionTotalCost = 0;
        let sectionTotalRevenue = 0;
        let sectionNetBalance = 0;

        const tableData = sortedBooks.map((book: any) => {
          const qtyArr = Number(book.stock_total || 0);
          const qtySold = Number(book.stock_sold || 0);
          const unitCost = Number(book.cost_price || 0);
          const unitPrice = Number(book.price || 0);
          
          const remaining = qtyArr - qtySold;
          const totalCost = qtyArr * unitCost; // PROCUREMENT COST
          const totalRevenue = qtySold * unitPrice; // ACTUAL INCOME
          const netBalance = totalRevenue - totalCost; // SURPLUS OR LOSS
          
          sectionArrived += qtyArr;
          sectionSold += qtySold;
          sectionRem += remaining;
          sectionTotalCost += totalCost;
          sectionTotalRevenue += totalRevenue;
          sectionNetBalance += netBalance;
          grandTotalBalance += netBalance;

          return [
            book.subject_name,
            qtyArr.toString(),
            qtySold.toString(),
            remaining.toString(),
            `Rs. ${unitCost.toFixed(2)}`,
            `Rs. ${totalCost.toFixed(2)}`,
            `Rs. ${unitPrice.toFixed(2)}`,
            `Rs. ${totalRevenue.toFixed(2)}`,
            {
              content: `${netBalance < 0 ? '-' : '+'}Rs. ${Math.abs(netBalance).toFixed(2)}`,
              styles: { textColor: netBalance < 0 ? [220, 38, 38] : [22, 163, 74] } // Red for Loss, Green for Profit
            }
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Subject', 'Arr', 'Dist', 'Rem', 'U.Cost', 'T.Cost', 'U.Price', 'T.Rev', 'Net Balance']],
          body: tableData,
          foot: [[
            'TOTALS', 
            sectionArrived.toString(), 
            sectionSold.toString(), 
            sectionRem.toString(),
            '-', 
            `Rs. ${sectionTotalCost.toFixed(1)}`, 
            '-', 
            `Rs. ${sectionTotalRevenue.toFixed(1)}`,
            {
              content: `${sectionNetBalance < 0 ? '-' : '+'}Rs. ${Math.abs(sectionNetBalance).toFixed(1)}`,
              styles: { textColor: sectionNetBalance < 0 ? [220, 38, 38] : [22, 163, 74] }
            }
          ]],
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 9 },
          footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3, halign: 'center' },
          columnStyles: {
            0: { cellWidth: 45, halign: 'left' }, // Subject
            4: { halign: 'right' }, // U.Cost
            5: { halign: 'right', fontStyle: 'bold' }, // T.Cost
            6: { halign: 'right' }, // U.Price
            7: { halign: 'right', fontStyle: 'bold' }, // T.Rev
            8: { halign: 'right', fontStyle: 'bold' } // Net Balance
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
  doc.setFontSize(22);
  doc.setTextColor(grandTotalBalance < 0 ? 220 : 22, grandTotalBalance < 0 ? 38 : 163, grandTotalBalance < 0 ? 38 : 74); 
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL SCHOOL ACCOUNT BALANCE: ${grandTotalBalance < 0 ? '-' : '+'}Rs. ${Math.abs(grandTotalBalance).toFixed(2)}`, 14, currentY);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Note: Net Balance = (Total Money Collected) - (Total Money Spent on Procurement). Red indicates more money was spent than received (Net Loss).', 14, currentY + 10);

  doc.save(`PTM_HSS_Audit_Report_${date.replace(/\//g, '-')}.pdf`);
};
