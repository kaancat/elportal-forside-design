
export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface BlockContent {
  _type: 'block'
  children: Array<{
    _type: 'span'
    text: string
    marks?: string[]
  }>
  markDefs?: Array<any>
  style?: string
}

export interface PageSection {
  _type: 'pageSection'
  _key: string
  title?: string
  content: BlockContent[]
  image?: SanityImage
  imagePosition?: 'left' | 'right' | 'none'
}

export interface FAQItem {
  _type: 'faqItem'
  _key: string
  question: string
  answer: BlockContent[]
}

export interface PriceExampleTable {
  _type: 'priceExampleTable'
  _key: string
  title: string
  leadingText: string
  example1_title: string
  example1_kwh_price: number
  example1_subscription: number
  example2_title: string
  example2_kwh_price: number
  example2_subscription: number
}

export interface HomePage {
  _id: string
  _type: 'homePage'
  title: string
  seoMetaTitle: string
  seoMetaDescription: string
  contentBlocks: Array<PageSection | FAQItem | PriceExampleTable>
}

export interface BlogPost {
  _id: string
  _type: 'blogPost'
  title: string
  slug: {
    current: string
  }
  mainImage?: SanityImage
  body: BlockContent[]
  publishedAt: string
  seoMetaTitle: string
  seoMetaDescription: string
}
