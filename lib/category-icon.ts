// lib/category-icon.ts
// The small circle icon on quiz cards is per category (quiz type), not per quiz.
// One illustrated icon per category, served from public/icons/<category>.webp.
const CATEGORY_ICON: Record<string, string> = {
  'bible-character': '/icons/bible-character.webp',
  'spiritual-profile': '/icons/spiritual-profile.webp',
  'bible-iq': '/icons/bible-iq.webp',
};

export function categoryIcon(category: string | undefined): string | undefined {
  return category ? CATEGORY_ICON[category] : undefined;
}
