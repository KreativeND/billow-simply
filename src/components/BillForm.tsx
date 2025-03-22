
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Bill, uploadLogo } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FileUpload from './FileUpload';
import { useToast } from '@/hooks/use-toast';

// Define the form schema with Zod
const formSchema = z.object({
  customer_name: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  print_name: z.string().min(2, {
    message: "Print name must be at least 2 characters.",
  }),
  quantity: z.coerce
    .number()
    .int()
    .positive({
      message: "Quantity must be a positive integer",
    }),
  price_per_piece: z.coerce
    .number()
    .positive({
      message: "Price per piece must be a positive number",
    })
    .multipleOf(0.01, {
      message: "Price can have up to 2 decimal places",
    }),
});

type FormSchema = z.infer<typeof formSchema>;

interface BillFormProps {
  onSubmit: (bill: Partial<Bill>) => Promise<void>;
  initialData?: Bill;
  onCancel: () => void;
}

const BillForm: React.FC<BillFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
}) => {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(initialData?.logo_url);
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(initialData?.total_amount || 0);

  // Initialize the form
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || "",
      print_name: initialData?.print_name || "",
      quantity: initialData?.quantity || 1,
      price_per_piece: initialData?.price_per_piece || 0,
    },
  });

  // Watch for changes to calculate total
  const quantity = form.watch("quantity");
  const pricePerPiece = form.watch("price_per_piece");

  // Calculate total amount when quantity or price changes
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(pricePerPiece) || 0;
    const total = qty * price;
    setTotalAmount(parseFloat(total.toFixed(2)));
  }, [quantity, pricePerPiece]);

  const handleFileUpload = (file: File) => {
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const resetLogo = () => {
    setLogoFile(null);
    setLogoPreview(undefined);
  };

  const handleFormSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    try {
      let logoUrl = initialData?.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, `${data.customer_name}-${data.print_name}`);
      }

      // Submit the bill with all data
      await onSubmit({
        ...data,
        logo_url: logoUrl,
        total_amount: totalAmount,
      });

      toast({
        title: initialData ? "Bill Updated" : "Bill Created",
        description: initialData 
          ? "The bill has been successfully updated."
          : "The bill has been successfully created.",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-scale-in">
      <CardHeader>
        <CardTitle className="text-center">
          {initialData ? "Edit Bill" : "Create New Bill"}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <FormLabel>Logo Image</FormLabel>
              <FileUpload
                onFileUpload={handleFileUpload}
                previewUrl={logoPreview}
                onReset={resetLogo}
                accept="image/*"
                maxSize={2}
              />
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="print_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Print Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter print name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_piece"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Piece ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter price per piece"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Amount (Calculated) */}
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Total Amount</FormLabel>
                <span className="text-2xl font-medium">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : initialData ? "Update Bill" : "Create Bill"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default BillForm;
