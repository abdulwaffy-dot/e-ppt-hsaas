import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProcurementApplication, AnnualBudgets } from '../types';

interface ExportOptions {
  applications: ProcurementApplication[];
  annualBudgets?: AnnualBudgets;
  title?: string;
  yearFilter?: string;
  deptFilter?: string;
  statusFilter?: string;
}

/**
 * Export HQ Procurement Reports to Excel (.xlsx) using ExcelJS
 */
export async function exportHQReportToExcel({
  applications,
  annualBudgets,
  title = 'UPM HQ Procurement Official Report',
  yearFilter = 'ALL',
  deptFilter = 'ALL',
  statusFilter = 'ALL',
}: ExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Universiti Putra Malaysia - e-PPT System';
  workbook.created = new Date();

  // --- SHEET 1: Applications Data ---
  const sheet1 = workbook.addWorksheet('Procurement Applications');

  // Page setup & gridlines
  sheet1.views = [{ showGridLines: true }];

  // Title Block
  sheet1.mergeCells('A1:I1');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = 'UNIVERSITI PUTRA MALAYSIA (UPM) - e-PPT PROCUREMENT REPORT';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '800000' }, // UPM Dark Red
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet1.getRow(1).height = 32;

  // Metadata block
  sheet1.mergeCells('A2:I2');
  const metaCell = sheet1.getCell('A2');
  metaCell.value = `Export Date: ${new Date().toLocaleString()} | Filter Year: ${yearFilter} | Department: ${deptFilter} | Status: ${statusFilter}`;
  metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet1.getRow(2).height = 20;

  sheet1.addRow([]); // Blank line

  // Header Row
  const headers = [
    'Ref No',
    'Year',
    'Department',
    'Project / Item Title',
    'Category',
    'Applicant Name',
    'Est. Cost (RM)',
    'Status',
    'HQ Justification / Decision Notes',
  ];

  const headerRow = sheet1.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }, // Slate 800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CBD5E1' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } },
    };
  });

  // Data Rows
  let totalCost = 0;
  let totalApprovedCost = 0;

  applications.forEach((app, idx) => {
    totalCost += app.estimatedCost;
    if (app.status === 'Approved') {
      totalApprovedCost += app.estimatedCost;
    }

    const row = sheet1.addRow([
      app.referenceNo,
      app.year,
      app.department,
      app.title,
      app.expenditureCategoryName || app.expenditureCategoryCode || '-',
      app.applicantName,
      app.estimatedCost,
      app.status,
      app.hqDecision?.justification || app.remarksJustification || '-',
    ]);

    row.height = 20;

    // Apply styles to individual cells
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle' };

      // Number formatting for Cost
      if (colNumber === 7) {
        cell.numFmt = '"RM "#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }

      // Status styling
      if (colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (app.status === 'Approved') {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '065F46' } }; // Dark green
        } else if (app.status === 'Rejected') {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '991B1B' } }; // Dark red
        } else {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '92400E' } }; // Dark amber
        }
      }

      // Zebra striping
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' },
        };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } },
      };
    });
  });

  // Summary Row at bottom
  sheet1.addRow([]); // spacing
  const summaryRow = sheet1.addRow([
    'TOTAL RECORDS',
    applications.length,
    '',
    'SUM OF ESTIMATED COSTS',
    '',
    'Total / Approved:',
    totalCost,
    `RM ${totalApprovedCost.toLocaleString()} Approved`,
    '',
  ]);

  summaryRow.height = 24;
  summaryRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0F172A' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2E8F0' },
    };
    if (colNumber === 7) {
      cell.numFmt = '"RM "#,##0.00';
    }
  });

  // Column Widths
  sheet1.columns = [
    { width: 16 }, // Ref No
    { width: 8 },  // Year
    { width: 28 }, // Dept
    { width: 35 }, // Title
    { width: 22 }, // Category
    { width: 22 }, // Applicant
    { width: 18 }, // Cost
    { width: 14 }, // Status
    { width: 40 }, // Justification
  ];

  // --- SHEET 2: Annual Budget Allocations (if provided) ---
  if (annualBudgets) {
    const sheet2 = workbook.addWorksheet('HQ Annual Budget Allocations');
    sheet2.views = [{ showGridLines: true }];

    // Header Title
    sheet2.mergeCells('A1:E1');
    const bTitleCell = sheet2.getCell('A1');
    bTitleCell.value = 'HQ ANNUAL BUDGET ALLOCATIONS & UTILIZATION';
    bTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    bTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '800000' } };
    bTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet2.getRow(1).height = 28;

    const bHeaders = ['Fiscal Year', 'Allocated Ceiling (RM)', 'Approved Commitments (RM)', 'Pending Requests (RM)', 'Utilization %'];
    const bHeaderRow = sheet2.addRow(bHeaders);
    bHeaderRow.height = 22;
    bHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const years = Object.keys(annualBudgets).map(Number).sort((a, b) => a - b);
    years.forEach((yr) => {
      const budget = annualBudgets[yr] || 0;
      const approvedSum = applications
        .filter((a) => a.year === yr && a.status === 'Approved')
        .reduce((sum, a) => sum + a.estimatedCost, 0);
      const pendingSum = applications
        .filter((a) => a.year === yr && a.status === 'Submitted')
        .reduce((sum, a) => sum + a.estimatedCost, 0);

      const utilPct = Math.round((approvedSum / (budget || 1)) * 100);

      const bRow = sheet2.addRow([yr, budget, approvedSum, pendingSum, `${utilPct}%`]);
      bRow.height = 18;
      bRow.getCell(1).alignment = { horizontal: 'center' };
      bRow.getCell(2).numFmt = '"RM "#,##0.00';
      bRow.getCell(3).numFmt = '"RM "#,##0.00';
      bRow.getCell(4).numFmt = '"RM "#,##0.00';
      bRow.getCell(5).alignment = { horizontal: 'center' };
    });

    sheet2.columns = [{ width: 14 }, { width: 24 }, { width: 26 }, { width: 24 }, { width: 16 }];
  }

  // Trigger File Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `UPM_HQ_Procurement_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export HQ Procurement Reports to PDF using jsPDF and jspdf-autotable
 */
