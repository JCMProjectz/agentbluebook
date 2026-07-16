import { getCollection, type CollectionEntry } from 'astro:content';

export const CONTACT_EMAIL = 'hello@agentbluebook.com';

// Canonical categories. `label` matches the values the content pipeline
// writes into article frontmatter; `slug` is the URL segment.
export interface Category {
  label: string;
  slug: string;
  navLabel: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { label: 'CRM', slug: 'crm', navLabel: 'CRM Software', icon: '👥', description: 'Manage leads, follow-ups, and client relationships' },
  { label: 'Lead Generation', slug: 'lead-gen', navLabel: 'Lead Generation', icon: '🎯', description: 'Lead gen platforms and services compared' },
  { label: 'Marketing', slug: 'marketing', navLabel: 'Marketing Tools', icon: '📣', description: 'Email, social, and listing marketing platforms' },
  { label: 'Transaction', slug: 'transaction', navLabel: 'Transaction Mgmt', icon: '📋', description: 'Transaction management and coordination tools' },
  { label: 'Websites', slug: 'websites', navLabel: 'Website Builders', icon: '🌐', description: 'IDX websites and personal agent sites compared' },
  { label: 'AI Tools', slug: 'ai-tools', navLabel: 'AI Tools', icon: '🤖', description: 'AI listing descriptions, CMAs, and content tools' },
];

// Map any category label an article might carry to its canonical slug.
// Tolerant of variants like "Transaction Mgmt" or "Website Builders".
export function categorySlug(label: string): string {
  const exact = CATEGORIES.find(c => c.label.toLowerCase() === label.toLowerCase());
  if (exact) return exact.slug;
  const loose = CATEGORIES.find(
    c =>
      label.toLowerCase().startsWith(c.label.toLowerCase()) ||
      c.navLabel.toLowerCase() === label.toLowerCase()
  );
  return loose ? loose.slug : label.toLowerCase().replace(/\s+/g, '-');
}

export type Article = CollectionEntry<'articles'>;

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection('articles');
  return articles.sort(
    (a, b) => new Date(b.data.publishedAt).valueOf() - new Date(a.data.publishedAt).valueOf()
  );
}

export function articlesInCategory(articles: Article[], slug: string): Article[] {
  return articles.filter(a => categorySlug(a.data.category) === slug);
}

export const TYPE_LABELS: Record<string, string> = {
  review: '📋 Review',
  comparison: '⚖️ Comparison',
  roundup: '🏆 Best Picks',
};
