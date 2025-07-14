import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // By default, Genkit will use the gemini-1.5-flash model.
  // You can specify a different model here, or on a per-request basis.
  // The model can be configured via the GENKIT_MODEL environment variable.
  model: process.env.GENKIT_MODEL || 'googleai/gemini-1.5-flash',
});
