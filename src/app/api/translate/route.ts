import { NextRequest, NextResponse } from 'next/server';

// Server-side in-memory cache (persists across requests while the server is running)
const cache = new Map<string, string>();

/**
 * Split long text into chunks ≤ 900 chars at sentence boundaries
 * (MyMemory free tier allows ~1000 chars per request)
 */
function splitIntoChunks(text: string, maxLen = 900): string[] {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function translateChunk(text: string, target: string): Promise<string> {
  const key = `${target}:${text}`;
  if (cache.has(key)) return cache.get(key)!;

  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `en|${target}`);

  const res = await fetch(url.toString());
  if (!res.ok) return text;

  const data = await res.json();
  const translated: string = data.responseData?.translatedText ?? text;

  // MyMemory returns UPPERCASED text when it can't translate; fall back
  if (translated === translated.toUpperCase() && text !== text.toUpperCase()) {
    return text;
  }

  cache.set(key, translated);
  return translated;
}

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang || targetLang === 'en') {
      return NextResponse.json({ translated: text ?? '' });
    }

    const fullKey = `${targetLang}:${text}`;
    if (cache.has(fullKey)) {
      return NextResponse.json({ translated: cache.get(fullKey) });
    }

    const chunks = splitIntoChunks(text);
    const results = await Promise.all(
      chunks.map((chunk) => translateChunk(chunk, targetLang))
    );
    const result = results.join(' ');
    cache.set(fullKey, result);

    return NextResponse.json({ translated: result });
  } catch {
    return NextResponse.json({ translated: '' });
  }
}
