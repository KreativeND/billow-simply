
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

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

// Function to fetch all bills
export async function fetchBills() {
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
    throw error;
  }
  
  return data as Bill;
}

// Function to create a new bill
export async function createBill(bill: Omit<Bill, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('bills')
    .insert([{
      ...bill,
      created_at: new Date().toISOString(),
    }])
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
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(`${fileName}-${Date.now()}`, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
  
  // Get the public URL for the uploaded file
  const { data: publicURL } = supabase.storage
    .from('logos')
    .getPublicUrl(data.path);
  
  return publicURL.publicUrl;
}

// Function to upload a PDF
export async function uploadPDF(pdfBlob: Blob, fileName: string) {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(`${fileName}-${Date.now()}.pdf`, pdfBlob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
  
  // Get the public URL for the uploaded file
  const { data: publicURL } = supabase.storage
    .from('pdfs')
    .getPublicUrl(data.path);
  
  return publicURL.publicUrl;
}

// Function to search bills
export async function searchBills(searchTerm: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .or(`customer_name.ilike.%${searchTerm}%,print_name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching bills:', error);
    throw error;
  }
  
  return data as Bill[];
}
