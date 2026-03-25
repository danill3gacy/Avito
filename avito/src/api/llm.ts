import type { Item, ChatMessage } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

async function callLLM(messages: { role: string; content: string }[], system: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function buildItemContext(item: Partial<Item>): string {
  return JSON.stringify({
    title: item.title,
    category: item.category,
    price: item.price,
    params: item.params,
    description: item.description,
  }, null, 2);
}

export async function generateDescription(item: Partial<Item>): Promise<string> {
  const system = `Ты помощник продавца на площадке объявлений Авито. Пиши на русском языке. Отвечай только текстом описания без лишних слов.`;
  const content = `Напиши привлекательное и подробное описание для объявления:
${buildItemContext(item)}

${item.description ? `Улучши текущее описание: "${item.description}"` : 'Придумай описание с нуля.'}

Описание должно быть информативным, убедительным, 3-5 предложений.`;

  return callLLM([{ role: 'user', content }], system);
}

export async function suggestPrice(item: Partial<Item>): Promise<string> {
  const system = `Ты эксперт по ценообразованию на вторичном рынке России. Пиши на русском языке.`;
  const content = `Предложи актуальную рыночную цену для объявления:
${buildItemContext(item)}

Дай конкретные цифры в рублях с кратким обоснованием. Учитывай состояние, год выпуска и другие параметры.`;

  return callLLM([{ role: 'user', content }], system);
}

export async function chatWithAI(item: Partial<Item>, messages: ChatMessage[]): Promise<string> {
  const system = `Ты AI-ассистент продавца на площадке Авито. Помогаешь улучшить объявление. 
Контекст объявления:
${buildItemContext(item)}

Отвечай на русском языке, кратко и по делу.`;

  const llmMessages = messages.map(m => ({ role: m.role, content: m.content }));
  return callLLM(llmMessages, system);
}
