
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobInfo {
  title: string;
  company: string;
  deadline: string;
}

interface LocationState {
  jobContent: string;
  jobInfo: JobInfo;
  sourceUrl: string;
}

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { jobContent, jobInfo, sourceUrl } = (location.state as LocationState) || { 
    jobContent: '', 
    jobInfo: { 
      title: 'Job Position',
      company: 'Company',
      deadline: 'Not specified'
    },
    sourceUrl: ''
  };

  const handleGenerateCoverLetter = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate a cover letter.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('resume_content')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (!profile?.resume_content) {
        toast({
          title: "Resume Required",
          description: "Please upload your resume in your profile first.",
          variant: "destructive",
        });
        
        // Add a delay before navigation to ensure the toast is visible
        setTimeout(() => {
          navigate('/profile', { 
            state: { 
              returnTo: '/job-details',
              returnState: location.state
            }
          });
        }, 1500);
        return;
      }

      navigate('/job-processor', { 
        state: { 
          jobContent,
          sourceUrl,
          cvContent: profile.resume_content,
          shouldGenerateOnMount: true
        }
      });
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/add">
            <Button variant="outline">
              Back to Add Job
            </Button>
          </Link>
        </div>

        <div className="space-y-6 bg-background p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{jobInfo.title}</h1>
              <div className="flex items-center text-muted-foreground">
                <span>{jobInfo.company}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img
                src={`https://logo.clearbit.com/${jobInfo.company.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}.com`}
                alt={`${jobInfo.company} logo`}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
          

            <div className="flex justify-between items-center pt-6">
              <Button
                onClick={handleGenerateCoverLetter}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
              >
                <FileText className="w-4 h-4 mr-2" />
                Write Cover Letter
              </Button>

              {sourceUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(sourceUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
