import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckSquare } from "lucide-react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export const FileUpload = ({ onFileContent }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
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
      setIsUploaded(true);
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
      className={`p-2 border-2 border-dashed ${
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
        className="flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            {isUploaded ? (
              <>
                <CheckSquare className="h-4 w-4" />
                <span>Resume Uploaded</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Resume</span>
              </>
            )}
          </Button>
        )}
      </label>
    </Card>
  );
};