/**
 * @fileOverview A Genkit flow for generating an explanation summary of detected behavioral and stylistic anomalies in student assignments.
 *
 * - generateAnomalyExplanation - A function that handles the generation of the anomaly explanation.
 * - GenerateAnomalyExplanationInput - The input type for the generateAnomalyExplanation function.
 * - GenerateAnomalyExplanationOutput - The return type for the generateAnomalyExplanation function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const GenerateAnomalyExplanationInputSchema = z.object({
  currentFingerprint: z
    .object({
      lexical_density: z
        .number()
        .describe('The lexical density of the current submission.'),
      avg_sentence_length: z
        .number()
        .describe('The average sentence length of the current submission.'),
      vocabulary_diversity: z
        .number()
        .describe(
          'The vocabulary diversity (Type-Token Ratio) of the current submission.'
        ),
      burst_score: z
        .number()
        .describe(
          'The burst score (standard deviation of IKL or WPM segments) of the current submission.'
        ),
      flesch_kincaid_score: z
        .number()
        .describe('The Flesch-Kincaid readability score of the current submission.'),
    })
    .describe(
      "The student's current stylistic and behavioral fingerprint for the assignment."
    ),
  baselineFingerprint: z
    .object({
      lexical_density: z
        .number()
        .describe('The lexical density of the student\u0027s historical baseline.'),
      avg_sentence_length: z
        .number()
        .describe('The average sentence length of the student\u0027s historical baseline.'),
      vocabulary_diversity: z
        .number()
        .describe(
          'The vocabulary diversity (Type-Token Ratio) of the student\u0027s historical baseline.'
        ),
      burst_score: z
        .number()
        .describe(
          'The burst score (standard deviation of IKL or WPM segments) of the student\u0027s historical baseline.'
        ),
      flesch_kincaid_score: z
        .number()
        .describe('The Flesch-Kincaid readability score of the student\u0027s historical baseline.'),
    })
    .describe("The student's historical baseline stylistic and behavioral fingerprint."),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'The overall risk score (0-100) indicating potential academic integrity issues.'
    ),
  flags: z
    .array(z.string())
    .describe(
      'An array of detected anomaly flags, e.g., "paste_event_detected", "wpm_spike_detected", "high_stylometric_deviation".'
    ),
});
export type GenerateAnomalyExplanationInput = z.infer<
  typeof GenerateAnomalyExplanationInputSchema
>;

const GenerateAnomalyExplanationOutputSchema = z
  .string()
  .describe(
    'A clear, concise explanation summary of detected behavioral and stylistic anomalies, including specific deviations from the student\u0027s baseline and reasons for the assigned risk score.'
  );
export type GenerateAnomalyExplanationOutput = z.infer<
  typeof GenerateAnomalyExplanationOutputSchema
>;

export async function generateAnomalyExplanation(
  input: GenerateAnomalyExplanationInput
): Promise<GenerateAnomalyExplanationOutput> {
  return generateAnomalyExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnomalyExplanationPrompt',
  input: {schema: GenerateAnomalyExplanationInputSchema},
  output: {schema: GenerateAnomalyExplanationOutputSchema},
  prompt: `
You are an academic integrity expert. Your task is to generate a concise explanation summary for a student's assignment, outlining detected behavioral and stylistic anomalies.

Based on the following data:

Current Fingerprint:
- Lexical Density: {{{currentFingerprint.lexical_density}}}
- Average Sentence Length: {{{currentFingerprint.avg_sentence_length}}}
- Vocabulary Diversity: {{{currentFingerprint.vocabulary_diversity}}}
- Burst Score: {{{currentFingerprint.burst_score}}}
- Flesch-Kincaid Score: {{{currentFingerprint.flesch_kincaid_score}}}

Baseline Fingerprint (historical average for this student):
- Lexical Density: {{{baselineFingerprint.lexical_density}}}
- Average Sentence Length: {{{baselineFingerprint.avg_sentence_length}}}
- Vocabulary Diversity: {{{baselineFingerprint.vocabulary_diversity}}}
- Burst Score: {{{baselineFingerprint.burst_score}}}
- Flesch-Kincaid Score: {{{baselineFingerprint.flesch_kincaid_score}}}

Overall Risk Score: {{{riskScore}}}

Detected Anomalies (Flags):
{{#if flags}}
{{#each flags}}
- {{{this}}}
{{/each}}
{{else}}
No specific anomaly flags were triggered.
{{/if}}

Provide an explanation summary that:
1. Clearly outlines any detected behavioral and stylistic anomalies.
2. Highlights specific deviations from the student's historical baseline for each metric (Lexical Density, Average Sentence Length, Vocabulary Diversity, Burst Score, Flesch-Kincaid Score).
3. Explains the reasons for the assigned risk score, referencing the detected anomaly flags.
4. Maintains an objective and informative tone suitable for an academic context.
`,
});

const generateAnomalyExplanationFlow = ai.defineFlow(
  {
    name: 'generateAnomalyExplanationFlow',
    inputSchema: GenerateAnomalyExplanationInputSchema,
    outputSchema: GenerateAnomalyExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
