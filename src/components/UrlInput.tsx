import { useState } from 'react';
import { StatusMessage } from './url-input/StatusMessage';
import { FileUploadButton } from './url-input/FileUploadButton';
import { ActionButtons } from './url-input/ActionButtons';

interface UrlInputProps {
  onUrlContent: (content: string) => void;
}

export function UrlInput({ onUrlContent }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [showLoad, setShowLoad] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showViewButton, setShowViewButton] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [jobContent, setJobContent] = useState('');
  const [cvContent, setCvContent] = useState('');

  const urlSteps = [
    'Opening website...',
    'Analysing job description',
    'Analyze complete. You can now upload your Resume'
  ];

  const fileSteps = [
    'Uploading Resume',
    'Analyzing Resume',
    'Analyse complete',
    'Generating cover letter',
    'Your cover letter is complete'
  ];

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setShowLoad(e.target.value.trim() !== '');
  };

  const runStepSequence = async (steps: string[], finalAction?: () => void) => {
    for (const step of steps) {
      setCurrentStep(step);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    setCurrentStep(null);
    if (finalAction) finalAction();
  };

  const handleLoadClick = async () => {
    setShowLoad(false);
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) throw new Error('Failed to fetch URL content');
      
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      const scripts = doc.getElementsByTagName('script');
      const styles = doc.getElementsByTagName('style');
      [...scripts, ...styles].forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      
      setJobContent(cleanText);
      onUrlContent(cleanText);
      await runStepSequence(urlSteps, () => setShowFileUpload(true));
    } catch (error) {
      console.error('Error fetching URL:', error);
      setCurrentStep('Error fetching job description');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/plain' && selectedFile.type !== 'application/pdf') {
      setCurrentStep('Error: Please upload a PDF or text file');
      return;
    }

    try {
      const text = await selectedFile.text();
      setCvContent(text.trim());
      
      await runStepSequence(fileSteps, () => {
        setShowViewButton(true);
        // Generate cover letter here
        const generatedLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. Based on my experience and qualifications outlined in my resume, I believe I would be an excellent candidate for this role.

[Cover letter content would be generated here based on CV and job description]

Best regards,
[Your name]`;
        setCoverLetter(generatedLetter);
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setCurrentStep('Error processing file');
    }
  };

  const toggleCoverLetter = () => {
    setShowCoverLetter(!showCoverLetter);
  };

  const downloadPDF = async () => {
    if (!coverLetter) return;

    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative">
      <div className="max-h-[74px] w-full p-6 rounded-lg bg-white/10 text-white border border-white/20 min-h-[70px] flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 mr-4 relative">
            <input
              type="url"
              placeholder={currentStep || "Paste job posting URL"}
              className="w-full bg-transparent outline-none"
              value={currentStep ? '' : url}
              onChange={handleUrlChange}
              disabled={!!currentStep}
            />
            {currentStep && (
              <div className="absolute left-0 top-0 w-full">
                <StatusMessage
                  currentStep={currentStep}
                  showFileUpload={showFileUpload}
                  showViewButton={showViewButton}
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {showLoad && (
              <button
                onClick={handleLoadClick}
                className="px-6 h-[64px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>✨ Load</span>
              </button>
            )}
            {showFileUpload && (
              <FileUploadButton onFileChange={handleFileChange} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ActionButtons
          showViewButton={showViewButton}
          showCoverLetter={showCoverLetter}
          toggleCoverLetter={toggleCoverLetter}
          cvContent={cvContent}
          jobContent={jobContent}
          downloadPDF={downloadPDF}
          coverLetter={coverLetter}
        />
        {showCoverLetter && coverLetter && (
          <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
            <pre className="whitespace-pre-wrap font-serif">{coverLetter}</pre>
          </div>
        )}
      </div>
    </div>
  );
}