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
  _key?: string
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
  headerAlignment?: 'left' | 'center' | 'right'
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
  settings?: {
    theme?: 'default' | 'primary' | 'dark' | 'light' | 'brand' | 'subtle' | 'accent' | 'pattern';
    padding?: 'none' | 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    textAlignment?: 'left' | 'center' | 'right';
    separator?: boolean;
    layoutRatio?: '50/50' | '60/40' | '40/60';
    verticalAlign?: 'start' | 'center' | 'end';
    stickyImage?: boolean;
  };
}

export interface FAQItem {
  _type: 'faqItem'
  _key: string
  question: string
  answer: BlockContent[]
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
  description?: string
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
  subtitle?: string
  description?: Array<any> // Portable Text blocks
  region?: 'DK1' | 'DK2'
  highlightLowest?: boolean
  showSpotPrice?: boolean
  showProviderFee?: boolean
  showTotalPrice?: boolean
  settings?: {
    theme?: 'default' | 'light' | 'subtle' | 'dark' | 'primary'
    padding?: 'none' | 'small' | 'medium' | 'large'
    fullWidth?: boolean
    textAlignment?: 'left' | 'center' | 'right'
    separator?: boolean
    layoutRatio?: '50/50' | '60/40' | '40/60'
    verticalAlign?: 'start' | 'center' | 'end'
    stickyImage?: boolean
  }
  // Deprecated field for backward compatibility
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
  headline: string
  subheadline?: string
  highlightWords?: string[] // Words to highlight in green
  content?: Array<any> // Portable Text blocks
  calculatorTitle?: string
  showLivePrice?: boolean
  showProviderComparison?: boolean
  stats?: Array<{
    _key?: string
    value: string
    label: string
  }>
  // Style & Appearance fields
  image?: SanityImage
  backgroundStyle?: 'default' | 'lightGray' | 'gradientGreenMist' | 'gradientOceanBreeze' | 'gradientSunriseGlow' | 'gradientNordicSky' | 'gradientClassic' | 'solidGreen' | 'solidDark'
  textColor?: 'auto' | 'dark' | 'light'
  overlayOpacity?: number
  padding?: 'small' | 'medium' | 'large' | 'xlarge'
  alignment?: 'left' | 'center' | 'right'
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
  // Additional pricing fields
  spotPriceMarkup?: number  // In øre/kWh
  greenCertificateFee?: number  // In øre/kWh
  tradingCosts?: number  // In øre/kWh
  signupFee?: number
  yearlySubscription?: number
  // Product features
  isVariablePrice?: boolean
  bindingPeriod?: number
  isGreenEnergy?: boolean
  // Regional pricing
  regionalPricing?: {
    region: string
    spotPriceMarkup?: number
    monthlySubscription?: number
  }[]
}

export interface ProviderListBlock {
  _type: 'providerList'
  _key: string
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
  providers: ProviderProductBlock[]
}

export interface ChargingBoxProduct {
  _id: string
  _type: 'chargingBoxProduct'
  name: string
  description?: any[]
  originalPrice?: number
  currentPrice: number
  badge?: string
  features?: string[]
  productImage?: any
  ctaLink: string
  ctaText?: string
}

export interface ChargingBoxShowcaseBlock {
  _type: 'chargingBoxShowcase'
  _key: string
  heading: string
  description?: any[]
  products?: ChargingBoxProduct[]
  headerAlignment?: 'left' | 'center' | 'right'
}

export interface RegionalComparisonBlock {
  _type: 'regionalComparison';
  _key: string;
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  leadingText?: BlockContent[];
  dk1Title?: string;
  dk1Description?: BlockContent[];
  dk1PriceIndicator?: 'higher' | 'lower' | 'same';
  dk1Features?: string[];
  dk2Title?: string;
  dk2Description?: BlockContent[];
  dk2PriceIndicator?: 'higher' | 'lower' | 'same';
  dk2Features?: string[];
  showMap?: boolean;
}

export interface PricingComparisonBlock {
  _type: 'pricingComparison';
  _key: string;
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  leadingText?: BlockContent[];
  fixedTitle?: string;
  fixedDescription?: BlockContent[];
  variableTitle?: string;
  variableDescription?: BlockContent[];
  comparisonItems?: {
    feature: string;
    fixed: string;
    variable: string;
    tooltip?: string;
  }[];
  recommendation?: BlockContent[];
}

export interface DailyPriceTimelineBlock {
  _type: 'dailyPriceTimeline';
  _key: string;
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  leadingText?: BlockContent[];
  showTimeZones?: boolean;
  showAveragePrice?: boolean;
  highlightPeakHours?: boolean;
  apiRegion?: 'DK1' | 'DK2';
}

export interface InfoCardsSectionBlock {
  _type: 'infoCardsSection';
  _key: string;
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  leadingText?: BlockContent[];
  cards?: {
    title: string;
    description?: BlockContent[];
    icon?: IconManager;
    iconColor?: string;
    bgColor?: string;
  }[];
  columns?: 2 | 3 | 4;
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
  heading: string
  subheading?: string
  content?: Array<any> // Portable Text blocks
  valueItems?: Array<{
    _key: string
    _type: 'valueItem'
    heading: string
    description: string
  }>
}

export interface ApplianceCalculator {
  _type: 'applianceCalculator'
  _key: string
  title?: string
  subtitle?: string
  showCategories?: string[]
  showSavingsCallToAction?: boolean
  defaultElectricityPrice?: number
}

export interface EnergyTipsSection {
  _type: 'energyTipsSection'
  _key: string
  title?: string
  subtitle?: string
  showCategories?: string[]
  displayMode?: 'tabs' | 'grid' | 'list'
  headerAlignment?: 'left' | 'center' | 'right'
  showDifficultyBadges?: boolean
  showSavingsPotential?: boolean
  showSavingsCalculator?: boolean
  maxTipsPerCategory?: number
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
  view?: '7d' | '30d'
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
  | ApplianceCalculator
  | EnergyTipsSection
  | ChargingBoxShowcaseBlock
  | RegionalComparisonBlock
  | PricingComparisonBlock
  | DailyPriceTimelineBlock
  | InfoCardsSectionBlock

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
  _type: 'page' | 'blogPost';
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
  icon?: string;
  name?: string;
  provider?: string;
  svg?: string;
  metadata?: {
    inlineSvg?: string;
    iconName?: string;
    url?: string;
    color?: {
      hex: string;
      rgba?: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    };
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
  title: string;
  siteTitle: string; // Keep for backward compatibility
  description?: string;
  logo?: SanityImage;
  favicon?: SanityImage;
  colorThemes?: Array<{
    _key: string;
    _type: 'colorTheme';
    [key: string]: any;
  }>;
  headerLinks: (Link | MegaMenu)[];
  footer: FooterSettings;
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
  showReadingProgress?: boolean;
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

// Unified Page Interface
export interface UnifiedPage extends SanityPage {
  isHomepage?: boolean
}
