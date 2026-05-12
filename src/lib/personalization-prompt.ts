type OutputMedium = 'image' | 'svg' | 'video';

export interface PersonalizationBrief {
  cardType: string;
  relationship: string;
  recipientName: string;
  message: string;
  signed: string;
  tone: string;
  design: string;
  customDesign: string;
  yearsTogether: string;
  age: string;
  cardRequirements: string;
  sharedMemory: string;
  recipientTraits: string[];
  relationshipVibe: string;
  insideJokeOrMotif: string;
  avoidDetails: string;
  additionalDetails: string[];
}

interface PromptOptions {
  size?: string;
  medium?: OutputMedium;
}

const EXCLUDED_EXTRA_FIELDS = new Set([
  'to',
  'relationship',
  'recipientName',
  'message',
  'signed',
  'senderName',
  'design',
  'customDesign',
  'design_custom',
  'yearsTogether',
  'age',
  'cardRequirements',
  'tone',
  'sharedMemory',
  'recipientTraits',
  'relationshipVibe',
  'insideJokeOrMotif',
  'avoidDetails',
  'size',
  'modelId',
  'styleId',
  'outputFormat',
  'imageCount',
  'referenceImageUrls',
  'animationSpeed',
  'loop',
  'styleStrength',
  'duration',
  'variationIndex',
  'isPublic',
]);

const toneMapping: Record<string, { style: string; philosophy: string; animation: string }> = {
  humor: {
    style: 'whimsical, playful, light-hearted yet sophisticated with delightful surprises',
    philosophy: 'Laughter connects souls; find the gentle humor that brings warmth',
    animation: 'bouncy but restrained motion with one delightful reveal',
  },
  surprise: {
    style: 'dynamic, vibrant, celebratory with moments of wonder and discovery',
    philosophy: 'The best surprises reveal what we always hoped was true',
    animation: 'soft reveals and elements that emerge with anticipation',
  },
  touching: {
    style: 'deeply emotional, tender, intimate with soft atmospheric quality',
    philosophy: 'True emotion needs no excess; let the visuals speak to the heart',
    animation: 'breathing rhythms, gentle heartbeat pulses, slow graceful movements',
  },
  romantic: {
    style: 'sensual, warm, intimate with dreamy soft-focus quality',
    philosophy: 'Love is seeing someone fully and choosing them',
    animation: 'intertwining elements, synchronized movement, magnetic attraction',
  },
  nostalgic: {
    style: 'warm sepia-tinted, memory-like, bittersweet beauty',
    philosophy: 'Memories are how love defeats time; honor the past while celebrating now',
    animation: 'gentle fades and floating drift like memories surfacing',
  },
  hopeful: {
    style: 'bright, ascending, dawn-like with emerging light',
    philosophy: 'Hope is courage in the face of uncertainty; show light breaking through',
    animation: 'upward motion, gradual brightening, unfurling growth',
  },
  grateful: {
    style: 'warm, grounded, rich earth tones with golden light',
    philosophy: 'Gratitude transforms what we have into enough; show abundance in simplicity',
    animation: 'gentle blooming, warming glow, assembling elements',
  },
};

const relationshipEmotions: Record<string, string> = {
  mom: 'Honor the quiet sacrifices of maternal love: hands that held, arms that comforted.',
  mother: 'Honor the quiet sacrifices of maternal love: hands that held, arms that comforted.',
  dad: 'Celebrate steadfast presence: the silent strength that shapes who we become.',
  father: 'Celebrate steadfast presence: the silent strength that shapes who we become.',
  friend: 'True friendship is chosen family: souls that recognized each other.',
  partner: 'Two people choosing each other again and again: love as a daily decision.',
  wife: 'The miracle of being truly known and loved anyway.',
  husband: 'The miracle of being truly known and loved anyway.',
  child: 'Each child rewrites possibility: pure potential wrapped in wonder.',
  grandparent: 'Living bridges to our history: wisdom and unconditional love.',
  sibling: 'Shared childhood and parallel journeys: the first friends we ever had.',
  colleague: 'Recognize the person behind the role with warmth and respect.',
  myself: 'Self-compassion is the foundation of all love; this deserves celebration.',
};

