
import React from 'react';
import { Bill } from '@/lib/supabase';
import BillCard from './BillCard';
import { InboxIcon } from 'lucide-react';

interface BillListProps {
  bills: Bill[];
  isLoading: boolean;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

const BillList: React.FC<BillListProps> = ({
  bills,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-background border rounded-lg h-44 animate-pulse opacity-50"
          />
        ))}
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-secondary/50 p-4 rounded-full mb-4">
          <InboxIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No bills found</h3>
        <p className="text-muted-foreground max-w-sm">
          Create your first bill by clicking the "Add New Bill" button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          onEdit={onEdit}
          onDelete={onDelete}
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${bills.indexOf(bill) * 50}ms`, animationFillMode: 'forwards' }}
        />
      ))}
    </div>
  );
};

export default BillList;
