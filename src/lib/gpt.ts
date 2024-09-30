import { CardType } from './card-config';
import { getPromptForCardType } from './prompt';
import { prisma } from './prisma'; 

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
    cardType: CardType;
    version?: string;
    [key: string]: any;
}

async function logApiRequest(params: {
    cardType: CardType;
    userInputs: Record<string, any>;
    promptVersion: string;
    responseContent: string;
    tokensUsed: number;
    duration: number;
    isError: boolean;
    errorMessage?: string;
}) {
    try {
        await prisma.apiLog.create({
            data: {
                cardType: params.cardType,
                userInputs: params.userInputs,
                promptVersion: params.promptVersion,
                responseContent: params.responseContent,
                tokensUsed: params.tokensUsed,
                duration: params.duration,
                isError: params.isError,
                errorMessage: params.errorMessage,
            },
        });
    } catch (error) {
        console.error("Error logging API request to database:", error);
    }
}

export async function generateCardContent(params: CardContentParams): Promise<string> {
    const { cardType, version, ...otherParams } = params;
    console.log("Generating card content for:", cardType, otherParams);

    const promptConfig = getPromptForCardType(cardType, version);
    const { prompt, version: promptVersion } = promptConfig;

    const userPrompt = Object.entries(otherParams)
        .filter(([_, value]) => value !== '' && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    if (userPrompt.length >= 800) {
        console.warn("User prompt too long, returning default SVG");
        return defaultSVG;
    }

    const startTime = Date.now();

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
                    { "role": "system", "content": prompt },
                    { "role": "user", "content": userPrompt },
                ],
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GPTResponse & { usage?: { total_tokens: number } } = await response.json();
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log("Request duration:", duration, "ms");
        console.log("Tokens used:", data.usage?.total_tokens || "Not provided");

        const content = data.choices[0].message.content;
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);

        // 记录 API 请求到数据库
        await logApiRequest({
            cardType,
            userInputs: otherParams,
            promptVersion,
            responseContent: content,
            tokensUsed: data.usage?.total_tokens || 0,
            duration,
            isError: false,
        });

        if (svgMatch) {
            return svgMatch[0];
        } else {
            console.warn("No valid SVG content found, returning default SVG");
            return defaultSVG;
        }
    } catch (error) {
        console.error("Error calling GPT API:", error);
        
        // 记录错误到数据库
        await logApiRequest({
            cardType,
            userInputs: otherParams,
            promptVersion,
            responseContent: "",
            tokensUsed: 0,
            duration: Date.now() - startTime,
            isError: true,
            errorMessage: error instanceof Error ? error.message : String(error),
        });

        throw error;
    }
}

const defaultSVG = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Error content -->
</svg>`;