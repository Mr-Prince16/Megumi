'use server';
/**
 * @fileOverview A simple chat flow that responds to user messages and images.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string(),
  imageUrl: z.string().optional().describe(
    "An optional image of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {text} = await ai.generate({
      prompt: [
        {text: `You are a helpful AI assistant named Nexus.AI. Respond to the user's message.`},
        {text: `User's message: ${input.message}`},
        ...(input.imageUrl ? [{media: {url: input.imageUrl}}] : []),
      ],
    });

    return {
      message: text,
    };
  }
);
