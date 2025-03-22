
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  previewUrl?: string;
  onReset?: () => void;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  previewUrl,
  onReset,
  accept = 'image/*',
  maxSize = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  };

  const validateAndUploadFile = (file: File) => {
    // Reset error
    setError(null);

    // Check file type
    if (!file.type.match(accept.replace('*', ''))) {
      setError(`Please upload a valid ${accept.replace('*', '')} file`);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`);
      return;
    }

    // All validation passed
    onFileUpload(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden animate-fade-in">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleReset}
              className="h-8 w-8 rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer animate-fade-in",
            isDragging ? "border-primary bg-secondary/50" : "border-border hover:border-muted-foreground/50 hover:bg-secondary/20",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            ref={inputRef}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-medium text-foreground">
              Drag & drop or click to upload
            </h3>
            <p className="text-sm text-muted-foreground">
              {accept.includes('image') ? 'Upload a logo image' : 'Upload a file'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: {maxSize}MB
            </p>
          </div>
        </div>
      )}
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;
