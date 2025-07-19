import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'energyTip',
  title: 'Energispare Råd',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {
        list: [
          { title: 'Daglige vaner', value: 'daily_habits' },
          { title: 'Opvarmning', value: 'heating' },
          { title: 'Belysning', value: 'lighting' },
          { title: 'Apparater', value: 'appliances' },
          { title: 'Isolering', value: 'insulation' },
          { title: 'Smart teknologi', value: 'smart_tech' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort Beskrivelse',
      type: 'text',
      rows: 2,
      validation: Rule => Rule.required().max(200)
    }),
    defineField({
      name: 'detailedContent',
      title: 'Detaljeret Indhold',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'savingsPotential',
      title: 'Besparelsespotentiale',
      type: 'string',
      options: {
        list: [
          { title: 'Lav (0-500 kr/år)', value: 'low' },
          { title: 'Mellem (500-2000 kr/år)', value: 'medium' },
          { title: 'Høj (2000+ kr/år)', value: 'high' }
        ]
      }
    }),
    defineField({
      name: 'difficulty',
      title: 'Sværhedsgrad',
      type: 'string',
      options: {
        list: [
          { title: 'Let', value: 'easy' },
          { title: 'Middel', value: 'medium' },
          { title: 'Svær', value: 'hard' }
        ]
      }
    }),
    defineField({
      name: 'icon',
      title: 'Ikon',
      type: 'string',
      description: 'Lucide React ikon navn'
    }),
    defineField({
      name: 'order',
      title: 'Rækkefølge',
      type: 'number',
      description: 'Sorteringsrækkefølge (lavere tal vises først)'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      savings: 'savingsPotential'
    },
    prepare(selection) {
      const { title, subtitle, savings } = selection
      const categoryLabels = {
        daily_habits: 'Daglige vaner',
        heating: 'Opvarmning',
        lighting: 'Belysning',
        appliances: 'Apparater',
        insulation: 'Isolering',
        smart_tech: 'Smart teknologi'
      }
      const savingsLabels = {
        low: '💰',
        medium: '💰💰',
        high: '💰💰💰'
      }
      return {
        title,
        subtitle: `${categoryLabels[subtitle] || subtitle} ${savingsLabels[savings] || ''}`
      }
    }
  }
})