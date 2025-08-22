/**
 * Centralized Sanity GROQ projections
 * Prevents drift between server and client queries
 * Ensures components get the data they expect
 */

// Comprehensive provider projection with all pricing fields
export const providerProjection = `{
  "id": _id,
  providerName,
  productName,
  "logoUrl": logo.asset->url,
  spotPriceMarkup,
  greenCertificateFee,
  tradingCosts,
  monthlySubscription,
  signupFee,
  yearlySubscription,
  isVindstoedProduct,
  isVariablePrice,
  bindingPeriod,
  isGreenEnergy,
  benefits,
  signupLink,
  lastPriceUpdate,
  priceUpdateFrequency,
  notes,
  isActive,
  displayPrice_kWh,
  displayMonthlyFee,
  regionalPricing[] {
    region,
    spotPriceMarkup,
    monthlySubscription
  }
}`;

// Icon projection with full metadata
export const iconProjection = `{
  provider,
  name,
  icon,
  metadata {
    inlineSvg,
    iconName,
    url,
    color,
    size,
    downloadUrl,
    author,
    license,
    collectionId,
    collectionName
  }
}`;

// Image projection with asset details
export const imageProjection = `{
  asset-> {
    _id,
    url,
    metadata {
      dimensions {
        width,
        height
      }
    }
  },
  alt,
  hotspot,
  crop
}`;

// Complete page projection with all component fields
export const pageProjection = `{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  seoMetaTitle,
  seoMetaDescription,
  seoKeywords,
  noIndex,
  isHomepage,
  showReadingProgress,
  ogImage ${imageProjection},
  contentBlocks[] {
    _key,
    _type,
    
    // Common fields
    title,
    subtitle,
    description,
    headerAlignment,
    
    // Hero components - complete projection
    _type == "hero" => {
      _type,
      _key,
      headline,
      subheadline,
      backgroundImage ${imageProjection},
      image ${imageProjection},
      backgroundImageUrl,
      imageAlt,
      imageCredit,
      backgroundStyle,
      textColor,
      overlayOpacity,
      padding,
      alignment,
      variant,
      showLivePrice,
      showProviderComparison,
      stats[] {
        _key,
        value,
        label,
        icon ${iconProjection}
      },
      cta {
        text,
        link,
        variant,
        icon ${iconProjection}
      }
    },
    
    _type == "heroWithCalculator" => {
      _type,
      _key,
      headline,
      subheadline,
      backgroundImage ${imageProjection},
      image ${imageProjection},
      backgroundImageUrl,
      backgroundImageAlt,
      backgroundStyle,
      textColor,
      overlayOpacity,
      padding,
      alignment,
      variant,
      ctaButtonText,
      showLivePrices
    },
    
    // Page sections with rich content
    _type == "pageSection" => {
      _type,
      _key,
      title,
      headerAlignment,
      content,
      image ${imageProjection},
      imageAlt,
      imagePosition,
      cta {
        text,
        link,
        variant
      },
      settings {
        backgroundColor,
        textColor,
        paddingTop,
        paddingBottom
      }
    },
    
    // Value propositions with icons
    _type == "valueProposition" => {
      _type,
      _key,
      heading,
      subheading,
      headerAlignment,
      valueItems[] {
        _key,
        title,
        description,
        icon ${iconProjection}
      }
    },
    
    // Feature lists with icons
    _type == "featureList" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      features[] {
        _key,
        title,
        description,
        icon ${iconProjection}
      }
    },
    
    // Info cards with icons
    _type == "infoCards" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      cards[] {
        _key,
        title,
        description,
        icon ${iconProjection},
        bgColor
      }
    },
    
    // FAQ groups
    _type == "faqGroup" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      faqItems[] {
        _key,
        question,
        answer
      }
    },
    
    // Call to action sections
    _type == "callToActionSection" => {
      _type,
      _key,
      headline,
      subheadline,
      headerAlignment,
      ctaButtons[] {
        _key,
        text,
        link,
        variant
      },
      backgroundImage ${imageProjection},
      backgroundColor
    },
    
    // Provider list with complete data
    _type == "providerList" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      displayMode,
      showDetailedPricing,
      showEnvironmentalInfo,
      'providers': providers[]-> ${providerProjection}
    },
    
    // Live price graph with API region
    _type == "livePriceGraph" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      headerAlignment,
      "apiRegion": region,
      timeRange,
      showComparison,
      height
    },
    
    // Daily price timeline with API region
    _type == "dailyPriceTimeline" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      "apiRegion": region,
      showComparison,
      height
    },
    
    // CO2 emissions display (keep original type name)
    _type == "co2EmissionsDisplay" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      headerAlignment,
      "apiRegion": region,
      showComparison,
      height
    },
    
    // Monthly production chart
    _type == "monthlyProductionChart" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      leadingText,
      headerAlignment,
      chartType,
      year,
      showComparison
    },
    
    // Renewable energy forecast
    _type == "renewableEnergyForecast" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      headerAlignment,
      "apiRegion": region,
      showDetails,
      forecastDays
    },
    
    // Price calculator with aliased type
    _type == "priceCalculatorWidget" => {
      "_type": "priceCalculator",
      _key,
      title,
      description,
      showAdvancedOptions,
      defaultConsumption,
      variant
    },
    
    // Consumption map with proper fields
    _type == "consumptionMap" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      "dataSource": dataType,
      consumerType,
      colorScheme,
      showLegend,
      showTooltips,
      enableInteraction
    },
    
    // Appliance calculator
    _type == "applianceCalculator" => {
      _type,
      _key,
      title,
      description,
      showSavingsTips,
      defaultAppliances[] {
        _key,
        name,
        wattage,
        hoursPerDay
      }
    },
    
    // Forbrug tracker
    _type == "forbrugTracker" => {
      _type,
      _key,
      title,
      description,
      showAdvancedFeatures,
      enableElOverblik
    },
    
    // Declaration charts
    _type == "declarationProduction" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      chartType,
      timeRange
    },
    
    _type == "declarationGridmix" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      chartType,
      timeRange
    },
    
    // Regional comparison
    _type == "regionalComparison" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      showPriceComparison,
      regions[] {
        _key,
        name,
        code
      }
    },
    
    // Energy tips section
    _type == "energyTipsSection" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      tips[] {
        _key,
        title,
        description,
        icon ${iconProjection},
        category
      }
    },
    
    // Video section
    _type == "videoSection" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      videoUrl,
      thumbnailImage ${imageProjection},
      description
    },
    
    // Real price comparison table
    _type == "realPriceComparisonTable" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      baseConsumption,
      providers[] {
        _key,
        provider->,
        customPricing
      }
    },
    
    // Location selector
    _type == "locationSelector" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      showRegionSelector,
      defaultRegion
    },
    
    // Fallback for unknown types
    _type => {
      _type,
      _key,
      title,
      subtitle,
      description,
      headerAlignment
    }
  }
}`;