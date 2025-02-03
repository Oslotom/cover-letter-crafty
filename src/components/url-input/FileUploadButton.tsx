import { FileText } from "lucide-react";

interface FileUploadButtonProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadButton = ({ onFileChange }: FileUploadButtonProps) => {
  return (
    <div>
      <input
        type="file"
        onChange={onFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.txt"
      />
      <label
        htmlFor="file-upload"
        className="px-6 h-[64px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition cursor-pointer flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>Upload Resume (PDF/TXT)</span>
      </label>
    </div>
  );
};