
import React, { useState } from 'react';
import { Sparkles, Wand2, ChevronRight } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';

interface GuidedForgeProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

interface ForgeStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const GuidedForge = ({ onGenerate, isGenerating }: GuidedForgeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [subject, setSubject] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const steps: ForgeStep[] = [
    {
      id: 'subject',
      title: 'Define Your Vision',
      description: 'What do you want to create?',
      completed: subject.length > 0,
    },
    {
      id: 'style',
      title: 'Choose Your Style',
      description: 'Select the artistic approach',
      completed: selectedStyle.length > 0,
    },
    {
      id: 'mood',
      title: 'Set the Mood',
      description: 'Define the emotional tone',
      completed: selectedMood.length > 0,
    },
    {
      id: 'synthesis',
      title: 'AI Synthesis',
      description: 'Let AI craft your perfect prompt',
      completed: selectedPrompt.length > 0,
    },
  ];

  const styles = [
    { id: 'photorealistic', name: 'Photorealistic', description: 'Lifelike, detailed imagery' },
    { id: 'digital-art', name: 'Digital Art', description: 'Modern digital painting style' },
    { id: 'fantasy', name: 'Fantasy', description: 'Magical, otherworldly aesthetics' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
    { id: 'oil-painting', name: 'Oil Painting', description: 'Classical painting techniques' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing paint effects' },
  ];

  const moods = [
    { id: 'serene', name: 'Serene', description: 'Peaceful and calming' },
    { id: 'dramatic', name: 'Dramatic', description: 'Bold and intense' },
    { id: 'mysterious', name: 'Mysterious', description: 'Enigmatic and intriguing' },
    { id: 'ethereal', name: 'Ethereal', description: 'Otherworldly and delicate' },
    { id: 'vibrant', name: 'Vibrant', description: 'Energetic and colorful' },
    { id: 'melancholic', name: 'Melancholic', description: 'Thoughtful and somber' },
  ];

  const synthesizePrompts = () => {
    // AI prompt synthesis simulation
    const basePrompt = `${subject}, ${selectedStyle} style, ${selectedMood} mood`;
    const variants = [
      `${basePrompt}, masterpiece, 8K UHD, highly detailed, professional lighting`,
      `${basePrompt}, cinematic composition, award-winning photography, ultra-realistic`,
      `${basePrompt}, artistic masterpiece, perfect composition, stunning visual impact`,
    ];
    setGeneratedPrompts(variants);
    setCurrentStep(3);
  };

  const handleForge = () => {
    if (selectedPrompt) {
      onGenerate(selectedPrompt, {
        style: selectedStyle,
        mood: selectedMood,
        steps: 30,
        guidance: 7.5,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <MuseForgeLiquidGlass variant="subtle" className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-all duration-300
                ${index <= currentStep
                  ? 'bg-gradient-to-r from-mf-primary-accent to-mf-secondary-accent text-mf-primary-bg'
                  : 'bg-white/10 text-mf-text-secondary'
                }
              `}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className={`
                  w-4 h-4 mx-2 transition-colors duration-300
                  ${index < currentStep ? 'text-mf-primary-accent' : 'text-mf-text-tertiary'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-semibold mf-text-gradient">
            {steps[currentStep]?.title}
          </h3>
          <p className="text-sm text-mf-text-secondary">
            {steps[currentStep]?.description}
          </p>
        </div>
      </MuseForgeLiquidGlass>

      {/* Step Content */}
      <MuseForgeLiquidGlass className="p-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-mf-text-primary">
              Describe what you want to create
            </label>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A mystical forest with glowing crystals..."
              className="w-full h-24 bg-white/5 border border-white/20 rounded-lg p-3 text-mf-text-primary placeholder:text-mf-text-tertiary resize-none mf-focus-ring"
            />
            <button
              onClick={() => setCurrentStep(1)}
              disabled={!subject.trim()}
              className="mf-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Style
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-mf-text-primary">
              Choose your artistic style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`
                    p-4 rounded-lg border text-left transition-all duration-300 mf-focus-ring
                    ${selectedStyle === style.id
                      ? 'border-mf-primary-accent bg-mf-primary-accent/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="font-medium text-mf-text-primary">{style.name}</div>
                  <div className="text-sm text-mf-text-secondary">{style.description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedStyle}
              className="mf-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Mood
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-mf-text-primary">
              Set the emotional tone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
                    p-4 rounded-lg border text-left transition-all duration-300 mf-focus-ring
                    ${selectedMood === mood.id
                      ? 'border-mf-primary-accent bg-mf-primary-accent/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="font-medium text-mf-text-primary">{mood.name}</div>
                  <div className="text-sm text-mf-text-secondary">{mood.description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={synthesizePrompts}
              disabled={!selectedMood}
              className="mf-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate AI Prompts
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-mf-text-primary">
              Choose your crafted prompt
            </label>
            <div className="space-y-3">
              {generatedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all duration-300 mf-focus-ring
                    ${selectedPrompt === prompt
                      ? 'border-mf-primary-accent bg-mf-primary-accent/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-sm text-mf-text-primary">{prompt}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </MuseForgeLiquidGlass>

      {/* Forge Ceremony */}
      {selectedPrompt && (
        <MuseForgeLiquidGlass variant="immersive" className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-mf-primary-accent to-mf-secondary-accent mb-4">
              <Wand2 className="w-8 h-8 text-mf-primary-bg" />
            </div>
            <h3 className="text-xl font-bold mf-text-ethereal">Ready to Forge Your Vision</h3>
            <p className="text-mf-text-secondary">Your creation awaits. Begin the forging ceremony.</p>
            <button
              onClick={handleForge}
              disabled={isGenerating}
              className="mf-button-primary px-8 py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-mf-primary-bg/30 border-t-mf-primary-bg rounded-full animate-spin mr-3" />
                  Forging...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  FORGE
                </>
              )}
            </button>
          </div>
        </MuseForgeLiquidGlass>
      )}
    </div>
  );
};