const messageContextDeep: Record<string, { emotion: string; visual: string }> = {
  sorry: {
    emotion: 'the courage of vulnerability, the hope for reconciliation, regret transformed into bridge-building',
    visual: 'mending, bridges forming, light returning after storm, hands reaching across gaps',
  },
  birthday: {
    emotion: 'another year of existence as a miracle; celebrate not just age but the gift of being alive',
    visual: 'rising elements, life force glowing, cycles of renewal, wishes taking flight',
  },
  'thank-you': {
    emotion: 'gratitude as recognition of grace in others',
    visual: 'blooming flowers, light emerging, hands giving and receiving, seeds of kindness sprouting',
  },
  congratulations: {
    emotion: 'achievement witnessed and joy shared',
    visual: 'ascending paths, stars rising, doors opening, peaks reached, light bursting forth',
  },
  love: {
    emotion: 'love as seeing someone fully and choosing them',
    visual: 'intertwining elements, hearts as vessels, magnetic attraction, two becoming constellation',
  },
  'get-well': {
    emotion: 'healing witnessed with comfort and hope',
    visual: 'warm light breaking through, gentle embrace, new growth after rain, protective warmth',
  },
  graduation: {
    emotion: 'threshold crossing; effort honored while possibility opens ahead',
    visual: 'doors opening, paths ascending, light at horizon, wings unfurling',
  },
  wedding: {
    emotion: 'two people choosing to build a world together',
    visual: 'rings interlinked, flames merging, roots intertwining, two paths becoming one',
  },
  holiday: {
    emotion: 'traditions connecting us across time',
    visual: 'gathering lights, warm hearth, circles of connection, seasonal magic',
  },
  anniversary: {
    emotion: 'love as a choice made every day',
    visual: 'intertwined paths, tree rings marking years, two moons in eternal dance',
  },
  baby: {
    emotion: 'new life as pure possibility',
    visual: 'stars being born, dawn breaking, seeds sprouting, delicate new leaves',
  },
};

const motifsMapEnhanced: Record<string, { motifs: string; mood: string }> = {
  birthday: {
    motifs: 'gentle candle flames as life force, floating wishes like stars, elegant balloons ascending, soft celebration particles',
    mood: "joyful wonder with a touch of time's preciousness",
  },
  anniversary: {
    motifs: 'intertwined paths or ribbons, warm golden light, two elements in harmony, rings or circles of continuity',
    mood: 'deep gratitude, the comfort of being truly known',
  },
  valentine: {
    motifs: 'hearts as vessels rather than cliches, silk ribbons, soft rose petals drifting, warm intimate glow',
    mood: 'romantic intimacy, the vulnerability of love',
  },
  love: {
    motifs: 'two elements in gravitational dance, ethereal glow, intertwined forms, magnetic attraction visualized',
    mood: 'devotion, the miracle of choosing and being chosen',
  },
  'thank-you': {
    motifs: 'blooming florals, light emerging from darkness, hands in gesture of giving, seeds transforming',
    mood: 'humble gratitude, recognition of grace',
  },
  congratulations: {
    motifs: 'ascending elements, stars rising, paths reaching peaks, light breaking through, triumphant arcs',
    mood: 'earned pride, boundless possibility',
  },
  'get-well': {
    motifs: 'warm light breaking through clouds, gentle protective embrace, new growth, soothing natural elements',
    mood: 'tender care, quiet strength, gentle hope',
  },
  graduation: {
    motifs: 'doors opening, paths ascending toward light, wings unfurling, threshold symbols',
    mood: 'achievement honored, future embraced',
  },
  wedding: {
    motifs: 'two flames becoming one, interlinked rings, roots growing together, white florals with golden light',
    mood: 'sacred joy, lasting promise',
  },
  holiday: {
    motifs: 'gathering warm lights, cozy glowing elements, seasonal magic, circles of connection',
    mood: 'warmth of belonging, comfort of tradition',
  },
  baby: {
    motifs: 'soft clouds and stars, gentle dawn colors, tiny precious elements, nurturing embrace shapes',
    mood: 'pure wonder, tender new beginning',
  },
  sorry: {
    motifs: 'bridge forming across gap, light returning after storm, gentle rain washing clean, hands reaching',
    mood: 'humble hope, the courage of vulnerability',
  },
};

