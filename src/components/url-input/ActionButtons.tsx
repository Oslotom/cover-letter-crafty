import { MessageSquare, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  showViewButton: boolean;
  showCoverLetter: boolean;
  toggleCoverLetter: () => void;
  cvContent: string;
  jobContent: string;
  downloadPDF: () => void;
}

export const ActionButtons = ({
  showViewButton,
  showCoverLetter,
  toggleCoverLetter,
  cvContent,
  jobContent,
  downloadPDF,
}: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chat', { 
      state: { 
        cvContent, 
        jobContent 
      } 
    });
  };

  return showViewButton ? (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleCoverLetter}
          className="px-6 h-[64px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
        >
          {showCoverLetter ? 'Hide Cover Letter' : 'View Cover Letter'}
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleChatClick}
            className="px-6 h-[64px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with AI</span>
          </button>
          <button
            onClick={downloadPDF}
            className="px-6 h-[64px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
      {showCoverLetter && (
        <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
          <pre className="whitespace-pre-wrap font-sans">{cvContent}</pre>
        </div>
      )}
    </div>
  ) : null;
};