export interface GuidanceCard {
  title: string;
  description: string;
}

export interface GuidanceSection {
  title: string;
  description: string;
  cards: GuidanceCard[];
}

export interface TrustLink {
  href: string;
  label: string;
  description: string;
}

export interface PageTrustGuide {
  reviewedBy: string;
  lastReviewed: string;
  purpose: string;
  methodology: GuidanceCard[];
  sections: GuidanceSection[];
}

export const TRUST_HUB_LINKS: TrustLink[] = [
  {
    href: "/about/",
    label: "About MewTruCard",
    description: "Who operates the product and what problems the team is solving.",
  },
  {
    href: "/how-it-works/",
    label: "How it works",
    description: "The real create, edit, and share flow behind the card experience.",
  },
  {
    href: "/ai-and-editorial-policy/",
    label: "AI and editorial policy",
    description: "How AI is used, what gets reviewed, and how public examples are handled.",
  },
];

const DEFAULT_REVIEWED_BY = "MewTruCard editorial team";
const DEFAULT_LAST_REVIEWED = "March 25, 2026";

const sharedGeneratorMethodology: GuidanceCard[] = [
  {
    title: "Built from product-first workflows",
    description:
      "This guidance is written around the actual MewTruCard flow: enter recipient details, generate a draft, edit the result, then share or download it.",
  },
  {
    title: "Grounded in public card examples",
    description:
      "We compare recurring patterns from public cards to see which tones, layouts, and prompt details are easiest to adapt for real sending moments.",
  },
  {
    title: "Written to help a decision",
    description:
      "Each page is meant to help visitors choose a direction faster, not just to repeat generic greeting-card advice.",
  },
];

const sharedGalleryMethodology: GuidanceCard[] = [
  {
    title: "Examples are there to teach, not just to decorate",
    description:
      "The gallery should help visitors compare tone, layout, and message length before they open the generator.",
  },
  {
    title: "Relationship context matters",
    description:
      "A card that works for a spouse can feel too intense for a friend, so the guidance focuses on matching occasion and relationship together.",
  },
  {
    title: "Practical over aspirational",
    description:
      "We prefer simple advice that helps users send a better card today: what to mention, what to avoid, and when to keep it short.",
  },
];

const generatorGuidanceByType: Record<string, Omit<PageTrustGuide, "reviewedBy" | "lastReviewed">> = {
  birthday: {
    purpose:
      "Help people create birthday cards that feel specific to the recipient instead of relying on generic party language.",
    methodology: sharedGeneratorMethodology,
    sections: [
      {
        title: "What usually makes a birthday card land better",
        description:
          "The strongest birthday cards usually combine one personal detail, one clear emotional tone, and a visual direction that matches the recipient.",
        cards: [
          {
            title: "Lead with the person, not the template",
            description:
              "Mention a habit, shared memory, age milestone, or role the recipient plays in your life before piling on celebratory phrases.",
          },
          {
            title: "Pick one tone and stay with it",
            description:
              "Warm and grateful, playful and teasing, or elegant and sincere all work. Mixing all three often makes the final card feel unfocused.",
          },
          {
            title: "Use details that age well",
            description:
              "References to hobbies, family roles, small routines, or a shared joke tend to feel more genuine than broad phrases like 'best person ever'.",
          },
        ],
      },
      {
        title: "Birthday art directions that translate well",
        description:
          "Different recipients call for different visual energy. Use the gallery to compare mood before you generate.",
        cards: [
          {
            title: "Playful celebration",
            description:
              "Bright color, confetti, illustrated cakes, balloons, and lively typography work well for friends, kids, and upbeat family moments.",
          },
          {
            title: "Keepsake style",
            description:
              "Softer palettes, elegant florals, subtle gold accents, and calmer typography fit parents, spouses, and milestone birthdays.",
          },
          {
            title: "Minimal modern",
            description:
              "Simple shapes, clean spacing, and one strong phrase are often the easiest option when you want a polished card that still feels personal.",
          },
        ],
      },
    ],
  },
  wedding: {
    purpose:
      "Help visitors create wedding cards that feel polished, supportive, and appropriate for the couple or guest relationship involved.",
    methodology: sharedGeneratorMethodology,
    sections: [
      {
        title: "What wedding cards usually need most",
        description:
          "Wedding cards work best when they sound calm, warm, and intentional. The message should support the couple instead of overpowering the moment.",
        cards: [
          {
            title: "Celebrate the commitment clearly",
            description:
              "Acknowledge the occasion directly, then add one line about the couple, their story, or what you admire about them together.",
          },
          {
            title: "Prefer sincere over overly dramatic",
            description:
              "Wedding cards rarely need exaggerated language. A steady, graceful tone usually feels more timeless and more useful for the recipient.",
          },
          {
            title: "Think about how the card will be kept",
            description:
              "If the card may be revisited later, choose wording and visuals that feel tasteful on a second read, not just impressive in the first moment.",
          },
        ],
      },
      {
        title: "Visual cues that feel wedding-ready",
        description:
          "Wedding designs are usually stronger when they keep composition restrained and let typography or one motif do the work.",
        cards: [
          {
            title: "Refined floral or botanical",
            description:
              "Works well when you want softness and celebration without making the page look busy or overly themed.",
          },
          {
            title: "Clean editorial elegance",
            description:
              "Whitespace, understated typography, and a limited palette often feel premium and are easier to personalize for different couples.",
          },
          {
            title: "Gentle motion only when it adds emotion",
            description:
              "If you use animation, keep it subtle. Wedding cards usually benefit more from grace and pacing than from flashy movement.",
          },
        ],
      },
    ],
  },
};

