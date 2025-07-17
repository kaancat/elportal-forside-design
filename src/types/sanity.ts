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

export interface MarkDef {
  _key: string
  _type: string
  href?: string
  [key: string]: unknown
}

export interface BlockContent {
  _type: 'block'
  children: Array<{
    _type: 'span'
    text: string
    marks?: string[]
  }>
  markDefs?: MarkDef[]
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
  leadingText: BlockContent[]
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
  headerAlignment?: 'left' | 'center' | 'right'
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
  headerAlignment?: 'left' | 'center' | 'right'
}

export interface CO2EmissionsChart {
  _type: 'co2EmissionsChart'
  _key: string
  title?: string
  subtitle?: string
  leadingText?: BlockContent[]
  headerAlignment?: 'left' | 'center' | 'right'
  showGauge?: boolean
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

export interface HeroBlock {
  _type: 'hero'
  _key: string
  headline: string
  subheadline?: string
  cta?: {
    text: string
    link: string
  }
  images?: SanityImage[]
}

export interface MonthlyProductionChartBlock {
  _type: 'monthlyProductionChart'
  _key: string
  title: string
  leadingText?: string
  description?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export interface ProviderProductBlock {
  id: string
  providerName: string
  productName: string
  logoUrl: string
  displayPrice_kWh: number
  displayMonthlyFee: number
  kwhMarkup?: number  // In øre, needs conversion to kroner
  monthlySubscription?: number
  signupLink: string
  isVindstoedProduct: boolean
  benefits: { text: string; included: boolean }[]
}

export interface ProviderListBlock {
  _type: 'providerList'
  _key: string
  title?: string
  providers: ProviderProductBlock[]
}

export interface FeatureBlock {
  _key: string
  _type: 'feature'
  title: string
  description: string
  icon: string
}

export interface FeatureListBlock {
  _type: 'featureList'
  _key: string
  title?: string
  features: FeatureBlock[]
}

export interface ValuePropositionBlock {
  _type: 'valueProposition'
  _key: string
  title?: string
  propositions: string[]
}

export interface DeclarationProduction {
  _type: 'declarationProduction'
  _key: string
  title?: string
  subtitle?: string
  leadingText?: BlockContent[]
  headerAlignment?: 'left' | 'center' | 'right'
  showProductionBreakdown?: boolean
  showCO2Intensity?: boolean
  showRenewableShare?: boolean
  defaultView?: '24h' | '7d' | '30d'
}

export interface DeclarationGridmix {
  _type: 'declarationGridmix'
  _key: string
  title?: string
  subtitle?: string
  leadingText?: BlockContent[]
  headerAlignment?: 'left' | 'center' | 'right'
  showSummary?: boolean
  view?: '24h' | '7d' | '30d'
}

export interface ConsumptionMap {
  _type: 'consumptionMap'
  _key: string
  title?: string
  subtitle?: string
  leadingText?: BlockContent[]
  headerAlignment?: 'left' | 'center' | 'right'
  dataSource?: 'latest' | 'daily' | 'monthly' | 'peak'
  consumerType?: 'all' | 'private' | 'industry' | 'both'
  colorScheme?: 'green' | 'blue' | 'heat' | 'brand'
  showLegend?: boolean
  showTooltips?: boolean
  enableInteraction?: boolean
  updateInterval?: number
  defaultView?: '24h' | '7d' | '30d' | 'month'
  showStatistics?: boolean
  mobileLayout?: 'responsive' | 'list' | 'simplified'
}


// Centralized ContentBlock union type
export type ContentBlock = 
  | PageSection 
  | FAQItem 
  | PriceExampleTable 
  | VideoSection 
  | FaqGroup 
  | RichTextSection 
  | CallToActionSection 
  | LivePriceGraph 
  | RealPriceComparisonTable 
  | RenewableEnergyForecast 
  | CO2EmissionsChart
  | DeclarationProduction
  | DeclarationGridmix
  | ConsumptionMap
  | PriceCalculator 
  | HeroWithCalculator 
  | HeroBlock
  | MonthlyProductionChartBlock
  | ProviderListBlock
  | FeatureListBlock
  | ValuePropositionBlock
  | MunicipalityConsumptionMapBlock

export interface HomePage {
  _id: string
  _type: 'homePage'
  title: string
  seoMetaTitle: string
  seoMetaDescription: string
  seoKeywords?: string[]
  ogImage?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  noIndex?: boolean
  contentBlocks: ContentBlock[]
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

// Navigation and Site Settings Types

export interface SanitySlug {
  current: string;
  _type: 'slug';
}

interface InternalLink {
  slug: string;
  _type: 'page' | 'blogPost' | 'homePage';
}

export interface Link {
  _key: string;
  _type: 'link';
  title: string;
  linkType: 'internal' | 'external';
  internalLink?: InternalLink;
  externalUrl?: string;
  isButton?: boolean;
}

export interface IconManager {
  _type: 'icon.manager';
  icon: string;
  metadata: {
    url: string;
  };
}

export interface MegaMenuItem {
  _key: string;
  _type: 'megaMenuItem';
  title: string;
  description?: string;
  link: Link;
  icon?: IconManager;
}

export interface MegaMenuColumn {
  _key: string;
  _type: 'megaMenuColumn';
  title?: string;
  items: MegaMenuItem[];
}

export interface MegaMenu {
  _key: string;
  _type: 'megaMenu';
  title: string;
  content: MegaMenuColumn[];
}

export interface FooterLinkGroup {
    _key: string;
    title: string;
    links: Link[];
}

export interface FooterSettings {
    footerLogo?: SanityImage;
    footerDescription?: string;
    copyrightText?: string;
    secondaryCopyrightText?: string;
    linkGroups: FooterLinkGroup[];
}

export interface SiteSettings {
  _id: string;
  _type: 'siteSettings';
  siteTitle: string;
  headerLinks: (Link | MegaMenu)[];
  footer: FooterSettings;
  // Add other site settings fields as needed
}

export interface SanityPage {
  _id: string;
  _type: 'page';
  title: string;
  slug: SanitySlug;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string[];
  ogImage?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  };
  noIndex?: boolean;
  contentBlocks?: ContentBlock[];
}

// Private Industry Consumption API Types
export interface ConsumptionRecord {
  HourUTC: string;
  HourDK: string;
  MunicipalityNo: string;
  MunicipalityName?: string;
  HousingCategory: string;
  HeatingCategory: string;
  ConsumptionkWh: number;
}

export interface AggregatedConsumption {
  municipalityNo: string;
  municipalityName: string;
  totalConsumption: number;
  averageConsumption: number;
  housingBreakdown: Record<string, number>;
  heatingBreakdown: Record<string, number>;
  recordCount: number;
}

export interface ConsumptionResponse {
  data: ConsumptionRecord[] | AggregatedConsumption[];
  totalRecords: number;
  aggregationType: 'none' | 'daily' | 'monthly' | 'municipality';
  period: {
    start: string;
    end: string;
  };
  filters: {
    municipality?: string;
    municipalityName?: string;
    housingCategory?: string;
    heatingCategory?: string;
  };
  availableCategories: {
    housing: string[];
    heating: string[];
  };
}

export interface MunicipalityConsumptionMapBlock {
  _type: 'municipalityConsumptionMap';
  _key: string;
  title?: string;
  subtitle?: string;
  defaultAggregation?: 'daily' | 'monthly' | 'municipality';
  showHousingBreakdown?: boolean;
  showHeatingBreakdown?: boolean;
  headerAlignment?: 'left' | 'center' | 'right';
}
