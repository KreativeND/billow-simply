
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { Bill, formatCurrency } from './supabase';

export async function generatePDF(bill: Bill, logoUrl?: string) {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add company info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Logo Printing Company', 20, 40);
  pdf.setFontSize(10);
  pdf.text('123 Print Street, Design City, India', 20, 45);
  pdf.text('contact@logoprinting.com | +91 9876543210', 20, 50);
  
  // Add invoice info
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: ${bill.id.substring(0, 8)}`, 140, 40);
  pdf.text(`Date: ${new Date(bill.created_at).toLocaleDateString('en-IN')}`, 140, 45);
  
  // Add customer info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', 20, 65);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Customer: ${bill.customer_name}`, 20, 70);
  
  // Add item table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, 80, 170, 10, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Item', 25, 86);
  pdf.text('Quantity', 90, 86);
  pdf.text('Price', 120, 86);
  pdf.text('Total', 160, 86);
  
  // Add item details
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.print_name, 25, 96);
  pdf.text(bill.quantity.toString(), 90, 96);
  pdf.text(`₹${bill.price_per_piece.toFixed(0)}`, 120, 96);
  pdf.text(`₹${bill.total_amount.toFixed(0)}`, 160, 96);
  
  // Add line
  pdf.setDrawColor(220, 220, 220);
  pdf.line(20, 105, 190, 105);
  
  // Add total
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount:', 130, 115);
  pdf.text(`₹${bill.total_amount.toFixed(0)}`, 160, 115);
  
  // Add logo if available
  if (logoUrl) {
    try {
      // First, we need to create an image element and load the logo
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = logoUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      const MAX_WIDTH = 50;  // max width in mm
      const MAX_HEIGHT = 30; // max height in mm
      
      // Calculate scaling to fit within MAX_WIDTH x MAX_HEIGHT while preserving aspect ratio
      const scale = Math.min(
        MAX_WIDTH / img.width,
        MAX_HEIGHT / img.height
      );
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw the image on the canvas
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get the image data as a data URL
      const imgData = canvas.toDataURL('image/png');
      
      // Add the image to the PDF
      pdf.addImage(
        imgData,
        'PNG',
        140, // x position (mm)
        55,  // y position (mm)
        canvas.width * 0.264583, // width in mm (convert from px to mm)
        canvas.height * 0.264583 // height in mm (convert from px to mm)
      );
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for your business!', 105, 280, { align: 'center' });
  
  return pdf;
}

export async function generateAndDownloadPDF(bill: Bill, logoUrl?: string) {
  const pdf = await generatePDF(bill, logoUrl);
  pdf.save(`invoice-${bill.id.substring(0, 8)}.pdf`);
  return pdf.output('blob');
}

export async function captureElementAsPNG(element: HTMLElement): Promise<string> {
  try {
    return await toPng(element, { quality: 0.95 });
  } catch (error) {
    console.error('Error capturing element as PNG:', error);
    throw error;
  }
}
