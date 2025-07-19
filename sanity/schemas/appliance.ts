import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'appliance',
  title: 'Elektrisk Apparat',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Apparat Navn',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
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
          { title: 'Køkken', value: 'kitchen' },
          { title: 'Underholdning', value: 'entertainment' },
          { title: 'Belysning', value: 'lighting' },
          { title: 'Køl og frys', value: 'cooling' },
          { title: 'Madlavning', value: 'cooking' },
          { title: 'Vask og rengøring', value: 'cleaning' },
          { title: 'Varme og køl', value: 'heating' },
          { title: 'Standby produkter', value: 'standby' },
          { title: 'Andet', value: 'other' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'powerWatts',
      title: 'Strømforbrug (Watt)',
      type: 'number',
      description: 'Gennemsnitligt strømforbrug i watt',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'powerRangeMin',
      title: 'Min Strømforbrug (Watt)',
      type: 'number',
      description: 'Minimum strømforbrug for variable apparater',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'powerRangeMax',
      title: 'Max Strømforbrug (Watt)',
      type: 'number',
      description: 'Maximum strømforbrug for variable apparater',
      validation: Rule => Rule.min(0)
    }),
    defineField({
      name: 'usageUnit',
      title: 'Brugs Enhed',
      type: 'string',
      options: {
        list: [
          { title: 'Timer pr. dag', value: 'hours_per_day' },
          { title: 'Minutter pr. dag', value: 'minutes_per_day' },
          { title: 'Gange pr. uge', value: 'cycles_per_week' },
          { title: 'Altid tændt', value: 'always_on' }
        ]
      },
      initialValue: 'hours_per_day',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'defaultUsage',
      title: 'Standard Brug',
      type: 'number',
      description: 'Standard brugsværdi baseret på enheden',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'icon',
      title: 'Ikon',
      type: 'string',
      description: 'Lucide React ikon navn (f.eks. Coffee, Tv, Gamepad2)',
    }),
    defineField({
      name: 'energyTip',
      title: 'Energispare Tip',
      type: 'text',
      description: 'Kort tip om hvordan man kan spare energi med dette apparat',
      rows: 3
    }),
    defineField({
      name: 'popularityScore',
      title: 'Popularitet',
      type: 'number',
      description: 'Score fra 1-10 for sortering (10 = mest populær)',
      initialValue: 5,
      validation: Rule => Rule.min(1).max(10)
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      power: 'powerWatts'
    },
    prepare(selection) {
      const { title, subtitle, power } = selection
      const categoryLabels = {
        kitchen: 'Køkken',
        entertainment: 'Underholdning',
        lighting: 'Belysning',
        cooling: 'Køl og frys',
        cooking: 'Madlavning',
        cleaning: 'Vask og rengøring',
        heating: 'Varme og køl',
        standby: 'Standby',
        other: 'Andet'
      }
      return {
        title,
        subtitle: `${categoryLabels[subtitle] || subtitle} - ${power}W`
      }
    }
  }
})