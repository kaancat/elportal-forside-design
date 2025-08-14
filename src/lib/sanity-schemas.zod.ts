// Auto-generated from Sanity schemas - MANUALLY UPDATED ON 2025-08-01
// Generated on: 2025-07-27T13:10:00.415Z
// MANUAL UPDATES: 
// - 2025-08-01: Fixed PageSection and Hero schemas to match actual Sanity schemas
// - 2025-08-01: Removed deprecated fields (title/subtitle) from HeroWithCalculator
// - 2025-08-01: Removed deprecated fields (title/items/propositions) from ValueProposition
// - 2025-08-01: Added icon field to valueItems in ValueProposition

import { z } from 'zod';

// Base schemas
export const SanityReferenceSchema = z.object({
  _type: z.literal('reference'),
  _ref: z.string(),
});

export const SanitySlugSchema = z.object({
  _type: z.literal('slug'),
  current: z.string(),
});

export const SanityImageSchema = z.object({
  _type: z.literal('image'),
  asset: SanityReferenceSchema,
  hotspot: z.object({
    x: z.number(),
    y: z.number(),
    height: z.number(),
    width: z.number(),
  }).optional(),
  crop: z.object({
    top: z.number(),
    bottom: z.number(),
    left: z.number(),
    right: z.number(),
  }).optional(),
}).passthrough();

export const IconManagerSchema = z.object({
  _type: z.literal('icon.manager'),
  icon: z.string(),
  metadata: z.object({
    iconName: z.string(),
    collectionId: z.string(),
    collectionName: z.string(),
    url: z.string(),
    inlineSvg: z.string(),
    downloadUrl: z.string(),
    size: z.object({
      width: z.number(),
      height: z.number(),
    }),
  }),
});

