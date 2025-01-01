import React from 'react';
import { Upload } from 'lucide-react';

interface BackgroundUploaderProps {
  onUpload: (file: string) => void;
}

const BackgroundUploader: React.FC<BackgroundUploaderProps> = ({ onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Background</label>
      <label className="flex items-center justify-center w-full h-12 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <span className="flex items-center space-x-2">
          <Upload className="w-6 h-6 text-gray-600" />
          <span className="font-medium text-gray-600">Choose a file</span>
        </span>
        <input type="file" name="file_upload" className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
    </div>
  );
};

export default BackgroundUploader;
