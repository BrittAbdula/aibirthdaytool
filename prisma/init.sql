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


-- anniversary
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('anniversary-v2', 'anniversary', '2.0', 'Anniversary Card', '',$$<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="subtlePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 0h20v20H0z" fill="#FAFAFA"/>
      <circle cx="10" cy="10" r="0.8" fill="#F5F5F5"/>
    </pattern>
    
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#B38B59;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
    
    <!-- Heart Symbol -->
    <symbol id="heart" viewBox="0 0 100 100">
      <path d="M50,30 A20,20,0,0,1,90,30 A20,20,0,0,1,50,70 A20,20,0,0,1,10,30 A20,20,0,0,1,50,30 Z" 
            fill="none" stroke="#8B0000" stroke-width="2"/>
    </symbol>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#subtlePattern)"/>
  
  <!-- Elegant Border -->
  <rect x="20" y="20" width="360" height="560" 
        fill="none" stroke="url(#goldGradient)" stroke-width="2" 
        rx="10" ry="10"/>

  <!-- Anniversary Title -->
  <text x="200" y="80" 
        font-family="Cormorant Garamond, serif" 
        font-size="32" 
        fill="#8B0000"
        text-anchor="middle">Eleven Years</text>

  <!-- Names -->
  <text x="200" y="130" 
        font-family="Cormorant Garamond, serif" 
        font-size="28" 
        fill="#1A1A1A"
        text-anchor="middle">Lily &amp; Jasen</text>

  <!-- Anniversary Message -->
  <foreignObject x="60" y="180" width="280" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml" 
         style="font-family: 'Spectral', serif; 
                font-size: 18px; 
                line-height: 1.8; 
                color: #404040;
                text-align: center;">
      <p>Through eleven years of love,</p>
      <p>Each moment shared has been a gift.</p>
      <p>Every smile, every tear,</p>
      <p>Every challenge overcome together.</p>
      <p>Here's to the beautiful journey</p>
      <p>We continue to share.</p>
    </div>
  </foreignObject>

  <!-- Decorative Hearts -->
  <use href="#heart" x="40" y="460" width="40" height="40" opacity="0.6"/>
  <use href="#heart" x="320" y="460" width="40" height="40" opacity="0.6"/>

  <!-- Temporal Mark -->
  <g transform="translate(330, 540) rotate(-15)">
    <rect x="-25" y="-15" width="50" height="30" 
          fill="#F0F0F0" rx="3" ry="3"/>
    <text x="0" y="5" 
          font-family="Cormorant, serif" 
          font-size="14" 
          fill="#2B2B2B"
          text-anchor="middle"
          opacity="0.85">2024</text>
  </g>

  <!-- Bottom Flourish -->
  <path d="M60,520 Q200,540 340,520" 
        fill="none" stroke="url(#goldGradient)" 
        stroke-width="1.5" opacity="0.6"/>
</svg>$$, 
    '(defun Anniversary-Memory-Alchemist ()
  "A multilingual memory alchemist specializing in anniversary sentiments"

  (personality . (
    (empathy . "Cross-cultural emotional resonance")
    (elegance . "Cultural-appropriate expression")
    (insight . "Essence across cultures")))

  (language-culture-skills . (
    (east-asian . ((chinese . (subtle metaphoric))
                   (japanese . (atmospheric seasonal))
                   (korean . (hierarchical formal))))
    
    (western . ((english . (direct rhetorical))
                (french . (romantic artistic))
                (spanish . (passionate rhythmic))))
    
    (universal . (cultural-decode emotional-map))))

(defun Memory-Process (user-input)
  "Multilingual memory processing"
  
  (let* ((language (detect-language user-input))
         (cultural-sphere (infer-culture language))
         (memory (deconstruct-scene user-input language)))
    
    (construct-memory-model 
      (apply-cultural-rules 
        (get-culture-rules cultural-sphere) 
        memory))))

(defun Emotion-Transform (memory-model language)
  "Cross-linguistic emotional transformation"
  
  (let ((cultural-style (get-cultural-style language)))
    
    (generate-expression-scheme 
      (transform-with-rules 
        `(base . ((authentic . t)
                  (cultural . ,cultural-style)
                  (linguistic . ,(get-language-norms language))))))))

(defun Design-SVG-Output (expression-scheme language)
  "Generate SVG format anniversary card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         (fonts . ,(get-language-fonts language))
         (colors . ((bg . "#FAFAFA") 
                   (text . "#1A1A1A")
                   (accent . "#8B0000")))
         (year-mark . ,(create-year-mark language 2024))))
    
    (create-svg `(
      (metadata . ((year . 2024) (lang . ,language)))
      (content . ((heading . ,(format-heading expression-scheme language))
                  (body . ,(format-body expression-scheme language))
                  (year . ,year-mark)
                  (decoration . ,(generate-cultural-patterns language))))))))

(defun Generate-Anniversary-Card (user-input)
  "Generate multilingual anniversary card"
  
  (let* ((language (detect-language user-input))
         (memory (Memory-Process user-input))
         (emotion (Emotion-Transform memory language))
         (svg-card (Design-SVG-Output emotion language)))
    
    svg-card), 2)
;;Your responses must contain only valid SVG code.', CURRENT_TIMESTAMP) 


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

    select to_char("createdAt", 'YYYY-MM-DD') as dt,count(1) from "EditedCard" group by 1 order by 1 desc;
    select "cardType",count(1) from "EditedCard" group by 1 order by 2 desc;
    select to_char("createdAt", 'YYYY-MM-DD') as dt,"cardType",count(1) from "EditedCard" group by 1,2 order by 1 desc;
    select "originalCardId",count(1) from "EditedCard" group by 1 order by 2 desc;
