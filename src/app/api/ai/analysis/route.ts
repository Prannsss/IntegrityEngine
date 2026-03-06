import { NextRequest, NextResponse } from 'next/server';
import {
  generateAnomalyExplanation,
  type GenerateAnomalyExplanationInput,
} from '../../../../../backend/ai/flows/generate-anomaly-explanation';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateAnomalyExplanationInput;

    if (
      !body.currentFingerprint ||
      !body.baselineFingerprint ||
      body.riskScore === undefined ||
      !body.flags
    ) {
      return NextResponse.json(
        { error: 'currentFingerprint, baselineFingerprint, riskScore and flags are required' },
        { status: 400 }
      );
    }

    const explanation = await generateAnomalyExplanation(body);
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error('[AI /analysis]', err);
    return NextResponse.json({ error: 'Failed to generate AI analysis' }, { status: 500 });
  }
}
