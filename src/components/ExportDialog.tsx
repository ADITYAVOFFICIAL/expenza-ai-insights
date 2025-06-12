
import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

const ExportDialog: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xlsx'>('pdf');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [filters, setFilters] = useState({
    category: '',
    bank: '',
    minAmount: '',
    maxAmount: '',
    includeCharts: true,
    includeSettled: true,
    includePending: true
  });

  const handleExport = async () => {
    // Simulate export process
    toast({
      title: "Export Started",
      description: `Generating ${exportFormat.toUpperCase()} report...`,
    });

    // Mock export delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your ${exportFormat.toUpperCase()} report has been downloaded.`,
      });
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Expenses</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'xlsx') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Bank</Label>
                <Select value={filters.bank} onValueChange={(value) => setFilters(prev => ({ ...prev, bank: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All banks</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="sbi">SBI</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={filters.includeCharts}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeCharts: !!checked }))}
                />
                <Label htmlFor="include-charts">Include charts and graphs</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-settled"
                  checked={filters.includeSettled}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeSettled: !!checked }))}
                />
                <Label htmlFor="include-settled">Include settled expenses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-pending"
                  checked={filters.includePending}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includePending: !!checked }))}
                />
                <Label htmlFor="include-pending">Include pending expenses</Label>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Generate {exportFormat.toUpperCase()} Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
