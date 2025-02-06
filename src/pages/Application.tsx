import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CoverLetterGenerator } from "@/components/CoverLetterGenerator";

interface Application {
  id: string;
  job_title: string;
  job_url: string;
  job_description: string;
  cover_letter: string;
  cv_content: string;
}

export default function Application() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchApplication(id);
  }, [id]);

  const fetchApplication = async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      });
    }
  };

  const handleCoverLetterChange = async (text: string) => {
    if (!application?.id) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update({ cover_letter: text })
        .eq('id', application.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!application?.cover_letter) return;
    
    const element = document.createElement("a");
    const file = new Blob([application.cover_letter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${application.job_title || 'untitled'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!application) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/applications')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{application.job_title || 'Untitled Position'}</h1>
        </div>
      </div>

      {application.job_url && (
        <div className="mb-8">
          <a 
            href={application.job_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Job Posting
          </a>
        </div>
      )}

      <CoverLetterGenerator
        cvContent={application.cv_content}
        jobContent={application.job_description}
        currentCoverLetter={application.cover_letter}
        isEditing={isEditing}
        onEdit={() => setIsEditing(!isEditing)}
        onDownload={handleDownload}
        onCoverLetterChange={handleCoverLetterChange}
      />
    </div>
  );
}