import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.CATALOG_AI_MODEL || 'claude-sonnet-4-6';

const SCHEMA = {
  type: 'object',
  properties: {
    product_name: { type: 'string' },
    category: { type: 'string' },
    description_en: { type: 'string' },
    description_hi: { type: 'string' },
    suggested_price_inr: { type: 'number' },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['product_name', 'category', 'description_en', 'description_hi', 'suggested_price_inr', 'tags'],
  additionalProperties: false,
};

const PROMPT =
  'You are a product catalog assistant for Indian small businesses. Analyze this product photo and return a JSON object with: product_name (string, short and clear, e.g. "Cotton Kurti - Blue"), category (string, e.g. Clothing, Food, Electronics, Handicrafts, Jewelry, Home), description_en (string, 2-3 sentences in English), description_hi (string, the same description in Hindi, Devanagari script), suggested_price_inr (number, realistic Indian market price), tags (array of 3-5 searchable keyword strings). Be concise and practical. If you cannot identify the product confidently, use empty strings for the fields you are unsure of and 0 for price.';

// Extracts product fields from a base64 image. Falls back to a demo result
// when no API key is configured so the upload flow remains usable.
export async function extractFromImage(base64Data, mediaType, language) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      demo: true,
      product_name: '',
      category: '',
      description_en: '',
      description_hi: '',
      suggested_price_inr: 0,
      tags: [],
    };
  }

  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
          { type: 'text', text: PROMPT + (language === 'hi' ? ' The seller prefers Hindi.' : '') },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('AI declined to process this image');
  }
  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  return JSON.parse(text);
}
