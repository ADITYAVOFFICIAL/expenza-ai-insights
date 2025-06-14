import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, X, Check, Loader2,Square, Settings2, Image as ImageIcon, CheckSquare, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, ListChecks, Banknote, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Expense } from '@/types/expense';
import { Allowance } from '@/lib/allowanceService';
import { Goal } from '@/types/goal';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO, isValid, compareAsc, subMonths } from 'date-fns'; // Added subMonths
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import jspdf-autotable

// Data structure interfaces
interface MonthlyTrend {
  month: string;
  expenses: number;
  income: number;
  savings: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  budget?: number;
  percentage?: number; // Assumed to be a number like 25.5 for 25.5%
}

interface DailySpending {
  day: string;
  amount: number;
}

interface BankData {
  name: string;
  value: number;
  color?: string;
  percentage?: number; // Assumed to be a number like 25.5 for 25.5%
}

export interface AnalyticsExportableData {
  summaryMetrics: Array<{ label: string; value: string; description?: string }>;
  monthlyTrends: MonthlyTrend[];
  categorySpending: CategorySpending[];
  dailySpending: DailySpending[];
  expenseByBank: BankData[];
  allowanceByBank: BankData[];
  allExpenses: Expense[]; // Expense type should include $createdAt and isRecurring
  timeFilterLabel: string;
}

interface AnalyticsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyticsData: AnalyticsExportableData | null;
  customChartConfigs?: Array<{ id: string; title: string }>;
  customDataSetOptions?: Array<{ id: string; label: string; defaultSelected?: boolean }>;
}

const defaultDataSetOptions = [
  { id: 'summaryMetrics', label: 'Summary Metrics' },
  { id: 'monthlyTrends', label: 'Monthly Trends (Income, Expenses, Savings)' },
  { id: 'categorySpending', label: 'Spending by Category' },
  { id: 'dailySpending', label: 'Daily Spending Trend' },
  { id: 'expenseByBank', label: 'Expenses by Bank' },
  { id: 'allowanceByBank', label: 'Allowances by Bank' },
  { id: 'allExpenses', label: 'Detailed Expense List (Raw Data)' },
];

const chartConfigs = [
  { id: 'analyticsChartExpensesByBank', title: 'Expenses by Bank Chart' },
  { id: 'analyticsChartAllowanceByBank', title: 'Allowance by Bank Chart' },
  { id: 'analyticsChartSavingsTrackingWrapper', title: 'Savings Tracking Chart' }, // Use wrapper ID if chart is complex
  { id: 'financialTrendsChartContainer', title: 'Financial Trends Chart' }, // Use ID from within FinancialTrendsChart
  { id: 'analyticsChartSpendingByCategoryWrapper', title: 'Spending by Category Chart' }, // Use wrapper ID
];

// Helper function to get a formatted period string for summary metric details
const getPeriodDetailString = (timeFilterLabel: string | undefined): string => {
  if (!timeFilterLabel) return '';
  const currentDate = new Date();
  const labelLower = timeFilterLabel.toLowerCase();

  if (labelLower === "this month" || labelLower === "current month") {
    return format(currentDate, 'MMMM, yyyy');
  }
  if (labelLower === "last month") {
    return format(subMonths(currentDate, 1), 'MMMM, yyyy');
  }
  // Regex to match "Month YYYY" e.g. "June 2025"
  const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
  const monthYearMatch = timeFilterLabel.match(monthYearPattern);
  if (monthYearMatch) {
    // Ensure consistent "Month, YYYY" format
    const monthName = monthYearMatch[1].charAt(0).toUpperCase() + monthYearMatch[1].slice(1);
    return `${monthName}, ${monthYearMatch[2]}`;
  }
  return timeFilterLabel; // Fallback to the original label if it's specific like a date range
};


