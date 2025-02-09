import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { HfInference } from '@huggingface/inference';
import { Wand2, Save } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { AIEditSection } from '@/components/job-processor/AIEditSection';
import { JobHeader } from '@/components/job-processor/JobHeader';

interface LocationState {
  jobContent: string;
  sourceUrl?: string;
  cvContent?: string;
  shouldGenerateOnMount?: boolean;
  applicationId?: string;
  currentCoverLetter?: string;
}

const JobProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingWithAI, setIsEditingWithAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { 
    jobContent, 
    sourceUrl, 
    cvContent, 
    shouldGenerateOnMount, 
    applicationId,
    currentCoverLetter: initialCoverLetter 
  } = (location.state as LocationState) || {};
  const [currentCoverLetter, setCurrentCoverLetter] = useState(initialCoverLetter || '');
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    if (!jobContent || !cvContent) {
      navigate('/');
      return;
    }
  }, [jobContent, navigate, cvContent]);

  const saveApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save applications",
          variant: "destructive",
        });
        return;
      }

      if (applicationId) {
        const { error } = await supabase
          .from('applications')
          .update({
            job_description: jobContent,
            cv_content: cvContent,
            cover_letter: currentCoverLetter,
            job_url: sourceUrl,
            job_title: jobTitle,
          })
          .eq('id', applicationId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Application updated successfully",
        });

        navigate('/dashboard');
      } else {
        const { data, error } = await supabase
          .from('applications')
          .insert([
            {
              job_description: jobContent,
              cv_content: cvContent,
              cover_letter: currentCoverLetter,
              job_url: sourceUrl,
              job_title: jobTitle,
              user_id: user.id,
              status: 'Wishlist'
            }
          ])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Application saved successfully",
        });

        if (data?.id) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: "Error",
        description: "Failed to save application",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto space-y-8 px-6 md:px-4 py-15">
        <JobHeader jobTitle="Cover Letter" sourceUrl={sourceUrl} />

        <div className="space-y-4">
          <div className="flex justify-end max-w-2xl mx-auto gap-2">
            
            <Button
              variant="default"
              size="sm"
              onClick={saveApplication}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {applicationId ? 'Update' : 'Save'}
            </Button>
          </div>

          <AIEditSection
            isEditing={isEditingWithAI}
            aiPrompt={aiPrompt}
            currentCoverLetter={currentCoverLetter}
            onPromptChange={setAiPrompt}
            onCoverLetterChange={setCurrentCoverLetter}
            onEditingChange={setIsEditingWithAI}
          />

          <CoverLetterGenerator
            cvContent={cvContent}
            jobContent={jobContent}
            isEditing={isEditing}
            onEdit={() => setIsEditing(!isEditing)}
            onCoverLetterChange={setCurrentCoverLetter}
            currentCoverLetter={currentCoverLetter}
            onDownload={() => {
              const element = document.createElement("a");
              const file = new Blob([currentCoverLetter], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = "cover-letter.txt";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            autoGenerate={shouldGenerateOnMount}
          />
        </div>
      </div>
    </div>
  );
};

export default JobProcessor;
