import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export const FileUpload = ({ onFileContent }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorker;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      onFileContent(fullText.trim());
      toast({
        title: "Success",
        description: "CV uploaded successfully",
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to process PDF file",
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
        accept=".pdf"
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
              Drag and drop your CV here or click to browse
            </p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
          </div>
        )}
      </label>
    </Card>
  );
};