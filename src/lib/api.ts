
export interface GenerateParams {
  prompt: string;
  negativePrompt?: string;
  style: string;
  steps: number;
  guidance: number;
  width?: number;
  height?: number;
  seed?: number;
  strength?: number;
}

export interface AssistParams {
  type: 'prompt_enhance' | 'style_suggest' | 'creative_expand';
  input: string;
  context?: any;
}

class MuseForgeAPI {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = '/api';
    this.sessionId = crypto.randomUUID();
  }

  async generateImage(params: GenerateParams): Promise<Blob> {
    const formData = new FormData();
    
    const payload = {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || '',
      style: params.style,
      steps: params.steps,
      guidance_scale: params.guidance,
      width: params.width || 512,
      height: params.height || 512,
      seed: params.seed,
      strength: params.strength,
    };

    formData.append('payload', JSON.stringify(payload));

    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'X-Session-ID': this.sessionId,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Generation failed: ${errorText}`);
    }

    return await response.blob();
  }

  async getAssistance(params: AssistParams): Promise<any> {
    const response = await fetch(`${this.baseUrl}/assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': this.sessionId,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Assistance failed: ${errorText}`);
    }

    return await response.json();
  }
}

export const api = new MuseForgeAPI();