const galleryGuidanceByType: Record<string, Omit<PageTrustGuide, "reviewedBy" | "lastReviewed">> = {
  birthday: {
    purpose:
      "Help visitors compare birthday card examples by tone, structure, and relationship fit before opening the generator.",
    methodology: sharedGalleryMethodology,
    sections: [
      {
        title: "How to read a birthday card gallery",
        description:
          "A useful birthday gallery should help users choose between voice directions quickly rather than scroll endlessly through decorative variants.",
        cards: [
          {
            title: "Scan for tone first",
            description:
              "Start by asking whether the example feels playful, heartfelt, elegant, or milestone-focused. That choice usually matters more than color.",
          },
          {
            title: "Notice message length",
            description:
              "Short front-cover phrases suit fast shares. Longer body copy works better when the relationship or age milestone deserves more detail.",
          },
          {
            title: "Borrow structure, not just visuals",
            description:
              "The most reusable lesson is often how the card is organized: greeting, personal detail, emotional close, then signature.",
          },
        ],
      },
      {
        title: "Patterns worth borrowing",
        description:
          "The best examples usually balance clarity and warmth. They show enough personality to feel specific without becoming hard to adapt.",
        cards: [
          {
            title: "One central motif",
            description:
              "Confetti, cake, florals, or stars can all work, but one strong motif is usually cleaner than mixing many party symbols together.",
          },
          {
            title: "A recipient-specific cue",
            description:
              "For parents, gratitude cues work well. For partners, intimacy matters more. For friends, humor or shared experiences often land best.",
          },
          {
            title: "An ending that sounds like a person",
            description:
              "The final line should sound as if you would actually say it out loud, not as if it was copied from a generic greeting-card rack.",
          },
        ],
      },
    ],
  },
  wedding: {
    purpose:
      "Help visitors compare wedding card examples and choose a tone that feels appropriate for the couple and the formality of the occasion.",
    methodology: sharedGalleryMethodology,
    sections: [
      {
        title: "How to read a wedding card gallery",
        description:
          "Wedding cards differ less by novelty and more by tone, formality, and how much of the couple story they try to capture.",
        cards: [
          {
            title: "Start with the relationship to the couple",
            description:
              "A card for close friends can feel more personal than one for colleagues or extended family, even when the visual theme stays similar.",
          },
          {
            title: "Use the gallery to set the formality level",
            description:
              "Some examples are airy and modern, others traditional and ceremonial. Match the card to the event and to how you actually speak.",
          },
          {
            title: "Look for balance in typography and imagery",
            description:
              "Wedding examples are strongest when the design gives the message enough room to breathe instead of competing with it.",
          },
        ],
      },
      {
        title: "Patterns worth borrowing",
        description:
          "The examples that age best usually pair modest visual restraint with one memorable emotional observation.",
        cards: [
          {
            title: "Warm blessing plus one specific note",
            description:
              "A strong wedding message often combines congratulations with one line about the couple, their future, or the quality of their partnership.",
          },
          {
            title: "Understated palettes",
            description:
              "Cream, blush, sage, gold, or monochrome treatments tend to stay versatile across different wedding styles.",
          },
          {
            title: "Clean finishing details",
            description:
              "Spacing, hierarchy, and a calm closing line usually do more for wedding cards than decorative excess.",
          },
        ],
      },
    ],
  },
};

