
import { defineType, defineField } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'seoMetaTitle',
      title: 'SEO Meta Title',
      type: 'string',
      description: 'Title that appears in search engine results',
      validation: Rule => Rule.max(60).warning('Keep it under 60 characters for better SEO')
    }),
    defineField({
      name: 'seoMetaDescription',
      title: 'SEO Meta Description',
      type: 'text',
      description: 'Description that appears in search engine results',
      validation: Rule => Rule.max(160).warning('Keep it under 160 characters for better SEO')
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        { type: 'pageSection' },
        { type: 'faqItem' }
      ],
      description: 'Add sections and FAQ items to build your homepage content'
    })
  ],
  preview: {
    select: {
      title: 'title'
    }
  }
})
