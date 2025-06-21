
import { z } from 'zod';

const API_BASE = import.meta.env.PROD 
  ? 'https://museforge-api.your-domain.workers.dev' 
  : 'http://localhost:8787';

// Generate a session ID for API Shield volumetric abuse detection
const SESSION_ID = crypto.randomUUID();

export class MuseForgeAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'MuseForgeAPIError';
  }
}

export interface GenerateParams {
  prompt: string;
  style: string;
  steps: number;
  guidance: number;
  width?: number;
  height?: number;
  seed?: number;
}

export interface AssistParams {
  type: 'prompt-enhance' | 'style-suggest' | 'parameter-optimize';
  input: string;
  context?: {
    currentStyle?: string;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

class MuseForgeAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new MuseForgeAPIError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  }

  async generateImage(params: GenerateParams): Promise<Blob> {
    console.log('🎨 Initiating generation:', params);
    
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new MuseForgeAPIError(
        errorData.error || `Generation failed: ${response.status}`,
        response.status
      );
    }

    return response.blob();
  }

  async getAssistance(params: AssistParams) {
    console.log('🤖 Requesting AI assistance:', params);
    
    return this.request('/api/assist', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new MuseForgeAPI();