const relationshipToneHints: Record<string, { tone: string; emphasis: string }> = {
  friend: {
    tone: "casual, warm, and lightly playful",
    emphasis: "shared memories, inside jokes, or how this person shows up in everyday life",
  },
  mother: {
    tone: "grateful, affectionate, and respectful",
    emphasis: "care, steadiness, family presence, or a specific way she has supported you",
  },
  wife: {
    tone: "close, admiring, and emotionally direct",
    emphasis: "partnership, daily life together, gratitude, and what makes the relationship feel like home",
  },
  husband: {
    tone: "close, appreciative, and grounded",
    emphasis: "reliability, shared growth, humor, and the small things that define the relationship",
  },
  girlfriend: {
    tone: "romantic, attentive, and personal",
    emphasis: "shared moments, emotional warmth, and details that feel intimate without sounding copied",
  },
  boyfriend: {
    tone: "romantic, relaxed, and personal",
    emphasis: "shared experiences, admiration, support, and the everyday rhythm of the relationship",
  },
  partner: {
    tone: "supportive, affectionate, and modern",
    emphasis: "teamwork, trust, and the life you are building together",
  },
  sister: {
    tone: "familiar, loving, and lightly conversational",
    emphasis: "family history, personality, and the role she plays in your life now",
  },
  brother: {
    tone: "easygoing, supportive, and genuine",
    emphasis: "shared history, humor, loyalty, and the way he shows up when it matters",
  },
};

function getRelationshipToneHint(relationshipLabel: string) {
  const key = relationshipLabel.trim().toLowerCase();
  return (
    relationshipToneHints[key] || {
      tone: "personal and naturally spoken",
      emphasis: "one concrete detail about the relationship instead of broad, generic praise",
    }
  );
}

export function getGeneratorTrustGuide(cardType: string, cardLabel: string): PageTrustGuide {
  const guide = generatorGuidanceByType[cardType] || {
    purpose: `Help visitors create ${cardLabel.toLowerCase()} cards with clearer prompts, better tone choices, and fewer generic phrases.`,
    methodology: sharedGeneratorMethodology,
    sections: [
      {
        title: `How to brief a ${cardLabel.toLowerCase()} card clearly`,
        description:
          "The generator works better when users choose one emotional direction, one visual direction, and one detail that makes the message specific.",
        cards: [
          {
            title: "Choose the relationship first",
            description:
              "The same card type changes a lot when the recipient is a friend, parent, partner, or colleague.",
          },
          {
            title: "Add one vivid detail",
            description:
              "A small memory, trait, or current milestone gives the generator something human to build around.",
          },
          {
            title: "Keep the first draft simple",
            description:
              "It is usually faster to start with a clear draft and refine in the editor than to overload the prompt all at once.",
          },
        ],
      },
      {
        title: "What to check before you share",
        description:
          "Most quality issues are easy to catch in a quick review after generation.",
        cards: [
          {
            title: "Read the message out loud",
            description:
              "If a sentence feels unlike something you would actually say, edit it before sending.",
          },
          {
            title: "Make sure the layout fits the message length",
            description:
              "A strong message can still feel awkward if the text block is too dense for the chosen visual style.",
          },
          {
            title: "Prefer clarity over flourish",
            description:
              "The card should still feel good to open on a phone and easy to understand in a few seconds.",
          },
        ],
      },
    ],
  };

  return {
    reviewedBy: DEFAULT_REVIEWED_BY,
    lastReviewed: DEFAULT_LAST_REVIEWED,
    ...guide,
  };
}

export function getTypeGalleryTrustGuide(cardType: string, cardLabel: string): PageTrustGuide {
  const guide = galleryGuidanceByType[cardType] || {
    purpose: `Help visitors compare public ${cardLabel.toLowerCase()} card examples and borrow patterns that are easier to adapt in the generator.`,
    methodology: sharedGalleryMethodology,
    sections: [
      {
        title: `How to use this ${cardLabel.toLowerCase()} gallery`,
        description:
          "The gallery is most useful when it helps visitors narrow down tone, pacing, and message style before they create their own card.",
        cards: [
          {
            title: "Start with the emotional job",
            description:
              "Decide whether the card should comfort, celebrate, flirt, congratulate, or simply mark a moment with clarity.",
          },
          {
            title: "Watch for reusable composition ideas",
            description:
              "Spacing, headline length, and message hierarchy are usually more transferable than decorative details.",
          },
          {
            title: "Use examples to shorten the blank-page phase",
            description:
              "A good gallery helps users make a decision faster, not spend more time browsing without a direction.",
          },
        ],
      },
      {
        title: "What tends to carry over well",
        description:
          "Not every example needs to be copied. The goal is to lift the underlying pattern that makes it work.",
        cards: [
          {
            title: "A clear tone signal",
            description:
              "Examples with an obvious emotional direction are easier to remix than cards that try to do everything at once.",
          },
          {
            title: "One dominant visual idea",
            description:
              "A card with one strong motif is easier to personalize than a collage of unrelated symbols.",
          },
          {
            title: "A natural close",
            description:
              "A believable final line is often what separates a useful example from a generic one.",
          },
        ],
      },
    ],
  };

  return {
    reviewedBy: DEFAULT_REVIEWED_BY,
    lastReviewed: DEFAULT_LAST_REVIEWED,
    ...guide,
  };
}

