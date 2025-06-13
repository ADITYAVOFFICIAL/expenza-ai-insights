import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, X, Check, Loader2,Square, Settings2, Image as ImageIcon, BarChart3, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, ListChecks, Banknote, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'; // Added DialogDescription
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Expense } from '@/types/expense'; // Assuming Expense type is imported
import { Allowance } from '@/lib/allowanceService'; // Assuming Allowance type is imported
import { Goal } from '@/types/goal'; // Assuming Goal type is imported
import { toast } from '@/hooks/use-toast'; // Changed useToast to toast
import { useIsMobile } from '@/hooks/use-mobile';
import ExcelJS from 'exceljs'; // Added ExcelJS import
import { format, parseISO } from 'date-fns'; // Added parseISO and format
import jsPDF from 'jspdf'; // Added jsPDF import
import 'jspdf-autotable';
import html2canvas from 'html2canvas'; // For capturing charts as images
// Data structure interfaces (assuming these are consistent with Analytics.tsx)
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
  percentage?: number;
}

interface DailySpending {
  day: string;
  amount: number;
}

interface BankData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface AnalyticsExportableData {
  summaryMetrics: Array<{ label: string; value: string; description?: string }>;
  monthlyTrends: MonthlyTrend[];
  categorySpending: CategorySpending[];
  dailySpending: DailySpending[];
  expenseByBank: BankData[];
  allowanceByBank: BankData[];
  allExpenses: Expense[];
  timeFilterLabel: string;
  // You can add more optional fields here if needed for different types of exports
  // e.g., paymentAppUsage?: Array<any>;
  // e.g., topExpenses?: Array<any>;
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

// Chart configurations - IDs must match those in Analytics.tsx
const chartConfigs = [
  { id: 'analyticsChartExpensesByBank', title: 'Expenses by Bank Chart' },
  { id: 'analyticsChartAllowanceByBank', title: 'Allowance by Bank Chart' },
  { id: 'analyticsChartSavingsTracking', title: 'Savings Tracking Chart' },
  { id: 'analyticsChartFinancialTrends', title: 'Financial Trends Chart' },
  { id: 'analyticsChartSpendingByCategory', title: 'Spending by Category Chart' },
];

const convertToCSV = (data: any[], sectionTitle?: string): string => {
  if (!data || data.length === 0) return sectionTitle ? `${sectionTitle}\nNo data available\n\n` : "";
  
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(row => {
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
    return `Expenza_Analytics_${timeFilterPart}_${datePart}.${extension}`;
  };

  const captureChartAsImage = async (chartId: string): Promise<string | null> => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.warn(`Chart element with ID ${chartId} not found.`);
      return null;
    }
    try {
      // Ensure visibility for accurate capture if charts are in collapsible sections or similar
      // This might require more complex handling depending on actual page layout
      const canvas = await html2canvas(chartElement, {
        logging: false,
        useCORS: true, // If charts use external images/fonts
        backgroundColor: '#ffffff', // Ensure background for transparent charts
        scale: 2, // Increase resolution
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error capturing chart ${chartId}:`, error);
      return null;
    }
  };

  const exportToCSVHandler = () => {
    if (!analyticsData) return;
    let combinedCsvString = `Expenza Analytics Report\n`;
    combinedCsvString += `Time Period: ${analyticsData.timeFilterLabel}\n`;
    combinedCsvString += `Export Date: ${new Date().toLocaleDateString()}\n\n`;

    // ... (Keep your existing CSV data processing logic here, adapted for selectedDataSets)
    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics) {
      combinedCsvString += convertToCSV(analyticsData.summaryMetrics.map(m => ({ Metric: m.label, Value: m.value, Details: m.description || '' })), "Summary Metrics");
    }
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends) {
      combinedCsvString += convertToCSV(analyticsData.monthlyTrends, "Monthly Trends");
    }
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending) {
      combinedCsvString += convertToCSV(analyticsData.categorySpending.map(c => ({ Category: c.category, Amount: c.amount, Percentage: c.percentage || ''})), "Spending by Category");
    }
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending) {
      combinedCsvString += convertToCSV(analyticsData.dailySpending, "Daily Spending Trend");
    }
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank) {
      combinedCsvString += convertToCSV(analyticsData.expenseByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})), "Expenses by Bank");
    }
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank) {
      combinedCsvString += convertToCSV(analyticsData.allowanceByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})), "Allowances by Bank");
    }
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses) {
      const expensesToExport = analyticsData.allExpenses.map(exp => ({
        Date: exp.date ? format(parseISO(exp.date), 'dd/MM/yy') : '', Name: exp.name, Amount: exp.amount, Category: exp.category,
        PaymentMethod: exp.paymentMethod, Bank: exp.bank || '', Notes: exp.notes || '', CreatedAt: exp.createdAt,
      }));
      combinedCsvString += convertToCSV(expensesToExport, "Detailed Expense List");
    }

    const blob = new Blob([combinedCsvString], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, getFilename('csv'));
  };

  const exportToPDFHandler = async () => {
    if (!analyticsData) return;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let yPos = 20; // Initial Y position with more top margin
    const pageMargin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 2 * pageMargin;
    const generationDate = new Date().toLocaleDateString();

    // --- Theme Colors (approximated from HSL values) ---
    const primaryColor = [51, 153, 102]; // Approx. hsl(150, 60%, 45%)
    const foregroundColor = [20, 23, 28]; // Approx. hsl(220, 20%, 10%)
    const mutedForegroundColor = [97, 106, 124]; // Approx. hsl(220, 15%, 45%)
    const whiteColor = [255, 255, 255];

    // --- Helper function to add footer with page number ---
    const addFooter = () => {
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(mutedForegroundColor[0], mutedForegroundColor[1], mutedForegroundColor[2]);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Page ${i} of ${pageCount} | Generated on: ${generationDate} | Expenza Analytics`,
          pageMargin,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
    };

    // --- Report Header ---
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 30, 'F'); // Header background banner

    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    pdf.text('Expenza Analytics Report', pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    pdf.text(`Period: ${analyticsData.timeFilterLabel}`, pageWidth / 2, 23, { align: 'center' });
    
    yPos = 40; // Reset Y position after header

    // --- Function to add a section with styled title and table ---
    const addSectionToPdf = (title: string, data: any[], columns?: string[]) => {
      if (data.length === 0) return;
      if (yPos > pdf.internal.pageSize.getHeight() - 40) { // Check for page break before section title
        pdf.addPage();
        yPos = pageMargin;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text(title, pageMargin, yPos);
      yPos += 8;

      if (yPos > pdf.internal.pageSize.getHeight() - 30) { // Check for page break before table
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
          theme: 'grid', // 'striped', 'grid', 'plain'
          styles: {
            fontSize: 9,
            cellPadding: 2,
            textColor: foregroundColor,
            lineColor: [200, 200, 200], // Lighter grid lines
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: whiteColor,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245], // Light gray for alternate rows
          },
          margin: { left: pageMargin, right: pageMargin },
          tableWidth: contentWidth, // Ensure table uses content width
          didDrawPage: (hookData: any) => { // Handle page breaks within table
            // yPos = hookData.cursor.y + 5; // Not reliable for setting next element's yPos
          }
        });
        // @ts-ignore
        yPos = pdf.lastAutoTable.finalY + 10;
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
        data.forEach(row => {
          if (yPos > pdf.internal.pageSize.getHeight() - 20) { pdf.addPage(); yPos = pageMargin; }
          pdf.text(Object.values(row).map(val => String(val).substring(0,30)).join(' | '), pageMargin, yPos); // Truncate long values
          yPos += 6;
        });
        yPos += 5;
      }
    };
    
    // --- Add Textual Data Sections ---
    pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]); // Default text color

    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) {
      addSectionToPdf("Summary Metrics", analyticsData.summaryMetrics.map(m => ({ Metric: m.label, Value: m.value, Details: m.description || '' })));
    }
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) {
      addSectionToPdf("Financial Trends", analyticsData.monthlyTrends);
    }
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) {
      addSectionToPdf("Spending by Category", analyticsData.categorySpending.map(c => ({ Category: c.category, Amount: `₹${Number(c.amount).toLocaleString()}`, Percentage: `${c.percentage || 0}%` })));
    }
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) {
      addSectionToPdf("Daily Spending Trend", analyticsData.dailySpending.map(d => ({ Day: d.day, Amount: `₹${Number(d.amount).toLocaleString()}` })));
    }
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) {
      addSectionToPdf("Expenses by Bank", analyticsData.expenseByBank.map(b => ({ Bank: b.name, Amount: `₹${Number(b.value).toLocaleString()}`, Percentage: `${b.percentage || 0}%` })));
    }
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) {
      addSectionToPdf("Allowances by Bank", analyticsData.allowanceByBank.map(b => ({ Bank: b.name, Amount: `₹${Number(b.value).toLocaleString()}`, Percentage: `${b.percentage || 0}%` })));
    }
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
      const expensesToExport = analyticsData.allExpenses.map(exp => ({
        Date: exp.date ? format(parseISO(exp.date), 'dd/MM/yy') : '', Name: exp.name, Amount: `₹${Number(exp.amount).toLocaleString()}`, Category: exp.category,
        Payment: exp.paymentMethod, Bank: exp.bank || 'N/A', Notes: exp.notes || '',
      }));
      addSectionToPdf("Detailed Expense List", expensesToExport, ['Date', 'Name', 'Amount', 'Category', 'Payment', 'Bank', 'Notes']);
    }

    // --- Add Charts Section ---
    if (includeGraphs && effectiveChartConfigs.length > 0) {
      if (yPos > pdf.internal.pageSize.getHeight() - 60) { // Check space before "Charts" title
         pdf.addPage(); yPos = pageMargin;
      } else {
        yPos += 5; // Some spacing if on same page
      }
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('Visualizations', pageMargin, yPos);
      yPos += 10;

      for (const chart of effectiveChartConfigs) {
        if (yPos > pdf.internal.pageSize.getHeight() - 80) { // Check space for chart title + chart
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
          
          if (yPos + chartHeight > pdf.internal.pageSize.getHeight() - 20) { // Check if chart fits
             pdf.addPage(); yPos = pageMargin;
             // Re-add chart title on new page
             pdf.setFontSize(12);
             pdf.setFont('helvetica', 'bold');
             pdf.setTextColor(foregroundColor[0], foregroundColor[1], foregroundColor[2]);
             pdf.text(chart.title, pageMargin, yPos);
             yPos += 7;
          }
          try {
            pdf.addImage(imageDataUrl, 'PNG', pageMargin, yPos, chartWidth, chartHeight);
            yPos += chartHeight + 15; // Space after chart
          } catch (e) {
            console.error("Error adding image to PDF: ", e);
            pdf.setTextColor(255,0,0);
            pdf.text(`Error rendering chart: ${chart.title}`, pageMargin, yPos);
            yPos += 10;
          }
        }
      }
    }
    
    addFooter(); // Add footer to all pages
    pdf.save(getFilename('pdf'));
  };

  const exportToXLSXHandler = async () => {
    if (!analyticsData) return;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expenza App';
    workbook.created = new Date();
    workbook.modified = new Date();

    const primaryColorArgb = 'FF339966'; // ARGB for primaryColor [51, 153, 102]
    const whiteColorArgb = 'FFFFFFFF';

    const addSheetWithData = (sheetName: string, data: any[]) => {
      if (data.length === 0) return;
      const worksheet = workbook.addWorksheet(sheetName.substring(0, 30)); 
      
      // Add title for the sheet
      worksheet.mergeCells('A1', `${String.fromCharCode(65 + Object.keys(data[0]).length -1)}1`);
      worksheet.getCell('A1').value = sheetName;
      worksheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: primaryColorArgb } };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      worksheet.getRow(1).height = 20;

      // Add headers
      worksheet.columns = Object.keys(data[0]).map(key => ({ 
        header: key.replace(/([A-Z])/g, ' $1').trim(), // Add space before caps for readability
        key: key, 
        width: key.toLowerCase().includes('name') || key.toLowerCase().includes('notes') ? 30 : (key.toLowerCase().includes('date') ? 15 : 20),
        style: { font: { name: 'Arial', size: 10 } }
      }));
      
      // Style header row (now row 2)
      const headerRow = worksheet.getRow(2);
      headerRow.values = Object.keys(data[0]).map(key => key.replace(/([A-Z])/g, ' $1').trim()); // Spaced headers
      headerRow.font = { name: 'Arial', bold: true, color: { argb: whiteColorArgb }, size: 11 };
      headerRow.fill = { type: 'pattern', pattern:'solid', fgColor:{argb: primaryColorArgb } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 18;

      // Add data rows starting from row 3
      data.forEach(item => {
        const row = worksheet.addRow(Object.values(item));
        row.font = { name: 'Arial', size: 10 };
        // Apply number formatting for amounts/percentages
        Object.keys(item).forEach((key, colIndex) => {
            const cell = row.getCell(colIndex + 1);
            if (typeof item[key] === 'number') {
                if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('value')) {
                    cell.numFmt = '"₹"#,##0.00';
                } else if (key.toLowerCase().includes('percentage')) {
                    cell.numFmt = '0.00"%"';
                    cell.value = item[key] / 100; // Store percentage as decimal for Excel
                }
            } else if (String(item[key]).startsWith('₹')) {
                 cell.numFmt = '"₹"#,##0.00';
                 cell.value = parseFloat(String(item[key]).replace('₹','').replace(/,/g,''));
            } else if (String(item[key]).endsWith('%')) {
                 cell.numFmt = '0.00"%"';
                 cell.value = parseFloat(String(item[key]).replace('%','')) / 100;
            }
        });
      });
      
      // Auto-filter on header row
      worksheet.autoFilter = `A2:${String.fromCharCode(65 + Object.keys(data[0]).length -1)}2`;
    };

    // Add textual data to sheets
    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) addSheetWithData("Summary Metrics", analyticsData.summaryMetrics.map(m => ({ Metric: m.label, Value: m.value, Details: m.description || '' })));
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) addSheetWithData("Financial Trends", analyticsData.monthlyTrends);
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) addSheetWithData("Spending by Category", analyticsData.categorySpending.map(c => ({ Category: c.category, Amount: c.amount, Percentage: c.percentage })));
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) addSheetWithData("Daily Spending", analyticsData.dailySpending);
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) addSheetWithData("Expense By Bank", analyticsData.expenseByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage })));
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) addSheetWithData("Allowance By Bank", analyticsData.allowanceByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage })));
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
        const expensesToExport = analyticsData.allExpenses.map(exp => ({
            Date: exp.date ? format(parseISO(exp.date), 'dd/MM/yy') : '', Name: exp.name, Amount: exp.amount, Category: exp.category,
            PaymentMethod: exp.paymentMethod, Bank: exp.bank || 'N/A', Notes: exp.notes || '', CreatedAt: exp.$createdAt,
        }));
        addSheetWithData("All Expenses Data", expensesToExport);
    }
    
    // --- Add Charts to Excel (if selected) ---
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
          const imageId = workbook.addImage({
            base64: imageBase64,
            extension: 'png',
          });
          
          // Approximate image size. ExcelJS uses EMU. 1 inch = 914400 EMU.
          // Let's aim for a width of about 10 columns and height of 20 rows.
          // These are rough estimates and might need adjustment.
          // A common approach is to set width/height in pixels and convert, or use cell anchors.
          // For simplicity, we'll use cell anchors to span a certain number of rows/columns.
          chartsSheet.addImage(imageId, {
            tl: { col: 0, row: currentRow }, // Top-left corner (0-indexed)
            // ext: { width: 600, height: 400 } // Define image size in pixels
             br: { col: 12, row: currentRow + 25 } // Bottom-right corner (spans 12 cols, 25 rows)
          });
          currentRow += 27; // Move down for next chart + title
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
    if (selectedDataSets.length === 0 && !includeGraphs) { // if graphs can be exported alone, this check needs adjustment
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
      onOpenChange(false); // Close dialog on successful export
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
          <DialogTitle className="flex items-center gap-2 dark:text-foreground"> {/* Added dark:text-foreground */}
            <Download className="w-5 h-5" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Select the format, data sets, and options for exporting your analytics report.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-sm font-medium dark:text-foreground">Export Format</Label> {/* Added dark:text-foreground */}
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'xlsx') => setExportFormat(value)} disabled={isExporting}>
              <SelectTrigger className="dark:text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" className="dark:text-foreground">CSV (Comma Separated Values)</SelectItem> {/* Added dark:text-foreground */}
                <SelectItem value="pdf" className="dark:text-foreground">PDF Document</SelectItem> {/* Added dark:text-foreground */}
                <SelectItem value="xlsx" className="dark:text-foreground">Excel Spreadsheet (.xlsx)</SelectItem> {/* Added dark:text-foreground */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium dark:text-foreground">Select Data Sets to Include</Label> {/* Added dark:text-foreground */}
                <Button variant="link" size="sm" onClick={() => handleSelectAllDataSets(!allDataSetsSelected)} className="p-0 h-auto dark:text-primary" disabled={isExporting}> {/* Added dark:text-primary */}
                    {allDataSetsSelected ? <Square className="w-4 h-4 mr-1"/> : <CheckSquare className="w-4 h-4 mr-1"/>}
                    {allDataSetsSelected ? 'Deselect All' : 'Select All'}
                </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md">
              {effectiveDataSetOptions.map(option => ( // Use effectiveDataSetOptions
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cb-export-${option.id}`}
                    checked={selectedDataSets.includes(option.id)}
                    onCheckedChange={(checked) => handleDataSetChange(option.id, !!checked)}
                    disabled={isExporting}
                  />
                  <Label htmlFor={`cb-export-${option.id}`} className="font-normal cursor-pointer flex-1 dark:text-foreground"> {/* Added dark:text-foreground */}
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
              <Label htmlFor="cb-include-graphs" className="font-normal cursor-pointer dark:text-foreground"> {/* Added dark:text-foreground */}
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