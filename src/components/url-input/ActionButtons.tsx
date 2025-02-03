import { MessageSquare, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  showViewButton: boolean;
  showCoverLetter: boolean;
  toggleCoverLetter: () => void;
  cvContent: string;
  jobContent: string;
  downloadPDF: () => void;
  coverLetter: string | null;
}

export const ActionButtons = ({
  showViewButton,
  showCoverLetter,
  toggleCoverLetter,
  cvContent,
  jobContent,
  downloadPDF,
  coverLetter,
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
    <div className="flex flex-col w-full">
      <button
        onClick={toggleCoverLetter}
        className="px-6 h-[64px] bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
      >
        {showCoverLetter ? 'Hide Cover Letter' : 'View Cover Letter'}
      </button>
      
      {showCoverLetter && coverLetter && (
        <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleChatClick}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with AI</span>
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
        </div>
      )}
    </div>
  ) : null;
};