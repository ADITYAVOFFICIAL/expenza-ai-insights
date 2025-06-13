import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Expense } from '@/types/expense';
import { Allowance } from '@/lib/allowanceService';
// import { Goal } from '@/types/goal'; // Not directly used in this component's data processing
import { Download, FileText, Image as ImageIcon, CheckSquare, Square } from 'lucide-react';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';

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
}

interface AnalyticsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyticsData: AnalyticsExportableData | null;
}

const dataSetOptions = [
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

const AnalyticsExportDialog: React.FC<AnalyticsExportDialogProps> = ({ open, onOpenChange, analyticsData }) => {
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>(dataSetOptions.map(opt => opt.id));
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [includeGraphs, setIncludeGraphs] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleSelectAllDataSets = (checked: boolean) => {
    setSelectedDataSets(checked ? dataSetOptions.map(opt => opt.id) : []);
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
        Date: exp.date, Name: exp.name, Amount: exp.amount, Category: exp.category,
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
    let yPos = 15; // Initial Y position

    pdf.setFontSize(18);
    pdf.text('Expenza Analytics Report', 105, yPos, { align: 'center' });
    yPos += 8;
    pdf.setFontSize(10);
    pdf.text(`Time Period: ${analyticsData.timeFilterLabel}`, 105, yPos, { align: 'center' });
    yPos += 5;
    pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
    yPos += 10;

    const addSectionToPdf = (title: string, data: any[]) => {
      if (data.length === 0) return;
      if (yPos > 260) { pdf.addPage(); yPos = 15; } // Check for page break
      pdf.setFontSize(14);
      pdf.text(title, 10, yPos);
      yPos += 7;
      pdf.setFontSize(9);
      // @ts-ignore // jsPDF-AutoTable is not strictly typed here, or use a simpler table
      if (typeof pdf.autoTable === 'function') {
        pdf.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(row => Object.values(row)),
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: { fillColor: [22, 160, 133], fontSize: 9 },
            margin: { top: yPos + 5 }
        });
        // @ts-ignore
        yPos = pdf.lastAutoTable.finalY + 10;
      } else { // Fallback for simple text if autoTable is not available/configured
        data.forEach(row => {
            if (yPos > 270) { pdf.addPage(); yPos = 15; }
            pdf.text(Object.values(row).join(' | '), 10, yPos);
            yPos += 5;
        });
        yPos += 5;
      }
    };
    
    // Add textual data
    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) {
        addSectionToPdf("Summary Metrics", analyticsData.summaryMetrics.map(m => ({ Metric: m.label, Value: m.value, Details: m.description || '' })));
    }
    // ... Add other textual data sections similarly ...
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) addSectionToPdf("Monthly Trends", analyticsData.monthlyTrends);
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) addSectionToPdf("Spending by Category", analyticsData.categorySpending.map(c => ({ Category: c.category, Amount: c.amount, Percentage: c.percentage || ''})));
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) addSectionToPdf("Daily Spending Trend", analyticsData.dailySpending);
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) addSectionToPdf("Expenses by Bank", analyticsData.expenseByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})));
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) addSectionToPdf("Allowances by Bank", analyticsData.allowanceByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})));
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
        const expensesToExport = analyticsData.allExpenses.map(exp => ({
            Date: exp.date, Name: exp.name, Amount: exp.amount, Category: exp.category,
            Payment: exp.paymentMethod, Bank: exp.bank || '', Notes: exp.notes || '',
        }));
        addSectionToPdf("Detailed Expense List", expensesToExport);
    }


    if (includeGraphs) {
      pdf.addPage();
      yPos = 15;
      pdf.setFontSize(16);
      pdf.text('Charts', 105, yPos, { align: 'center' });
      yPos += 10;

      for (const chart of chartConfigs) {
        if (yPos > 200) { pdf.addPage(); yPos = 15; } // Check for page break before adding chart
        const imageDataUrl = await captureChartAsImage(chart.id);
        if (imageDataUrl) {
          pdf.setFontSize(12);
          pdf.text(chart.title, 10, yPos);
          yPos += 5;
          const imgProps = pdf.getImageProperties(imageDataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // Page width with margin
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          if (yPos + pdfHeight > 280 && yPos !== 15) { // If not enough space and not top of new page
             pdf.addPage(); yPos = 15;
             pdf.setFontSize(12);
             pdf.text(chart.title, 10, yPos);
             yPos += 5;
          }
          pdf.addImage(imageDataUrl, 'PNG', 10, yPos, pdfWidth, pdfHeight);
          yPos += pdfHeight + 10;
        }
      }
    }
    pdf.save(getFilename('pdf'));
  };

  const exportToXLSXHandler = async () => {
    if (!analyticsData) return;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expenza App';
    workbook.created = new Date();
    workbook.modified = new Date();

    const addSheetWithData = (sheetName: string, data: any[]) => {
      if (data.length === 0) return;
      const worksheet = workbook.addWorksheet(sheetName.substring(0, 30)); // Max 31 chars for sheet name
      worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key, width: 20 }));
      worksheet.addRows(data);
      // Style header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FF228B22'} }; // Green fill
    };

    // Add textual data to sheets
    if (selectedDataSets.includes('summaryMetrics') && analyticsData.summaryMetrics.length > 0) addSheetWithData("Summary Metrics", analyticsData.summaryMetrics.map(m => ({ Metric: m.label, Value: m.value, Details: m.description || '' })));
    // ... Add other textual data sections similarly ...
    if (selectedDataSets.includes('monthlyTrends') && analyticsData.monthlyTrends.length > 0) addSheetWithData("Monthly Trends", analyticsData.monthlyTrends);
    if (selectedDataSets.includes('categorySpending') && analyticsData.categorySpending.length > 0) addSheetWithData("Category Spending", analyticsData.categorySpending.map(c => ({ Category: c.category, Amount: c.amount, Percentage: c.percentage || ''})));
    if (selectedDataSets.includes('dailySpending') && analyticsData.dailySpending.length > 0) addSheetWithData("Daily Spending", analyticsData.dailySpending);
    if (selectedDataSets.includes('expenseByBank') && analyticsData.expenseByBank.length > 0) addSheetWithData("Expense By Bank", analyticsData.expenseByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})));
    if (selectedDataSets.includes('allowanceByBank') && analyticsData.allowanceByBank.length > 0) addSheetWithData("Allowance By Bank", analyticsData.allowanceByBank.map(b => ({ Bank: b.name, Amount: b.value, Percentage: b.percentage || ''})));
    if (selectedDataSets.includes('allExpenses') && analyticsData.allExpenses.length > 0) {
        const expensesToExport = analyticsData.allExpenses.map(exp => ({
            Date: exp.date, Name: exp.name, Amount: exp.amount, Category: exp.category,
            Payment: exp.paymentMethod, Bank: exp.bank || '', Notes: exp.notes || '', CreatedAt: exp.createdAt,
        }));
        addSheetWithData("All Expenses", expensesToExport);
    }

    if (includeGraphs) {
      const chartsSheet = workbook.addWorksheet('Charts');
      let currentRow = 1;
      for (const chart of chartConfigs) {
        const imageDataUrl = await captureChartAsImage(chart.id);
        if (imageDataUrl) {
          chartsSheet.getCell(`A${currentRow}`).value = chart.title;
          chartsSheet.getRow(currentRow).font = { bold: true, size: 14 };
          currentRow +=1;

          const imageBase64 = imageDataUrl.split(',')[1]; // Get base64 part
          const imageId = workbook.addImage({
            base64: imageBase64,
            extension: 'png',
          });
          // Approximate image size. ExcelJS uses EMU. 1 inch = 914400 EMU. 96 DPI.
          // Width of ~15 Excel columns, Height ~25 rows. This is very approximate.
          chartsSheet.addImage(imageId, {
            tl: { col: 0, row: currentRow }, // Top-left corner
            // ext: { width: 500, height: 300 } // Define image size in pixels
            // Or use br (bottom-right corner) to span cells
            br: { col: 10, row: currentRow + 20 } // Span 10 columns and 20 rows
          });
          currentRow += 22; // Move down for next chart
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

  const allDataSetsSelected = selectedDataSets.length === dataSetOptions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Analytics Data
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'xlsx') => setExportFormat(value)} disabled={isExporting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="xlsx">Excel Spreadsheet (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Select Data Sets to Include</Label>
                <Button variant="link" size="sm" onClick={() => handleSelectAllDataSets(!allDataSetsSelected)} className="p-0 h-auto" disabled={isExporting}>
                    {allDataSetsSelected ? <Square className="w-4 h-4 mr-1"/> : <CheckSquare className="w-4 h-4 mr-1"/>}
                    {allDataSetsSelected ? 'Deselect All' : 'Select All'}
                </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md">
              {dataSetOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cb-export-${option.id}`}
                    checked={selectedDataSets.includes(option.id)}
                    onCheckedChange={(checked) => handleDataSetChange(option.id, !!checked)}
                    disabled={isExporting}
                  />
                  <Label htmlFor={`cb-export-${option.id}`} className="font-normal cursor-pointer flex-1">
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
              <Label htmlFor="cb-include-graphs" className="font-normal cursor-pointer">
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
            <Button type="button" variant="outline" disabled={isExporting}>Cancel</Button>
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