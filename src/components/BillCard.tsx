
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, FileEdit, Download, EyeIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bill } from '@/lib/supabase';
import QRCode from 'react-qr-code';
import { generateAndDownloadPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  className?: string;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onEdit, onDelete, className }) => {
  const { toast } = useToast();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async () => {
    try {
      await generateAndDownloadPDF(bill, bill.logo_url);
      toast({
        title: "PDF Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border hover:shadow-md group",
        className,
        isHovered && "ring-1 ring-primary/10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        <div className="grid grid-cols-12 gap-4">
          {/* Logo or Placeholder */}
          <div className="col-span-3 bg-secondary rounded-md overflow-hidden h-20 flex items-center justify-center">
            {bill.logo_url ? (
              <img 
                src={bill.logo_url} 
                alt={`${bill.print_name} logo`}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="text-muted-foreground text-xs text-center p-2">No Logo</div>
            )}
          </div>
          
          {/* Bill Details */}
          <div className="col-span-9 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground truncate">{bill.print_name}</h3>
              <p className="text-sm text-muted-foreground truncate">Customer: {bill.customer_name}</p>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Date: </span>
                <span>{formatDate(bill.created_at)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-1">Total:</span>
                <span className="font-medium">${bill.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-secondary/30 p-3 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          <span>Qty: {bill.quantity}</span>
          <span className="mx-2">•</span>
          <span>Price: ${bill.price_per_piece.toFixed(2)}/piece</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-opacity"
            onClick={() => setIsQROpen(true)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-opacity"
            onClick={() => onEdit(bill)}
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 transition-opacity"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-opacity"
            onClick={() => onDelete(bill)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      {/* QR Code Dialog */}
      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {bill.pdf_url ? (
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={bill.pdf_url}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                  className="animate-scale-in"
                />
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No PDF URL available for this invoice.</p>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  className="mt-2"
                >
                  Generate PDF
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Scan this QR code to download the invoice PDF.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BillCard;
