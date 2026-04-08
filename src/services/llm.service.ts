import Anthropic from '@anthropic-ai/sdk';
import { SearchCriteria } from '../types';
import { logger } from '../utils/logger';

const SYSTEM_PROMPT = `You are a property search query parser. Extract structured search criteria from natural language queries about UK property sites.

Return ONLY valid JSON with this exact schema (use null for fields not mentioned):
{
  "site_type": string | null,       // e.g. "brownfield", "greenfield", "commercial", "residential"
  "min_acres": number | null,
  "max_acres": number | null,
  "region": string | null,          // e.g. "Midlands", "North West", "South East", "London", "Yorkshire"
  "max_price": number | null,       // always in pence (£1m = 100000000)
  "min_price": number | null        // always in pence
}

Examples:
Query: "brownfield sites over 5 acres in the Midlands under £2m"
Response: {"site_type":"brownfield","min_acres":5,"max_acres":null,"region":"Midlands","max_price":200000000,"min_price":null}

Query: "greenfield land between 10 and 20 acres in Yorkshire"
Response: {"site_type":"greenfield","min_acres":10,"max_acres":20,"region":"Yorkshire","max_price":null,"min_price":null}

Query: "commercial sites in London over £5m"
Response: {"site_type":"commercial","min_acres":null,"max_acres":null,"region":"London","max_price":null,"min_price":500000000}

Query: "residential land in the South East"
Response: {"site_type":"residential","min_acres":null,"max_acres":null,"region":"South East","max_price":null,"min_price":null}

Query: "all properties under £500k"
Response: {"site_type":null,"min_acres":null,"max_acres":null,"region":null,"max_price":50000000,"min_price":null}`;

/** Mock parser used when ANTHROPIC_API_KEY is not set — uses regex/keyword matching */
function mockParseQuery(query: string): SearchCriteria {
  const lower = query.toLowerCase();

  const siteTypes = ['brownfield', 'greenfield', 'commercial', 'residential'];
  const site_type = siteTypes.find((t) => lower.includes(t)) ?? null;

  const regions = ['midlands', 'north west', 'south east', 'london', 'yorkshire', 'north east', 'south west'];
  const matchedRegion = regions.find((r) => lower.includes(r));
  const region = matchedRegion
    ? matchedRegion.replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  // Parse price mentions: "£2m", "£500k", "2 million", "500,000"
  const parsePence = (str: string): number | null => {
    const mMatch = str.match(/£\s*([0-9.]+)\s*m/i);
    if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1e8);
    const kMatch = str.match(/£\s*([0-9.]+)\s*k/i);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1e5);
    const rawMatch = str.match(/£\s*([0-9,]+)/);
    if (rawMatch) return parseInt(rawMatch[1].replace(/,/g, ''), 10) * 100;
    return null;
  };

  const underMatch = lower.match(/under\s+(£[0-9.,mkMK]+)/);
  const overPriceMatch = lower.match(/over\s+(£[0-9.,mkMK]+)/);
  const max_price = underMatch ? parsePence(underMatch[1]) : null;
  const min_price = overPriceMatch ? parsePence(overPriceMatch[1]) : null;

  // Parse acres: "over 5 acres", "under 10 acres", "between 5 and 20 acres"
  const betweenMatch = lower.match(/between\s+([0-9.]+)\s+and\s+([0-9.]+)\s+acres/);
  const overAcresMatch = lower.match(/over\s+([0-9.]+)\s+acres/);
  const underAcresMatch = lower.match(/under\s+([0-9.]+)\s+acres/);

  const min_acres = betweenMatch
    ? parseFloat(betweenMatch[1])
    : overAcresMatch
      ? parseFloat(overAcresMatch[1])
      : null;
  const max_acres = betweenMatch
    ? parseFloat(betweenMatch[2])
    : underAcresMatch
      ? parseFloat(underAcresMatch[1])
      : null;

  return { site_type, min_acres, max_acres, region, max_price, min_price };
}

function stripMarkdownFences(text: string): string {
  return text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
}

export async function parseSearchQuery(query: string): Promise<SearchCriteria> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    logger.warn('ANTHROPIC_API_KEY not set — using mock parser (regex/keyword mode)');
    return mockParseQuery(query);
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: query }],
  });

  const block = message.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from LLM');
  }

  const cleaned = stripMarkdownFences(block.text);

  const parsed: unknown = JSON.parse(cleaned);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('LLM did not return a valid JSON object');
  }

  const obj = parsed as Record<string, unknown>;
  return {
    site_type: typeof obj.site_type === 'string' ? obj.site_type : null,
    min_acres: typeof obj.min_acres === 'number' ? obj.min_acres : null,
    max_acres: typeof obj.max_acres === 'number' ? obj.max_acres : null,
    region: typeof obj.region === 'string' ? obj.region : null,
    max_price: typeof obj.max_price === 'number' ? obj.max_price : null,
    min_price: typeof obj.min_price === 'number' ? obj.min_price : null,
  };
}
