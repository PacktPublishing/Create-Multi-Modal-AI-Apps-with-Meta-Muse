import OpenAI from 'openai';

export const MODEL = 'muse-spark-1.3';

export const client = new OpenAI({
  baseURL: 'https://api.meta.ai/v1',
  apiKey: process.env.MODEL_API_KEY,
  maxRetries: 3,
  timeout: 60 * 1000,
});

// Muse Spark prices, in dollars per million tokens
const PRICES = { input: 1.25, cached: 0.15, output: 4.25 };

export function costOf(usage) {
  const cached = usage.input_tokens_details?.cached_tokens ?? 0;
  const fresh = usage.input_tokens - cached;
  const dollars =
    fresh * PRICES.input + cached * PRICES.cached + usage.output_tokens * PRICES.output;
  return dollars / 1_000_000;
}
