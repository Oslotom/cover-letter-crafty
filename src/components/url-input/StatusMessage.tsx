import { Loader2 } from "lucide-react";

interface StatusMessageProps {
  currentStep: string | null;
  showFileUpload: boolean;
  showViewButton: boolean;
}

export const StatusMessage = ({ currentStep, showFileUpload, showViewButton }: StatusMessageProps) => {
  if (currentStep) {
    return (
      <div className="flex items-center space-x-3">
        <Loader2 className="animate-spin" />
        <span className="text-white">{currentStep}</span>
      </div>
    );
  }

  if (showFileUpload) {
    return <span className="text-white">Upload your resume as PDF or text file</span>;
  }

  if (showViewButton) {
    return <span className="text-white">Click to show your cover letter</span>;
  }

  return null;
};