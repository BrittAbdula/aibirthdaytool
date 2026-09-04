/**
 * Emotional registers: the "types" a card can be cast into.
 *
 * A register is not an occasion. A birthday can be a party, a blessing, a
 * quiet devotion or a roast; a "sorry" can be pleading, steady or cute. The
 * director (emotion-director.ts) reads the brief and picks ONE register, then
 * makes concrete choices inside that register's range. Every range is wide on
 * purpose — two cards in the same register should still not look alike.
 */

export type RegisterId =
  | 'pleading-apology'
  | 'gentle-repair'
  | 'playful-apology'
  | 'gushing-love'
  | 'quiet-devotion'
  | 'sweet-flirt'
  | 'loud-celebration'
  | 'warm-wish'
  | 'bestie-banter'
  | 'tender-nostalgia'
  | 'proud-milestone'
  | 'grateful-glow'
  | 'comfort-and-care'
  | 'sacred-blessing'
  | 'cool-minimal'
  | 'festive-gathering';

export type MotionTempo = 'still' | 'slow' | 'steady' | 'lively' | 'bouncy';

export interface RegisterPalette {
  name: string;
  ground: string;
  ink: string;
  accent: string;
  accent2: string;
}

export interface EmotionRegister {
  id: RegisterId;
  name: string;
  /** Signals in a brief that point here — written for the director. */
  whenToUse: string;
  /** What the sender is going through. */
  senderState: string;
  /** What the recipient should feel before they have read a word. */
  feeling: string;
  paletteRule: string;
  palettes: RegisterPalette[];
  typeVoices: string[];
  compositions: string[];
  /** Metaphor seeds. Inspiration only — the world should come from the message. */
  worlds: string[];
  motion: { tempo: MotionTempo; arrivals: string[]; presences: string[] };
  textures: string[];
  /** Names from the technique library in prompt.ts. */
  techniques: string[];
  forbid: string[];
  /** Style family for raster image / video generation. */
  imageStyle: string;
}

export const DEFAULT_REGISTER_ID: RegisterId = 'warm-wish';

