import React from 'react';
import { CommentData } from '../utils/youtubeApi';

interface CommentSelectorProps {
  comments: CommentData[];
  onSelect: (comment: CommentData) => void;
}

const CommentSelector: React.FC<CommentSelectorProps> = ({ comments, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Select a Comment</label>
      <select
        onChange={(e) => onSelect(comments[parseInt(e.target.value)])}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a comment</option>
        {comments.map((comment, index) => (
          <option key={index} value={index}>
            {comment.text.substring(0, 50)}...
          </option>
        ))}
      </select>
    </div>
  );
};

export default CommentSelector;
