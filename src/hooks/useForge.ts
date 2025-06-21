
import { useState } from 'react';

interface ForgeParameters {
  style: string;
  steps: number;
  guidance: number;
}

export const useForge = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>();

  const generateImage = async (prompt: string, parameters: ForgeParameters) => {
    setIsGenerating(true);
    setCurrentImage(undefined);

    try {
      // Simulate API call to Cloudflare Workers AI
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, generate a placeholder image
      // In real implementation, this would call the Cloudflare Workers AI API
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(0.5, '#3B82F6');
        gradient.addColorStop(1, '#1E293B');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some artistic elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const radius = Math.random() * 20 + 5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add text overlay with prompt
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generated: ' + prompt.substring(0, 40) + '...', 256, 480);
      }
      
      const imageUrl = canvas.toDataURL('image/png');
      setCurrentImage(imageUrl);
      
      return {
        url: imageUrl,
        prompt,
        parameters,
      };
    } catch (error) {
      console.error('Generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImage,
    isGenerating,
    currentImage,
  };
};