export function buildPersonalizationBrief(formData: any, cardType: string): PersonalizationBrief {
  const base = (formData?.formData ?? formData ?? {}) as Record<string, unknown>;
  const relationship = stringValue(base.to || base.relationship);
  const signed = stringValue(base.signed || base.senderName);
  const customDesign = stringValue(base.customDesign || base.design_custom);

  return {
    cardType,
    relationship,
    recipientName: stringValue(base.recipientName),
    message: stringValue(base.message),
    signed,
    tone: stringValue(base.tone).toLowerCase(),
    design: stringValue(base.design),
    customDesign,
    yearsTogether: stringValue(base.yearsTogether),
    age: stringValue(base.age),
    cardRequirements: stringValue(base.cardRequirements),
    sharedMemory: stringValue(base.sharedMemory),
    recipientTraits: normalizeTraits(base.recipientTraits),
    relationshipVibe: stringValue(base.relationshipVibe),
    insideJokeOrMotif: stringValue(base.insideJokeOrMotif),
    avoidDetails: stringValue(base.avoidDetails),
    additionalDetails: collectAdditionalDetails(base),
  };
}

export function createNaturalPrompt(
  formData: any,
  cardType: string,
  opts?: PromptOptions
): string {
  const size = opts?.size || 'portrait';
  const medium = opts?.medium || 'image';
  const brief = buildPersonalizationBrief(formData, cardType);
  const toneConfig = getToneConfig(brief.tone);
  const messageContext = messageContextDeep[cardType] || {
    emotion: 'heartfelt sentiment rooted in the sender and recipient',
    visual: 'elegant thematic elements that serve the emotional core',
  };
  const motifsConfig = motifsMapEnhanced[cardType] || {
    motifs: 'tasteful, meaningful thematic elements that serve the emotional core',
    mood: 'elegant and heartfelt',
  };

  const sections = [
    buildOpeningSection(brief, medium, toneConfig),
    buildRecipientSection(brief, medium),
    buildMemorySection(brief),
    buildMessageSection(brief, medium, messageContext),
    buildMilestoneSection(brief),
    buildVisualSection(brief, medium, toneConfig, motifsConfig),
    buildCompositionSection(size),
    buildMediumSection(brief, medium, toneConfig),
    buildAvoidanceSection(brief),
    'Final quality: Pristine, no watermarks, no artifacts. A gift worth giving.',
  ];

  return sections.filter(Boolean).join('\n\n').trim();
}

export function buildReferenceEditPrompt(
  formData: any,
  cardType: string,
  opts?: { size?: string }
): string {
  const brief = buildPersonalizationBrief(formData, cardType);
  const toneStyle = brief.tone.includes('humor')
    ? 'whimsical, playful, light-hearted'
    : brief.tone.includes('surprise')
      ? 'dynamic, vibrant, celebratory'
      : brief.tone.includes('touching')
        ? 'deeply emotional, tender, heartwarming, atmospheric'
        : 'elegant, polished, and welcoming';

  const motifsMap: Record<string, string> = {
    birthday: 'elegant balloons, soft confetti, streamers, cake',
    anniversary: 'romantic lighting, roses, gold accents',
    valentine: 'petals, soft pinks and reds, intimate glow',
    love: 'warm glow, soft romantic symbols',
    'thank-you': 'botanicals, fresh flowers',
    congratulations: 'stars, sparkles, confetti',
    'get-well': 'soothing nature elements',
    graduation: 'mortarboard, scroll, gold details',
    wedding: 'floral arrangements, lace, rings',
    holiday: 'seasonal decor, lights, cozy atmosphere',
    baby: 'soft toys, clouds, stars',
    sorry: 'peaceful, muted tones',
  };
  const motifs = motifsMap[cardType] || 'festive, elegant thematic elements';
  const paletteLine = getPaletteLine(brief);
  const size = opts?.size || 'portrait';
  const orientationLine = size === 'landscape'
    ? 'Use a balanced horizontal composition.'
    : size === 'square'
      ? 'Use a centered, balanced square composition.'
      : 'Use a balanced vertical composition.';

  return [
    'Create a high-quality, elegant transformation.',
    'Keep the subject clearly recognizable (face geometry, hairstyle, skin tone, accessories).',
    'Preserve main clothing colors/patterns but refine them for a premium look.',
    'Make the subject the star; place on a subtle, aesthetic base if needed.',
    'Subject scale: 65-85% of canvas.',
    orientationLine,
    `Background: ${motifs} matching the ${toneStyle} mood. Extend background to edges (full-bleed, opaque).`,
    brief.sharedMemory ? `Subtle personal cue: ${brief.sharedMemory}.` : '',
    brief.insideJokeOrMotif ? `Personal motif: ${brief.insideJokeOrMotif}.` : '',
    paletteLine,
    brief.avoidDetails ? `Avoid: ${brief.avoidDetails}.` : '',
    'NO text. NO white borders. NO letterboxing.',
    'Render as a polished, high-definition 2D illustration (or photorealistic if appropriate) with cohesive color grading, soft cinematic lighting, and depth.',
    'Respect the reference pose.',
    'No watermarks/logos. Best quality, 8k, masterpiece.',
  ].filter(Boolean).join(' ');
}

