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
  const [showInput, setShowInput] = useState(true);

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
    setShowInput(false);
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
      setShowInput(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/plain' && selectedFile.type !== 'application/pdf') {
      setCurrentStep('Error: Please upload a PDF or text file');
      return;
    }

    setShowFileUpload(false);
    
    try {
      const text = await selectedFile.text();
      setCvContent(text.trim());
      
      await runStepSequence(fileSteps, () => {
        setShowViewButton(true);
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setCurrentStep('Error processing file');
      setShowFileUpload(true);
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
        {showInput ? (
          <>
            <input
              type="url"
              placeholder="Paste job posting URL"
              className="flex-1 bg-transparent outline-none"
              value={url}
              onChange={handleUrlChange}
            />
            {showLoad && (
              <button
                onClick={handleLoadClick}
                className="ml-4 px-6 h-[64px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
              >
                <span>✨ Load</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <StatusMessage
              currentStep={currentStep}
              showFileUpload={showFileUpload}
              showViewButton={showViewButton}
            />
            <div className="flex items-center space-x-2">
              {showFileUpload && (
                <FileUploadButton onFileChange={handleFileChange} />
              )}
              <ActionButtons
                showViewButton={showViewButton}
                showCoverLetter={showCoverLetter}
                toggleCoverLetter={toggleCoverLetter}
                cvContent={cvContent}
                jobContent={jobContent}
                downloadPDF={downloadPDF}
              />
            </div>
          </div>
        )}
      </div>
     
      {showCoverLetter && coverLetter && (
        <div className="mt-4 p-6 bg-white/10 rounded-lg text-white">
          <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
}