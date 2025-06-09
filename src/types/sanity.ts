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
  fullWidth?: boolean
  cta?: {
    text: string;
    url: string;
  };
  theme?: {
    background: string;
    text: string;
    primary: string;
  };
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
  leadingText: any[]
  example1_title: string
  example1_kwh_price: number
  example1_subscription: number
  example2_title: string
  example2_kwh_price: number
  example2_subscription: number
}

export interface VideoSection {
  _type: 'videoSection'
  _key: string
  title?: string
  videoUrl: string
  customThumbnail?: SanityImage
}

export interface FaqGroup {
  _type: 'faqGroup'
  _key: string
  title: string
  faqItems: FAQItem[]
}

export interface RichTextSection {
  _type: 'richTextSection'
  _key: string
  content: BlockContent[]
}

export interface CallToActionSection {
  _type: 'callToActionSection'
  _key: string
  title: string
  buttonText: string
  buttonUrl: string
}

export interface LivePriceGraph {
  _type: 'livePriceGraph'
  _key: string
  title: string
  subtitle?: string
  apiRegion: 'DK1' | 'DK2'
}

export interface RealPriceComparisonTable {
  _type: 'realPriceComparisonTable'
  _key: string
  title: string
  leadingText?: string
}

export interface RenewableEnergyForecast {
  _type: 'renewableEnergyForecast'
  _key: string
  title: string
  leadingText?: string
}

export interface PriceCalculator {
  _type: 'priceCalculator'
  _key: string
  title?: string
}

export interface HeroWithCalculator {
  _type: 'heroWithCalculator'
  _key: string
}

export interface HomePage {
  _id: string
  _type: 'homePage'
  title: string
  seoMetaTitle: string
  seoMetaDescription: string
  contentBlocks: Array<PageSection | FAQItem | PriceExampleTable | VideoSection | FaqGroup | RichTextSection | CallToActionSection | LivePriceGraph | RealPriceComparisonTable | RenewableEnergyForecast | PriceCalculator | HeroWithCalculator>
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