function buildOpeningSection(
  brief: PersonalizationBrief,
  medium: OutputMedium,
  toneConfig: { philosophy: string }
): string {
  if (medium === 'svg') {
    return `Creative intent: Create a deeply moving ${brief.cardType} card that touches the heart. ${toneConfig.philosophy}.`;
  }
  if (medium === 'image') {
    return `Creative intent: Create a masterpiece ${brief.cardType} greeting card visual of award-winning quality. The image should feel personal, elegant, and emotionally specific.`;
  }
  return `Creative intent: Create a personalized ${brief.cardType} video card with emotional pacing.`;
}

function buildRecipientSection(brief: PersonalizationBrief, medium: OutputMedium): string {
  const lines = ['Recipient context:'];
  if (brief.relationship && brief.recipientName) {
    const relationship = brief.relationship.toLowerCase() === 'myself'
      ? 'myself'
      : `my ${brief.relationship.toLowerCase()}`;
    lines.push(`This is for ${relationship}, ${brief.recipientName}.`);
  } else if (brief.recipientName) {
    lines.push(`This is for ${brief.recipientName}.`);
  }

  if (medium === 'svg' && brief.relationship) {
    const relationshipKey = Object.keys(relationshipEmotions).find(key =>
      brief.relationship.toLowerCase().includes(key)
    );
    if (relationshipKey) lines.push(relationshipEmotions[relationshipKey]);
  }

  if (brief.signed && medium !== 'image') {
    lines.push(`From ${brief.signed}; infuse personal warmth into the design.`);
  }

  return lines.length > 1 ? lines.join(' ') : '';
}

function buildMemorySection(brief: PersonalizationBrief): string {
  const lines = ['Memory and personality:'];
  if (brief.sharedMemory) lines.push(`Shared memory: ${brief.sharedMemory}.`);
  if (brief.recipientTraits.length) lines.push(`Recipient traits: ${brief.recipientTraits.join(', ')}.`);
  if (brief.relationshipVibe) lines.push(`Relationship vibe: ${brief.relationshipVibe}.`);
  if (brief.insideJokeOrMotif) lines.push(`Personal motif: ${brief.insideJokeOrMotif}.`);
  return lines.length > 1 ? lines.join(' ') : '';
}

function buildMessageSection(
  brief: PersonalizationBrief,
  medium: OutputMedium,
  context: { emotion: string; visual: string }
): string {
  const lines = ['Message intent:'];
  if (brief.message) {
    lines.push(`Core message: "${brief.message}".`);
  }

  if (medium === 'svg') {
    lines.push(`Emotional essence: ${context.emotion}.`);
    lines.push(`Translate this into visual metaphor: ${context.visual}.`);
  } else if (medium === 'image') {
    lines.push(`Transform the sentiment into rich visual storytelling with emotional depth.`);
  }

  return lines.join(' ');
}

function buildMilestoneSection(brief: PersonalizationBrief): string {
  const lines = ['Milestone context:'];
  if (brief.yearsTogether) {
    const yearsNum = parseInt(brief.yearsTogether);
    if (yearsNum >= 25) {
      lines.push(`Celebrating ${brief.yearsTogether} remarkable years together: a testament to enduring love.`);
    } else if (yearsNum >= 10) {
      lines.push(`Honoring ${brief.yearsTogether} years of choosing each other: a decade of shared life.`);
    } else {
      lines.push(`Marking ${brief.yearsTogether} years together: each year a chapter in an ongoing story.`);
    }
  }

  if (brief.age) {
    const ageNum = parseInt(brief.age);
    if (ageNum >= 80) {
      lines.push(`A life of ${brief.age} years: rich with wisdom, stories, and love given.`);
    } else if (ageNum >= 50) {
      lines.push(`${brief.age} years of living, learning, and loving: a milestone worth celebrating deeply.`);
    } else if (ageNum <= 10) {
      lines.push(`${brief.age} years young: all of life's wonder still ahead.`);
    } else {
      lines.push(`Celebrating ${brief.age} years.`);
    }
  }

  return lines.length > 1 ? lines.join(' ') : '';
}

