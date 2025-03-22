
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  console.log('Fetching bills from Supabase');
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
  
  return data as Bill[];
}

// Function to fetch a single bill by ID
export async function fetchBillById(id: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching bill:', error);
    throw new Error('Bill not found');
  }
  
  return data as Bill;
}

// Function to create a new bill
export async function createBill(bill: Omit<Bill, 'id' | 'created_at'>) {
  const newBill = {
    ...bill,
    created_at: new Date().toISOString(),
  };
  
  console.log('Creating new bill:', newBill);
  
  const { data, error } = await supabase
    .from('bills')
    .insert([newBill])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
  
  return data as Bill;
}

// Function to update an existing bill
export async function updateBill(id: string, bill: Partial<Bill>) {
  console.log('Updating bill:', id, bill);
  
  const { data, error } = await supabase
    .from('bills')
    .update(bill)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
  
  return data as Bill;
}

// Function to delete a bill
export async function deleteBill(id: string) {
  console.log('Deleting bill id:', id);
  
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
  
  return true;
}

// Function to upload a logo image
export async function uploadLogo(file: File, fileName: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `logos/${fileName}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
  
  console.log('Uploading logo:', filePath);
  
  const { data, error } = await supabase.storage
    .from('bill-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
  
  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('bill-assets')
    .getPublicUrl(data.path);
  
  return publicUrl;
}

// Function to upload a PDF
export async function uploadPDF(pdfBlob: Blob, fileName: string) {
  const filePath = `pdfs/${fileName}-${Math.random().toString(36).substring(2, 11)}.pdf`;
  
  console.log('Uploading PDF:', filePath);
  
  const { data, error } = await supabase.storage
    .from('bill-assets')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
  
  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('bill-assets')
    .getPublicUrl(data.path);
  
  return publicUrl;
}

// Function to search bills
export async function searchBills(searchTerm: string) {
  const term = searchTerm.toLowerCase();
  
  console.log('Searching bills with term:', term);
  
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .or(`customer_name.ilike.%${term}%,print_name.ilike.%${term}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching bills:', error);
    throw error;
  }
  
  return data as Bill[];
}
