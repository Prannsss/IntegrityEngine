import { Fingerprint } from '../telemetry/types';

export function calculateFingerprint(text: string, burstScore: number = 0): Fingerprint {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length === 0) {
    return {
      lexical_density: 0,
      avg_sentence_length: 0,
      vocabulary_diversity: 0,
      burst_score: 0,
      flesch_kincaid_score: 0
    };
  }

  // 1. Lexical Density (simplified: ratio of long words to total words as proxy for complexity)
  const complexityWords = words.filter(w => w.length > 6).length;
  const lexical_density = (complexityWords / words.length) * 100;

  // 2. Average Sentence Length
  const avg_sentence_length = words.length / sentences.length;

  // 3. Vocabulary Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const vocabulary_diversity = (uniqueWords / words.length) * 100;

  // 4. Flesch-Kincaid Grade Level (Simplified Approximation)
  // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  // Syllables approx: word length / 3
  const syllableCount = words.reduce((acc, word) => acc + Math.max(1, word.length / 3), 0);
  const flesch_kincaid_score = 0.39 * (words.length / sentences.length) + 11.8 * (syllableCount / words.length) - 15.59;

  return {
    lexical_density,
    avg_sentence_length,
    vocabulary_diversity,
    burst_score: burstScore,
    flesch_kincaid_score: Math.max(0, flesch_kincaid_score)
  };
}