export function exportHQReportToPDF({
  applications,
  annualBudgets,
  title = 'UNIVERSITI PUTRA MALAYSIA',
  yearFilter = 'ALL',
  deptFilter = 'ALL',
  statusFilter = 'ALL',
}: ExportOptions): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Banner Colors
  const darkRed = '#800000';
  const slate900 = '#0F172A';

  // 1. Header Header Box
  doc.setFillColor(128, 0, 0); // Dark Red
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('UNIVERSITI PUTRA MALAYSIA (UPM)', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('e-PPT HQ Procurement Official Review & Expenditure Report', 14, 18);

  // Date and Metadata top right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-MY')}`, 283, 11, { align: 'right' });
  doc.text('Confidential - HQ Authority', 283, 18, { align: 'right' });

  // 2. Report Parameters & KPI Cards
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Active Filters: Fiscal Year [${yearFilter}] | Dept [${deptFilter}] | Status [${statusFilter}]`, 14, 30);

  // Compute Metrics
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'Approved');
  const pendingApps = applications.filter((a) => a.status === 'Submitted');
  const rejectedApps = applications.filter((a) => a.status === 'Rejected');

  const totalCost = applications.reduce((sum, a) => sum + a.estimatedCost, 0);
  const approvedCost = approvedApps.reduce((sum, a) => sum + a.estimatedCost, 0);
  const pendingCost = pendingApps.reduce((sum, a) => sum + a.estimatedCost, 0);

  // KPI Summary Card Boxes
  const cardWidth = 63;
  const cardHeight = 16;
  const startY = 34;

  // Card 1: Total
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, startY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL APPLICATIONS', 18, startY + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalApps} Applications (RM ${totalCost.toLocaleString()})`, 18, startY + 11);

  // Card 2: Approved
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(82, startY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(6, 95, 70);
  doc.text('APPROVED COMMITMENTS', 86, startY + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${approvedApps.length} Apps (RM ${approvedCost.toLocaleString()})`, 86, startY + 11);

  // Card 3: Pending
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(150, startY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.text('PENDING HQ REVIEW', 154, startY + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pendingApps.length} Apps (RM ${pendingCost.toLocaleString()})`, 154, startY + 11);

  // Card 4: Budget context
  const targetYr = yearFilter === 'ALL' ? 2026 : parseInt(yearFilter, 10);
  const activeBudget = annualBudgets ? (annualBudgets[targetYr] || 2500000) : 2500000;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(218, startY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(55, 48, 163);
  doc.text(`HQ BUDGET CEILING (${targetYr})`, 222, startY + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`RM ${activeBudget.toLocaleString()}`, 222, startY + 11);

  // 3. AutoTable Data
  const tableData = applications.map((app) => [
    app.referenceNo,
    app.year.toString(),
    app.department,
    app.title.length > 38 ? app.title.substring(0, 35) + '...' : app.title,
    app.expenditureCategoryName || app.expenditureCategoryCode || '-',
    app.applicantName,
    `RM ${app.estimatedCost.toLocaleString()}`,
    app.status,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Ref No', 'Year', 'Department', 'Project Title', 'Category', 'Applicant', 'Est. Cost', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 26 }, // Ref
      1: { cellWidth: 12, halign: 'center' }, // Yr
      2: { cellWidth: 42 }, // Dept
      3: { cellWidth: 65 }, // Title
      4: { cellWidth: 35 }, // Cat
      5: { cellWidth: 32 }, // Applicant
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }, // Cost
      7: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }, // Status
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const val = data.cell.raw;
        if (val === 'Approved') {
          data.cell.styles.textColor = [6, 95, 70];
        } else if (val === 'Rejected') {
          data.cell.styles.textColor = [153, 27, 27];
        } else {
          data.cell.styles.textColor = [146, 64, 14];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer / Signatures
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  if (finalY < 165) {
    const sigY = Math.max(finalY + 12, 160);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICIAL HQ APPROVAL & VERIFICATION SIGN-OFF', 14, sigY);

    // Signature Box 1
    doc.setDrawColor(203, 213, 225);
    doc.line(14, sigY + 18, 90, sigY + 18);
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Prepared By: HQ Procurement Secretariat', 14, sigY + 22);
    doc.text(`Date: ${new Date().toLocaleDateString('en-MY')}`, 14, sigY + 26);

    // Signature Box 2
    doc.line(190, sigY + 18, 280, sigY + 18);
    doc.text('Approved By: Perolehan_hsaas / Head of HQ Reviewer', 190, sigY + 22);
    doc.text('Stamp & Authorization Signature', 190, sigY + 26);
  }

  // Trigger Save
  doc.save(`UPM_HQ_Procurement_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
