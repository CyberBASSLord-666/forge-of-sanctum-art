
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

// CORS configuration for MuseForge
app.use('*', cors({
  origin: ['https://museforge.lovable.app', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'X-Session-ID'],
  allowMethods: ['POST', 'OPTIONS'],
}));

// Request schemas
const GenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.enum(['photorealistic', 'digital-art', 'fantasy', 'anime', 'oil-painting', 'watercolor']),
  steps: z.number().min(10).max(50).default(30),
  guidance: z.number().min(1).max(20).default(7.5),
  width: z.number().default(512),
  height: z.number().default(512),
  seed: z.number().optional(),
});

const AssistRequestSchema = z.object({
  type: z.enum(['prompt-enhance', 'style-suggest', 'parameter-optimize']),
  input: z.string().min(1).max(500),
  context: z.object({
    currentStyle: z.string().optional(),
    userLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  }).optional(),
});

// Generate endpoint - The heart of the Forge
app.post('/api/generate', 
  zValidator('json', GenerateRequestSchema),
  async (c) => {
    const sessionId = c.req.header('X-Session-ID') || 'anonymous';
    const params = c.req.valid('json');
    
    console.log(`[${sessionId}] Generation request:`, params);
    
    try {
      // In production, this would call Cloudflare Workers AI
      // For now, we'll simulate the generation process
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env?.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${params.prompt}, ${params.style} style`,
          n: 1,
          size: `${params.width}x${params.height}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const imageUrl = result.data[0].url;
      
      // Fetch the image and return as binary
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      return new Response(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'X-Generation-Time': Date.now().toString(),
        },
      });
    } catch (error) {
      console.error(`[${sessionId}] Generation failed:`, error);
      return c.json({ error: 'Generation failed', details: error.message }, 500);
    }
  }
);

// AI Assist endpoint - Creative co-processor
app.post('/api/assist',
  zValidator('json', AssistRequestSchema),
  async (c) => {
    const sessionId = c.req.header('X-Session-ID') || 'anonymous';
    const params = c.req.valid('json');
    
    console.log(`[${sessionId}] Assist request:`, params);
    
    try {
      let assistance;
      
      switch (params.type) {
        case 'prompt-enhance':
          assistance = {
            enhanced: `${params.input}, highly detailed, professional photography, vibrant colors, perfect composition`,
            suggestions: ['Add lighting description', 'Specify art medium', 'Include mood/atmosphere'],
          };
          break;
          
        case 'style-suggest':
          assistance = {
            styles: ['photorealistic', 'digital-art', 'fantasy'],
            reasoning: 'Based on your prompt, these styles would work well',
          };
          break;
          
        case 'parameter-optimize':
          assistance = {
            steps: 30,
            guidance: 7.5,
            reasoning: 'Optimal settings for your prompt complexity',
          };
          break;
      }
      
      return c.json(assistance);
    } catch (error) {
      console.error(`[${sessionId}] Assist failed:`, error);
      return c.json({ error: 'Assistance failed', details: error.message }, 500);
    }
  }
);

export default app;
