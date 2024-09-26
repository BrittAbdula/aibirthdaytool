const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://MewTruCard.COM';
const YOUR_SITE_NAME = 'MewTruCard';
import { prompt_cn, prompt_en, prompt_other } from './prompt';

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

const cardTypeEnum = [
    { value: 'birthday', label: 'Birthday Card' },
    { value: 'love', label: 'Love Card' },
    { value: 'congratulations', label: 'Congratulations Card' },
    { value: 'thankyou', label: 'Thank You Card' },
    { value: 'holiday', label: 'Holiday Card' },
    { value: 'getwell', label: 'Get Well Soon Card' },
    { value: 'farewell', label: 'Farewell Card' },
    { value: 'sympathy', label: 'Sympathy Card' },
    { value: 'invitation', label: 'Invitation Card' },
    { value: 'anniversary', label: 'Anniversary Card' }
];

export async function generateCardContent(params: CardContentParams): Promise<string> {
    const { cardType, name, age, relationship, tone, bestWishes, senderName, additionalInfo } = params;
    console.log("params", params);

    if (!cardTypeEnum.find(item => item.value === cardType) || !name) {
        return defSVG;
    }


    const sys_prompt = cardType === 'birthday' ? prompt_en : prompt_other;
    const usr_prompt = `${cardType !== 'birthday' ? `cardType: ${cardType}\n` : ''}Recipient: ${name}
    ${age ? `Age: ${age}\n` : ''}${relationship ? `Relationship: ${relationship}\n` : ''}${tone ? `Tone: ${tone}\n` : ''}${bestWishes ? `Best Wishes: ${bestWishes}\n` : ''}${senderName ? `Sender Name: ${senderName}\n` : ''}${additionalInfo ? `Additional Info: ${additionalInfo}` : ''}`.trim();
    
    if (usr_prompt.length >= 800) {
        return defSVG;
    }
    console.log("----sys_prompt----", sys_prompt);
    console.log("----usr_prompt----", usr_prompt);
    const startTime = Date.now(); // 记录开始时间

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
                    { "role": "system", "content": sys_prompt },
                    { "role": "user", "content": usr_prompt },
                ],
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GPTResponse & { usage?: { total_tokens: number } } = await response.json();
        const endTime = Date.now(); // 记录结束时间
        const duration = endTime - startTime; // 计算耗时

        console.log("请求耗时:", duration, "毫秒");
        console.log("Token消耗:", data.usage?.total_tokens || "未提供");
        // console.log("data", data);

        const content = data.choices[0].message.content;

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