

1. cardGenerator --- init.sql
2. Template --- 01_create_card_generator.sql
3. svg --- card/cloudflare r2
  const [imgUrl, setImgUrl] = useState<string>(`https://store.celeprime.com/${wishCardType}.svg`)
4. spotify --- SpotifySearch.tsx
5. card-constants.ts
6. prompt.ts



INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1mothersday', 'Mother''s Day Card Generator', 'mothersday', 'Create Mother''s Day cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Mother''s Day Card Generator', 'Mother''s Day Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Mother''s Day Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Celebrate Mother''s Day with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique Mother''s Day cards that celebrate the arrival of a new baby","Our AI transforms your baby shower wishes into extraordinary messages of celebration","Customize your cards until they perfectly express your joy and best wishes","Share the celebration with high-quality downloadable images or musical greeting links"]',
  ''
);  

-- eid mubarak

INSERT INTO "CardGenerator" (
  id, name, slug, description, "isSystem", "isPublic",
  "createdAt", "updatedAt", "userId",
  title, label, fields, "templateInfo", why, "promptContent"
) VALUES (
  'clg1eidmubarak', 'Eid Mubarak Card Generator', 'eidmubarak', 'Create Eid Mubarak cards', true, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL,
  'Eid Mubarak Card Generator', 'Eid Mubarak Card',
  '[{"name":"recipientName","type":"text","label":"Recipient''s Name","optional":false},{"name":"relationship","type":"select","label":"Relationship","options":["Myself","Friend","Father","Mother","Wife","Husband","Boyfriend","Girlfriend","Brother","Sister","Daughter","Grandparent","Student","Classmate","Son","Other"],"optional":false,"defaultValue":"Friend"},{"name":"message","type":"textarea","label":"Eid Mubarak Message (optional)","optional":true},{"name":"senderName","type":"text","label":"Your Name (optional)","optional":true}]',
  'Celebrate Eid Mubarak with personalized cards from MewtruCard''s collection of free customizable templates ✨',
  '["MewtruCard''s AI creates unique Eid Mubarak cards that celebrate the arrival of a new baby","Our AI transforms your baby shower wishes into extraordinary messages of celebration","Customize your cards until they perfectly express your joy and best wishes","Share the celebration with high-quality downloadable images or musical greeting links"]',
  ''
);  
