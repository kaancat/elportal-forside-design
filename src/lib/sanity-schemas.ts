// Auto-generated from Sanity schemas - MANUALLY UPDATED ON 2025-08-01
// Generated on: 2025-07-27T13:10:00.413Z
// MANUAL UPDATES: Fixed PageSection and Hero interfaces to match actual Sanity schemas

// Base types
export interface SanityReference {
  _type: 'reference';
  _ref: string;
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityImage {
  _type: 'image';
  asset: SanityReference;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface IconManager {
  _type: 'icon.manager';
  icon: string;
  metadata: {
    iconName: string;
    collectionId: string;
    collectionName: string;
    url: string;
    inlineSvg: string;
    downloadUrl: string;
    size: {
      width: number;
      height: number;
    };
  };
}

// Content block base
export interface ContentBlockBase {
  _type: string;
  _key: string;
}

export interface ApplianceCalculator extends ContentBlockBase {
  _type: 'applianceCalculator';
  title?: string;
  subtitle?: string;
}

export interface BlogPost extends ContentBlockBase {
  _type: 'blogPost';
  title: string;
  slug: SanitySlug;
}

export interface CallToActionSection extends ContentBlockBase {
  _type: 'callToActionSection';
  title: string;
  buttonText: string;
  buttonUrl: string;
  // Legacy optional aliases
  heading?: string;
  primaryButtonLink?: string;
  primaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonText?: string;
}

export interface ChargingBoxProduct extends ContentBlockBase {
  _type: 'chargingBoxProduct';
  name: string;
}

export interface ChargingBoxShowcase extends ContentBlockBase {
  _type: 'chargingBoxShowcase';
  heading: string;
}

export interface Co2EmissionsChart extends ContentBlockBase {
  _type: 'co2EmissionsChart';
  title?: string;
  subtitle?: string;
  // Legacy fields present in some documents
  description?: string;
  region?: string;
  showForecast?: boolean;
}

export interface ColorTheme extends ContentBlockBase {
  _type: 'colorTheme';
  name: string;
  background?: any;
  text?: any;
  primary?: any;
}

export interface ConsumptionMap extends ContentBlockBase {
  _type: 'consumptionMap';
  title?: string;
  subtitle?: string;
}

export interface DailyPriceTimeline extends ContentBlockBase {
  _type: 'dailyPriceTimeline';
  title?: string;
  subtitle?: string;
  region?: string;
  priceArea?: string;
}

export interface DeclarationGridmix extends ContentBlockBase {
  _type: 'declarationGridmix';
  title?: string;
  subtitle?: string;
}

export interface DeclarationProduction extends ContentBlockBase {
  _type: 'declarationProduction';
  title?: string;
  subtitle?: string;
  leadingText?: any[];
  headerAlignment?: 'left' | 'center' | 'right';
  showProductionBreakdown?: boolean;
  showCO2Intensity?: boolean;
  showRenewableShare?: boolean;
  defaultView?: '24h' | '7d' | '30d';
}

export interface EnergyTipsSection extends ContentBlockBase {
  _type: 'energyTipsSection';
  title?: string;
  subtitle?: string;
  showCategories?: string[];
  displayMode?: 'tabs' | 'grid' | 'list';
  headerAlignment?: 'left' | 'center' | 'right';
  showDifficultyBadges?: boolean;
  showSavingsPotential?: boolean;
  showSavingsCalculator?: boolean;
  maxTipsPerCategory?: number;
  defaultCategory?: 'all' | 'daily_habits' | 'heating' | 'lighting' | 'appliances' | 'insulation' | 'smart_tech';
}

export interface FaqGroup extends ContentBlockBase {
  _type: 'faqGroup';
  title: string;
  faqItems: Array<{
    _type: 'faqItem';
    _key: string;
    question: string;
    answer: any[];
  }>;
}

export interface FaqItem extends ContentBlockBase {
  _type: 'faqItem';
  question: string;
}

export interface FeatureItem extends ContentBlockBase {
  _type: 'featureItem';
  icon?: IconManager;
  title?: string;
  description?: string;
}

export interface FeatureList extends ContentBlockBase {
  _type: 'featureList';
  title?: string;
  subtitle?: string;
}

export interface Hero extends ContentBlockBase {
  _type: 'hero';
  headline: string;
  subheadline?: string;
  // Legacy optional rich text content
  content?: Array<any>;
  image?: SanityImage;
}

export interface HeroWithCalculator extends ContentBlockBase {
  _type: 'heroWithCalculator';
  headline: string;
  subheadline?: string;
  highlightWords?: string[];
  content?: Array<any>; // Portable Text blocks
  calculatorTitle?: string;
  showLivePrice?: boolean;
  showProviderComparison?: boolean;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  // Style & Appearance fields
  image?: SanityImage;
  backgroundStyle?: 'default' | 'lightGray' | 'gradientGreenMist' | 'gradientOceanBreeze' | 'gradientSunriseGlow' | 'gradientNordicSky' | 'gradientClassic' | 'solidGreen' | 'solidDark';
  textColor?: 'auto' | 'dark' | 'light';
  overlayOpacity?: number;
  padding?: 'small' | 'medium' | 'large' | 'xlarge';
  alignment?: 'left' | 'center' | 'right';
}


export interface InfoCardsSection extends ContentBlockBase {
  _type: 'infoCardsSection';
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  leadingText?: any[];
  // Legacy style fields for backward compatibility
  backgroundColor?: string;
  textColor?: string;
  cards?: {
    title: string;
    description?: any[];
    icon?: string;
    iconColor?: string;
    bgColor?: string;
  }[];
  columns?: 2 | 3 | 4;
}

export interface Link extends ContentBlockBase {
  _type: 'link';
  title: string;
}

export interface LivePriceGraph extends ContentBlockBase {
  _type: 'livePriceGraph';
  title: string;
  subtitle?: string;
  apiRegion: 'DK1' | 'DK2';
  headerAlignment?: 'left' | 'center' | 'right';
  // Legacy optional fields for backward compatibility
  autoRefresh?: boolean;
  chartHeight?: number;
  colorScheme?: string;
  updateInterval?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  chartType?: string;
  timeRange?: string;
  description?: string;
  refreshInterval?: number;
  showAverage?: boolean;
  showCurrentPrice?: boolean;
  showToggle?: boolean;
  priceArea?: string;
}

export interface MegaMenu extends ContentBlockBase {
  _type: 'megaMenu';
  title: string;
}

export interface MegaMenuColumn extends ContentBlockBase {
  _type: 'megaMenuColumn';
  title?: string;
}

export interface MegaMenuItem extends ContentBlockBase {
  _type: 'megaMenuItem';
  title: string;
  description?: string;
  icon?: IconManager;
  link: any;
}

export interface MonthlyProductionChart extends ContentBlockBase {
  _type: 'monthlyProductionChart';
  title: string;
  leadingText?: string;
  description?: string;
  // Legacy optional fields present in older docs
  comparisonType?: string;
  showComparison?: boolean;
}

export interface Page extends ContentBlockBase {
  _type: 'page';
  title: string;
  slug: SanitySlug;
}

export interface Page extends ContentBlockBase {
  _type: 'page';
  title: string;
  slug: SanitySlug;
}

export interface PageSection extends ContentBlockBase {
  _type: 'pageSection';
  title?: string;
  header?: string; // legacy alias used in older docs
  headerAlignment?: 'left' | 'center' | 'right';
  content?: Array<any>; // Array of blocks, images, and embedded components
  image?: SanityImage;
  imagePosition?: 'left' | 'right';
  cta?: {
    text: string;
    url: string;
  };
  link?: string; // legacy alias for cta.url
  // Legacy style fields
  backgroundColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  textColor?: string;
  settings?: any; // SectionSettings interface
}

export interface PriceCalculator extends ContentBlockBase {
  _type: 'priceCalculator';
  title?: string;
  backgroundColor?: string;
  variant?: string;
}

export interface PriceExampleTable extends ContentBlockBase {
  _type: 'priceExampleTable';
  title: string;
}

export interface PricingComparison extends ContentBlockBase {
  _type: 'pricingComparison';
  title?: string;
  subtitle?: string;
  // Legacy optional flags for backward compatibility
  showCalculator?: boolean;
  showRecommendation?: boolean;
}

export interface Provider extends ContentBlockBase {
  _type: 'provider';
  providerName: string;
  productName: string;
  logo?: SanityImage;
  displayPrice_kWh: number;
  displayMonthlyFee: number;
  signupLink: string;
  isVindstoedProduct?: boolean;
}

export interface ProviderList extends ContentBlockBase {
  _type: 'providerList';
  title?: string;
  subtitle?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  // Legacy optional fields used in older documents
  maxProviders?: number;
  showDetailedPricing?: boolean;
  showGreenEnergy?: boolean;
}

export interface RealPriceComparisonTable extends ContentBlockBase {
  _type: 'realPriceComparisonTable';
  title: string;
  subtitle?: string;
  description?: Array<any>; // Portable Text blocks
  region?: 'DK1' | 'DK2';
  highlightLowest?: boolean;
  showSpotPrice?: boolean;
  showProviderFee?: boolean;
  showTotalPrice?: boolean;
  // Deprecated field for backward compatibility
  leadingText?: string;
}

export interface RegionalComparison extends ContentBlockBase {
  _type: 'regionalComparison';
  title?: string;
  subtitle?: string;
  // Legacy optional flags for backward compatibility
  showHistoricalTrend?: boolean;
  showPriceDifference?: boolean;
}

export interface RenewableEnergyForecast extends ContentBlockBase {
  _type: 'renewableEnergyForecast';
  title: string;
  leadingText?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  // Legacy/deprecated fields that may exist in old data
  region?: string;
  showPercentages?: boolean;
  showTrend?: boolean;
  showDetails?: boolean;
  forecastDays?: number;
}

export interface RichTextSection extends ContentBlockBase {
  _type: 'richTextSection';
}

export interface SectionSettings extends ContentBlockBase {
  _type: 'sectionSettings';
}

export interface SiteSettings extends ContentBlockBase {
  _type: 'siteSettings';
  title: string;
  description?: string;
}

export interface ValueItem extends ContentBlockBase {
  _type: 'valueItem';
  icon?: IconManager;
  heading: string;
  description: string;
}

export interface ValueProposition extends ContentBlockBase {
  _type: 'valueProposition';
  heading: string;
  subheading?: string;
  content?: Array<any>; // Portable Text blocks
  valueItems?: Array<{
    _key: string;
    _type: 'valueItem';
    heading: string;
    description: string;
  }>;
  // Deprecated fields for backward compatibility
  title?: string;
  items?: Array<any>;
  propositions?: string[];
}

export interface VideoSection extends ContentBlockBase {
  _type: 'videoSection';
  title: string;
}

// Union of all content block types
export type ContentBlock = ApplianceCalculator | CallToActionSection | ChargingBoxShowcase | Co2EmissionsChart | ColorTheme | ConsumptionMap | DailyPriceTimeline | DeclarationGridmix | DeclarationProduction | EnergyTipsSection | FaqGroup | FaqItem | FeatureItem | FeatureList | Hero | HeroWithCalculator | InfoCardsSection | Link | LivePriceGraph | MegaMenu | MegaMenuColumn | MegaMenuItem | MonthlyProductionChart | PageSection | PriceCalculator | PriceExampleTable | PricingComparison | ProviderList | RealPriceComparisonTable | RegionalComparison | RenewableEnergyForecast | RichTextSection | SectionSettings | ValueItem | ValueProposition | VideoSection;