function buildVisualSection(
  brief: PersonalizationBrief,
  medium: OutputMedium,
  toneConfig: { style: string; animation: string },
  motifsConfig: { motifs: string; mood: string }
): string {
  const lines = ['Visual direction:'];
  if (toneConfig.style) lines.push(`Overall mood: ${toneConfig.style}.`);
  const paletteLine = getPaletteLine(brief);
  if (paletteLine) lines.push(paletteLine);
  if (brief.cardRequirements) lines.push(`Specific requests: ${brief.cardRequirements}.`);
  if (brief.additionalDetails.length) lines.push(`Additional details: ${brief.additionalDetails.join(' ')}`);

  if (medium === 'svg') {
    lines.push(`Visual metaphors to consider: ${motifsConfig.motifs}.`);
    lines.push(`Emotional atmosphere: ${motifsConfig.mood}.`);
    lines.push(`Animation spirit: ${toneConfig.animation}.`);
  } else {
    lines.push(`Use elegant motifs: ${motifsConfig.motifs}.`);
  }

  return lines.join(' ');
}

function buildCompositionSection(size: string): string {
  if (size === 'portrait' || size === 'story') {
    return 'Composition: portrait orientation with a clear focal point and visual breathing room.';
  }
  if (size === 'landscape') {
    return 'Composition: landscape orientation with cinematic depth and horizontal flow.';
  }
  return 'Composition: square layout, centered with intentional balance.';
}

function buildMediumSection(
  brief: PersonalizationBrief,
  medium: OutputMedium,
  toneConfig: { animation: string }
): string {
  if (medium === 'image') {
    const inscriptionParts: string[] = [];
    if (brief.recipientName) inscriptionParts.push(`To ${brief.recipientName}`);
    if (brief.signed) inscriptionParts.push(`from ${brief.signed}`);
    const inscription = inscriptionParts.length
      ? `Small elegant handwritten inscription: "${inscriptionParts.join(', ')}" in a quiet corner.`
      : 'Rely entirely on visual storytelling; no large text.';

    return [
      'Image execution:',
      'Full-bleed, edge-to-edge composition.',
      'No borders or white margins.',
      'Rich, fully opaque background.',
      'Frame the main subject at 65-85% of canvas.',
      'Style: high-end digital art, soft cinematic lighting, highly detailed.',
      inscription,
    ].join(' ');
  }

  if (medium === 'svg') {
    return [
      'SVG execution:',
      'Use clean vector shapes, rich gradients, and a warm textured-feeling background; no plain white canvas.',
      'Include ONE signature animation that embodies the emotional core.',
      `Preferred animation behavior: ${toneConfig.animation}.`,
      'The animation should be meditative, performant, and not distracting.',
    ].join(' ');
  }

  return 'Video execution: Smooth, cinematic motion with emotional pacing.';
}

function buildAvoidanceSection(brief: PersonalizationBrief): string {
  const defaults = [
    'watermarks',
    'logos',
    'visual artifacts',
    'awkward empty margins',
    'generic stock-card composition',
  ];
  const line = brief.avoidDetails
    ? `Avoid: ${brief.avoidDetails}. Also avoid ${defaults.join(', ')}.`
    : `Avoid: ${defaults.join(', ')}.`;
  return line;
}

function getToneConfig(tone: string) {
  const toneKey = Object.keys(toneMapping).find(key => tone.includes(key)) || '';
  return toneMapping[toneKey] || {
    style: 'elegant, heartfelt, and emotionally resonant',
    philosophy: 'Every card is a moment of connection between two people',
    animation: 'subtle breathing motion and gentle presence',
  };
}

function getPaletteLine(brief: PersonalizationBrief): string {
  if (!brief.design) return '';
  if (brief.design === 'custom') {
    return brief.customDesign ? `Color palette: ${brief.customDesign}.` : '';
  }
  return `Color palette: ${brief.design}.`;
}

function normalizeTraits(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => stringValue(item)).filter(Boolean).slice(0, 3);
  }

  return stringValue(value)
    .split(/[,|\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function collectAdditionalDetails(base: Record<string, unknown>): string[] {
  const extras: string[] = [];
  Object.entries(base).forEach(([key, value]) => {
    if (EXCLUDED_EXTRA_FIELDS.has(key)) return;
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (typeof value === 'object') return;
    const human = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase();
    if (typeof value === 'boolean') {
      if (value) extras.push(`Include ${human} element.`);
    } else {
      extras.push(`${human}: ${String(value)}.`);
    }
  });
  return extras;
}

function stringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
