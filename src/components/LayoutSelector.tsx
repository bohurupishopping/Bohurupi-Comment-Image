import React from 'react';
import { Layout } from 'lucide-react';

interface LayoutSelectorProps {
  onSelect: (layout: string) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Layout</label>
      <div className="relative">
        <select
          onChange={(e) => onSelect(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          <option value="default">Default</option>
          <option value="minimal">Modern Style</option>
          <option value="modern">Standard Style</option>
          <option value="vintage">Vintage Style</option>
          <option value="social">Youtube Style</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <Layout className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default LayoutSelector;