export function getRelationshipGalleryTrustGuide(
  cardType: string,
  cardLabel: string,
  relationshipLabel: string
): PageTrustGuide {
  const toneHint = getRelationshipToneHint(relationshipLabel);
  const starterExamples =
    cardType === "birthday"
      ? [
          {
            title: "Start with a living detail",
            description: `Mention what makes ${relationshipLabel.toLowerCase()} feel distinctive right now: a habit, recent milestone, or the role they play in your everyday life.`,
          },
          {
            title: "Let the emotion fit the relationship",
            description: `For ${relationshipLabel.toLowerCase()} cards, the tone should feel ${toneHint.tone} rather than like a generic birthday speech.`,
          },
          {
            title: "Close with something you would really say",
            description:
              "A short, believable closing line usually feels stronger than a dramatic final quote.",
          },
        ]
      : cardType === "wedding"
        ? [
            {
              title: "Acknowledge the couple first",
              description:
                "Lead with the commitment or the day itself, then add a line that reflects your real connection to the people involved.",
            },
            {
              title: `Match the tone to ${relationshipLabel.toLowerCase()}`,
              description: `For ${relationshipLabel.toLowerCase()} wedding cards, aim for wording that feels ${toneHint.tone} and easy to keep, not overly theatrical.`,
            },
            {
              title: "Keep the blessing specific",
              description:
                "A short wish for the future lands better when it sounds personal instead of ceremonial by default.",
            },
          ]
        : [
            {
              title: "Write to the relationship, not just the event",
              description: `For ${relationshipLabel.toLowerCase()} cards, focus on ${toneHint.emphasis}.`,
            },
            {
              title: "Use one scene or memory",
              description:
                "A grounded detail usually does more than broad praise because it proves the card is for this person.",
            },
            {
              title: "Keep the voice natural",
              description:
                "If a line sounds too polished to say out loud, it is worth softening before sending.",
            },
          ];

  return {
    reviewedBy: DEFAULT_REVIEWED_BY,
    lastReviewed: DEFAULT_LAST_REVIEWED,
    purpose: `Help visitors choose ${cardLabel.toLowerCase()} examples that fit a ${relationshipLabel.toLowerCase()} relationship before they create or edit their own version.`,
    methodology: sharedGalleryMethodology,
    sections: [
      {
        title: `How to write for ${relationshipLabel}`,
        description: `For ${relationshipLabel.toLowerCase()} cards, the message usually works best when it feels ${toneHint.tone} and centers ${toneHint.emphasis}.`,
        cards: starterExamples,
      },
      {
        title: "What to borrow from the examples below",
        description:
          "Use the gallery to pick a pattern, not to copy someone else's exact message.",
        cards: [
          {
            title: "Borrow tone before wording",
            description:
              "If an example feels too intense or too distant for the relationship, change that first before you think about color or layout.",
          },
          {
            title: "Keep one meaningful detail",
            description:
              "One believable reference usually creates more connection than a long list of compliments.",
          },
          {
            title: "Match design to the closeness of the relationship",
            description:
              "More intimate relationships can handle softer or more expressive visuals. More casual ones often benefit from clearer, simpler layouts.",
          },
        ],
      },
    ],
  };
}

export function getTrustHubRelatedLinks(cardType: string) {
  const contextualLinks: TrustLink[] = [];

  if (cardType) {
    contextualLinks.push({
      href: `/${cardType}/`,
      label: `Open the ${cardType} generator`,
      description: "Go from guidance to the actual create-edit-share flow.",
    });
    contextualLinks.push({
      href: `/type/${cardType}/`,
      label: `Browse ${cardType} examples`,
      description: "Compare public examples before you commit to a direction.",
    });
  }

  return [...contextualLinks, ...TRUST_HUB_LINKS].slice(0, 4);
}