export const EMOTION_REGISTERS: Record<RegisterId, EmotionRegister> = {
  'pleading-apology': {
    id: 'pleading-apology',
    name: 'The 2 a.m. apology',
    whenToUse:
      'Sorry with tears: 😭🥺😢💔, "plz", "maan jao", "don\'t leave", "forgive me", elongated sorryyyy, a long confession, fear of losing the person.',
    senderState: 'Scared of losing them. Vulnerable, a little desperate, still here.',
    feeling: '"They are not going anywhere. They mean it." Softness arriving in a dark room.',
    paletteRule:
      'Low light. A cool field (dusk, fog, night) with ONE warm point of light — that light is the sender staying. Never festive, never gold-foil, never bright pink.',
    palettes: [
      { name: 'rain-washed dusk', ground: '#22304a', ink: '#f3efe6', accent: '#f2b661', accent2: '#6f8aa3' },
      { name: 'fogged glass', ground: '#d9dde0', ink: '#2b3440', accent: '#e07a5f', accent2: '#9aa7b1' },
      { name: 'midnight with one lamp', ground: '#14161f', ink: '#ece6d9', accent: '#ffb347', accent2: '#3d4c6b' },
      { name: 'tear-streaked lilac', ground: '#ded6e6', ink: '#33294a', accent: '#ff7f6b', accent2: '#a294b8' },
    ],
    typeVoices: [
      'soft rounded sans, lowercase, generous leading — like a text typed slowly at night',
      'handwritten-feel italic serif with a slightly uneven baseline',
      'a small quiet serif with a lot of air; the recipient\'s name set larger than the word sorry',
    ],
    compositions: [
      'the message sits low on the canvas like a person sitting on the floor; one light source above',
      'left-aligned narrow column, wide empty right side — the silence after sending',
      'one small object centered in a vast field (a paper boat, a lamp, a phone glowing)',
    ],
    worlds: [
      'rain that slows and finally stops',
      'a lamp left on in a window',
      'a paper boat that stays afloat',
      'a phone screen lighting up a dark room',
      'a knot loosening',
      'an umbrella held over someone else',
    ],
    motion: {
      tempo: 'slow',
      arrivals: [
        'rain streaks ease into stillness while the words fade up',
        'a light warms from cold blue to amber over two seconds',
        'the name draws itself first; the apology follows a beat later',
      ],
      presences: [
        'a breathing glow no faster than a resting heartbeat',
        'a single drop drifting down every few seconds',
        'fog clearing so slowly it is almost imperceptible',
      ],
    },
    textures: ['rain on glass', 'soft worn paper', 'fog blur', 'a notebook page'],
    techniques: ['rain-lines', 'fogged-glass', 'breathing-glow', 'draw-on', 'grain'],
    forbid: [
      'confetti or balloons',
      'gold shimmer',
      'a symmetric formal frame',
      'uppercase small-caps eyebrows',
      'bright pink or candy gradients',
      'elegant wedding script',
    ],
    imageStyle:
      'a single cinematic still at night: one practical light source, rain or fog, muted cool grade with one warm highlight; painterly, never glossy',
  },

  'gentle-repair': {
    id: 'gentle-repair',
    name: 'Steady repair',
    whenToUse:
      'A calm, adult apology: "I was wrong", "I want to fix this", accountability without begging; formal or respectful vibe; few or no emoji.',
    senderState: 'Owning it. Steady, sincere, wants to rebuild, not to be rescued.',
    feeling: 'Sincerity you can lean on. Something broken being mended carefully.',
    paletteRule:
      'Muted, grounded, adult: sage, clay, warm grey, morning-after-rain blues. Gold appears only as a mending line, never as decoration.',
    palettes: [
      { name: 'sage & clay', ground: '#ece7dc', ink: '#2f3a36', accent: '#c46a4b', accent2: '#8fa39a' },
      { name: 'morning after rain', ground: '#e8eef0', ink: '#23313a', accent: '#d9a441', accent2: '#7fa0ad' },
      { name: 'kintsugi', ground: '#1f2326', ink: '#efe8da', accent: '#d4a84b', accent2: '#6b7a80' },
      { name: 'warm grey linen', ground: '#d8d2c8', ink: '#2c2a27', accent: '#b8563f', accent2: '#8a8478' },
    ],
    typeVoices: [
      'a quiet serif in sentence case with a tight measure',
      'a clean grotesk with one italic phrase',
      'typewriter mono for the message, serif for the name',
    ],
    compositions: [
      'two halves that meet in the middle — the layout itself is the repair',
      'editorial left-aligned text with one drawn line crossing a gap',
      'a small centered emblem (a mended bowl, a bridge) above a calm block of text',
    ],
    worlds: ['a kintsugi seam', 'a bridge drawing itself across a gap', 'dawn after rain', 'a door left open', 'two chairs at one table', 'a thread being re-sewn'],
    motion: {
      tempo: 'slow',
      arrivals: ['a crack fills with gold from left to right', 'a bridge line draws itself across the gap', 'grey lifts into warm light'],
      presences: ['a faint shimmer travelling along the seam', 'one slow steady breath'],
    },
    textures: ['linen', 'ceramic glaze', 'paper grain'],
    techniques: ['draw-on', 'emboss', 'gradient-shimmer', 'grain'],
    forbid: ['a begging tone', 'crying emoji as a motif', 'party elements', 'saturated pink'],
    imageStyle: 'gouache on cold-press paper, one soft light, muted earth palette; a single object that means repair',
  },

  'playful-apology': {
    id: 'playful-apology',
    name: 'Sorry, but cute',
    whenToUse:
      'An apology that teases: "still vvvv sorry btw", pinky promise, nicknames, an inside joke inside the sorry, 😅🥺 with a grin, Funny trait + Playful vibe.',
    senderState: 'Knows they are forgiven already, or nearly. Being cute on purpose.',
    feeling: '"We\'re okay." A grin you cannot hold back.',
    paletteRule:
      'Bright but limited: at most two brights on a clean ground, flat fills, white sticker outlines. Playful is not messy.',
    palettes: [
      { name: 'butter & ink', ground: '#f6e7a1', ink: '#23272f', accent: '#ff6b57', accent2: '#4f86c6' },
      { name: 'sticker sheet', ground: '#fff4ec', ink: '#2b2b2b', accent: '#ff5c8a', accent2: '#ffd166' },
      { name: 'mint puppy-eyes', ground: '#d8f0e6', ink: '#1f3b33', accent: '#ff7f50', accent2: '#8fd3c6' },
      { name: 'ruled notebook', ground: '#fbfaf5', ink: '#2a3d66', accent: '#e63946', accent2: '#cfd8e6' },
    ],
    typeVoices: [
      'chunky hand-lettered display with a wobble',
      'marker-style bold sans in mixed case, one word oversized',
      'speech-bubble lettering',
    ],
    compositions: [
      'one big sticker object with a speech bubble holding the sorry',
      'the word sorry repeated as a growing stack down the card',
      'a notebook page: doodles in the margin, the message in the middle',
    ],
    worlds: ['puppy eyes', 'a pinky promise', 'a white flag made of a sock', 'a bandaid shaped like a heart', 'a cat knocking a glass over', 'a paper plane carrying a note'],
    motion: {
      tempo: 'bouncy',
      arrivals: ['elements pop in one at a time with overshoot — comic timing', 'a doodle draws itself with a wobble', 'a paper plane loops in and lands'],
      presences: ['a slow blink every four seconds', 'a pinky wiggle', 'a bandaid bouncing gently'],
    },
    textures: ['sticker gloss', 'marker', 'notebook paper', 'doodle'],
    techniques: ['sticker-outline', 'draw-on', 'pop-in', 'wobble', 'halftone'],
    forbid: ['a sad palette', 'tears rendered seriously', 'formal serif', 'gold foil', 'empty elegance'],
    imageStyle: 'riso-print sticker illustration: two or three flat inks, thick outlines, slight mis-registration, one goofy character',
  },

  'gushing-love': {
    id: 'gushing-love',
    name: 'Overflowing',
    whenToUse:
      'Love that cannot stay inside: "lovvveee youuuu sooo muchhh", ❤️💗💞😘🥰 storms, "my everything", "jaan", elongated words, exclamation floods.',
    senderState: 'Overwhelmed. Wants the other person to feel the size of it.',
    feeling: 'Being adored, loudly. A hug that lifts you off the ground.',
    paletteRule:
      'Warm, saturated, unashamed. One dominant colour fills the canvas; everything else is highlight. This is the one register where a hot-pink wash is honest.',
    palettes: [
      { name: 'cherry crush', ground: '#ff5d73', ink: '#fff2f4', accent: '#ffd6dc', accent2: '#7a0f28' },
      { name: 'blush & wine', ground: '#ffe4ea', ink: '#5a1b2e', accent: '#e0356b', accent2: '#ff9fb6' },
      { name: 'hot pink & ink', ground: '#ff2d95', ink: '#1a0a12', accent: '#fff0f5', accent2: '#ffb3d1' },
      { name: 'sunset heart', ground: '#ffb08a', ink: '#4a1c2a', accent: '#ff3b6b', accent2: '#ffe3a3' },
    ],
    typeVoices: [
      'a huge swelling display — the elongated words kept as written ("youuuu"), letters growing',
      'rounded soft sans, giant, bursting past the edges',
      'a handwritten scrawl at heart-rate speed',
    ],
    compositions: [
      'one word so big it bleeds off the canvas, the message tucked inside it',
      'a heart as a vessel that fills the whole card, the text inside',
      'a flood: the message repeated and fading back into the wash',
    ],
    worlds: ['a heart as a container filling up', 'a tide coming in', 'a phone full of unread I-love-yous', 'sun through closed eyelids', 'a hug from behind', 'a thousand paper hearts'],
    motion: {
      tempo: 'lively',
      arrivals: ['a burst outward from the center, then a settle', 'text swells from the middle like a heartbeat', 'colour floods in from one edge'],
      presences: ['a heartbeat pulse at about seventy beats per minute', 'hearts — a meaningful count — rising slowly', 'a glow that never quite settles'],
    },
    textures: ['soft glow', 'wet ink', 'doodled hearts', 'velvet'],
    techniques: ['heartbeat-pulse', 'bloom-glow', 'particle-with-meaning', 'draw-on'],
    forbid: ['cool minimalism', 'tiny type', 'restraint', 'a muted palette', 'sad blue'],
    imageStyle: 'saturated painterly illustration bathed in one colour, soft bloom light, close and intimate; feels like a hug',
  },

  'quiet-devotion': {
    id: 'quiet-devotion',
    name: 'Home',
    whenToUse:
      'Deep steady love: long-term partners, "you are my home", "always", "forever", anniversaries counted in years, a wife or husband written to with calm certainty.',
    senderState: 'Certain. Grateful. Not performing — telling the truth quietly.',
    feeling: 'Safety. Being fully known and chosen again.',
    paletteRule: 'Warm and low-contrast: candlelit darks or linen creams. The light is a candle, not a spotlight.',
    palettes: [
      { name: 'candlelit', ground: '#2a1f1a', ink: '#f4e9d8', accent: '#e8a54b', accent2: '#7a4a3a' },
      { name: 'linen & ochre', ground: '#efe6d6', ink: '#3a2f28', accent: '#c98a3a', accent2: '#8c6f5a' },
      { name: 'dusk lavender', ground: '#d8d2e6', ink: '#2f2740', accent: '#e6a37f', accent2: '#8f84b4' },
      { name: 'deep teal & cream', ground: '#1e3a3a', ink: '#f1ebdd', accent: '#e7b96a', accent2: '#4f7a78' },
    ],
    typeVoices: [
      'an elegant serif with wide letter-spacing on the name and the message in italic',
      'a small patient serif with generous leading',
      'one hand-drawn word in the sender\'s language, the rest in serif',
    ],
    compositions: [
      'two elements slightly apart that share one light',
      'the text as a column of quiet lines, centered low',
      'a window: a rectangle of warm light in a dark field, the words inside it',
    ],
    worlds: ['a lamp in a window', 'two cups on one table', 'keys on a hook', 'a coat on a chair', 'two moons', 'one blanket', 'a pulse line that is two pulses'],
    motion: {
      tempo: 'slow',
      arrivals: ['a candle catches and its light spreads slowly', 'two lights drift toward each other and stay', 'words fade up one line at a time, as if read aloud'],
      presences: ['an irregular subtle candle flicker', 'a shared breath', 'a very slow shimmer on the name only'],
    },
    textures: ['linen', 'candle glow', 'old wood', 'paper'],
    techniques: ['candle-flicker', 'breathing-glow', 'gradient-shimmer', 'grain', 'draw-on'],
    forbid: ['confetti', 'neon', 'loud type', 'clutter', 'generic floating hearts'],
    imageStyle: 'a golden-hour or candlelit still, shallow depth of field, Kodak Portra warmth; one intimate domestic object',
  },

  'sweet-flirt': {
    id: 'sweet-flirt',
    name: 'Butterflies',
    whenToUse:
      'Crush energy: light, cheeky, shy — "Mine girl 🫶😚", "Madam ji", "cutie", 😉😚🫶, a short sweet message, a Romantic vibe without heaviness.',
    senderState: 'Nervous and delighted. Testing the water with a grin.',
    feeling: 'Butterflies. A note passed in class.',
    paletteRule: 'Light and fresh: two pastels plus one bright. Nothing heavy, nothing dark.',
    palettes: [
      { name: 'peach & lilac', ground: '#ffe1cf', ink: '#3b2a4a', accent: '#b48cff', accent2: '#ff8a80' },
      { name: 'mint & coral', ground: '#d7f2ea', ink: '#1f3a36', accent: '#ff6f61', accent2: '#ffd8a8' },
      { name: 'sky & marigold', ground: '#cfe6ff', ink: '#1f2f57', accent: '#ffb703', accent2: '#ff7aa2' },
      { name: 'strawberry milk', ground: '#ffe8ee', ink: '#5c2a3a', accent: '#ff4d6d', accent2: '#a7d8ff' },
    ],
    typeVoices: ['a playful script for one word, clean sans for the rest', 'a bubbly rounded display', 'a typewriter note on a folded paper'],
    compositions: [
      'a folded note tucked into a corner, opening',
      'the name inside a doodled heart, off-center',
      'a text-message bubble that arrives with a little bounce',
    ],
    worlds: ['a passed note', 'a blush spreading', 'a wink', 'a few meaningful butterflies', 'a strawberry', 'a paper fortune-teller', 'a phone notification'],
    motion: {
      tempo: 'lively',
      arrivals: ['a note slides in and unfolds', 'a blush blooms across the ground', 'a wink, then the words'],
      presences: ['butterflies drifting', 'a shy bounce', 'a slow blink'],
    },
    textures: ['soft pastel paper', 'doodles', 'gloss'],
    techniques: ['pop-in', 'draw-on', 'particle-with-meaning', 'wobble'],
    forbid: ['heavy romance', 'formal serif', 'a dark palette', 'tears'],
    imageStyle: 'pastel storybook illustration, soft outlines, playful spot lighting',
  },

  'loud-celebration': {
    id: 'loud-celebration',
    name: 'Throw the party',
    whenToUse:
      'Volume: ALL CAPS, 🎉🥳🎂🎈, "HAPPIEST BIRTHDAY", "MANY MORE HAPPY RETURNS", exclamation marks, a milestone age that deserves a banner.',
    senderState: 'Hyped. Wants to make noise on their behalf.',
    feeling: 'A party thrown for you. Confetti in the chest.',
    paletteRule: 'High contrast, poster energy: at most three brights, big shapes rather than tiny sparkles.',
    palettes: [
      { name: 'marigold riot', ground: '#ffb703', ink: '#1d1d1d', accent: '#e0245e', accent2: '#2a6df4' },
      { name: 'midnight confetti', ground: '#101828', ink: '#ffffff', accent: '#ffd60a', accent2: '#ff4d8d' },
      { name: 'cobalt pop', ground: '#2453ff', ink: '#fff7e6', accent: '#ffe100', accent2: '#ff5e5b' },
      { name: 'cream carnival', ground: '#fff3dc', ink: '#1b1b1b', accent: '#ff3b30', accent2: '#00a884' },
    ],
    typeVoices: [
      'giant condensed display, all caps, stacked',
      'the age as a monumental numeral, the name in bold sans',
      'poster lettering with a hard shadow offset in the accent',
    ],
    compositions: [
      'poster: the headline fills the top half, the message in a band below',
      'the number as a monument with the message wrapped around it',
      'diagonal energy: elements bursting from one corner',
    ],
    worlds: ['balloons rising', 'a banner unfurling', 'a cake with exactly the right number of candles', 'a burst of streamers', 'a stadium crowd', 'a drum roll'],
    motion: {
      tempo: 'bouncy',
      arrivals: ['elements burst from the center with overshoot', 'the headline slams in letter by letter', 'balloons rise into place'],
      presences: ['confetti drift — twelve pieces at most, real shapes', 'a banner swaying', 'candle flames flickering'],
    },
    textures: ['riso grain', 'poster halftone', 'bold flat colour'],
    techniques: ['pop-in', 'halftone', 'riso-misregistration', 'particle-with-meaning', 'shadow-offset'],
    forbid: ['tiny type', 'a muted palette', 'a meditative pace', 'empty space as the hero'],
    imageStyle: 'a bold riso or screenprint poster: three flat inks, big shapes, halftone texture, slight mis-registration',
  },

  'warm-wish': {
    id: 'warm-wish',
    name: 'Sincere wish',
    whenToUse:
      'A heartfelt everyday wish: "stay blessed", "keep smiling", "hope this year brings...", warm without shouting; also the honest default when a brief is thin.',
    senderState: 'Fond. Means every word, in an ordinary voice.',
    feeling: 'Being wished well by someone who actually means it.',
    paletteRule: 'Warm daylight: honey, terracotta, sky, sage, apricot. Friendly, not formal; one accent does the smiling.',
    palettes: [
      { name: 'honey & terracotta', ground: '#fbefd9', ink: '#3d2b1f', accent: '#d8622b', accent2: '#e9b949' },
      { name: 'sky & marigold', ground: '#e6f0fa', ink: '#23364f', accent: '#f4a300', accent2: '#ff7b54' },
      { name: 'sage & apricot', ground: '#e9efe1', ink: '#2f3d2f', accent: '#ff9f68', accent2: '#8fb39a' },
      { name: 'rose-gold morning', ground: '#fbe8e2', ink: '#4a2c2c', accent: '#d46a6a', accent2: '#e8b86d' },
    ],
    typeVoices: [
      'a friendly serif with the name hand-lettered',
      'a rounded sans, warm and readable',
      'a big greeting in the sender\'s language, hand-drawn, with a quiet serif message',
    ],
    compositions: [
      'a centered wish with one small illustrated object as the anchor',
      'a garland across the top, the message beneath',
      'a candle or cake small at the bottom, the wish above, warm air between',
    ],
    worlds: ['one candle catching', 'a sunrise', 'a garland drawing itself', 'a slice of cake', 'a kite', 'one flower for each year', 'a phone alarm at midnight'],
    motion: {
      tempo: 'steady',
      arrivals: ['a candle catches and light spreads', 'a garland draws itself across', 'a sunrise gradient warms'],
      presences: ['a flame flicker', 'petals or leaves drifting slowly', 'a glow that breathes'],
    },
    textures: ['gouache', 'warm paper', 'soft grain'],
    techniques: ['candle-flicker', 'draw-on', 'grain', 'bloom-glow'],
    forbid: ['a cold palette', 'formal small-caps stationery unless the sender is formal', 'heavy black'],
    imageStyle: 'gouache storybook illustration, dappled morning light, one warm accent',
  },

  'bestie-banter': {
    id: 'bestie-banter',
    name: 'Roast with love',
    whenToUse:
      'Friends teasing: inside jokes, nicknames like "churail" or "neela doremon", 😂😁🤣, "idiot", "bakbak", 3 a.m. calls, Funny trait, Playful vibe.',
    senderState: 'Delighted by this person. Shows love by making fun of them.',
    feeling: '"You get me." Laughing before you finish reading.',
    paletteRule: 'Bold flat colours with comic contrast; leave room for a punchline. Mustard, navy, lime, plum, meme black-and-white.',
    palettes: [
      { name: 'mustard & navy', ground: '#f2c14e', ink: '#1e2a4a', accent: '#ffffff', accent2: '#e63946' },
      { name: 'lime & plum', ground: '#d8f26a', ink: '#3c1642', accent: '#ff5c8a', accent2: '#1b998b' },
      { name: 'photo-booth', ground: '#f7f3ea', ink: '#111111', accent: '#ff3b30', accent2: '#0aa2c0' },
      { name: 'meme monochrome', ground: '#ffffff', ink: '#000000', accent: '#ffde00', accent2: '#ff2e63' },
    ],
    typeVoices: [
      'chunky marker caps for the punchline, plain sans for the setup',
      'meme-style bold sans with a stroke',
      'a handwritten caption under a doodle',
    ],
    compositions: [
      'setup at the top, punchline revealed at the bottom after a beat',
      'a photo-booth strip of three doodled moments',
      'a sticker collage around the name',
    ],
    worlds: ['the inside joke drawn literally', 'a trophy for best listener', 'a receipt of favours owed', 'a group-chat screenshot', 'a warning sign', 'a 3 a.m. phone glow'],
    motion: {
      tempo: 'bouncy',
      arrivals: ['the setup arrives, a beat of nothing, then the punchline pops', 'stickers slap on one by one', 'a doodle draws itself'],
      presences: ['a wobble on the punchline', 'a blinking cursor', 'one sticker slowly spinning'],
    },
    textures: ['sticker', 'marker', 'zine paper', 'photo-booth strip'],
    techniques: ['pop-in', 'sticker-outline', 'halftone', 'wobble', 'draw-on', 'typewriter-reveal'],
    forbid: ['a sentimental palette', 'formal serif', 'gold foil', 'empty elegance', 'generic funny clip-art'],
    imageStyle: 'zine or sticker illustration: thick outlines, flat colours, deadpan humour, the inside joke drawn literally',
  },

  'tender-nostalgia': {
    id: 'tender-nostalgia',
    name: 'I miss old us',
    whenToUse:
      '"I miss", "old us", "remember when", "yaad hai", a date that mattered, long shared history, bittersweet warmth, a Nostalgic vibe.',
    senderState: 'Aching and warm at once. Holding a memory up to the light.',
    feeling: 'A photograph you forgot you had. Sweet and a little sore.',
    paletteRule: 'Faded: sepia, dusty rose, faded blue, warm greys — one colour that survived. Light leaks allowed.',
    palettes: [
      { name: 'sepia & dusty rose', ground: '#efe3d3', ink: '#4a3a30', accent: '#c97b7b', accent2: '#a08a72' },
      { name: 'faded blue', ground: '#dfe6ea', ink: '#2e3b47', accent: '#d9a066', accent2: '#8fa6b5' },
      { name: 'old photograph', ground: '#e8dcc6', ink: '#3b302a', accent: '#b5533c', accent2: '#9c8c74' },
      { name: 'evening film', ground: '#2f2a33', ink: '#efe4d3', accent: '#e0a370', accent2: '#7d6b83' },
    ],
    typeVoices: [
      'typewriter mono for the message with a serif date as the eyebrow',
      'an old letterpress serif, slightly uneven',
      'handwriting on the back of a photograph',
    ],
    compositions: [
      'a photo frame held by tape, caption below',
      'a date as the eyebrow, the memory as the body, wide margins',
      'two overlapping faded frames — then and now',
    ],
    worlds: ['a photo developing', 'a ticket stub', 'a song on repeat', 'rain on a bus window', 'an old chat thread', 'a pressed flower', 'a cassette'],
    motion: {
      tempo: 'slow',
      arrivals: ['the image develops from blank like a polaroid', 'a light leak sweeps once and fades', 'a typewriter reveal of the memory'],
      presences: ['film-grain flicker', 'dust motes drifting', 'a very slow drift, like a memory surfacing'],
    },
    textures: ['film grain', 'tape', 'old paper', 'light leaks'],
    techniques: ['typewriter-reveal', 'grain', 'light-leak', 'polaroid-develop', 'drift'],
    forbid: ['bright saturation', 'confetti', 'sharp modern sans', 'forced cheer'],
    imageStyle: 'a faded film still or polaroid: light leaks, warm grain, one surviving colour',
  },

  'proud-milestone': {
    id: 'proud-milestone',
    name: 'Threshold',
    whenToUse:
      'Achievement and thresholds: congratulations, graduation, promotion, a big anniversary number, a mentor written to with respect and pride.',
    senderState: 'Proud on their behalf. Wants the moment marked properly.',
    feeling: 'Being witnessed at the top of the stairs.',
    paletteRule: 'Deep grounds — navy, forest, graphite, ivory — with a metallic accent the moment has earned. Formal is welcome here.',
    palettes: [
      { name: 'navy & gold', ground: '#14213d', ink: '#fdf6e3', accent: '#e5b72e', accent2: '#3a5a99' },
      { name: 'forest & brass', ground: '#1f3d2f', ink: '#f2ead8', accent: '#c9a24d', accent2: '#5f8a6a' },
      { name: 'ivory & oxblood', ground: '#f4efe6', ink: '#2a1f1f', accent: '#8b1e2d', accent2: '#b89a5a' },
      { name: 'graphite & sunrise', ground: '#2b2d33', ink: '#f5f1ea', accent: '#ff9f1c', accent2: '#6c7a92' },
    ],
    typeVoices: ['an editorial serif with a monumental numeral', 'engraved small caps plus serif', 'a bold grotesk headline with a serif body'],
    compositions: [
      'the number or milestone as a monument, the message beneath',
      'a path or staircase leading up and off the canvas',
      'a certificate-like frame broken by one element that escapes it',
    ],
    worlds: ['doors of light', 'a staircase', 'a summit', 'a diploma ribbon', 'a torch passed on', 'a rocket', 'tree rings marking the years', 'a key'],
    motion: {
      tempo: 'steady',
      arrivals: ['a path draws itself upward', 'doors open from the center', 'the numeral rises and catches the light'],
      presences: ['a slow foil shimmer', 'light widening', 'a ribbon swaying'],
    },
    textures: ['letterpress', 'foil', 'engraved lines'],
    techniques: ['gradient-shimmer', 'emboss', 'draw-on', 'grain'],
    forbid: ['cutesy doodles', 'pastel', 'bubbly type'],
    imageStyle: 'modern letterpress with one foil element, a deep ground, a disciplined two-or-three-ink palette',
  },

  'grateful-glow': {
    id: 'grateful-glow',
    name: 'Thank you, truly',
    whenToUse:
      'Gratitude: thank-you cards, teachers, mentors, "thank you for coming into my life", listing what someone did, 🙏 with warmth rather than ceremony.',
    senderState: 'Moved. Wants the other person to know they were seen.',
    feeling: 'Warmth reflected back at you.',
    paletteRule: 'Warm and grounded — amber, sage, tea, garden greens, warm slate. Light that is given, not sparkled.',
    palettes: [
      { name: 'amber & sage', ground: '#fdf3e1', ink: '#3b3226', accent: '#d98e2b', accent2: '#8aa37b' },
      { name: 'morning tea', ground: '#f3ead9', ink: '#4a3b2a', accent: '#b46a3a', accent2: '#d9b87a' },
      { name: 'garden', ground: '#e4eedd', ink: '#27392a', accent: '#e4794a', accent2: '#7fa66f' },
      { name: 'warm slate', ground: '#34404a', ink: '#f3ecdc', accent: '#ffb86b', accent2: '#7fa0a8' },
    ],
    typeVoices: [
      'a warm serif with generous leading',
      'botanical-plate captions: a small label plus serif',
      'a handwritten thank-you as the hero',
    ],
    compositions: [
      'one bloom for each thing they did, arranged like a botanical plate',
      'light passing from one element to another, the text along the path',
      'a centered thank-you with one small object they would recognise',
    ],
    worlds: ['a garden where each bloom is something they did', 'a lantern handed over', 'a diary page', 'a chalkboard', 'a cup of tea kept warm', 'a bookmark'],
    motion: {
      tempo: 'steady',
      arrivals: ['blooms open one after another', 'a lantern is lit and its light travels', 'a chalk line writes the thank-you'],
      presences: ['leaves breathing', 'a warm glow travelling slowly', 'petals drifting'],
    },
    textures: ['watercolor', 'botanical linework', 'warm paper'],
    techniques: ['draw-on', 'bloom-glow', 'bleed', 'grain'],
    forbid: ['neon', 'party elements', 'cold blue', 'empty elegance'],
    imageStyle: 'a modern botanical plate in watercolor: precise linework, warm earth palette, a breath of gold',
  },

  'comfort-and-care': {
    id: 'comfort-and-care',
    name: "I've got you",
    whenToUse:
      'Get well, hard times, worry: "take care", "eat on time", "rest", "I\'m here", illness, grief-adjacent, a parent being fussed over.',
    senderState: 'Worried and tender. Wants to wrap the person up.',
    feeling: 'Being held. A blanket settling on your shoulders.',
    paletteRule: 'Soft, low-contrast, warm neutrals — blanket, dusk, eucalyptus, warm night. Nothing sharp or bright.',
    palettes: [
      { name: 'blanket', ground: '#e9e2d8', ink: '#3d3a38', accent: '#d98c6b', accent2: '#a8b8c0' },
      { name: 'soft dusk', ground: '#d7dde8', ink: '#2f3745', accent: '#f0b37e', accent2: '#8fa3bd' },
      { name: 'warm night', ground: '#2e2a2e', ink: '#efe6dc', accent: '#ffb27d', accent2: '#6f6a80' },
      { name: 'eucalyptus', ground: '#e3ece7', ink: '#2f3e3a', accent: '#e6a17a', accent2: '#91b0a3' },
    ],
    typeVoices: ['a gentle rounded sans, lowercase, slow leading', 'a soft small patient serif', 'a handwritten note tucked in'],
    compositions: [
      'a window of light widening with the text inside',
      'a soft blanket-shaped form holding the message',
      'one small steady object (a kettle, a nightlight) with wide calm space',
    ],
    worlds: ['a window of light widening', 'a nightlight', 'steam from a bowl of soup', 'a blanket settling', 'a slow tide', 'a hand on a shoulder', 'a plant on a sill'],
    motion: {
      tempo: 'slow',
      arrivals: ['light widens slowly', 'steam rises, then the words', 'a blanket settles'],
      presences: ['a five-second breath cycle', 'steam drifting', 'a nightlight glow'],
    },
    textures: ['knit', 'fog', 'soft paper', 'felt'],
    techniques: ['breathing-glow', 'fogged-glass', 'drift', 'grain'],
    forbid: ['confetti', 'high contrast', 'urgency', 'bright pink', 'loud type'],
    imageStyle: 'soft gouache or pastel illustration, diffuse light, warm neutrals; one caring object',
  },

  'sacred-blessing': {
    id: 'sacred-blessing',
    name: 'May God bless you',
    whenToUse:
      'Blessings and reverence: "May God bless you", "Bhagwan", "Allah", "dua", "inshallah", 🙏, elders and parents addressed with respect, religious festivals, formal blessing language.',
    senderState: 'Reverent. Wishing protection and grace on someone.',
    feeling: 'Being blessed. Light placed on your head like a hand.',
    paletteRule: 'Rich and ceremonial: saffron, vermilion, emerald, jasmine white, night sky — gold as light. Symmetry is welcome here.',
    palettes: [
      { name: 'saffron & vermilion', ground: '#7a1e1e', ink: '#fff3d6', accent: '#f2b134', accent2: '#ff7a2a' },
      { name: 'emerald & gold', ground: '#0f3d2e', ink: '#f5ecd5', accent: '#d4af37', accent2: '#2e7d5b' },
      { name: 'jasmine', ground: '#fbf6e8', ink: '#3a2a1a', accent: '#c8102e', accent2: '#2f8f5b' },
      { name: 'night sky & gold', ground: '#12213d', ink: '#f6efdc', accent: '#e6c15c', accent2: '#4c6a9c' },
    ],
    typeVoices: [
      'an ornamental serif with one calligraphic word in the sender\'s language',
      'engraved caps with a flowing script',
      'block-print lettering',
    ],
    compositions: [
      'centered and symmetric: a frame of pattern (rangoli, arabesque, vine) with the blessing inside',
      'a lamp at the base, the blessing rising above it',
      'a medallion holding the name, the blessing beneath',
    ],
    worlds: ['a diya flame', 'a rangoli drawing itself', 'a crescent and a star', 'a lotus opening', 'incense drifting', 'a marigold garland', 'a temple bell', 'a dove'],
    motion: {
      tempo: 'steady',
      arrivals: ['the pattern draws itself outward from the center', 'the lamp is lit and gold spreads', 'the petals of a lotus open'],
      presences: ['a steady flame with a subtle flicker', 'a slow gold shimmer on the pattern', 'incense smoke drifting'],
    },
    textures: ['silk', 'gold leaf', 'block print', 'embossed pattern'],
    techniques: ['gradient-shimmer', 'emboss', 'pattern-tile', 'candle-flicker', 'draw-on'],
    forbid: ['irreverence', 'memes', 'neon', 'sloppy lettering'],
    imageStyle: 'ceremonial illustration: gold leaf on a deep ground or block print on white, a symmetric pattern frame',
  },

  'cool-minimal': {
    id: 'cool-minimal',
    name: 'Just enough',
    whenToUse:
      'Short, composed messages with no emoji and no elongation; a modern understated sender; "Happy birthday, Schatz"; a Respectful vibe with few words.',
    senderState: 'Composed. Says little and means it.',
    feeling: 'Effortless. The confidence of one good line.',
    paletteRule: 'Monochrome plus one accent, flat and print-like. Whitespace is the design.',
    palettes: [
      { name: 'bone & ink', ground: '#f4f1ea', ink: '#111111', accent: '#ff2d2d', accent2: '#b9b4a8' },
      { name: 'black & electric', ground: '#0b0b0b', ink: '#f2f2f2', accent: '#2f6bff', accent2: '#555555' },
      { name: 'concrete', ground: '#d9d9d6', ink: '#1a1a1a', accent: '#ffb000', accent2: '#8a8a86' },
      { name: 'chalk & sage', ground: '#f8f8f5', ink: '#22302b', accent: '#6fbf8a', accent2: '#c9c9c2' },
    ],
    typeVoices: ['a bold grotesk, huge and tight', 'a monumental numeral with a tiny caption', 'a thin serif at enormous size'],
    compositions: [
      'one giant word, the message in a small corner',
      'the number or the initial filling the canvas, cropped',
      'a strict grid: eyebrow, hero, footer',
    ],
    worlds: ['a single shape', 'a cropped numeral', 'one candle drawn as one line', 'a paper fold'],
    motion: {
      tempo: 'still',
      arrivals: ['one precise move: the hero slides in and stops', 'a single line draws itself'],
      presences: ['almost nothing — one element breathes imperceptibly', 'the accent dot pulses once every six seconds'],
    },
    textures: ['none', 'a faint print grain'],
    techniques: ['draw-on', 'grain'],
    forbid: ['decoration', 'gradients', 'particles', 'more than one accent', 'ornament'],
    imageStyle: 'a minimalist poster: one shape, one bold word, huge negative space, print texture',
  },

  'festive-gathering': {
    id: 'festive-gathering',
    name: 'Belonging',
    whenToUse:
      'Holidays and festivals: Diwali, Christmas, Eid, New Year, Lunar New Year, Mid-Autumn — greetings to a family or a group, lights, tradition, togetherness.',
    senderState: 'Warm and communal. Wants everyone under one light.',
    feeling: 'Belonging. Lights coming on one by one.',
    paletteRule: 'A night ground with gathered lights, or the festival\'s own colours. Warmth over sparkle.',
    palettes: [
      { name: 'diwali', ground: '#3b0f3f', ink: '#ffe9b0', accent: '#ffb020', accent2: '#ff4f5e' },
      { name: 'yule', ground: '#1d3b2a', ink: '#f6efe0', accent: '#c8323a', accent2: '#d9b56a' },
      { name: 'eid night', ground: '#0f2a4a', ink: '#f5efdf', accent: '#e2c275', accent2: '#3d7e8a' },
      { name: 'new year', ground: '#0d0d12', ink: '#f7f2e8', accent: '#f5c542', accent2: '#ff6b8b' },
      { name: 'lunar red', ground: '#b3222d', ink: '#fff1cf', accent: '#f7c948', accent2: '#6b0f1a' },
    ],
    typeVoices: [
      'a festive serif with a hand-lettered greeting in the sender\'s language',
      'lantern-sign lettering',
      'a warm rounded display',
    ],
    compositions: [
      'lights gathering toward the center where the greeting sits',
      'a hearth or window glow with the names around it',
      'a string of lanterns across the top, the message beneath',
    ],
    worlds: ['lights gathering', 'a string of lanterns', 'a hearth', 'a table set for many', 'snow at a window', 'a few meaningful fireworks', 'a crescent moon', 'a row of diyas'],
    motion: {
      tempo: 'steady',
      arrivals: ['lights come on one by one toward the center', 'lanterns rise', 'snow begins'],
      presences: ['lights twinkling gently out of phase', 'snow or sparks drifting', 'a hearth glow breathing'],
    },
    textures: ['warm glow', 'paper lantern', 'wool', 'gold leaf'],
    techniques: ['bloom-glow', 'particle-with-meaning', 'candle-flicker', 'gradient-shimmer', 'pattern-tile'],
    forbid: ['generic clip-art', 'cold minimalism', 'a corporate greeting'],
    imageStyle: 'warm festive illustration: gathered lights on a deep ground, lantern glow, cosy detail',
  },
};

