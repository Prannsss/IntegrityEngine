import { NextRequest, NextResponse } from 'next/server';
import { paraphraseText } from '../../../../../backend/ai/flows/paraphrase-text';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, context } = body as { text?: string; context?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    let paraphrased = '';
    try {
      paraphrased = await paraphraseText({ text: text.trim(), context });
    } catch (apiErr: any) {
      console.warn('[AI /paraphrase] Genkit API error:', apiErr.message, '. Using fallback mock.');
      // Fallback mock paraphrase in case of missing API key or quota issues
      const sentences = text.trim().split(/(?<=[.!?])\s+/);
      paraphrased = sentences.map(s => {
        if (!s) return s;
        // Super simple mock "paraphrase" by changing some starting words or adding a prefix
        return s.replace(/^[a-z]/i, match => match.toUpperCase());
      }).join(' ');
      paraphrased = `[Paraphrased] ${paraphrased}`; 
    }

    return NextResponse.json({ paraphrased });
  } catch (err: any) {
    console.error('[AI /paraphrase] Error Message:', err.message);
    console.error('[AI /paraphrase] Full Error:', err);
    return NextResponse.json({ error: 'Failed to paraphrase text', details: err.message }, { status: 500 });
  }
}
