
import React from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "flex items-center px-6 h-16 bg-background/90 backdrop-blur-sm border-b sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-medium text-foreground/90">Billing Manager</h1>
      </div>
    </header>
  );
};

export default Header;
