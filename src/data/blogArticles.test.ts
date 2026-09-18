import { describe, it, expect } from 'vitest';
import { BLOG_ARTICLES, getArticleBySlug } from './blogArticles';

describe('Blog Articles Data Integrity', () => {
  it('should have at least 4 in-depth articles', () => {
    expect(BLOG_ARTICLES.length).toBeGreaterThanOrEqual(4);
  });

  it('should have unique slugs for all articles', () => {
    const slugs = BLOG_ARTICLES.map(a => a.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('each article must have non-empty title, summary, contentHtml, and reading time', () => {
    BLOG_ARTICLES.forEach(article => {
      expect(article.id).toBeDefined();
      expect(article.slug.trim()).not.toBe('');
      expect(article.title.trim()).not.toBe('');
      expect(article.summary.trim()).not.toBe('');
      expect(article.contentHtml.length).toBeGreaterThan(100);
      expect(article.readTime).toMatch(/분/);
      expect(article.category).toBeDefined();
    });
  });

  it('getArticleBySlug should find existing articles correctly and return undefined for invalid slug', () => {
    const article = getArticleBySlug('how-to-compress-pdf-securely');
    expect(article).toBeDefined();
    expect(article?.title).toContain('PDF');

    const nonExistent = getArticleBySlug('invalid-slug-12345');
    expect(nonExistent).toBeUndefined();
  });
});
