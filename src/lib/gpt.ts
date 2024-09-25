const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://MewTruCard.COM';
const YOUR_SITE_NAME = 'MewTruCard';

interface GPTResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

interface CardContentParams {
    cardType: string;
    relationship: string;
    name?: string;
    age?: string;
    tone?: string;
    bestWishes?: string;
    senderName?: string;
    additionalInfo?: string;
}

const defSVG = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffe6cc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffcc99;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg-gradient)" />

  <text x="200" y="250" font-family="Brush Script MT, cursive" font-size="60" fill="#00008B" text-anchor="middle">Coming</text>
  <text x="200" y="350" font-family="Brush Script MT, cursive" font-size="60" fill="#00008B" text-anchor="middle">Soon</text>

  <line x1="50" y1="400" x2="350" y2="400" stroke="#4B0082" stroke-width="2" />

  <circle cx="200" cy="480" r="50" fill="none" stroke="#4B0082" stroke-width="2" />
  <path d="M200,430 Q220,480 200,530 Q180,480 200,430" fill="#98FB98" stroke="#4B0082" stroke-width="2" />

  <text x="200" y="570" font-family="Georgia, serif" font-size="16" fill="#00008B" text-anchor="middle" font-style="italic">Stay tuned for something special!</text>
</svg>`

export async function generateCardContent(params: CardContentParams): Promise<string> {
    const { cardType, name, age, relationship, tone, bestWishes,  senderName, additionalInfo } = params;
    console.log("params", params);
    if (cardType !== 'birthday') {
        return defSVG;
    }

    const promptParts = [
        `You are a highly skilled designer specializing in creating unique, insightful, and personalized birthday greeting cards. Use the following information to create the card:`,
        age ? `- Age: ${age}` : '',
        relationship ? `- Relationship: ${relationship}` : '',
        bestWishes ? `- Best Wishes: ${bestWishes}` : '',
        senderName ? `- Sender Name: ${senderName}` : '',
        additionalInfo ? `- Additional Information: ${additionalInfo}` : '',
        `Design a personalized greeting card with:

- Insightful, warm, and creative content
- Understanding of recipient's preferences
- Clever personal elements and metaphors
- Sincere, touching, and visually appealing expression
- Attention to recipient's interests and personality

For the greeting:
- Craft a concise, deeply customized message
- Use provided information to tailor it

For the SVG card (400x600):
- Choose background, fonts, and colors based on recipient
- Set appropriate font sizes and layout
- Create visual hierarchy emphasizing personalized elements
- Apply design principles for emotional resonance
- Incorporate recipient's interests, relationship aspects, and relevant memories

Provide only the complete SVG code in a markdown block.`];

    const prompt = promptParts.filter(Boolean).join('\n');
    console.log("----prompt----", prompt);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL,
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    { "role": "user", "content": prompt },
                ],
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GPTResponse = await response.json();
        console.log("data", data);
        const content = data.choices[0].message.content;
        console.log("content", content);

        // 提取 SVG 内容
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
        if (svgMatch) {
            return svgMatch[0]; // 返回匹配到的 SVG 内容
        } else {
            console.warn("未找到有效的 SVG 内容，返回默认 SVG");
            return defSVG;
        }
    } catch (error) {
        console.error("Error calling GPT API:", error);
        throw error;
    }
}