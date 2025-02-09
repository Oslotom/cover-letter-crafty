
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export default function CoverLetter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch application details",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setApplication(data);
      setIsLoading(false);
    };

    fetchApplication();
  }, [id, navigate, toast]);

  const handleCoverLetterChange = async (newCoverLetter: string) => {
    if (!id) return;

    const { error } = await supabase
      .from('applications')
      .update({ cover_letter: newCoverLetter })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save cover letter",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Cover letter saved successfully",
    });
  };

  if (isLoading) {
    return <div className="container max-w-2xl mx-auto p-4">Loading...</div>;
  }

  if (!application) {
    return <div className="container max-w-2xl mx-auto p-4">Application not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto space-y-8 px-6 md:px-4 py-15">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">
            <span className="span-gradient-text">{application.job_title}</span>
          </h1>
          <p className="text-lg text-muted-foreground">Cover Letter</p>
          {application.job_url && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <a href={application.job_url} target="_blank" rel="noopener noreferrer" 
                className="hover:text-foreground transition-colors">
                {application.job_url}
              </a>
            </div>
          )}
        </div>

        <CoverLetterGenerator
          cvContent={application.cv_content}
          jobContent={application.job_description}
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          currentCoverLetter={application.cover_letter}
          onCoverLetterChange={handleCoverLetterChange}
          onDownload={() => {
            const element = document.createElement("a");
            const file = new Blob([application.cover_letter], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = "cover-letter.txt";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
        />
      </div>
    </div>
  );
}
