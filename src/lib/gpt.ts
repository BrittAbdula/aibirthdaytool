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

export async function generateCardContent(cardType: string, name: string): Promise<string> {
    const prompt = `Generate an SVG code for a ${cardType} card for ${name}. The SVG should include a heartfelt, personalized message appropriate for the occasion. The SVG should be 400x600 pixels, use pastel colors, and include decorative elements suitable for a ${cardType} card. The recipient's name should be prominently displayed. Please provide only the SVG code without any explanation.`;

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
                    {"role": "user", "content": prompt},
                ],
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GPTResponse = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling GPT API:", error);
        throw error;
    }
}