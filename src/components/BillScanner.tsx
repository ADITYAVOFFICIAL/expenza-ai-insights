
import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface BillScannerProps {
  onScanComplete: (data: {
    amount?: number;
    vendor?: string;
    date?: string;
    category?: string;
  }) => void;
  onClose: () => void;
}

const BillScanner: React.FC<BillScannerProps> = ({ onScanComplete, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR processing
    setIsScanning(true);
    
    // Mock OCR results - in real app, this would call Gemini API
    setTimeout(() => {
      const mockData = {
        amount: 450,
        vendor: 'Café Coffee Day',
        date: new Date().toISOString().split('T')[0],
        category: 'food'
      };
      
      setIsScanning(false);
      onScanComplete(mockData);
      
      toast({
        title: "Bill Scanned Successfully",
        description: "Expense details have been extracted from the bill.",
      });
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan Bill</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {previewImage ? (
          <div className="space-y-4">
            <img 
              src={previewImage} 
              alt="Bill preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            {isScanning && (
              <div className="flex items-center justify-center space-x-2">
                <Scan className="w-5 h-5 animate-spin" />
                <span>Extracting bill details...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a bill image to extract expense details automatically
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Select Image
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillScanner;
