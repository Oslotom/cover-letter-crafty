
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from '@/components/FileUpload';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, User } from "lucide-react";

interface ProfileData {
  resume_content?: string | null;
  resume_file_name?: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your profile.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('resume_content, resume_file_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeContent = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ resume_content: content })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, resume_content: content }));
      toast({
        title: "Success",
        description: "Resume uploaded successfully!",
      });

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({
        title: "Error",
        description: "Failed to update resume.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your resume and profile information</p>
            </div>
          </div>

          {/* Resume Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Resume</h2>
                <p className="text-muted-foreground">
                  Upload your resume to use for generating cover letters
                </p>
              </div>
              {profile?.resume_content && (
                <div className="flex items-center text-muted-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Resume uploaded</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <FileUpload
                onFileContent={handleResumeContent}
                contentType="cv"
                showSuccessInButton={true}
              />

              {profile?.resume_content && (
                <Card className="p-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Resume Preview</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {profile.resume_content.slice(0, 500)}...
                  </p>
                </Card>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
