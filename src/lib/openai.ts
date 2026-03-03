import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

interface MessageContext {
  brokerName: string;
  stepNumber: number;
  totalSteps: number;
  basePrompt: string;
  promptOverride?: string | null;
  previousMessages?: string[];
}

export async function generateCampaignMessage(ctx: MessageContext): Promise<string> {
  const systemPrompt = `${ctx.basePrompt}

Regras:
- Mensagem curta (máx 3 parágrafos)
- Tom amigável e profissional
- Use o nome do corretor
- Cada etapa deve ter abordagem diferente:
  - Etapa 1: Apresentação e reaproximação
  - Etapa 2: Destaque benefícios e novidades
  - Etapa 3: Case de sucesso ou depoimento
  - Etapa 4: Oferta ou incentivo especial
  - Etapa 5: Último contato, urgência leve
- NÃO use markdown, emojis excessivos, ou formatação complexa
- NÃO use placeholders como [Seu Nome] — escreva a mensagem pronta para enviar
- A mensagem deve parecer escrita por uma pessoa real`;

  const userPrompt = `${ctx.promptOverride || ctx.basePrompt}

Dados:
- Nome do corretor: ${ctx.brokerName}
- Etapa: ${ctx.stepNumber} de ${ctx.totalSteps}
${ctx.previousMessages?.length ? `\nMensagens anteriores enviadas:\n${ctx.previousMessages.join('\n---\n')}` : ''}

Gere a mensagem da etapa ${ctx.stepNumber}:`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  return response.choices[0].message.content?.trim() || '';
}
