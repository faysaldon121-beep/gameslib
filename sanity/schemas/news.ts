import { defineField, defineType } from 'sanity';
export default defineType({
  name: 'news', title: 'News Articles', type: 'document',
  groups:[ { name: 'content', title: 'Content', default: true }, { name: 'media', title: 'Media' }, { name: 'settings', title: 'Settings' }, { name: 'seo', title: 'SEO' } ],
  fields:[
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'content', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'content', title: 'Content', type: 'array', group: 'content', of:[ { type: 'block' }, { type: 'image' }, { type: 'code' } ] }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', group: 'media' }),
    defineField({ name: 'videoEmbed', title: 'Video Embed', type: 'text', group: 'media' }),
    defineField({ name: 'category', title: 'Category', type: 'string', group: 'settings', options: { list:['breaking', 'reviews', 'trailers', 'updates', 'esports', 'deals', 'rumors'] } }),
    defineField({ name: 'platforms', title: 'Platforms', type: 'array', group: 'settings', of: [{ type: 'string' }] }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', group: 'settings', of:[{ type: 'string' }] }),
    defineField({ name: 'author', title: 'Author', type: 'object', group: 'settings', fields:[ { name: 'name', type: 'string' }, { name: 'avatar', type: 'image' }, { name: 'bio', type: 'text' } ] }),
    defineField({ name: 'readingTime', title: 'Reading Time', type: 'number', group: 'settings', initialValue: 3 }),
    defineField({ name: 'views', title: 'Views', type: 'number', group: 'settings', initialValue: 0 }),
    defineField({ name: 'shares', title: 'Shares', type: 'object', group: 'settings', fields:[ { name: 'total', type: 'number', initialValue: 0 } ] }),
    defineField({ name: 'isBreaking', title: 'Breaking', type: 'boolean', group: 'settings', initialValue: false }),
    defineField({ name: 'isFeatured', title: 'Featured', type: 'boolean', group: 'settings', initialValue: false }),
    defineField({ name: 'isTrending', title: 'Trending', type: 'boolean', group: 'settings', initialValue: false }),
    defineField({ name: 'isPublished', title: 'Published', type: 'boolean', group: 'settings', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', group: 'settings', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'seo', title: 'SEO', type: 'object', group: 'seo', fields:[ { name: 'metaTitle', type: 'string' }, { name: 'metaDescription', type: 'text' } ] })
  ]
});
