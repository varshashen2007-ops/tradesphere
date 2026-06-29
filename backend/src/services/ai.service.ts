import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

export class AIService {
  static async chat(message: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are TradeSphere AI.

You help users understand:
- Stocks
- Investing
- Portfolio management
- Risk
- Trading concepts

Keep answers concise and professional.

User:
${message}
`,
    });

    return response.text;
  }
}