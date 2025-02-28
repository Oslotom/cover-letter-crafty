import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from '@/components/FileUpload';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, User, Trash2, Loader2, Calendar, Download, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  resume_content?: string | null;
  resume_file_name?: string | null;
  resume_file_url?: string | null;
  upload_date?: string | null;
  file_size?: number | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
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
        .select('resume_content, resume_file_name, resume_file_url, upload_date, file_size')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setShowUpload(!data?.resume_file_name);
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

  const handleResumeContent = async (content: string, fileName: string, fileUrl: string) => {
    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload your resume.",
          variant: "destructive",
        });
        return;
      }

      // Get file size from URL
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const fileSize = blob.size;

      // If there's an existing resume, delete it from storage
      if (profile?.resume_file_name) {
        const oldFileName = `${profile.resume_file_name}`;
        await supabase.storage
          .from('pdfs')
          .remove([oldFileName]);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          resume_content: content,
          resume_file_name: fileName,
          resume_file_url: fileUrl,
          upload_date: new Date().toISOString(),
          file_size: fileSize
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Fetch updated profile data
      await fetchProfile();
      setShowUpload(false);
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({
        title: "Error",
        description: "Failed to update resume. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by FileUpload component
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (profile?.resume_file_name) {
        const { error: storageError } = await supabase.storage
          .from('pdfs')
          .remove([profile.resume_file_name]);

        if (storageError) throw storageError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_content: null,
          resume_file_name: null,
          resume_file_url: null,
          upload_date: null,
          file_size: null
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Fetch updated profile data instead of updating state directly
      await fetchProfile();
      setShowUpload(true);
      
      toast({
        title: "Success",
        description: "Resume deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: "Failed to delete resume.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
            </div>

            {profile?.resume_file_name && !showUpload ? (
              <div className="space-y-6">
                {/* Resume Details */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">{profile.resume_file_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(profile.upload_date)}
                          </span>
                          <span>{formatFileSize(profile.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {profile.resume_file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(profile.resume_file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpload(true)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Replace
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your resume? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteResume}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Resume Preview */}
                  {profile.resume_content && (
                    <Card className="p-4 bg-muted/50">
                      <h3 className="font-medium mb-2">Resume Preview</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {profile.resume_content.slice(0, 500)}...
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileUpload
                  onFileContent={handleResumeContent}
                  contentType="cv"
                  showSuccessInButton={true}
                  isUploading={isUploading}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
