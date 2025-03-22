
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock data for bills
const mockBills: Bill[] = [
  {
    id: '1',
    logo_url: 'https://via.placeholder.com/150',
    customer_name: 'Acme Corp',
    print_name: 'Logo Design 1',
    quantity: 100,
    price_per_piece: 2.5,
    total_amount: 250,
    pdf_url: 'https://example.com/sample.pdf',
    created_at: new Date(2023, 5, 15).toISOString(),
  },
  {
    id: '2',
    logo_url: 'https://via.placeholder.com/150',
    customer_name: 'TechStart',
    print_name: 'Startup Logo',
    quantity: 50,
    price_per_piece: 3.0,
    total_amount: 150,
    pdf_url: 'https://example.com/sample2.pdf',
    created_at: new Date(2023, 6, 20).toISOString(),
  },
  {
    id: '3',
    customer_name: 'Green Leaf',
    print_name: 'Eco Friendly Design',
    quantity: 200,
    price_per_piece: 1.75,
    total_amount: 350,
    created_at: new Date(2023, 7, 5).toISOString(),
  }
];

// Type definitions for our bill
export type Bill = {
  id: string;
  logo_url?: string;
  customer_name: string;
  print_name: string;
  quantity: number;
  price_per_piece: number;
  total_amount: number;
  pdf_url?: string;
  created_at: string;
};

// Function to fetch all bills
export async function fetchBills() {
  // Return mock data instead of fetching from Supabase
  console.log('Fetching mock bills');
  return mockBills;
}

// Function to fetch a single bill by ID
export async function fetchBillById(id: string) {
  const bill = mockBills.find(b => b.id === id);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  return bill;
}

// Function to create a new bill
export async function createBill(bill: Omit<Bill, 'id' | 'created_at'>) {
  const newBill: Bill = {
    ...bill,
    id: Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
  };
  
  console.log('Creating new bill:', newBill);
  mockBills.unshift(newBill);
  
  return newBill;
}

// Function to update an existing bill
export async function updateBill(id: string, bill: Partial<Bill>) {
  const index = mockBills.findIndex(b => b.id === id);
  
  if (index === -1) {
    throw new Error('Bill not found');
  }
  
  mockBills[index] = {
    ...mockBills[index],
    ...bill
  };
  
  return mockBills[index];
}

// Function to delete a bill
export async function deleteBill(id: string) {
  const index = mockBills.findIndex(b => b.id === id);
  
  if (index === -1) {
    throw new Error('Bill not found');
  }
  
  mockBills.splice(index, 1);
  
  return true;
}

// Function to upload a logo image
export async function uploadLogo(file: File, fileName: string) {
  console.log('Mock uploading logo:', fileName);
  // Create a mock URL - in a real app this would be a Supabase storage URL
  return URL.createObjectURL(file);
}

// Function to upload a PDF
export async function uploadPDF(pdfBlob: Blob, fileName: string) {
  console.log('Mock uploading PDF:', fileName);
  // Create a mock URL - in a real app this would be a Supabase storage URL
  return URL.createObjectURL(pdfBlob);
}

// Function to search bills
export async function searchBills(searchTerm: string) {
  const term = searchTerm.toLowerCase();
  return mockBills.filter(
    bill => 
      bill.customer_name.toLowerCase().includes(term) || 
      bill.print_name.toLowerCase().includes(term)
  );
}
