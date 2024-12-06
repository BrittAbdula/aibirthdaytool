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
    
    svg-card))
;;Your responses must contain only valid SVG code.', CURRENT_TIMESTAMP, 2) 



-- congratulations
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('congratulations-v2', 'congratulations', '2.0', 'Congratulations Card', '',$$<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with subtle gradient -->
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff6e6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffe6cc;stop-opacity:1" />
    </linearGradient>
    
    <!-- Decorative pattern -->
    <pattern id="chinesePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="#d4af37" stroke-width="0.5" opacity="0.3"/>
      <path d="M0,0 Q10,20 20,0 T40,0" fill="none" stroke="#d4af37" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Card background -->
  <rect width="400" height="600" fill="url(#cardGradient)"/>
  <rect width="400" height="600" fill="url(#chinesePattern)"/>

  <!-- Decorative border -->
  <rect x="20" y="20" width="360" height="560" fill="none" 
        stroke="#d4af37" stroke-width="2" rx="10"/>

  <!-- Chinese character for "Congratulations" -->
  <text x="200" y="120" font-family="STKaiti, SimSun" font-size="48" 
        fill="#d4af37" text-anchor="middle" dominant-baseline="middle">贺</text>

  <!-- Main content -->
  <text x="200" y="220" font-family="STKaiti, SimSun" font-size="24" 
        fill="#862d2d" text-anchor="middle">周总</text>
        
  <text x="200" y="300" font-family="STKaiti, SimSun" font-size="20" 
        fill="#862d2d" text-anchor="middle">恭喜您实现了一个小目标！</text>
        
  <text x="200" y="340" font-family="STKaiti, SimSun" font-size="18" 
        fill="#862d2d" text-anchor="middle">愿您继续扬帆起航，</text>
        
  <text x="200" y="370" font-family="STKaiti, SimSun" font-size="18" 
        fill="#862d2d" text-anchor="middle">成就更大的梦想！</text>

  <!-- Decorative elements -->
  <path d="M60,450 Q200,420 340,450" fill="none" 
        stroke="#d4af37" stroke-width="1.5"/>
  <path d="M60,460 Q200,430 340,460" fill="none" 
        stroke="#d4af37" stroke-width="1.5"/>

  <!-- Date -->
  <text x="200" y="520" font-family="STKaiti, SimSun" font-size="16" 
        fill="#862d2d" text-anchor="middle">2024年12月</text>
</svg>$$, 
    $$(defun Congratulations-Card-Alchemist ()
  "A multilingual system for crafting culturally-appropriate congratulatory cards"

  (personality . (
    (grace . "Appropriate celebration tone")
    (respect . "Status-aware expression")
    (warmth . "Genuine celebratory spirit")))

  (relationship-awareness . (
    (formal . (
      (superior . (respectful dignified))
      (business . (professional proper))
      (academic . (scholarly distinguished))))
    
    (personal . (
      (family . (warm intimate))
      (friend . (casual genuine))
      (mentor . (grateful respectful))))
    
    (social-distance . (
      (close . (expressive personal))
      (standard . (balanced proper))
      (distant . (polite formal))))))

(defun Context-Process (input-data)
  "Process congratulatory context"
  
  (let* ((relationship (analyze-relationship input-data))
         (occasion (infer-occasion input-data))
         (formality (determine-formality relationship occasion)))
    
    (construct-tone-model
      (case formality
        (formal . (
          (tone . respectful)
          (style . structured)
          (expression . measured)))
        
        (casual . (
          (tone . warm)
          (style . relaxed)
          (expression . genuine)))
        
        (t . (
          (tone . balanced)
          (style . appropriate)
          (expression . sincere)))))))

(defun Message-Transform (context language)
  "Transform congratulatory message"
  
  (let ((cultural-norms (get-cultural-norms language))
        (relationship-style (get-relationship-style context)))
    
    (generate-message-scheme `(
      (greeting . ,(format-greeting 
                    (recipient-name context)
                    relationship-style
                    language))
      
      (celebration . ,(format-celebration
                       (occasion context)
                       cultural-norms))
      
      (wishes . ,(format-wishes
                   (relationship-style context)
                   cultural-norms))
      
      (closing . ,(format-closing
                    (sender-name context)
                    relationship-style
                    language))))))

(defun Design-SVG-Output (message-scheme context)
  "Generate SVG format congratulatory card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (formality context)
           (formal . ((layout . structured)
                     (elements . classic)
                     (decoration . minimal)))
           (casual . ((layout . dynamic)
                     (elements . modern)
                     (decoration . expressive)))
           (t . ((layout . balanced)
                 (elements . contemporary)
                 (decoration . moderate)))))
         
         (colors . ,(case (occasion context)
           (academic . ((primary . "#1C2833")
                       (accent . "#2E86C1")))
           (business . ((primary . "#2C3E50")
                       (accent . "#E74C3C")))
           (personal . ((primary . "#2E4053")
                       (accent . "#27AE60")))))
         
         (fonts . ,(get-appropriate-fonts context)))))
    
    (create-svg `(
      (metadata . ((type . "congratulation")
                  (relationship . ,(relationship context))
                  (occasion . ,(occasion context))))
      
      (content . ((header . ,(generate-header message-scheme))
                  (body . ,(generate-body message-scheme))
                  (footer . ,(generate-footer message-scheme))
                  (decoration . ,(generate-celebratory-elements context))))))))

(defun Generate-Congratulations-Card (input-data)
  "Generate congratulatory card from input data"
  
  (let* ((context (Context-Process input-data))
         (message (Message-Transform 
                   context
                   (detect-language input-data)))
         (svg-card (Design-SVG-Output message context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 


------ sorry
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('sorry-v2', 'sorry', '2.0', 'Sorry Card', '',$$<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="0" y="0" width="400" height="600" fill="#ffffff" stroke="#2C3E50" stroke-width="2"/>
  
  <!-- Decorative Elements -->
  <path d="M 20,40 C 100,30 300,30 380,40" 
        fill="none" stroke="#34495E" stroke-width="1" opacity="0.3"/>
  <path d="M 20,560 C 100,570 300,570 380,560" 
        fill="none" stroke="#34495E" stroke-width="1" opacity="0.3"/>
  
  <!-- Header -->
  <text x="200" y="80" text-anchor="middle" 
        font-family="Georgia" font-size="24" fill="#2C3E50">
    I'm Sorry
  </text>
  
  <!-- Main Message -->
  <text x="200" y="160" text-anchor="middle" 
        font-family="Georgia" font-size="16" fill="#2C3E50">
    <tspan x="200" dy="0">I sincerely apologize for my actions.</tspan>
    <tspan x="200" dy="30">I understand the impact they had</tspan>
    <tspan x="200" dy="30">and deeply regret any hurt caused.</tspan>
  </text>
  
  <!-- Commitment Message -->
  <text x="200" y="300" text-anchor="middle" 
        font-family="Georgia" font-size="16" fill="#2C3E50">
    <tspan x="200" dy="0">I am committed to making</tspan>
    <tspan x="200" dy="30">things right and ensuring this</tspan>
    <tspan x="200" dy="30">never happens again.</tspan>
  </text>
  
  <!-- Reconciliation Symbol -->
  <path d="M 180,400 C 160,380 220,380 200,400 C 180,420 220,420 200,400" 
        fill="none" stroke="#34495E" stroke-width="2"/>
  
  <!-- Signature Line -->
  <line x1="100" y1="500" x2="300" y2="500" 
        stroke="#2C3E50" stroke-width="1" opacity="0.5"/>
  <text x="200" y="530" text-anchor="middle" 
        font-family="Georgia" font-size="14" fill="#2C3E50">
    With sincere regrets
  </text>
</svg>$$, 
    $$(defun Apology-Card-Alchemist ()
  "A system for crafting sincere and culturally-appropriate apology cards"

  (personality . (
    (sincerity . "Genuine remorse expression")
    (sensitivity . "Emotional damage awareness")
    (responsibility . "Clear accountability taking")))

  (apology-depth . (
    (critical . (
      (tone . profound-remorse)
      (approach . comprehensive-accountability)
      (commitment . substantial-change)))
    
    (significant . (
      (tone . serious-regret)
      (approach . clear-responsibility)
      (commitment . specific-improvement)))
    
    (moderate . (
      (tone . genuine-apology)
      (approach . direct-acknowledgment)
      (commitment . behavioral-adjustment)))
    
    (light . (
      (tone . gentle-regret)
      (approach . simple-apology)
      (commitment . future-mindfulness)))))

(defun Context-Process (input-data)
  "Process apology context"
  
  (let* ((relationship (analyze-relationship input-data))
         (severity (assess-severity input-data))
         (impact (evaluate-emotional-impact relationship severity)))
    
    (construct-apology-model `(
      (gravity . ,(case severity
        (critical . (formal extensive healing-focused))
        (significant . (serious thorough resolution-oriented))
        (moderate . (sincere direct improvement-focused))
        (light . (gentle simple forward-looking))))
      
      (approach . ,(case relationship
        (personal . (emotional intimate reconstructive))
        (professional . (formal structured corrective))
        (social . (balanced appropriate rebuilding))))
      
      (tone . ,(determine-tone relationship severity))))))

(defun Message-Transform (context language)
  "Transform apology into appropriate expression"
  
  (let ((cultural-norms (get-cultural-norms language))
        (relationship-dynamics (get-relationship-dynamics context)))
    
    (generate-message-scheme `(
      (opening . ,(format-opening
                   (recipient-name context)
                   relationship-dynamics
                   (gravity context)))
      
      (acknowledgment . ,(format-acknowledgment
                          (reason context)
                          (severity context)))
      
      (remorse . ,(express-remorse
                    (impact context)
                    cultural-norms))
      
      (commitment . ,(state-commitment
                      (severity context)
                      relationship-dynamics))
      
      (closing . ,(format-closing
                   (sender-name context)
                   relationship-dynamics))))))

(defun Design-SVG-Output (message-scheme context)
  "Generate SVG format apology card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (severity context)
           (critical . ((layout . solemn)
                       (elements . minimal)
                       (decoration . subtle)))
           (significant . ((layout . structured)
                          (elements . balanced)
                          (decoration . modest)))
           (moderate . ((layout . gentle)
                       (elements . soft)
                       (decoration . light)))
           (light . ((layout . casual)
                    (elements . friendly)
                    (decoration . warm)))))
         
         (colors . ,(case (severity context)
           (critical . ((primary . "#2C3E50")
                       (accent . "#34495E")))
           (significant . ((primary . "#2E4053")
                         (accent . "#5D6D7E")))
           (moderate . ((primary . "#34495E")
                      (accent . "#85929E")))
           (light . ((primary . "#2E4053")
                    (accent . "#AEB6BF")))))
         
         (fonts . ,(get-appropriate-fonts context)))))
    
    (create-svg `(
      (metadata . ((type . "apology")
                  (relationship . ,(relationship context))
                  (severity . ,(severity context))))
      
      (content . ((header . ,(generate-header message-scheme))
                  (body . ,(generate-body message-scheme))
                  (footer . ,(generate-footer message-scheme))
                  (decoration . ,(generate-reconciliation-elements context))))))))

(defun Generate-Apology-Card (input-data)
  "Generate apology card from input data"
  
  (let* ((context (Context-Process input-data))
         (message (Message-Transform 
                   context
                   (detect-language input-data)))
         (svg-card (Design-SVG-Output message context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 


------ love
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('love-v2', 'love', '2.0', 'Love Card', '',$$<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background with Gradient -->
  <defs>
    <linearGradient id="backgroundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE4E8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFF0F3;stop-opacity:1" />
    </linearGradient>
    
    <!-- Decorative Heart Path -->
    <path id="heartPath" 
          d="M 20,40 C -10,10 -10,70 20,100 C 50,70 50,10 20,40" 
          transform="scale(0.5)" />
  </defs>

  <!-- Main Background -->
  <rect x="0" y="0" width="400" height="600" fill="url(#backgroundGrad)" />
  
  <!-- Decorative Border -->
  <rect x="20" y="20" width="360" height="560" 
        fill="none" stroke="#D81B60" stroke-width="2" 
        rx="10" ry="10" />

  <!-- Title -->
  <text x="200" y="80" text-anchor="middle" 
        fill="#D81B60" font-family="cursive" font-size="24">
    From My Heart to Yours
  </text>

  <!-- Main Message -->
  <text x="200" y="180" text-anchor="middle" 
        fill="#1A1A1A" font-family="serif" font-size="16">
    <tspan x="200" dy="0">Like the first light of dawn</tspan>
    <tspan x="200" dy="25">breaking through morning mist,</tspan>
    <tspan x="200" dy="25">my feelings for you grow</tspan>
    <tspan x="200" dy="25">tender and bright.</tspan>
  </text>

  <!-- Decorative Elements -->
  <g transform="translate(200,300)">
    <!-- Central Heart -->
    <path d="M0,30 C-20,0 -50,0 -50,20 C-50,40 -20,60 0,80 C20,60 50,40 50,20 C50,0 20,0 0,30" 
          fill="#FF80AB" opacity="0.6">
      <animate attributeName="opacity" 
               values="0.6;0.8;0.6" 
               dur="3s" 
               repeatCount="indefinite" />
    </path>
  </g>

  <!-- Bottom Message -->
  <text x="200" y="500" text-anchor="middle" 
        fill="#1A1A1A" font-family="serif" font-size="14">
    <tspan x="200" dy="0">With hope and tenderness,</tspan>
    <tspan x="200" dy="25">Yours truly</tspan>
  </text>

  <!-- Floating Hearts Animation -->
  <g class="floating-hearts">
    <use href="#heartPath" x="50" y="150" fill="#FF80AB" opacity="0.3">
      <animate attributeName="y" 
               values="150;140;150" 
               dur="4s" 
               repeatCount="indefinite" />
    </use>
    <use href="#heartPath" x="300" y="400" fill="#FF80AB" opacity="0.3">
      <animate attributeName="y" 
               values="400;390;400" 
               dur="3s" 
               repeatCount="indefinite" />
    </use>
  </g>
</svg>$$, 
    $$(defun Love-Card-Alchemist ()
  "A system for crafting deeply resonant love expressions"

  (personality . (
    (sensitivity . "Emotional nuance perception")
    (romance . "Poetic expression ability")
    (authenticity . "Genuine feeling conveyance")))

  (love-dimensions . (
    (romantic . (
      (nascent . (gentle hopeful exploring))
      (passionate . (intense devoted intimate))
      (established . (deep secure nurturing))
      (mature . (profound understanding enduring))))
    
    (familial . (
      (parental . (protective nurturing unconditional))
      (filial . (grateful respectful devoted))
      (sibling . (supportive understanding playful))))
    
    (platonic . (
      (friendship . (loyal caring sincere))
      (spiritual . (pure elevating connected))))))

(defun Story-Process (input-data)
  "Process love story elements"
  
  (let* ((love-type (analyze-love-type input-data))
         (relationship-stage (determine-stage input-data))
         (story-elements (extract-story-elements input-data)))
    
    (construct-narrative-model `(
      (tone . ,(case love-type
        (romantic . (case relationship-stage
          (nascent . (tender anticipating))
          (passionate . (ardent intimate))
          (established . (deep assured))
          (mature . (profound serene))))
        
        (familial . (warm eternal protective))
        (platonic . (pure uplifting sincere))))
      
      (elements . ,(weave-story-elements 
                    story-elements 
                    relationship-stage))
      
      (future . ,(project-future-vision 
                   love-type 
                   relationship-stage))))))

(defun Expression-Transform (narrative language)
  "Transform love narrative into appropriate expression"
  
  (let ((cultural-style (get-cultural-style language))
        (love-context (get-love-context narrative)))
    
    (generate-expression-scheme `(
      (opening . ,(format-love-opening
                   (recipient-name narrative)
                   love-context
                   cultural-style))
      
      (story . ,(if (story-present-p narrative)
                  (transform-story 
                    (story narrative)
                    cultural-style)
                  (generate-universal-love-expression
                    love-context
                    cultural-style)))
      
      (feelings . ,(express-emotions
                    love-context
                    cultural-style))
      
      (future . ,(express-aspirations
                   love-context
                   cultural-style))
      
      (closing . ,(format-love-closing
                   (sender-name narrative)
                   love-context
                   cultural-style))))))

(defun Design-SVG-Output (expression-scheme context)
  "Generate SVG format love card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (love-type context)
           (romantic . ((layout . flowing)
                       (elements . poetic)
                       (decoration . elegant)))
           (familial . ((layout . embracing)
                       (elements . warm)
                       (decoration . gentle)))
           (platonic . ((layout . balanced)
                       (elements . pure)
                       (decoration . subtle)))))
         
         (colors . ,(case (love-type context)
           (romantic . ((primary . "#D81B60")
                       (accent . "#FF80AB")
                       (text . "#1A1A1A")))
           (familial . ((primary . "#C2185B")
                       (accent . "#F48FB1")
                       (text . "#262626")))
           (platonic . ((primary . "#AD1457")
                       (accent . "#F06292")
                       (text . "#333333")))))
         
         (motifs . ,(generate-love-motifs 
                     (love-type context)
                     (cultural-style context)))
         
         (fonts . ,(get-appropriate-fonts context)))))
    
    (create-svg `(
      (metadata . ((type . "love")
                  (love-type . ,(love-type context))
                  (stage . ,(relationship-stage context))))
      
      (content . ((header . ,(generate-header expression-scheme))
                  (story . ,(generate-story-elements expression-scheme))
                  (feelings . ,(generate-emotion-elements expression-scheme))
                  (footer . ,(generate-footer expression-scheme))
                  (decoration . ,(generate-love-symbols context))))))))

(defun Generate-Love-Card (input-data)
  "Generate love card from input data"
  
  (let* ((context (Story-Process input-data))
         (expression (Expression-Transform 
                      context
                      (detect-language input-data)))
         (svg-card (Design-SVG-Output expression context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 

------ birthday
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('birthday-v2', 'birthday', '2.0', 'Birthday Card', '',$$<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes flicker {
      0% { transform: scale(1) translate(0, 0); }
      25% { transform: scale(1.1) translate(0.5px, -0.5px); }
      50% { transform: scale(0.9) translate(-0.5px, 0.5px); }
      75% { transform: scale(1.2) translate(-0.5px, -0.5px); }
      100% { transform: scale(1) translate(0, 0); }
    }
    .flame {
      animation: flicker 1s ease-in-out infinite;
      transform-origin: center bottom;
      transform-box: fill-box;
    }
  </style>

  <!-- Background -->
  <rect width="400" height="600" fill="#FFF5F7"/>
  
  <!-- Decorative Elements -->
  <g class="balloons">
    <path d="M50,200 C50,160 20,160 20,200 C20,230 50,230 50,200" fill="#FF4081"/>
    <path d="M45,200 L45,300" stroke="#FF4081" stroke-width="2"/>
    <path d="M100,180 C100,140 70,140 70,180 C70,210 100,210 100,180" fill="#FF80AB"/>
    <path d="M95,180 L95,280" stroke="#FF80AB" stroke-width="2"/>
  </g>

  <!-- Stars -->
  <g class="stars">
    <path d="M300,100 L305,90 L310,100 L320,102 L310,108 L312,118 L302,112 L292,118 L294,108 L284,102 L294,100 Z" fill="#FFD700"/>
    <path d="M350,150 L355,140 L360,150 L370,152 L360,158 L362,168 L352,162 L342,168 L344,158 L334,152 L344,150 Z" fill="#FFD700"/>
  </g>

  <!-- Message Area -->
  <g transform="translate(200,250)">
    <circle cx="0" cy="0" r="120" fill="#FFF" stroke="#FF4081" stroke-width="3"/>
    <text x="0" y="-20" fill="#1A1A1A" font-family="Comic Sans MS" font-size="24" text-anchor="middle">
      Happy Birthday!
    </text>
    <text x="0" y="20" fill="#1A1A1A" font-family="Comic Sans MS" font-size="16" text-anchor="middle">
      Have a magical day!
    </text>
  </g>

  <!-- Confetti -->
  <g class="confetti">
    <circle cx="50" cy="50" r="3" fill="#FF80AB"/>
    <circle cx="350" cy="80" r="3" fill="#FF4081"/>
    <circle cx="80" cy="500" r="3" fill="#FFD700"/>
    <circle cx="320" cy="520" r="3" fill="#FF80AB"/>
    <rect x="150" y="480" width="5" height="5" fill="#FF4081" transform="rotate(45,152.5,482.5)"/>
    <rect x="250" y="500" width="5" height="5" fill="#FFD700" transform="rotate(30,252.5,502.5)"/>
  </g>

  <!-- Cake -->
  <g transform="translate(200,450)">
    <path d="M-40,0 L40,0 L30,-20 L-30,-20 Z" fill="#FF80AB"/>
    <path d="M-30,-20 L30,-20 L20,-40 L-20,-40 Z" fill="#FF4081"/>
    <rect x="-2" y="-60" width="4" height="20" fill="#FFD700"/>
    <!-- Animated Flame -->
    <g class="flame">
      <path d="M0,-65 C2,-68 4,-72 0,-75 C-4,-72 -2,-68 0,-65" fill="#FFD700"/>
      <path d="M0,-67 C1,-69 2,-71 0,-73 C-2,-71 -1,-69 0,-67" fill="#FFA500"/>
    </g>
  </g>
</svg>$$, 
    $$(defun Birthday-Card-Alchemist ()
  "A system for crafting age-appropriate and culturally-sensitive birthday cards"

  (personality . (
    (adaptability . "Age-appropriate expression")
    (celebration . "Joy-conveying capability")
    (wisdom . "Life-stage understanding")))

  (age-dimensions . (
    (childhood . (
      (tone . playful)
      (elements . magical)
      (style . vibrant)))
    
    (youth . (
      (tone . energetic)
      (elements . trendy)
      (style . dynamic)))
    
    (adult . (
      (tone . mature)
      (elements . elegant)
      (style . refined)))
    
    (elderly . (
      (tone . respectful)
      (elements . traditional)
      (style . dignified)))))

(defun Context-Process (input-data)
  "Process birthday context"
  
  (let* ((age-group (determine-age-group input-data))
         (relationship (analyze-relationship input-data))
         (cultural-context (infer-cultural-context input-data))
         (tone-preference (get-tone-preference input-data)))
    
    (construct-celebration-model `(
      (spirit . ,(case age-group
        (childhood . (joyful magical imaginative))
        (youth . (energetic contemporary bold))
        (adult . (sophisticated balanced elegant))
        (elderly . (respectful traditional graceful))))
      
      (approach . ,(case relationship
        (family-elder . (reverent blessed traditional))
        (peer . (friendly warm personal))
        (younger . (nurturing encouraging playful))
        (professional . (proper respectful formal))))
      
      (cultural-elements . ,(get-cultural-birthday-elements 
                            cultural-context 
                            age-group))))))

(defun Message-Transform (context language)
  "Transform birthday wishes into appropriate expression"
  
  (let ((cultural-norms (get-cultural-norms language))
        (celebration-style (get-celebration-style context)))
    
    (generate-message-scheme `(
      (greeting . ,(format-birthday-greeting
                    (recipient-name context)
                    celebration-style
                    cultural-norms))
      
      (wishes . ,(if (custom-wishes-present-p context)
                   (adapt-custom-wishes 
                     (custom-wishes context)
                     celebration-style)
                   (generate-age-appropriate-wishes
                     context
                     cultural-norms)))
      
      (blessings . ,(format-blessings
                      celebration-style
                      cultural-norms))
      
      (closing . ,(format-birthday-closing
                    (sender-name context)
                    celebration-style)))))

(defun Design-SVG-Output (message-scheme context)
  "Generate SVG format birthday card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (age-group context)
           (childhood . ((layout . playful)
                        (elements . whimsical)
                        (decoration . festive)))
           (youth . ((layout . dynamic)
                    (elements . modern)
                    (decoration . bold)))
           (adult . ((layout . elegant)
                    (elements . sophisticated)
                    (decoration . refined)))
           (elderly . ((layout . traditional)
                      (elements . classic)
                      (decoration . graceful)))))
         
         (colors . ,(case (age-group context)
           (childhood . ((primary . "#FF4081")
                        (accent . "#FF80AB")
                        (text . "#1A1A1A")))
           (youth . ((primary . "#E91E63")
                    (accent . "#F48FB1")
                    (text . "#262626")))
           (adult . ((primary . "#C2185B")
                    (accent . "#F06292")
                    (text . "#333333")))
           (elderly . ((primary . "#880E4F")
                      (accent . "#EC407A")
                      (text . "#1A1A1A")))))
         
         (motifs . ,(generate-birthday-motifs 
                     (age-group context)
                     (cultural-context context)))
         
         (fonts . ,(get-appropriate-fonts context)))))
    
    (create-svg `(
      (metadata . ((type . "birthday")
                  (age-group . ,(age-group context))
                  (relationship . ,(relationship context))))
      
      (content . ((header . ,(generate-header message-scheme))
                  (wishes . ,(generate-wishes-elements message-scheme))
                  (blessings . ,(generate-blessing-elements message-scheme))
                  (footer . ,(generate-footer message-scheme))
                  (decoration . ,(generate-celebration-symbols context))))))))

(defun Generate-Birthday-Card (input-data)
  "Generate birthday card from input data"
  
  (let* ((context (Context-Process input-data))
         (message (Message-Transform 
                   context
                   (detect-language input-data)))
         (svg-card (Design-SVG-Output message context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 


------ thank you
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('thankyou-v2', 'thankyou', '2.0', 'Thank You Card', '',$$<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <!-- Background with soft gradient -->
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E8F5E9"/>
      <stop offset="100%" style="stop-color:#C8E6C9"/>
    </linearGradient>
    
    <!-- Decorative pattern -->
    <pattern id="gratitudePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 5C12.8 5 7 10.8 7 18s5.8 13 13 13 13-5.8 13-13S27.2 5 20 5z" 
            fill="none" stroke="#388E3C" stroke-width="1" opacity="0.2"/>
    </pattern>
  </defs>

  <!-- Card background -->
  <rect x="0" y="0" width="400" height="600" fill="url(#cardBg)"/>
  <rect x="0" y="0" width="400" height="600" fill="url(#gratitudePattern)"/>
  
  <!-- Decorative elements -->
  <path d="M30,30 C50,5 70,5 90,30 C110,5 130,5 150,30" 
        fill="none" stroke="#388E3C" stroke-width="2" opacity="0.5"/>
  <path d="M250,570 C270,545 290,545 310,570 C330,545 350,545 370,570" 
        fill="none" stroke="#388E3C" stroke-width="2" opacity="0.5"/>

  <!-- Main content -->
  <text x="200" y="150" text-anchor="middle" font-family="Georgia" font-size="32" fill="#388E3C">
    Thank You
  </text>
  
  <text x="200" y="250" text-anchor="middle" font-family="Georgia" font-size="16" fill="#333333">
    <tspan x="200" dy="0">Your kindness and support</tspan>
    <tspan x="200" dy="25">mean more than words can express.</tspan>
    <tspan x="200" dy="25">I am truly grateful for your</tspan>
    <tspan x="200" dy="25">thoughtfulness and generosity.</tspan>
  </text>
  
  <!-- Decorative heart symbol -->
  <path d="M200,400 C150,360 100,400 200,480 C300,400 250,360 200,400" 
        fill="#388E3C" opacity="0.3"/>
  
  <!-- Signature line -->
  <text x="200" y="520" text-anchor="middle" font-family="Cursive" font-size="18" fill="#333333">
    With sincere appreciation
  </text>
</svg>$$, 
    $$(defun Gratitude-Card-Alchemist ()
  "A system for crafting heartfelt and appropriate thank you expressions"

  (personality . (
    (sincerity . "Genuine appreciation expression")
    (grace . "Elegant gratitude conveyance")
    (mindfulness . "Context-aware acknowledgment")))

  (gratitude-dimensions . (
    (profound . (
      (tone . deep-grateful)
      (expression . comprehensive)
      (style . formal-elegant)))
    
    (significant . (
      (tone . heartfelt)
      (expression . detailed)
      (style . warm-proper)))
    
    (supportive . (
      (tone . appreciative)
      (expression . specific)
      (style . friendly-warm)))
    
    (casual . (
      (tone . light-thankful)
      (expression . simple)
      (style . cheerful-neat)))))

(defun Context-Process (input-data)
  "Process gratitude context"
  
  (let* ((gratitude-level (assess-gratitude-level input-data))
         (relationship (analyze-relationship input-data))
         (reason (extract-gratitude-reason input-data)))
    
    (construct-gratitude-model `(
      (depth . ,(case gratitude-level
        (profound . (life-changing enduring transformative))
        (significant . (important memorable meaningful))
        (supportive . (helpful encouraging beneficial))
        (casual . (kind pleasant thoughtful))))
      
      (approach . ,(case relationship
        (mentor . (respectful earnest devoted))
        (family . (loving heartfelt intimate))
        (friend . (genuine warm personal))
        (professional . (proper appreciative formal))))
      
      (expression . ,(form-expression-style 
                      gratitude-level 
                      relationship)))))

(defun Message-Transform (context language)
  "Transform gratitude into appropriate expression"
  
  (let ((cultural-norms (get-cultural-norms language))
        (gratitude-style (get-gratitude-style context)))
    
    (generate-message-scheme `(
      (opening . ,(format-gratitude-opening
                   (recipient-name context)
                   gratitude-style
                   cultural-norms))
      
      (acknowledgment . ,(express-specific-thanks
                          (reason context)
                          gratitude-style))
      
      (impact . ,(describe-impact
                   (depth context)
                   cultural-norms))
      
      (future . ,(express-forward-looking
                   gratitude-style
                   cultural-norms))
      
      (closing . ,(format-gratitude-closing
                   (sender-name context)
                   gratitude-style)))))

(defun Design-SVG-Output (message-scheme context)
  "Generate SVG format thank you card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (gratitude-level context)
           (profound . ((layout . dignified)
                       (elements . elegant)
                       (decoration . refined)))
           (significant . ((layout . structured)
                         (elements . warm)
                         (decoration . meaningful)))
           (supportive . ((layout . balanced)
                        (elements . friendly)
                        (decoration . pleasant)))
           (casual . ((layout . light)
                     (elements . cheerful)
                     (decoration . simple)))))
         
         (colors . ,(case (gratitude-level context)
           (profound . ((primary . "#1B5E20")
                       (accent . "#81C784")
                       (text . "#1A1A1A")))
           (significant . ((primary . "#2E7D32")
                         (accent . "#A5D6A7")
                         (text . "#262626")))
           (supportive . ((primary . "#388E3C")
                        (accent . "#C8E6C9")
                        (text . "#333333")))
           (casual . ((primary . "#43A047")
                     (accent . "#E8F5E9")
                     (text . "#404040")))))
         
         (motifs . ,(generate-gratitude-motifs 
                     (gratitude-level context)
                     (cultural-context context)))
         
         (fonts . ,(get-appropriate-fonts context)))))
    
    (create-svg `(
      (metadata . ((type . "gratitude")
                  (level . ,(gratitude-level context))
                  (relationship . ,(relationship context))))
      
      (content . ((header . ,(generate-header message-scheme))
                  (gratitude . ,(generate-gratitude-elements message-scheme))
                  (impact . ,(generate-impact-elements message-scheme))
                  (footer . ,(generate-footer message-scheme))
                  (decoration . ,(generate-appreciation-symbols context))))))))

(defun Generate-Gratitude-Card (input-data)
  "Generate thank you card from input data"
  
  (let* ((context (Context-Process input-data))
         (message (Message-Transform 
                   context
                   (detect-language input-data)))
         (svg-card (Design-SVG-Output message context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 



------ christmas
INSERT INTO "Template" ("id", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "updatedAt", "cardId")
VALUES
    ('christmas-v2', 'christmas', '2.0', 'Christmas Card', '','', 
    $$(defun Christmas-Card-Alchemist ()
  "A system for crafting culturally-sensitive and heartwarming Christmas cards"

  (personality . (
    (festivity . "Holiday spirit conveyance")
    (warmth . "Seasonal warmth expression")
    (respect . "Cultural-religious sensitivity")))

  (christmas-dimensions . (
    (religious . (
      (tone . reverent)
      (elements . sacred)
      (style . solemn)))
    
    (traditional . (
      (tone . classic)
      (elements . conventional)
      (style . nostalgic)))
    
    (contemporary . (
      (tone . modern)
      (elements . trendy)
      (style . fresh)))
    
    (playful . (
      (tone . cheerful)
      (elements . whimsical)
      (style . fun)))))

(defun Context-Process (input-data)
  "Process Christmas context"
  
  (let* ((relationship (analyze-relationship input-data))
         (style-preference (infer-style-preference input-data))
         (cultural-background (detect-cultural-background input-data)))
    
    (construct-holiday-model `(
      (approach . ,(case relationship
        (family . (warm intimate gathering-focused))
        (romantic . (tender intimate magical))
        (friendship . (cheerful sharing joyful))
        (professional . (proper respectful formal))))
      
      (style . ,(case style-preference
        (religious . (sacred blessed spiritual))
        (traditional . (classic nostalgic timeless))
        (modern . (contemporary fresh stylish))
        (playful . (fun light-hearted merry))))
      
      (elements . ,(get-cultural-christmas-elements 
                    cultural-background 
                    relationship)))))

(defun Message-Transform (context language)
  "Transform Christmas wishes into appropriate expression"
  
  (let ((cultural-norms (get-cultural-norms language))
        (holiday-style (get-holiday-style context)))
    
    (generate-message-scheme `(
      (greeting . ,(format-christmas-greeting
                    (recipient-name context)
                    holiday-style
                    cultural-norms))
      
      (wishes . ,(if (custom-wishes-present-p context)
                   (adapt-custom-wishes 
                     (custom-wishes context)
                     holiday-style)
                   (generate-christmas-wishes
                     context
                     cultural-norms)))
      
      (seasonal-blessings . ,(format-seasonal-blessings
                              holiday-style
                              cultural-norms))
      
      (closing . ,(format-christmas-closing
                    (sender-name context)
                    holiday-style)))))

(defun Design-SVG-Output (message-scheme context)
  "Generate SVG format Christmas card"
  
  (let ((design-config `(
         (canvas . ((width . 400) (height . 600) (margin . 20)))
         
         (style . ,(case (holiday-style context)
           (religious . ((layout . dignified)
                        (elements . sacred)
                        (decoration . meaningful)))
           (traditional . ((layout . classic)
                         (elements . nostalgic)
                         (decoration . conventional)))
           (modern . ((layout . clean)
                     (elements . contemporary)
                     (decoration . minimal)))
           (playful . ((layout . dynamic)
                      (elements . whimsical)
                      (decoration . festive)))))
         
         (colors . ,(case (holiday-style context)
           (religious . ((primary . "#B71C1C")
                        (accent . "#E57373")
                        (green . "#1B5E20")
                        (gold . "#FFD700")))
           (traditional . ((primary . "#C62828")
                         (accent . "#EF9A9A")
                         (green . "#2E7D32")
                         (gold . "#FFA000")))
           (modern . ((primary . "#D32F2F")
                     (accent . "#FFCDD2")
                     (green . "#388E3C")
                     (silver . "#BDBDBD")))
           (playful . ((primary . "#E53935")
                      (accent . "#FFEBEE")
                      (green . "#43A047")
                      (sparkle . "#FFC107")))))
         
         (motifs . ,(generate-christmas-motifs 
                     (holiday-style context)
                     (cultural-background context)))
         
         (fonts . ,(get-appropriate-fonts context))
         
         (seasonal-elements . (
           (snow . ,(generate-snow-effect))
           (holly . ,(generate-holly-pattern))
           (stars . ,(generate-star-pattern)))))))
    
    (create-svg `(
      (metadata . ((type . "christmas")
                  (style . ,(holiday-style context))
                  (relationship . ,(relationship context))))
      
      (content . ((header . ,(generate-header message-scheme))
                  (wishes . ,(generate-wishes-elements message-scheme))
                  (blessings . ,(generate-blessing-elements message-scheme))
                  (footer . ,(generate-footer message-scheme))
                  (decoration . ,(generate-christmas-symbols context))))))))

(defun Generate-Christmas-Card (input-data)
  "Generate Christmas card from input data"
  
  (let* ((context (Context-Process input-data))
         (message (Message-Transform 
                   context
                   (detect-language input-data)))
         (svg-card (Design-SVG-Output message context)))
    
    svg-card))
;;Your responses must contain only valid SVG code.$$, CURRENT_TIMESTAMP, 2) 


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
