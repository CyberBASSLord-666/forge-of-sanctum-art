
import { z } from 'zod';

// Enhanced API configuration
const API_CONFIG = {
  baseUrl: import.meta.env.PROD 
    ? 'https://museforge-api.your-domain.workers.dev' 
    : 'http://localhost:8787',
  timeout: 60000, // 60 seconds for AI generation
  retryAttempts: 3,
  retryDelay: 1000,
};

// Generate session ID for API Shield volumetric abuse detection
const SESSION_ID = crypto.randomUUID();

// Enhanced error classes
export class MuseForgeAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MuseForgeAPIError';
  }
}

export class MuseForgeValidationError extends MuseForgeAPIError {
  constructor(message: string, public validationErrors: z.ZodError) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'MuseForgeValidationError';
  }
}

export class MuseForgeRateLimitError extends MuseForgeAPIError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'MuseForgeRateLimitError';
  }
}

// Enhanced schemas
export const GenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  style: z.string(),
  steps: z.number().int().min(1).max(50),
  guidance: z.number().min(0).max(30),
  width: z.number().int().min(256).max(2048).optional().default(512),
  height: z.number().int().min(256).max(2048).optional().default(512),
  seed: z.number().int().optional(),
  negativePrompt: z.string().optional(),
  strength: z.number().min(0).max(1).optional(),
});

export const AssistRequestSchema = z.object({
  type: z.enum(['prompt-enhance', 'style-suggest', 'parameter-optimize']),
  input: z.string().min(1),
  context: z.object({
    currentStyle: z.string().optional(),
    userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    previousPrompts: z.array(z.string()).optional(),
  }).optional(),
});

export type GenerateParams = z.infer<typeof GenerateRequestSchema>;
export type AssistParams = z.infer<typeof AssistRequestSchema>;

export interface AssistanceResponse {
  enhanced: string;
  suggestions?: string[];
  optimizations?: {
    recommendedSteps?: number;
    recommendedGuidance?: number;
    styleRecommendations?: string[];
  };
  confidence: number;
}

export interface GenerationMetadata {
  requestId: string;
  processingTime: number;
  modelUsed: string;
  cost?: number;
}

export interface GenerationResult {
  blob: Blob;
  metadata: GenerationMetadata;
}

class MuseForgeAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'X-Session-ID': SESSION_ID,
          'X-Request-ID': crypto.randomUUID(),
          'X-Client-Version': '1.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          throw new MuseForgeRateLimitError(
            errorData.error || 'Rate limit exceeded',
            retryAfter
          );
        }
        
        throw new MuseForgeAPIError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData.code,
          errorData.context
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof MuseForgeAPIError) {
        throw error;
      }
      
      // Retry on network errors
      if (retryCount < API_CONFIG.retryAttempts && 
          (error instanceof TypeError || error.name === 'AbortError')) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1))
        );
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      throw new MuseForgeAPIError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async generateImage(params: GenerateParams): Promise<GenerationResult> {
    console.log('🎨 Initiating generation with enhanced parameters:', params);
    
    // Validate parameters client-side
    const validatedParams = GenerateRequestSchema.parse(params);
    
    const formData = new FormData();
    formData.append('payload', JSON.stringify(validatedParams));
    
    const response = await fetch(`${API_CONFIG.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'X-Session-ID': SESSION_ID,
        'X-Request-ID': crypto.randomUUID(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new MuseForgeAPIError(
        errorData.error || `Generation failed: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const blob = await response.blob();
    const metadata: GenerationMetadata = {
      requestId: response.headers.get('X-Request-ID') || crypto.randomUUID(),
      processingTime: parseInt(response.headers.get('X-Processing-Time') || '0'),
      modelUsed: response.headers.get('X-Model-Used') || 'unknown',
      cost: parseFloat(response.headers.get('X-Cost') || '0') || undefined,
    };

    return { blob, metadata };
  }

  async getAssistance(params: AssistParams): Promise<AssistanceResponse> {
    console.log('🤖 Requesting enhanced AI assistance:', params);
    
    // Validate parameters client-side
    const validatedParams = AssistRequestSchema.parse(params);
    
    return this.request<AssistanceResponse>('/api/assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedParams),
    });
  }

  async healthCheck(): Promise<{ status: string; version: string; uptime: number }> {
    return this.request<{ status: string; version: string; uptime: number }>('/api/health');
  }
}

export const museForgeAPI = new MuseForgeAPI();
