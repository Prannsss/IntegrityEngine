/**
 * @fileOverview A Genkit flow for paraphrasing student essay text.
 *
 * - paraphraseText - Paraphrases the given input text while preserving academic meaning.
 * - ParaphraseInput  - Input type.
 * - ParaphraseOutput - Output type.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const ParaphraseInputSchema = z.object({
  text: z.string().describe('The text to paraphrase.'),
  context: z
    .string()
    .optional()
    .describe('Optional topic/question context to guide the paraphrase.'),
});
export type ParaphraseInput = z.infer<typeof ParaphraseInputSchema>;

const ParaphraseOutputSchema = z
  .string()
  .describe('A paraphrased version of the input text with improved clarity and academic tone.');
export type ParaphraseOutput = z.infer<typeof ParaphraseOutputSchema>;

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
  return paraphraseTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'paraphraseTextPrompt',
  input: {schema: ParaphraseInputSchema},
  output: {schema: ParaphraseOutputSchema},
  prompt: `You are an academic writing assistant helping a student improve their essay.
Paraphrase the following text to improve clarity, flow, and academic tone while preserving the student's original meaning and arguments.
Do not add new facts, change the student's position, or remove key points.
Return only the paraphrased text — no preamble, no explanation, no quotation marks.

{{#if context}}
Essay topic / question context: {{{context}}}
{{/if}}

Text to paraphrase:
{{{text}}}`,
});

const paraphraseTextFlow = ai.defineFlow(
  {
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
