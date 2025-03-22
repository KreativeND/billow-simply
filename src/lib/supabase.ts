
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial mock data for bills
const initialMockBills: Bill[] = [
  {
    id: '1',
    logo_url: 'https://via.placeholder.com/150',
    customer_name: 'Acme Corp',
    print_name: 'Logo Design 1',
    quantity: 100,
    price_per_piece: 250,
    total_amount: 25000,
    pdf_url: 'https://example.com/sample.pdf',
    created_at: new Date(2023, 5, 15).toISOString(),
  },
  {
    id: '2',
    logo_url: 'https://via.placeholder.com/150',
    customer_name: 'TechStart',
    print_name: 'Startup Logo',
    quantity: 50,
    price_per_piece: 300,
    total_amount: 15000,
    pdf_url: 'https://example.com/sample2.pdf',
    created_at: new Date(2023, 6, 20).toISOString(),
  },
  {
    id: '3',
    customer_name: 'Green Leaf',
    print_name: 'Eco Friendly Design',
    quantity: 200,
    price_per_piece: 175,
    total_amount: 35000,
    created_at: new Date(2023, 7, 5).toISOString(),
  }
];

// Get mock data from localStorage or use initial data
const getStoredMockBills = (): Bill[] => {
  try {
    const storedBills = localStorage.getItem('mockBills');
    return storedBills ? JSON.parse(storedBills) : initialMockBills;
  } catch (error) {
    console.error('Error retrieving bills from localStorage:', error);
    return initialMockBills;
  }
};

// Save mock data to localStorage
const saveStoredMockBills = (bills: Bill[]): void => {
  try {
    localStorage.setItem('mockBills', JSON.stringify(bills));
  } catch (error) {
    console.error('Error saving bills to localStorage:', error);
  }
};

// Get bills from storage on initial load
let mockBills: Bill[] = getStoredMockBills();

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

// Currency format helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to fetch all bills
export async function fetchBills() {
  // Return mock data
  console.log('Fetching mock bills');
  return [...getStoredMockBills()]; // Get fresh data from storage
}

// Function to fetch a single bill by ID
export async function fetchBillById(id: string) {
  const bills = getStoredMockBills();
  const bill = bills.find(b => b.id === id);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  return {...bill}; // Return a copy to prevent accidental mutation
}

// Function to create a new bill
export async function createBill(bill: Omit<Bill, 'id' | 'created_at'>) {
  const bills = getStoredMockBills();
  
  const newBill: Bill = {
    ...bill,
    id: Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
  };
  
  console.log('Creating new bill:', newBill);
  bills.unshift(newBill);
  
  // Update both in-memory and localStorage
  mockBills = bills;
  saveStoredMockBills(bills);
  
  return {...newBill}; // Return a copy to prevent accidental mutation
}

// Function to update an existing bill
export async function updateBill(id: string, bill: Partial<Bill>) {
  const bills = getStoredMockBills();
  const index = bills.findIndex(b => b.id === id);
  
  if (index === -1) {
    throw new Error('Bill not found');
  }
  
  bills[index] = {
    ...bills[index],
    ...bill
  };
  
  console.log('Updated bill:', bills[index]);
  
  // Update both in-memory and localStorage
  mockBills = bills;
  saveStoredMockBills(bills);
  
  return {...bills[index]}; // Return a copy to prevent accidental mutation
}

// Function to delete a bill
export async function deleteBill(id: string) {
  const bills = getStoredMockBills();
  const index = bills.findIndex(b => b.id === id);
  
  if (index === -1) {
    throw new Error('Bill not found');
  }
  
  console.log('Deleting bill id:', id);
  bills.splice(index, 1);
  
  // Update both in-memory and localStorage
  mockBills = bills;
  saveStoredMockBills(bills);
  
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
  const bills = getStoredMockBills();
  const term = searchTerm.toLowerCase();
  
  return bills.filter(
    bill => 
      bill.customer_name.toLowerCase().includes(term) || 
      bill.print_name.toLowerCase().includes(term)
  ).map(bill => ({...bill})); // Return copies to prevent accidental mutation
}
