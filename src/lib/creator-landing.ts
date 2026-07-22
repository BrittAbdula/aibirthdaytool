import type { CreatorLandingContent } from '@/components/creator/CreatorLandingPage';

export const creatorLandingPages = {
  employeeBirthday: {
    source: 'landing_employee_birthday_cards',
    eyebrow: 'For HR, office managers, and people teams',
    title: 'Employee birthday cards, ready before the morning reminder.',
    description: 'Keep every birthday in one roster, reuse your team style, and generate personalized cards for the month in one focused session.',
    proof: 'Start with 3 recipients and one real batch preview — no subscription required.',
    workflowTitle: 'From birthday list to ready-to-send cards.',
    workflowDescription: 'A small operational workspace for the person who remembers every team moment.',
    cardImages: [
      { src: '/card/birthday_1.png', alt: 'Personalized employee birthday card example' },
      { src: '/card/birthday.svg', alt: 'Animated employee birthday card example' },
      { src: '/card/birthday_3.png', alt: 'Branded team birthday card example' },
    ],
  },
  workAnniversary: {
    source: 'landing_work_anniversary_cards',
    eyebrow: 'For recurring employee milestones',
    title: 'Work anniversary cards that feel personal, not templated.',
    description: 'See upcoming milestones, keep a consistent team voice, and personalize every card without rebuilding the process each month.',
    proof: 'The free workspace includes 3 recipients and one generated batch preview.',
    workflowTitle: 'A repeatable rhythm for meaningful milestones.',
    workflowDescription: 'Keep the operational details organized so the final message still feels human.',
    cardImages: [
      { src: '/card/anniversary.svg', alt: 'Personalized work anniversary card example' },
      { src: '/card/congratulations.svg', alt: 'Team milestone congratulations card example' },
      { src: '/card/thankyou.svg', alt: 'Employee appreciation card example' },
    ],
  },
  bulkGreetingCards: {
    source: 'landing_bulk_personalized_cards',
    eyebrow: 'For recurring people operations',
    title: 'Bulk greeting cards without bulk-looking messages.',
    description: 'Import a roster, apply one brand direction, and create individualized cards in a batch you can review, retry, and reuse.',
    proof: 'Preview the workflow with your first 3 recipients before subscribing.',
    workflowTitle: 'Batch efficiency, one-person-at-a-time results.',
    workflowDescription: 'Designed for operators who need repeatability without sacrificing a personal touch.',
    cardImages: [
      { src: '/card/birthday_2.png', alt: 'Bulk personalized birthday card example' },
      { src: '/card/thankyou.svg', alt: 'Bulk personalized appreciation card example' },
      { src: '/card/congratulations.svg', alt: 'Bulk personalized congratulations card example' },
    ],
  },
} satisfies Record<string, CreatorLandingContent>;
