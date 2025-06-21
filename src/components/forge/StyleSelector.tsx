
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StyleSelectorProps {
  style: string;
  onStyleChange: (style: string) => void;
}

export const StyleSelector = ({ style, onStyleChange }: StyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">Art Style</label>
      <Select value={style} onValueChange={onStyleChange}>
        <SelectTrigger className="bg-white/5 border-white/20 text-white focus:ring-purple-500/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/20">
          <SelectItem value="photorealistic">📷 Photorealistic</SelectItem>
          <SelectItem value="digital-art">🎨 Digital Art</SelectItem>
          <SelectItem value="fantasy">🧙‍♂️ Fantasy</SelectItem>
          <SelectItem value="anime">🌸 Anime</SelectItem>
          <SelectItem value="oil-painting">🖼️ Oil Painting</SelectItem>
          <SelectItem value="watercolor">💧 Watercolor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