export const REGISTER_IDS = Object.keys(EMOTION_REGISTERS) as RegisterId[];

export function isRegisterId(value: unknown): value is RegisterId {
  return typeof value === 'string' && value in EMOTION_REGISTERS;
}

export function getRegister(id: string | null | undefined): EmotionRegister {
  return isRegisterId(id) ? EMOTION_REGISTERS[id] : EMOTION_REGISTERS[DEFAULT_REGISTER_ID];
}

/** Compact catalogue for the director: one line per register. */
export function describeRegisterCatalog(): string {
  return REGISTER_IDS.map((id) => {
    const r = EMOTION_REGISTERS[id];
    return `- ${id} — "${r.name}". Use when: ${r.whenToUse} Recipient feels: ${r.feeling}`;
  }).join('\n');
}

/**
 * The register's range, for the director's concrete picks and for the generator's
 * improvisation. The director does not need the SVG technique names.
 */
export function describeRegisterRange(register: EmotionRegister, opts: { forDirector?: boolean } = {}): string {
  const palettes = register.palettes
    .map((p) => `"${p.name}" (ground ${p.ground}, ink ${p.ink}, accent ${p.accent}, accent2 ${p.accent2})`)
    .join('; ');
  return [
    `Register: ${register.name} (${register.id})`,
    `Sender state: ${register.senderState}`,
    `Recipient should feel: ${register.feeling}`,
    `Palette rule: ${register.paletteRule}`,
    `Palette options: ${palettes}`,
    `Type voices: ${register.typeVoices.join(' | ')}`,
    `Compositions: ${register.compositions.join(' | ')}`,
    `Worlds this register knows (inspiration only — the message decides): ${register.worlds.join('; ')}`,
    `Motion: tempo ${register.motion.tempo}. Arrivals: ${register.motion.arrivals.join(' | ')}. Presences: ${register.motion.presences.join(' | ')}`,
    `Textures: ${register.textures.join(', ')}`,
    opts.forDirector ? '' : `Techniques that suit it: ${register.techniques.join(', ')}`,
    `Never in this register: ${register.forbid.join('; ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}
