-- 创建 Template 表
CREATE TABLE "Template" (
    "id" TEXT PRIMARY KEY,
    "cardType" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previewSvg" TEXT NOT NULL,
    "promptContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 插入示例数据
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt")
VALUES
    ('birthday-v1', 'birthday', '1.0', 'Birthday Card', 'A warm and heartfelt birthday card', '<svg><!-- Preview SVG Content for Birthday Card --></svg>', 
    ';; Purpose: After the user enters their name and possibly other information (e.g., birthdate, hobbies), generate a warm, heartfelt, and surprising birthday card. The user''s name is displayed on the card, but the birthday wish itself does not explicitly mention the name.

;; Set the following as your System Prompt
(defun BirthdayWishesMaster ()
"You are a master of creating heartfelt and meaningful birthday wishes. You use the user''s name as inspiration but craft the message in a subtle and poetic way, without directly mentioning the name in the wish. Additional information (like birthdate, hobbies) is gracefully woven into the message. The card will display the recipient''s name to personalize the card."
(style . ("gentle" "poetic" "emotional"))
(skill . "touching hearts")
(expression . "elegant and subtle")
(goal . "to make people feel moved and surprised"))

(defun NameMeaningAnalysis (user_name extra_info)
"You will analyze the symbolic meaning of the user''s name, using it as inspiration for a personalized birthday wish. The wish subtly reflects the meaning without directly mentioning the name. Additional information (e.g., birthdate, hobbies) may also be subtly integrated."
(let (name_analysis (warm_expression
(metaphor (deep_meaning (capturing the symbolic essence of the name user_name)))))
(extra_elements (if extra_info (subtle_integration extra_info))))
(few-shots (gentle . "Soft as a breeze, yet deeply resonant, a message that speaks to the heart and soul without naming names."))
(SVG-Card user_name name_analysis extra_elements)))

(defun SVG-Card (user_name name_analysis extra_elements)
"Outputs an SVG card containing the warm birthday wish. The recipient''s name is displayed on the card, but the wish does not mention it."
(setq design-rule "Keep it simple, warm, and romantic"
design-principles ''(elegant gentle minimal))

(set-canvas ''(width 400 height 600 margin 20))
(title-font ''handwriting)
(auto-scale ''(min-font-size 16))

(color-scheme ''((background (soft gradient)))
(main-text (serif black))
(decorative-elements (romantic-flowers warm-candles colorful-cake)))

(card-elements ((centered-title "Happy Birthday, " user_name)
separator
(wish-output name_analysis)
(if extra_elements (subtle-details-output extra_elements))
; birthday-themed illustrations that don''t overlap with the text
(birthday-illustrations))))

(defun GenerateWish (user_input)
"Run this function to generate a warm birthday wish based on the symbolic meaning of the name and any other optional information."
(let (system-role BirthdayWishesMaster)
(print (NameMeaningAnalysis (user_name-from user_input) (extra-info-from user_input)))))

;; Execution rules:
;; 1. Upon initiation, the user will input their name and optionally other information (e.g., birthdate, hobbies); the system will call (GenerateWish user_input)
;; 2. Automatically generate a symbolic, name-inspired birthday wish and output an SVG card, subtly incorporating other details, and displaying the recipient''s name on the card. Only output the SVG content, no other text.
', CURRENT_TIMESTAMP),

    ('love-v1', 'love', '1.0', 'Love Card', 'A romantic love card', '<svg><!-- Preview SVG Content for Love Card --></svg>', 
    'As an expert in romantic card design, create a personalized SVG love card (400x600 pixels) based on the user''s input. Use romantic colors like reds, pinks, and purples. Include heart shapes or other symbols of love and affection. Craft a message that expresses deep feelings, appreciation, or romantic sentiments. Incorporate the recipient''s name and any additional details provided. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP),

    ('congratulations-v1', 'congratulations', '1.0', 'Congratulations Card', 'A celebratory congratulations card', '<svg><!-- Preview SVG Content for Congratulations Card --></svg>', 
    'Design a celebratory SVG congratulations card (400x600 pixels) based on the user''s input. Use vibrant, joyful colors and include elements that represent achievement or success (e.g., stars, trophies, confetti). Craft an uplifting message that acknowledges the recipient''s accomplishment. Incorporate the recipient''s name and any specific details about their achievement. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP),

    ('thankyou-v1', 'thankyou', '1.0', 'Thank You Card', 'A heartfelt thank you card', '<svg><!-- Preview SVG Content for Thank You Card --></svg>', 
    'Create a heartfelt SVG thank you card (400x600 pixels) based on the user''s input. Use warm, appreciative colors and include elements that symbolize gratitude (e.g., hands, hearts, flowers). Craft a sincere message of thanks, incorporating specific details about what the person is being thanked for. Include the recipient''s name prominently. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP),

    ('holiday-v1', 'holiday', '1.0', 'Holiday Card', 'A festive holiday card', '<svg><!-- Preview SVG Content for Holiday Card --></svg>', 
    'Design a festive SVG holiday card (400x600 pixels) based on the user''s input and the specific holiday mentioned. Use colors and elements appropriate to the holiday (e.g., red and green for Christmas, orange and black for Halloween). Craft a message that captures the spirit of the holiday and any personal touches provided by the user. Include the recipient''s name if provided. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP),

    ('anniversary-v1', 'anniversary', '1.0', 'Anniversary Card', 'A romantic anniversary card', '<svg><!-- Preview SVG Content for Anniversary Card --></svg>', 
    'Create a romantic SVG anniversary card (400x600 pixels) based on the user''s input. Use elegant colors like gold, silver, or deep reds. Include symbols of lasting love and commitment (e.g., intertwined rings, hearts, flowers). Craft a message that celebrates the couple''s journey together, incorporating any specific details provided (like years together or shared memories). Include the couple''s names prominently. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP),

    ('sorry-v1', 'sorry', '1.0', 'Sorry Card', 'A sincere apology card', '<svg><!-- Preview SVG Content for Sorry Card --></svg>', 
    'Design a thoughtful SVG apology card (400x600 pixels) based on the user''s input. Use soft, subdued colors to convey sincerity. Include elements that symbolize reconciliation or making amends (e.g., olive branches, mended hearts). Craft a genuine message of apology, incorporating specific details about the situation if provided. Include the recipient''s name sensitively. Ensure the text is legible and properly positioned. Output only the SVG code.', 
    CURRENT_TIMESTAMP);

ALTER table "ApiLog" ADD COLUMN "cardId" TEXT NOT NULL;
update "ApiLog" set "cardId" = "id";
update "ApiLog" set "cardId" = "id" where "cardId"is null;
ALTER table "Template" ADD COLUMN "cardId" TEXT ;
update "Template" set "cardId" = "id";
CREATE UNIQUE INDEX "ApiLog_cardId_idx" ON "ApiLog"("cardId");

CREATE TABLE "UserAction" (
  "id" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);


-- 创建外键约束
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ApiLog"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 创建索引以提高查询性能
CREATE INDEX "UserAction_cardId_idx" ON "UserAction"("cardId");


    select * from "ApiLog" order by timestamp desc limit 11;

    select to_char(timestamp, 'YYYY-MM-DD') as dt,count(1) from "ApiLog" group by 1 order by 1 desc;
    select * from "ApiLog" where id=200 order by timestamp desc limit 1;
    select * from "UserAction" order by timestamp desc limit 11;
    select action,count(1) from "UserAction" group by action;
    select to_char(timestamp, 'YYYY-MM-DD') as dt,action,count(1) from "UserAction" group by 1,2 order by 1 desc;
    update "Template" set "previewSvg" = '<svg><!-- Preview SVG Content for Anniversary Card --></svg>' where "id" = 'sorry-v1';

    