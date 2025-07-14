import { config } from 'dotenv';
config();

// This file is the entrypoint for the Genkit developer UI.
// It imports all the flows that you want to be able to run from the developer UI.
// e.g. import '@/ai/flows/my-flow.ts';
import '@/ai/flows/chat.ts';
