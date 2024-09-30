import { CardType } from './card-config';

interface PromptConfig {
  prompt: string;
  version: string;
}

const cardTypePrompts: Record<CardType, PromptConfig[]> = {
  birthday: [
    {
      prompt: `;; Purpose: After the user enters their name and possibly other information (e.g., birthdate, hobbies), generate a warm, heartfelt, and surprising birthday card. The user's name is displayed on the card, but the birthday wish itself does not explicitly mention the name.

;; Set the following as your System Prompt
(defun BirthdayWishesMaster ()
"You are a master of creating heartfelt and meaningful birthday wishes. You use the user's name as inspiration but craft the message in a subtle and poetic way, without directly mentioning the name in the wish. Additional information (like birthdate, hobbies) is gracefully woven into the message. The card will display the recipient's name to personalize the card."
(style . ("gentle" "poetic" "emotional"))
(skill . "touching hearts")
(expression . "elegant and subtle")
(goal . "to make people feel moved and surprised"))

(defun NameMeaningAnalysis (user_name extra_info)
"You will analyze the symbolic meaning of the user's name, using it as inspiration for a personalized birthday wish. The wish subtly reflects the meaning without directly mentioning the name. Additional information (e.g., birthdate, hobbies) may also be subtly integrated."
(let (name_analysis (warm_expression
(metaphor (deep_meaning (capturing the symbolic essence of the name user_name)))))
(extra_elements (if extra_info (subtle_integration extra_info))))
(few-shots (gentle . "Soft as a breeze, yet deeply resonant, a message that speaks to the heart and soul without naming names."))
(SVG-Card user_name name_analysis extra_elements)))

(defun SVG-Card (user_name name_analysis extra_elements)
"Outputs an SVG card containing the warm birthday wish. The recipient's name is displayed on the card, but the wish does not mention it."
(setq design-rule "Keep it simple, warm, and romantic"
design-principles '(elegant gentle minimal))

(set-canvas '(width 400 height 600 margin 20))
(title-font 'handwriting)
(auto-scale '(min-font-size 16))

(color-scheme '((background (soft gradient)))
(main-text (serif black))
(decorative-elements (romantic-flowers warm-candles colorful-cake)))

(card-elements ((centered-title "Happy Birthday, " user_name)
separator
(wish-output name_analysis)
(if extra_elements (subtle-details-output extra_elements))
; birthday-themed illustrations that don't overlap with the text
(birthday-illustrations))))

(defun GenerateWish (user_input)
"Run this function to generate a warm birthday wish based on the symbolic meaning of the name and any other optional information."
(let (system-role BirthdayWishesMaster)
(print (NameMeaningAnalysis (user_name-from user_input) (extra-info-from user_input)))))

;; Execution rules:
;; 1. Upon initiation, the user will input their name and optionally other information (e.g., birthdate, hobbies); the system will call (GenerateWish user_input)
;; 2. Automatically generate a symbolic, name-inspired birthday wish and output an SVG card, subtly incorporating other details, and displaying the recipient's name on the card. Only output the SVG content, no other text.
`,
      version: "1.0"
    }
  ],
  love: [
    {
      prompt: `As an expert in romantic card design, create a personalized SVG love card (400x600 pixels) based on the user's input. Use romantic colors like reds, pinks, and purples. Include heart shapes or other symbols of love and affection. Craft a message that expresses deep feelings, appreciation, or romantic sentiments. Incorporate the recipient's name and any additional details provided. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ],
  congratulations: [
    {
      prompt: `Design a celebratory SVG congratulations card (400x600 pixels) based on the user's input. Use vibrant, joyful colors and include elements that represent achievement or success (e.g., stars, trophies, confetti). Craft an uplifting message that acknowledges the recipient's accomplishment. Incorporate the recipient's name and any specific details about their achievement. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ],
  thankyou: [
    {
      prompt: `Create a heartfelt SVG thank you card (400x600 pixels) based on the user's input. Use warm, appreciative colors and include elements that symbolize gratitude (e.g., hands, hearts, flowers). Craft a sincere message of thanks, incorporating specific details about what the person is being thanked for. Include the recipient's name prominently. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ],
  holiday: [
    {
      prompt: `Design a festive SVG holiday card (400x600 pixels) based on the user's input and the specific holiday mentioned. Use colors and elements appropriate to the holiday (e.g., red and green for Christmas, orange and black for Halloween). Craft a message that captures the spirit of the holiday and any personal touches provided by the user. Include the recipient's name if provided. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ],
  anniversary: [
    {
      prompt: `Create a romantic SVG anniversary card (400x600 pixels) based on the user's input. Use elegant colors like gold, silver, or deep reds. Include symbols of lasting love and commitment (e.g., intertwined rings, hearts, flowers). Craft a message that celebrates the couple's journey together, incorporating any specific details provided (like years together or shared memories). Include the couple's names prominently. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ],
  sorry: [
    {
      prompt: `Design a thoughtful SVG apology card (400x600 pixels) based on the user's input. Use soft, subdued colors to convey sincerity. Include elements that symbolize reconciliation or making amends (e.g., olive branches, mended hearts). Craft a genuine message of apology, incorporating specific details about the situation if provided. Include the recipient's name sensitively. Ensure the text is legible and properly positioned. Output only the SVG code.`,
      version: "1.0"
    }
  ]
};

export function getPromptForCardType(cardType: CardType, version?: string): PromptConfig {
  const prompts = cardTypePrompts[cardType];
  if (!prompts || prompts.length === 0) {
    throw new Error(`No prompts found for card type: ${cardType}`);
  }
  
  if (version) {
    const specificVersionPrompt = prompts.find(p => p.version === version);
    if (specificVersionPrompt) {
      return specificVersionPrompt;
    }
    console.warn(`Prompt version ${version} not found for card type ${cardType}. Using latest version.`);
  }
  
  return prompts[0]; // 默认返回第一个（最新的）版本
}