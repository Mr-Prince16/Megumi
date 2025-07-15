import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    'GOOGLE_API_KEY environment variable not found. ' +
    'Please provide it in your .env file or hosting provider configuration.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  // By default, Genkit will use the gemini-1.5-flash model.
  // You can specify a different model here, or on a per-request basis.
  // The model can be configured via the GENKIT_MODEL environment variable.
  model: process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash',
});
