
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchBills, 
  Bill, 
  createBill, 
  updateBill, 
  deleteBill,
  searchBills,
  uploadPDF
} from '@/lib/supabase';
import { generateAndDownloadPDF } from '@/lib/pdfGenerator';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BillList from '@/components/BillList';
import BillForm from '@/components/BillForm';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const BillingApp = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  // Fetch bills with React Query
  const { 
    data: bills, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['bills', searchQuery],
    queryFn: () => searchQuery 
      ? searchBills(searchQuery)
      : fetchBills(),
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newBill: Partial<Bill>) => {
      try {
        const createdBill = await createBill(newBill as Omit<Bill, 'id' | 'created_at'>);
        
        // Generate PDF and upload to Supabase
        if (createdBill) {
          try {
            const pdfBlob = await generateAndDownloadPDF(createdBill, createdBill.logo_url);
            const pdfUrl = await uploadPDF(pdfBlob, `bill-${createdBill.id}`);
            
            // Update the bill with the PDF URL
            await updateBill(createdBill.id, { pdf_url: pdfUrl });
            return { ...createdBill, pdf_url: pdfUrl };
          } catch (error) {
            console.error("Error generating/uploading PDF:", error);
            return createdBill;
          }
        }
        
        return createdBill;
      } catch (error) {
        console.error("Error in createMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsFormOpen(false);
      toast({
        title: "Bill Created",
        description: "The bill has been successfully created.",
      });
    },
    onError: (error) => {
      console.error("Error creating bill:", error);
      toast({
        title: "Error Creating Bill",
        description: "There was an error creating the bill. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({id, bill}: {id: string, bill: Partial<Bill>}) => {
      const updatedBill = await updateBill(id, bill);
      
      // Regenerate PDF if needed
      if (updatedBill && (bill.logo_url !== undefined || bill.quantity !== undefined || bill.price_per_piece !== undefined)) {
        try {
          const pdfBlob = await generateAndDownloadPDF(updatedBill, updatedBill.logo_url);
          const pdfUrl = await uploadPDF(pdfBlob, `bill-${updatedBill.id}`);
          
          // Update the bill with the new PDF URL
          return await updateBill(updatedBill.id, { pdf_url: pdfUrl });
        } catch (error) {
          console.error("Error regenerating PDF:", error);
          return updatedBill;
        }
      }
      
      return updatedBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsFormOpen(false);
      setSelectedBill(null);
    },
    onError: (error) => {
      console.error("Error updating bill:", error);
      toast({
        title: "Error Updating Bill",
        description: "There was an error updating the bill. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Bill Deleted",
        description: "The bill has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Error deleting bill:", error);
      toast({
        title: "Error Deleting Bill",
        description: "There was an error deleting the bill. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleAddNew = () => {
    setSelectedBill(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setIsFormOpen(true);
  };
  
  const handleDelete = (bill: Bill) => {
    setSelectedBill(bill);
    setIsDeleteDialogOpen(true);
  };
  
  const handleFormSubmit = async (formData: Partial<Bill>) => {
    if (selectedBill) {
      // Update existing bill
      await updateMutation.mutate({ id: selectedBill.id, bill: formData });
    } else {
      // Create new bill
      await createMutation.mutate(formData);
    }
  };
  
  const handleConfirmDelete = () => {
    if (selectedBill) {
      deleteMutation.mutate(selectedBill.id);
    }
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  // Display error if any
  useEffect(() => {
    if (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Error Loading Bills",
        description: "There was an error loading your bills. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 px-4 md:px-6 space-y-8 max-w-7xl">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-medium sm:hidden">Bills</h1>
          
          <div className="w-full sm:w-auto max-w-lg">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search by customer or print name..." 
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button 
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="h-9 w-9"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleAddNew} 
              className="h-9 px-4 gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Bill</span>
            </Button>
          </div>
        </div>
        
        {/* Bills List */}
        <BillList
          bills={bills || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
      
      {/* Bill Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl p-0">
          <BillForm
            onSubmit={handleFormSubmit}
            initialData={selectedBill || undefined}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default BillingApp;
