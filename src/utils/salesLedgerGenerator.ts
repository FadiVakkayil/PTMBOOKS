import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Sale {
  id: string;
  student_name: string;
  division: string;
  total_amount: number;
  items: any[];
  staff_name: string;
  created_at: string;
}

export const generateSalesLedger = (sales: Sale[]) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better detail
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text('PTM HSS THRIKKADEERI - SALES LEDGER', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Official textbook distribution log | Exported: ${date}`, 14, 28);
  doc.line(14, 32, 283, 32);

  let totalSalesValue = 0;

  const tableData = sales.map((sale) => {
    totalSalesValue += Number(sale.total_amount);
    
    // Format items list
    const itemsList = sale.items
      .map((i: any) => `${i.subject_name} (x${i.quantity})`)
      .join(', ');

    return [
      new Date(sale.created_at).toLocaleString(),
      sale.student_name,
      sale.division,
      itemsList,
      `Rs. ${Number(sale.total_amount).toFixed(2)}`,
      sale.staff_name || 'Staff'
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Date/Time', 'Student', 'Div', 'Items Distributed', 'Total Amount', 'Issued By']],
    body: tableData,
    foot: [['', '', '', 'GRAND TOTAL REVENUE', `Rs. ${totalSalesValue.toFixed(2)}`, '']],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 10 },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 3, halign: 'center', overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 40 }, // Date
      1: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }, // Student
      2: { cellWidth: 15 }, // Div
      3: { halign: 'left', cellWidth: 100 }, // Items
      4: { halign: 'right', fontStyle: 'bold' } // Amount
    }
  });

  doc.save(`PTM_Sales_Ledger_${new Date().getTime()}.pdf`);
};
