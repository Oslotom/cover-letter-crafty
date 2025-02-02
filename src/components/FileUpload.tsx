import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export const FileUpload = ({ onFileContent }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      onFileContent(text.trim());
      toast({
        title: "Success",
        description: "CV uploaded successfully",
      });
    } catch (error) {
      console.error('Error processing text file:', error);
      toast({
        title: "Error",
        description: "Failed to process text file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Card
      className={`p-6 border-2 border-dashed ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      } rounded-lg cursor-pointer transition-colors`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        type="file"
        accept=".txt"
        className="hidden"
        id="file-upload"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your CV text file here or click to browse
            </p>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        )}
      </label>
    </Card>
  );
};