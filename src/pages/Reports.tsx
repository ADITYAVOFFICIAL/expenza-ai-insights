
import React from 'react';
import { FileText, Download, Calendar, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExportDialog from '@/components/ExportDialog';
import CurrencyConverter from '@/components/CurrencyConverter';

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Tools</h1>
          <p className="text-muted-foreground">Generate reports and use financial tools</p>
        </div>
        <ExportDialog />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Monthly Report</h3>
              <p className="text-sm text-muted-foreground">Current month summary</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <BarChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Category Analysis</h3>
              <p className="text-sm text-muted-foreground">Spending breakdown</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Custom Range</h3>
              <p className="text-sm text-muted-foreground">Date range report</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">PDF Report</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive expense report with charts</p>
                </div>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Excel Spreadsheet</h4>
                  <p className="text-sm text-muted-foreground">Raw data for analysis</p>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Tax Summary</h4>
                  <p className="text-sm text-muted-foreground">Expense summary for tax filing</p>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Converter */}
        <CurrencyConverter />
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Monthly Summary', description: 'Overview of monthly expenses' },
              { name: 'Category Breakdown', description: 'Expenses by category' },
              { name: 'Group Expenses', description: 'Shared expense summary' },
              { name: 'Goal Progress', description: 'Financial goals tracking' },
              { name: 'Recurring Expenses', description: 'Subscription and recurring costs' },
              { name: 'Bank Analysis', description: 'Expenses by bank account' }
            ].map((template, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
