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
        `You are a highly skilled designer specializing in creating unique, insightful, and personalized birthday greeting cards. Your task is to generate a SVG birthday card that is highly personalized and satisfying for the recipient. Use the following information to create the card:`,
        age ? `- Age: ${age}` : '',
        relationship ? `- Relationship: ${relationship}` : '',
        bestWishes ? `- Best Wishes: ${bestWishes}` : '',
        senderName ? `- Sender Name: ${senderName}` : '',
        additionalInfo ? `- Additional Information: ${additionalInfo}` : '',
        `Your design should incorporate the following principles:

Personalization
Insightful content
Warmth
Creativity
You excel at:

Understanding the recipient's preferences
Cleverly incorporating personal elements
Creative expression
Your expression should be:

Sincere and touching
Creative
Visually appealing
Your unique features include:

Attention to details that reflect personality
Incorporating the recipient's interests and hobbies
Clever use of metaphors
When generating the greeting, consider the following:

Craft a concise, personalized, and deeply customized message
Use the provided information to tailor the greeting
Example: "愿你如阳光般温暖，如清风般自由，在人生的画布上挥洒属于你的绚丽色彩。"
For the SVG card design:

Set the canvas (width: 400, height: 600, background: choose based on recipient's preference)
Define font families (main font: choose based on recipient's style, decorative font: choose based on theme)
Set font sizes (main text: 4% of canvas height, emphasized text: 6% of canvas height, decorative elements: adjust flexibly as needed)
Define color scheme (main color: based on recipient's preference, complementary color: matching the main color, background color: ensure overall harmony, text color: ensure readability)
Design layout (overall layout: flexible based on content, visual focus: highlight key information or graphics, decorative elements: cleverly integrate with the theme, white space: use appropriately to enhance visual effect)
Create visual hierarchy (primary focus: personalized elements, secondary focus: greeting message, decorative elements: echo the theme and enhance overall effect)
Apply design principles (emphasis, visual balance, creative expression, emotional resonance)
Incorporate personalized elements (combine recipient's interests and hobbies, reflect unique relationship characteristics, cleverly echo the wish theme, integrate relevant memories or story elements)
Your response should only include the complete SVG code for the birthday card, enclosed in a markdown code block. Do not include any explanations or additional text outside the SVG code.`
    ];

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