const convertToCSV = (data: any[], sectionTitle?: string): string => {
  if (!data || data.length === 0) return sectionTitle ? `${sectionTitle}\nNo data available\n\n` : "";
  
  // Filter out internal properties like isRecurring for CSV
  const dataForCsv = data.map(row => {
    const { isRecurring, ...rest } = row; // eslint-disable-line @typescript-eslint/no-unused-vars
    return rest;
  });

  if (dataForCsv.length === 0 || Object.keys(dataForCsv[0]).length === 0) return sectionTitle ? `${sectionTitle}\nNo data available\n\n` : "";


  const header = Object.keys(dataForCsv[0]).join(',');
  const rows = dataForCsv.map(row => {
    return Object.values(row).map(value => {
      const stringValue = String(value === null || value === undefined ? '' : value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  let csvString = "";
  if (sectionTitle) {
    csvString += `${sectionTitle}\n`;
  }
  csvString += header + '\n' + rows.join('\n') + '\n\n';
  return csvString;
};

const downloadFile = (blob: Blob, filename: string): void => {
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const AnalyticsExportDialog: React.FC<AnalyticsExportDialogProps> = ({
  open,
  onOpenChange,
  analyticsData,
  customChartConfigs,
  customDataSetOptions,
}) => {
  const effectiveDataSetOptions = customDataSetOptions || defaultDataSetOptions;
  const effectiveChartConfigs = customChartConfigs || chartConfigs;

  const [selectedDataSets, setSelectedDataSets] = useState<string[]>(
    effectiveDataSetOptions.filter(opt => opt.defaultSelected !== false).map(opt => opt.id)
  );
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [includeGraphs, setIncludeGraphs] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleSelectAllDataSets = (checked: boolean) => {
    setSelectedDataSets(checked ? effectiveDataSetOptions.map(opt => opt.id) : []);
  };

  const handleDataSetChange = (dataSetId: string, checked: boolean) => {
    setSelectedDataSets(prev =>
      checked ? [...prev, dataSetId] : prev.filter(id => id !== dataSetId)
    );
  };

  const getFilename = (extension: string): string => {
    const timeFilterPart = analyticsData?.timeFilterLabel.replace(/\s+/g, '_') || 'data';
    const datePart = new Date().toISOString().split('T')[0];
    return `DigiSamahārta_Analytics_${timeFilterPart}_${datePart}.${extension}`;
  };

  const captureChartAsImage = async (chartId: string): Promise<string | null> => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.warn(`Chart element with ID ${chartId} not found.`);
      toast({ title: "Chart not found", description: `Element with ID ${chartId} missing for export.`, variant: "warning" });
      return null;
    }
    try {
      const canvas = await html2canvas(chartElement, {
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff', 
        scale: 2, 
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error capturing chart ${chartId}:`, error);
      toast({ title: "Chart Capture Error", description: `Could not capture ${chartId}.`, variant: "destructive" });
      return null;
    }
  };

  const exportToCSVHandler = () => {
    if (!analyticsData) return;
    let combinedCsvString = `DigiSamahārta Analytics Report\n`;
    combinedCsvString += `Time Period: ${analyticsData.timeFilterLabel}\n`;
    combinedCsvString += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    const reportPeriodDetail = getPeriodDetailString(analyticsData.timeFilterLabel);

    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics) {
      const processedSummaryMetrics = analyticsData.summaryMetrics.map(m => ({
        Metric: m.label,
        Value: m.value,
        Details: (m.description && m.description.toLowerCase() === "for this month") ? reportPeriodDetail : (m.description || '')
      }));
      combinedCsvString += convertToCSV(processedSummaryMetrics, "Summary Metrics");
    }
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends) {
      combinedCsvString += convertToCSV(analyticsData.monthlyTrends, "Monthly Trends");
    }
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending) {
      combinedCsvString += convertToCSV(analyticsData.categorySpending.map(c => ({ 
        Category: c.category, 
        Amount: c.amount, 
        Percentage: c.percentage != null ? `${c.percentage.toFixed(2)}%` : 'N/A'
      })), "Spending by Category");
    }
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending) {
      combinedCsvString += convertToCSV(analyticsData.dailySpending, "Daily Spending Trend");
    }
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank) {
      combinedCsvString += convertToCSV(analyticsData.expenseByBank.map(b => ({ 
        Bank: b.name, 
        Amount: b.value, 
        Percentage: b.percentage != null ? `${b.percentage.toFixed(2)}%` : 'N/A'
      })), "Expenses by Bank");
    }
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank) {
      combinedCsvString += convertToCSV(analyticsData.allowanceByBank.map(b => ({ 
        Bank: b.name, 
        Amount: b.value, 
        Percentage: b.percentage != null ? `${b.percentage.toFixed(2)}%` : 'N/A'
      })), "Allowances by Bank");
    }
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses) {
      const expensesToExport = analyticsData.allExpenses
        .map(exp => {
            const parsedDate = exp.date ? parseISO(exp.date) : null;
            const parsedCreatedAt = exp.$createdAt ? parseISO(exp.$createdAt) : null;
            return {
                Date: parsedDate && isValid(parsedDate) ? format(parsedDate, 'dd/MM/yy') : '',
                Name: exp.name,
                Amount: exp.amount,
                Category: exp.category,
                PaymentMethod: exp.paymentMethod,
                Bank: exp.bank || '',
                Notes: exp.notes || '',
                CreatedAt: parsedCreatedAt && isValid(parsedCreatedAt) ? format(parsedCreatedAt, 'dd/MM/yy HH:mm:ss') : (exp.$createdAt || ''),
                // isRecurring: exp.isRecurring // Keep for XLSX, remove for CSV if not needed there
            };
        })
        .sort((a, b) => {
            const dateA = a.Date ? new Date(a.Date.split('/').reverse().join('-')) : new Date(0); 
            const dateB = b.Date ? new Date(b.Date.split('/').reverse().join('-')) : new Date(0);
            if (!isValid(dateA) && isValid(dateB)) return 1;
            if (isValid(dateA) && !isValid(dateB)) return -1;
            if (!isValid(dateA) && !isValid(dateB)) return 0;
            return compareAsc(dateA, dateB);
        });
      combinedCsvString += convertToCSV(expensesToExport, "Detailed Expense List");
    }

    const blob = new Blob([combinedCsvString], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, getFilename('csv'));
  };

  const exportToPDFHandler = async () => {
    if (!analyticsData) return;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let yPos = 20; 
    const pageMargin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 2 * pageMargin;
    const generationDate = new Date().toLocaleDateString();

    const primaryColor = [51, 153, 102]; 
    const foregroundColor = [20, 23, 28]; 
    const mutedForegroundColor = [97, 106, 124];
    const whiteColor = [255, 255, 255];

    const addFooter = () => {
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(mutedForegroundColor[0], mutedForegroundColor[1], mutedForegroundColor[2]);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Page ${i} of ${pageCount} | Generated on: ${generationDate} | DigiSamahārta Analytics`,
          pageMargin,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
    };

    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 30, 'F'); 
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    pdf.text('DigiSamahārta Analytics Report', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    pdf.text(`Period: ${analyticsData.timeFilterLabel}`, pageWidth / 2, 23, { align: 'center' });
    yPos = 40;

    const addSectionToPdf = (title: string, data: any[], columns?: string[]) => {
      if (data.length === 0) return;
      if (yPos > pdf.internal.pageSize.getHeight() - 40) { 
        pdf.addPage();
        yPos = pageMargin;
      }
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text(title, pageMargin, yPos);
      yPos += 8;
      if (yPos > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPos = pageMargin;
      }
      
      // @ts-ignore
      if (typeof pdf.autoTable === 'function') {
        // @ts-ignore
        pdf.autoTable({
          head: [columns || Object.keys(data[0])],
          body: data.map(row => Object.values(row)),
          startY: yPos,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2, textColor: foregroundColor, lineColor: [200, 200, 200], lineWidth: 0.1 },
          headStyles: { fillColor: primaryColor, textColor: whiteColor, fontStyle: 'bold', fontSize: 10, halign: 'center' },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: pageMargin, right: pageMargin },
          tableWidth: contentWidth,
        });
        // @ts-ignore
        yPos = pdf.lastAutoTable.finalY + 10;
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
        data.forEach(row => {
          if (yPos > pdf.internal.pageSize.getHeight() - 20) { pdf.addPage(); yPos = pageMargin; }
          pdf.text(Object.values(row).map(val => String(val).substring(0,30)).join(' | '), pageMargin, yPos);
          yPos += 6;
        });
        yPos += 5;
      }
    };
    
    pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
    const reportPeriodDetail = getPeriodDetailString(analyticsData.timeFilterLabel);

    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) {
      const processedSummaryMetrics = analyticsData.summaryMetrics.map(m => ({
        Metric: m.label,
        Value: m.value,
        Details: (m.description && m.description.toLowerCase() === "for this month") ? reportPeriodDetail : (m.description || '')
      }));
      addSectionToPdf("Summary Metrics", processedSummaryMetrics);
    }
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) {
      addSectionToPdf("Financial Trends", analyticsData.monthlyTrends);
    }
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) {
      addSectionToPdf("Spending by Category", analyticsData.categorySpending.map(c => ({ 
        Category: c.category, 
        Amount: `₹${Number(c.amount).toLocaleString()}`, 
        Percentage: c.percentage != null ? `${c.percentage.toFixed(2)}%` : 'N/A'
      })));
    }
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) {
      addSectionToPdf("Daily Spending Trend", analyticsData.dailySpending.map(d => ({ Day: d.day, Amount: `₹${Number(d.amount).toLocaleString()}` })));
    }
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) {
      addSectionToPdf("Expenses by Bank", analyticsData.expenseByBank.map(b => ({ 
        Bank: b.name, 
        Amount: `₹${Number(b.value).toLocaleString()}`, 
        Percentage: b.percentage != null ? `${b.percentage.toFixed(2)}%` : 'N/A'
      })));
    }
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) {
      addSectionToPdf("Allowances by Bank", analyticsData.allowanceByBank.map(b => ({ 
        Bank: b.name, 
        Amount: `₹${Number(b.value).toLocaleString()}`, 
        Percentage: b.percentage != null ? `${b.percentage.toFixed(2)}%` : 'N/A'
      })));
    }
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
      const expensesToExport = analyticsData.allExpenses
        .map(exp => {
            const parsedDate = exp.date ? parseISO(exp.date) : null;
            const parsedCreatedAt = exp.$createdAt ? parseISO(exp.$createdAt) : null;
            return {
                DateObj: parsedDate, // For sorting
                Date: parsedDate && isValid(parsedDate) ? format(parsedDate, 'dd/MM/yy') : '',
                Name: exp.name,
                Amount: `₹${Number(exp.amount).toLocaleString()}`,
                Category: exp.category,
                Payment: exp.paymentMethod,
                Bank: exp.bank || 'N/A',
                Notes: exp.notes || '',
                CreatedAt: parsedCreatedAt && isValid(parsedCreatedAt) ? format(parsedCreatedAt, 'dd/MM/yy HH:mm:ss') : (exp.$createdAt || ''),
            };
        })
        .sort((a, b) => {
            if (!a.DateObj && b.DateObj) return 1;
            if (a.DateObj && !b.DateObj) return -1;
            if (!a.DateObj && !b.DateObj) return 0;
            return compareAsc(a.DateObj as Date, b.DateObj as Date);
        })
        .map(({ DateObj, ...rest }) => rest); // Remove DateObj after sorting

      addSectionToPdf("Detailed Expense List", expensesToExport, ['Date', 'Name', 'Amount', 'Category', 'Payment', 'Bank', 'Notes', 'CreatedAt']);
    }

    if (includeGraphs && effectiveChartConfigs.length > 0) {
      if (yPos > pdf.internal.pageSize.getHeight() - 60) { 
         pdf.addPage(); yPos = pageMargin;
      } else {
        yPos += 5; 
      }
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('Visualizations', pageMargin, yPos);
      yPos += 10;

      for (const chart of effectiveChartConfigs) {
        if (yPos > pdf.internal.pageSize.getHeight() - 80) { 
          pdf.addPage(); yPos = pageMargin;
        }
        const imageDataUrl = await captureChartAsImage(chart.id);
        if (imageDataUrl) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
          pdf.text(chart.title, pageMargin, yPos);
          yPos += 7;

          const imgProps = pdf.getImageProperties(imageDataUrl);
          const chartWidth = contentWidth; 
          const chartHeight = (imgProps.height * chartWidth) / imgProps.width;
          
          if (yPos + chartHeight > pdf.internal.pageSize.getHeight() - 20) { 
             pdf.addPage(); yPos = pageMargin;
             pdf.setFontSize(12);
             pdf.setFont('helvetica', 'bold');
             pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
             pdf.text(chart.title, pageMargin, yPos);
             yPos += 7;
          }
          try {
            pdf.addImage(imageDataUrl, 'PNG', pageMargin, yPos, chartWidth, chartHeight);
            yPos += chartHeight + 15; 
          } catch (e) {
            console.error("Error adding image to PDF: ", e);
            pdf.setTextColor(255,0,0);
            pdf.text(`Error rendering chart: ${chart.title}`, pageMargin, yPos);
            yPos += 10;
          }
        }
      }
    }
    
    addFooter(); 
    pdf.save(getFilename('pdf'));
  };

  const exportToXLSXHandler = async () => {
    if (!analyticsData) return;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DigiSamahārta App';
    workbook.created = new Date();
    workbook.modified = new Date();

    const primaryColorArgb = 'FF339966'; 
    const whiteColorArgb = 'FFFFFFFF';
    const recurringHighlightColorArgb = 'FFFFFF00'; // Light Yellow
    
    const reportPeriodDetail = getPeriodDetailString(analyticsData.timeFilterLabel);

    const addSheetWithData = (sheetName: string, data: any[], columnConfigs?: {key: string, header: string, width?: number, isDate?: boolean, isDateTime?: boolean, isCurrency?: boolean, isPercentage?: boolean}[]) => {
      if (data.length === 0) return;
      const worksheet = workbook.addWorksheet(sheetName.substring(0, 30)); 
      
      const headers = columnConfigs ? columnConfigs.map(c => c.header) : Object.keys(data[0]).filter(k => k !== 'isRecurring').map(key => key.replace(/([A-Z])/g, ' $1').trim());
      const keys = columnConfigs ? columnConfigs.map(c => c.key) : Object.keys(data[0]).filter(k => k !== 'isRecurring');


      worksheet.mergeCells('A1', `${String.fromCharCode(65 + headers.length -1)}1`);
      worksheet.getCell('A1').value = sheetName; // This is the main sheet title
      worksheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: primaryColorArgb } };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      worksheet.getRow(1).height = 20;

      worksheet.columns = headers.map((header, index) => ({
        header: header,
        key: keys[index],
        width: columnConfigs?.find(c => c.key === keys[index])?.width || (keys[index].toLowerCase().includes('name') || keys[index].toLowerCase().includes('notes') ? 30 : (keys[index].toLowerCase().includes('date') ? 15 : 20)),
        style: { font: { name: 'Arial', size: 10 } }
      }));
      
      const headerRow = worksheet.getRow(2);
      headerRow.values = headers;
      headerRow.font = { name: 'Arial', bold: true, color: { argb: whiteColorArgb }, size: 11 };
      headerRow.fill = { type: 'pattern', pattern:'solid', fgColor:{argb: primaryColorArgb } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 18;

      data.forEach(item => {
        const rowValues = keys.map(key => item[key]);
        const row = worksheet.addRow(rowValues);
        row.font = { name: 'Arial', size: 10 };

        if (sheetName === "All Expenses Data" && item.isRecurring) {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: recurringHighlightColorArgb }
                };
            });
        }
        
        keys.forEach((key, colIndex) => {
            const cell = row.getCell(colIndex + 1);
            const config = columnConfigs?.find(c => c.key === key);

            if (config?.isDate && item[key] instanceof Date && isValid(item[key])) {
                cell.value = item[key]; 
                cell.numFmt = 'dd/mm/yy';
            } else if (config?.isDateTime && item[key] instanceof Date && isValid(item[key])) {
                cell.value = item[key]; 
                cell.numFmt = 'dd/mm/yy hh:mm:ss';
            } else if (config?.isCurrency && typeof item[key] === 'number') {
                cell.value = item[key];
                cell.numFmt = '"₹"#,##0.00';
            } else if (config?.isPercentage && item[key] != null && typeof item[key] === 'number') {
                cell.value = item[key] / 100; 
                cell.numFmt = '0.00%';
            } else if (typeof item[key] === 'number') { 
                 if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('expenses') || key.toLowerCase().includes('income') || key.toLowerCase().includes('savings')) {
                    cell.numFmt = '"₹"#,##0.00';
                }
            }
        });
      });
      
      worksheet.autoFilter = `A2:${String.fromCharCode(65 + headers.length -1)}2`;
    };

    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) {
      const processedSummaryMetrics = analyticsData.summaryMetrics.map(m => ({
        Metric: m.label,
        Value: m.value,
        Details: (m.description && m.description.toLowerCase() === "for this month") ? reportPeriodDetail : (m.description || '')
      }));
      addSheetWithData("Summary Metrics", processedSummaryMetrics, [
        { key: 'Metric', header: 'Metric', width: 30 },
        { key: 'Value', header: 'Value', width: 20 },
        { key: 'Details', header: 'Details', width: 30 },
      ]);
    }
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) {
        addSheetWithData("Financial Trends", analyticsData.monthlyTrends, [
            { key: 'month', header: 'Month', width: 20 },
            { key: 'income', header: 'Income', isCurrency: true, width: 15 },
            { key: 'expenses', header: 'Expenses', isCurrency: true, width: 15 },
            { key: 'savings', header: 'Savings', isCurrency: true, width: 15 },
        ]);
    }
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) {
        addSheetWithData("Spending by Category", analyticsData.categorySpending.map(c => ({ ...c })), [
            { key: 'category', header: 'Category', width: 25 },
            { key: 'amount', header: 'Amount', isCurrency: true, width: 15 },
            { key: 'percentage', header: 'Percentage', isPercentage: true, width: 15 }
        ]);
    }
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) {
        addSheetWithData("Daily Spending", analyticsData.dailySpending, [
            { key: 'day', header: 'Day', width: 20 },
            { key: 'amount', header: 'Amount', isCurrency: true, width: 15 }
        ]);
    }
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) {
        addSheetWithData("Expense By Bank", analyticsData.expenseByBank.map(b => ({ ...b })), [
            { key: 'name', header: 'Bank', width: 25 },
            { key: 'value', header: 'Amount', isCurrency: true, width: 15 },
            { key: 'percentage', header: 'Percentage', isPercentage: true, width: 15 }
        ]);
    }
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) {
        addSheetWithData("Allowance By Bank", analyticsData.allowanceByBank.map(b => ({ ...b })), [
            { key: 'name', header: 'Bank', width: 25 },
            { key: 'value', header: 'Amount', isCurrency: true, width: 15 },
            { key: 'percentage', header: 'Percentage', isPercentage: true, width: 15 }
        ]);
    }
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
        const expensesToExport = analyticsData.allExpenses
            .map(exp => {
                const parsedDate = exp.date ? parseISO(exp.date) : null;
                const parsedCreatedAt = exp.$createdAt ? parseISO(exp.$createdAt) : null;
                return {
                    Date: parsedDate && isValid(parsedDate) ? parsedDate : null,
                    Name: exp.name,
                    Amount: exp.amount,
                    Category: exp.category,
                    PaymentMethod: exp.paymentMethod,
                    Bank: exp.bank || 'N/A',
                    Notes: exp.notes || '',
                    CreatedAt: parsedCreatedAt && isValid(parsedCreatedAt) ? parsedCreatedAt : null,
                    isRecurring: !!exp.isRecurring // Ensure this matches your Expense type
                };
            })
            .sort((a, b) => {
                if (!a.Date && b.Date) return 1; // Null dates go to the end
                if (a.Date && !b.Date) return -1;
                if (!a.Date && !b.Date) return 0;
                return compareAsc(a.Date as Date, b.Date as Date);
            });

        addSheetWithData("All Expenses Data", expensesToExport, [
            { key: 'Date', header: 'Date', width: 15, isDate: true },
            { key: 'Name', header: 'Name', width: 30 },
            { key: 'Amount', header: 'Amount', width: 15, isCurrency: true },
            { key: 'Category', header: 'Category', width: 20 },
            { key: 'PaymentMethod', header: 'Payment Method', width: 20 },
            { key: 'Bank', header: 'Bank', width: 20 },
            { key: 'Notes', header: 'Notes', width: 35 },
            { key: 'CreatedAt', header: 'Created At', width: 20, isDateTime: true },
            // 'isRecurring' is not a column, but used for styling
        ]);
    }
    
    if (includeGraphs && effectiveChartConfigs.length > 0) {
      const chartsSheet = workbook.addWorksheet('Charts');
      let currentRow = 1;
      for (const chart of effectiveChartConfigs) {
        const imageDataUrl = await captureChartAsImage(chart.id);
        if (imageDataUrl) {
          chartsSheet.getCell(`A${currentRow}`).value = chart.title;
          chartsSheet.getRow(currentRow).font = { name: 'Arial', bold: true, size: 14, color: { argb: primaryColorArgb } };
          currentRow +=1;

          const imageBase64 = imageDataUrl.split(',')[1];
          const imageId = workbook.addImage({ base64: imageBase64, extension: 'png' });
          chartsSheet.addImage(imageId, {
            tl: { col: 0, row: currentRow }, 
            // Adjusted to take less horizontal space if needed, e.g., col: 8 for half width on A4-like proportion
            br: { col: 10, row: currentRow + 20 } // Adjust col for width, row for height
          });
          currentRow += 22; // Adjust based on image height + spacing
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, getFilename('xlsx'));
  };

  const handleExport = async () => {
    if (!analyticsData) {
      toast({ title: "Error", description: "No data available to export.", variant: "destructive" });
      return;
    }
    if (selectedDataSets.length === 0 && !includeGraphs) {
      toast({ title: "No Selection", description: "Please select at least one data set or include graphs.", variant: "warning" });
      return;
    }
    if (selectedDataSets.length === 0 && (exportFormat === 'pdf' || exportFormat === 'xlsx') && !includeGraphs) {
        toast({ title: "No Selection", description: "Please select data sets or enable graph export.", variant: "warning" });
        return;
    }

    setIsExporting(true);
    toast({ title: "Exporting...", description: `Generating ${exportFormat.toUpperCase()} report. This may take a moment.` });

    try {
      if (exportFormat === 'csv') {
        exportToCSVHandler();
      } else if (exportFormat === 'pdf') {
        await exportToPDFHandler();
      } else if (exportFormat === 'xlsx') {
        await exportToXLSXHandler();
      }
      toast({ title: "Export Successful", description: `Your ${exportFormat.toUpperCase()} report has been downloaded.` });
      onOpenChange(false); 
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({ title: "Export Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const allDataSetsSelected = selectedDataSets.length === effectiveDataSetOptions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-foreground">
            <Download className="w-5 h-5" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Select the format, data sets, and options for exporting your analytics report.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-sm font-medium dark:text-foreground">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'xlsx') => setExportFormat(value)} disabled={isExporting}>
              <SelectTrigger className="dark:text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" className="dark:text-foreground">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="pdf" className="dark:text-foreground">PDF Document</SelectItem>
                <SelectItem value="xlsx" className="dark:text-foreground">Excel Spreadsheet (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium dark:text-foreground">Select Data Sets to Include</Label>
                <Button variant="link" size="sm" onClick={() => handleSelectAllDataSets(!allDataSetsSelected)} className="p-0 h-auto dark:text-primary" disabled={isExporting}>
                    {allDataSetsSelected ? <Square className="w-4 h-4 mr-1"/> : <CheckSquare className="w-4 h-4 mr-1"/>}
                    {allDataSetsSelected ? 'Deselect All' : 'Select All'}
                </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md">
              {effectiveDataSetOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cb-export-${option.id}`}
                    checked={selectedDataSets.includes(option.id)}
                    onCheckedChange={(checked) => handleDataSetChange(option.id, !!checked)}
                    disabled={isExporting}
                  />
                  <Label htmlFor={`cb-export-${option.id}`} className="font-normal cursor-pointer flex-1 dark:text-foreground">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {(exportFormat === 'pdf' || exportFormat === 'xlsx') && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cb-include-graphs"
                checked={includeGraphs}
                onCheckedChange={(checked) => setIncludeGraphs(!!checked)}
                disabled={isExporting}
              />
              <Label htmlFor="cb-include-graphs" className="font-normal cursor-pointer dark:text-foreground">
                Include Charts/Graphs (Beta)
              </Label>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Selected time period for export: <strong>{analyticsData?.timeFilterLabel || 'N/A'}</strong>
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isExporting} className="dark:text-foreground">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleExport} disabled={isExporting || (!analyticsData || (selectedDataSets.length === 0 && !includeGraphs))}>
            {isExporting ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsExportDialog;