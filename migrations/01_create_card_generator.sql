CREATE TABLE "CardGenerator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "advancedFields" JSONB,
    "templateInfo" TEXT,
    "why" JSONB,
    "promptContent" TEXT NOT NULL,

    CONSTRAINT "CardGenerator_pkey" PRIMARY KEY ("id")
);


-- Insert love card generator
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1love', 'Love Card Generator', 'love', 'Express your deepest feelings with romantic love cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Love Card Generator', 'Love Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Partner","Spouse","Crush","Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Partner"},{"name":"message","type":"textarea","label":"Love story (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Express your love with personalized, heartfelt cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI generator creates unique love cards that capture your deepest emotions","Your heartfelt messages become extraordinary with our AI-crafted personal expressions of love","With MewtruCard''s love cards, you can edit and refine until your message is perfect","Share your feelings in a special way with high-quality images or musical greeting links"]',
  ''
);


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1congrats', 'Congratulations Card Generator', 'congratulations', 'Create celebratory congratulations cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Congratulations Card Generator', 'Congratulations Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Congratulatory Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Celebrate achievements with personalized congratulations cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique congratulatory cards that celebrate success","Our AI transforms your congratulations into extraordinary personalized messages","Customize your cards until they perfectly express your pride and joy","Share the achievement with high-quality downloadable images or musical greeting links"]',
  ''
);


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1holiday', 'Holiday Card Generator', 'holiday', 'Create festive holiday cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Holiday Card Generator', 'Holiday Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"holiday","type":"select","label":"Holiday (optional)","options":["Christmas","New Year","Easter","Hanukkah","Diwali","Other"],"optional":true},{"name":"message","type":"textarea","label":"Holiday Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Share the holiday spirit with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique holiday cards that capture the festive spirit","Our AI transforms your holiday wishes into extraordinary seasonal greetings","Customize your holiday cards until they perfectly express your seasonal joy","Share the celebration with high-quality downloadable images or musical greeting links"]',
  ''
);


 
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1anniv', 'Anniversary Card Generator', 'anniversary', 'Create special anniversary cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Anniversary Card Generator', 'Anniversary Card',
  '[{"name":"celebrantNames","type":"text","label":"Celebrants'' Names (e.g., John & Mary Smith)","optional":false},{"name":"Sender","type":"select","label":"Sender","options":["Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Boyfriend"},{"name":"yearsTogether","type":"age","label":"Years Together (optional)","optional":true},{"name":"StoryOrWishes","type":"textarea","label":"Story or Wishes (optional)","optional":true}]',
  'Send your love and warm wishes on personalized, anniversary cards from MewtruCard collection of free customizable templates ✨',
  '["MewtruCard''s AI generator creates truly unique anniversary designs for you - each card is an original masterpiece that tells your story.","Your heartfelt messages become extraordinary with MewtruCard, as our AI crafts personalized anniversary greetings that reflect your special bond.","With MewtruCard''s anniversary cards, you maintain full creative control - edit and refine your AI-generated designs until they''re perfect.","Share your MewtruCard anniversary moments your way - download as free high-quality images or create musical greeting links that make your celebration unforgettable."]',
  ''
); 


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1sorry', 'Sorry Card Generator', 'sorry', 'Create sincere apology cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Sorry Card Generator', 'Sorry Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"reason","type":"textarea","label":"Reason for Apology (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Express your sincere apologies with thoughtful cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique apology cards that convey genuine remorse","Our AI helps transform your apology into a heartfelt message","Customize your cards until they perfectly express your sincerity","Share your apology with high-quality downloadable images or musical greeting links"]',
  ''
);




INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1xmas', 'Christmas Card Generator', 'christmas', 'Create festive Christmas cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Christmas Card Generator', 'Christmas Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Christmas Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Share the magic of Christmas with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique Christmas cards that capture the holiday magic","Our AI transforms your Christmas wishes into extraordinary seasonal greetings","Customize your Christmas cards until they perfectly express your holiday spirit","Share the joy with high-quality downloadable images or musical greeting links"]',
  ''
);



INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1newyear', 'New Year Card Generator', 'newyear', 'Create New Year celebration cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'New Year Card Generator', 'New Year Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"New Year Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Welcome the New Year with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique New Year cards that capture the spirit of new beginnings","Our AI transforms your New Year wishes into extraordinary greetings","Customize your cards until they perfectly express your hopes for the year ahead","Share the celebration with high-quality downloadable images or musical greeting links"]',
  ''
);



INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1teacher', 'Teacher Card Generator', 'teacher', 'Create appreciation cards for teachers', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Teacher Card Generator', 'Teacher Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Student"},{"name":"message","type":"textarea","label":"Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Show your appreciation for teachers with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique teacher appreciation cards that express genuine gratitude","Our AI transforms your thanks into extraordinary messages of appreciation","Customize your cards until they perfectly express your respect and thankfulness","Share your appreciation with high-quality downloadable images or musical greeting links"]',
  ''
);



INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1graduation', 'Graduation Card Generator', 'graduation', 'Create graduation celebration cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Graduation Card Generator', 'Graduation Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Classmate"},{"name":"message","type":"textarea","label":"Graduation Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Celebrate academic achievements with personalized graduation cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique graduation cards that celebrate academic success","Our AI transforms your congratulations into extraordinary messages of achievement","Customize your cards until they perfectly express your pride and best wishes","Share the accomplishment with high-quality downloadable images or musical greeting links"]',
  ''
);


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
    'clg1thankyou', 'Thank You Card Generator', 'thankyou', 'Create thank you cards', true, true,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
    'Thank You Card Generator', 'Thank You Card',
    '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Thank You Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    'Express your gratitude with personalized thank you cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique thank you cards that express genuine appreciation","Our AI transforms your thanks into extraordinary messages of gratitude","Customize your cards until they perfectly express your appreciation","Share your gratitude with high-quality downloadable images or musical greeting links"]',
    ''
);


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "advancedFields", "templateInfo", why, "promptContent"
) VALUES (
  'clg1birthday', 'Birthday Card Generator', 'birthday', 'Create birthday celebration cards', true, true,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
    'Birthday Card Generator', 'Birthday Card',
    '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Birthday Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    '[{"name":"age","type":"age","label":"Age (optional)","optional":true},{"name":"tone","type":"select","label":"Message Tone (optional)","options":["Sincere and Warm","Playful and Cute","Romantic and Poetic","Lighthearted and Joyful","Inspirational and Encouraging"],"optional":true},{"name":"bestWishes","type":"select","label":"Best Wishes (optional)","options":["Success","Happiness","Good Health","Love and Joy","Adventures","Career Advancement"],"optional":true},{"name":"additionalInfo","type":"textarea","label":"Additional Information (optional)","placeholder":"Anything you want to say or your Story","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","placeholder":"Enter your name","optional":true}]',
    'Celebrate birthdays with personalized cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique birthday cards that celebrate special occasions","Our AI transforms your birthday wishes into extraordinary messages of celebration","Customize your cards until they perfectly express your joy and best wishes","Share the celebration with high-quality downloadable images or musical greeting links"]',
    ''
);


INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
    'clg1thankyou', 'Thank You Card Generator', 'thankyou', 'Create thank you cards', true, true,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
    'Thank You Card Generator', 'Thank You Card',
    '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Thank You Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    'Express your gratitude with personalized thank you cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique thank you cards that express genuine appreciation","Our AI transforms your thanks into extraordinary messages of gratitude","Customize your cards until they perfectly express your appreciation","Share your gratitude with high-quality downloadable images or musical greeting links"]',
    ''
);

-- baby
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1baby', 'Baby Card Generator', 'baby', 'Create baby shower cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Baby Card Generator', 'Baby Card',
  '[{"name":"babyName","type":"text","label":"Baby''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Baby Shower Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    'Celebrate the arrival of a new baby with personalized cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique baby shower cards that celebrate the arrival of a new baby","Our AI transforms your baby shower wishes into extraordinary messages of celebration","Customize your cards until they perfectly express your joy and best wishes","Share the celebration with high-quality downloadable images or musical greeting links"]',
    ''
);

-- wedding
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1wedding', 'Wedding Card Generator', 'wedding', 'Create wedding celebration cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Wedding Card Generator', 'Wedding Card',
  '[{"name":"coupleNames","type":"text","label":"Couple''s Names","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Wedding Wishes (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    'Celebrate weddings with personalized cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique wedding cards that celebrate the union of two hearts","Our AI transforms your wedding wishes into extraordinary messages of celebration","Customize your cards until they perfectly express your joy and best wishes","Share the celebration with high-quality downloadable images or musical greeting links"]',
    ''
);


-- good luck
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1goodluck', 'Good Luck Card Generator', 'goodluck', 'Create good luck cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Good Luck Card Generator', 'Good Luck Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Good Luck Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
    'Wish someone good luck with personalized cards from MewtruCard''s collection of free customizable templates ✨',
    '["MewtruCard''s AI creates unique good luck cards that express genuine wishes for success","Our AI transforms your good luck message into extraordinary messages of encouragement","Customize your cards until they perfectly express your support","Share your good luck wishes with high-quality downloadable images or musical greeting links"]',
    ''
);


-- valentine
INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1valentine', 'Valentine Card Generator', 'valentine', 'Create Valentine''s Day cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Valentine Card Generator', 'Valentine Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Valentine''s Day Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Celebrate love with personalized Valentine''s Day cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique Valentine''s Day cards that express genuine love","Our AI transforms your Valentine''s Day wishes into extraordinary messages of love","Customize your cards until they perfectly express your love and best wishes","Share your love with high-quality downloadable images or musical greeting links"]',
  ''
);  