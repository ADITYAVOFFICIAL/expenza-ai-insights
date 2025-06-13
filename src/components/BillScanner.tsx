
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import geminiService from '@/lib/gemini';

interface BillScannerProps {
  onScanComplete: (data: any) => void;
  onClose: () => void;
}

const BillScanner: React.FC<BillScannerProps> = ({ onScanComplete, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Process the image
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const extractedData = await geminiService.extractBillData(file);
      
      toast({
        title: "Bill Scanned Successfully",
        description: "Expense details have been extracted from the bill.",
      });

      onScanComplete({ ...extractedData, file }); // Pass the file object along with extracted data
    } catch (error) {
      console.error('Error processing bill:', error);
      toast({
        title: "Processing Failed",
        description: "Could not extract data from the bill. Please try again or enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scan Bill</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Upload a photo of your bill or receipt to automatically extract expense details using AI.
      </div>

      {previewUrl && (
        <div className="relative rounded-lg overflow-hidden border">
          <img 
            src={previewUrl} 
            alt="Bill preview" 
            className="w-full h-48 object-cover"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Processing bill...</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleUploadClick}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {previewUrl ? 'Upload Different Image' : 'Upload Image'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, WebP. Max size: 10MB.
      </div>
    </div>
  );
};

export default BillScanner;