export const ApplianceCalculatorSchema = z.object({
  _type: z.literal('applianceCalculator'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const BlogPostSchema = z.object({
  _type: z.literal('blogPost'),
  _key: z.string(),
  title: z.string(),
  slug: SanitySlugSchema,
});

export const CallToActionSectionSchema = z.object({
  _type: z.literal('callToActionSection'),
  _key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  buttonText: z.string(),
  buttonUrl: z.string(),
});

export const ChargingBoxProductSchema = z.object({
  // When dereferenced in GROQ we receive a document with _id (and sometimes _type)
  _id: z.string().optional(),
  _type: z.literal('chargingBoxProduct').optional(),
  name: z.string(),
  description: z.array(z.any()).optional(),
  originalPrice: z.number().optional(),
  currentPrice: z.number().optional(),
  badge: z.string().optional(),
  features: z.array(z.string()).optional(),
  productImage: SanityImageSchema.optional(),
  ctaLink: z.string().url().optional(),
  ctaText: z.string().optional(),
}).passthrough();

export const ChargingBoxShowcaseSchema = z.object({
  _type: z.literal('chargingBoxShowcase'),
  _key: z.string(),
  heading: z.string(),
  description: z.array(z.any()).optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  products: z.array(ChargingBoxProductSchema).optional(),
}).passthrough();

export const Co2EmissionsChartSchema = z.object({
  _type: z.literal('co2EmissionsChart'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const ColorThemeSchema = z.object({
  _type: z.literal('colorTheme'),
  _key: z.string(),
  name: z.string(),
  background: z.any().optional(),
  text: z.any().optional(),
  primary: z.any().optional(),
});

export const ConsumptionMapSchema = z.object({
  _type: z.literal('consumptionMap'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  leadingText: z.array(z.any()).optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  dataSource: z.enum(['latest', 'daily', 'monthly', 'peak']).optional(),
  consumerType: z.enum(['all', 'private', 'industry', 'both']).optional(),
  colorScheme: z.enum(['green', 'blue', 'heat', 'brand']).optional(),
  showLegend: z.boolean().optional(),
  showTooltips: z.boolean().optional(),
  enableInteraction: z.boolean().optional(),
  updateInterval: z.number().optional(),
  defaultView: z.enum(['24h', '7d', '30d', 'month']).optional(),
  showStatistics: z.boolean().optional(),
  mobileLayout: z.enum(['responsive', 'list', 'simplified']).optional(),
});

export const DailyPriceTimelineSchema = z.object({
  _type: z.literal('dailyPriceTimeline'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const DeclarationGridmixSchema = z.object({
  _type: z.literal('declarationGridmix'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  leadingText: z.array(z.any()).optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  showSummary: z.boolean().optional(),
  view: z.enum(['7d', '30d']).optional(),
});

export const DeclarationProductionSchema = z.object({
  _type: z.literal('declarationProduction'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  leadingText: z.array(z.any()).optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  showProductionBreakdown: z.boolean().optional(),
  showCO2Intensity: z.boolean().optional(),
  showRenewableShare: z.boolean().optional(),
  defaultView: z.enum(['24h', '7d', '30d']).optional(),
});

export const EnergyTipsSectionSchema = z.object({
  _type: z.literal('energyTipsSection'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  showCategories: z.array(z.string()).optional(),
  displayMode: z.enum(['tabs', 'grid', 'list']).optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  showDifficultyBadges: z.boolean().optional(),
  showSavingsPotential: z.boolean().optional(),
  showSavingsCalculator: z.boolean().optional(),
  maxTipsPerCategory: z.number().optional(),
  defaultCategory: z.enum(['all', 'daily_habits', 'heating', 'lighting', 'appliances', 'insulation', 'smart_tech']).optional(),
  tips: z.array(z.any()).optional(),
});

export const FaqGroupSchema = z.object({
  _type: z.literal('faqGroup'),
  _key: z.string(),
  title: z.string(),
  faqItems: z.array(z.object({
    _type: z.literal('faqItem'),
    _key: z.string(),
    question: z.string(),
    answer: z.array(z.any()),
  })),
});

export const FaqItemSchema = z.object({
  _type: z.literal('faqItem'),
  _key: z.string(),
  question: z.string(),
  answer: z.array(z.any()),
});

export const FeatureItemSchema = z.object({
  _type: z.literal('featureItem'),
  _key: z.string(),
  icon: IconManagerSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const FeatureListSchema = z.object({
  _type: z.literal('featureList'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const HeroSchema = z.object({
  _type: z.literal('hero'),
  _key: z.string(),
  headline: z.string(),
  subheadline: z.string().optional(),
  image: SanityImageSchema.optional(),
});

export const HeroWithCalculatorSchema = z.object({
  _type: z.literal('heroWithCalculator'),
  _key: z.string(),
  headline: z.string(),
  subheadline: z.string().optional(),
  highlightWords: z.array(z.string()).optional(),
  content: z.array(z.any()).optional(), // Portable Text blocks
  calculatorTitle: z.string().optional(),
  showLivePrice: z.boolean().optional(),
  showProviderComparison: z.boolean().optional(),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional().nullable(),
  // Style & Appearance fields
  image: SanityImageSchema.optional(),
  backgroundStyle: z.enum(['default', 'lightGray', 'gradientGreenMist', 'gradientOceanBreeze', 'gradientSunriseGlow', 'gradientNordicSky', 'gradientClassic', 'solidGreen', 'solidDark']).optional(),
  textColor: z.enum(['auto', 'dark', 'light']).optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
  padding: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});


export const InfoCardsSectionSchema = z.object({
  _type: z.literal('infoCardsSection'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  leadingText: z.array(z.any()).optional(),
  cards: z.array(z.object({
    title: z.string(),
    description: z.array(z.any()).optional(),
    icon: IconManagerSchema.optional(),
    iconColor: z.string().optional(),
    bgColor: z.string().optional(),
  })).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export const LinkSchema = z.object({
  _type: z.literal('link'),
  _key: z.string(),
  title: z.string(),
});

export const LivePriceGraphSchema = z.object({
  _type: z.literal('livePriceGraph'),
  _key: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  apiRegion: z.enum(['DK1', 'DK2']),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
});

export const MegaMenuSchema = z.object({
  _type: z.literal('megaMenu'),
  _key: z.string(),
  title: z.string(),
});

export const MegaMenuColumnSchema = z.object({
  _type: z.literal('megaMenuColumn'),
  _key: z.string(),
  title: z.string().optional(),
});

export const MegaMenuItemSchema = z.object({
  _type: z.literal('megaMenuItem'),
  _key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  icon: IconManagerSchema.optional(),
  link: z.any(),
});

export const MonthlyProductionChartSchema = z.object({
  _type: z.literal('monthlyProductionChart'),
  _key: z.string(),
  title: z.string(),
  leadingText: z.string().optional(),
  description: z.string().optional(),
});

export const PageSchema = z.object({
  _type: z.literal('page'),
  _key: z.string(),
  title: z.string(),
  slug: SanitySlugSchema,
});

export const PageSectionSchema = z.object({
  _type: z.literal('pageSection'),
  _key: z.string(),
  title: z.string().optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  content: z.array(z.any()).optional(), // Array of blocks, images, and embedded components
  image: SanityImageSchema.optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  cta: z.object({
    text: z.string(),
    url: z.string(),
  }).optional(),
  settings: z.any().optional(), // SectionSettings schema defined later in file
});

export const PriceCalculatorSchema = z.object({
  _type: z.literal('priceCalculator'),
  _key: z.string(),
  title: z.string().optional(),
});

export const PriceExampleTableSchema = z.object({
  _type: z.literal('priceExampleTable'),
  _key: z.string(),
  title: z.string(),
});

export const PricingComparisonSchema = z.object({
  _type: z.literal('pricingComparison'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const ProviderSchema = z.object({
  _type: z.literal('provider'),
  _key: z.string(),
  providerName: z.string(),
  productName: z.string(),
  logo: SanityImageSchema.optional(),
  displayPrice_kWh: z.number(),
  displayMonthlyFee: z.number(),
  signupLink: z.string().url(),
  isVindstoedProduct: z.boolean().optional(),
});

export const ProviderListSchema = z.object({
  _type: z.literal('providerList'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  headerAlignment: z.enum(['left', 'center', 'right']).optional(),
  providers: z.array(z.any()).optional(),
});

export const RealPriceComparisonTableSchema = z.object({
  _type: z.literal('realPriceComparisonTable'),
  _key: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.array(z.any()).optional(), // Portable Text blocks
  region: z.enum(['DK1', 'DK2']).optional(),
  highlightLowest: z.boolean().optional(),
  showSpotPrice: z.boolean().optional(),
  showProviderFee: z.boolean().optional(),
  showTotalPrice: z.boolean().optional(),
  // Deprecated field for backward compatibility
  leadingText: z.string().optional().nullable(),
});

export const RegionalComparisonSchema = z.object({
  _type: z.literal('regionalComparison'),
  _key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const RenewableEnergyForecastSchema = z.object({
  _type: z.literal('renewableEnergyForecast'),
  _key: z.string(),
  title: z.string(),
  leadingText: z.string().optional(),
});

export const RichTextSectionSchema = z.object({
  _type: z.literal('richTextSection'),
  _key: z.string(),
});

export const SectionSettingsSchema = z.object({
  _type: z.literal('sectionSettings'),
  _key: z.string(),
});

export const SiteSettingsSchema = z.object({
  _type: z.literal('siteSettings'),
  _key: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

export const ValueItemSchema = z.object({
  _type: z.literal('valueItem'),
  _key: z.string(),
  icon: IconManagerSchema.optional(),
  heading: z.string(),
  description: z.string(),
});

export const ValuePropositionSchema = z.object({
  _type: z.literal('valueProposition'),
  _key: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
  content: z.array(z.any()).optional(), // Portable Text blocks
  valueItems: z.array(z.object({
    _key: z.string(),
    _type: z.literal('valueItem'),
    heading: z.string(),
    description: z.string(),
    icon: IconManagerSchema.optional(),
  })).optional(),
});

export const VideoSectionSchema = z.object({
  _type: z.literal('videoSection'),
  _key: z.string(),
  title: z.string(),
});

// Union schema for all content blocks
export const ContentBlockSchema = z.discriminatedUnion('_type', [
  ApplianceCalculatorSchema,
  CallToActionSectionSchema,
  ChargingBoxShowcaseSchema,
  Co2EmissionsChartSchema,
  ColorThemeSchema,
  ConsumptionMapSchema,
  DailyPriceTimelineSchema,
  DeclarationGridmixSchema,
  DeclarationProductionSchema,
  EnergyTipsSectionSchema,
  FaqGroupSchema,
  FaqItemSchema,
  FeatureItemSchema,
  FeatureListSchema,
  HeroSchema,
  HeroWithCalculatorSchema,
  InfoCardsSectionSchema,
  LinkSchema,
  LivePriceGraphSchema,
  MegaMenuSchema,
  MegaMenuColumnSchema,
  MegaMenuItemSchema,
  MonthlyProductionChartSchema,
  PageSectionSchema,
  PriceCalculatorSchema,
  PriceExampleTableSchema,
  PricingComparisonSchema,
  ProviderListSchema,
  RealPriceComparisonTableSchema,
  RegionalComparisonSchema,
  RenewableEnergyForecastSchema,
  RichTextSectionSchema,
  SectionSettingsSchema,
  ValueItemSchema,
  ValuePropositionSchema,
  VideoSectionSchema,
]);
