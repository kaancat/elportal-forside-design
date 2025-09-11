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
    
    // Hero components - complete projection aligned with component props
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
        "url": coalesce(url, link)
      }
    },
    
    _type == "heroWithCalculator" => {
      _type,
      _key,
      headline,
      subheadline,
      highlightWords,
      content,
      calculatorTitle,
      showLivePrice,
      showProviderComparison,
      stats[] {
        _key,
        value,
        label
      },
      image ${imageProjection},
      backgroundStyle,
      textColor,
      overlayOpacity,
      padding,
      alignment
    },
    
    // Page sections with rich content
    _type == "pageSection" => {
      _type,
      _key,
      title,
      headerAlignment,
      content,
      image ${imageProjection},
      imagePosition,
      cta {
        text,
        url
      },
      theme->{ 
        "background": background.hex,
        "text": text.hex,
        "primary": primary.hex
      },
      settings {
        theme,
        padding,
        fullWidth,
        textAlignment,
        separator,
        layoutRatio,
        verticalAlign,
        stickyImage
      }
    },
    
    // Value propositions with icons
    _type == "valueProposition" => {
      _type,
      _key,
      heading,
      subheading,
      headerAlignment,
      "valueItems": coalesce(valueItems[] {
        _key,
        title,
        description,
        icon ${iconProjection}
      }, [])
    },
    
    // Feature lists with icons
    _type == "featureList" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      "features": coalesce(features[] {
        _key,
        title,
        description,
        icon ${iconProjection}
      }, [])
    },
    
    // Info cards section with icons (correct type name)
    _type == "infoCardsSection" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      leadingText,
      "cards": coalesce(cards[] {
        _key,
        title,
        description,
        icon ${iconProjection},
        iconColor,
        bgColor
      }, []),
      columns
    },
    
    // FAQ groups
    _type == "faqGroup" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      "faqItems": coalesce(faqItems[] {
        _key,
        question,
        answer
      }, [])
    },

    // Individual FAQ item (legacy usage on some pages)
    _type == "faqItem" => {
      _type,
      _key,
      question,
      answer
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
      priceSourceDate,
      displayMode,
      showDetailedPricing,
      showEnvironmentalInfo,
      'providers': providers[]-> ${providerProjection}
    },
    
    // Live price graph with API region (default DK2)
    _type == "livePriceGraph" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      headerAlignment,
      "apiRegion": coalesce(region, "DK2"),
      timeRange,
      showComparison,
      height
    },
    
    // Daily price timeline with API region (default DK2)
    _type == "dailyPriceTimeline" => {
      _type,
      _key,
      title,
      subtitle,
      leadingText,
      headerAlignment,
      "apiRegion": coalesce(region, "DK2"),
      showTimeZones,
      showAveragePrice,
      highlightPeakHours,
      showComparison,
      height
    },
    
    // CO2 emissions: alias Sanity's co2EmissionsDisplay -> app's co2EmissionsChart
    _type == "co2EmissionsDisplay" => {
      // Force the block type expected by the renderer to avoid missing component
      "_type": "co2EmissionsChart",
      _key,
      title,
      subtitle,
      description,
      leadingText,
      headerAlignment,
      "apiRegion": region,
      showComparison,
      height
    },

    // Direct CO2 emissions chart block
    _type == "co2EmissionsChart" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      leadingText,
      headerAlignment,
      "apiRegion": coalesce(region, "DK2"),
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
    
    // Renewable energy forecast (default region DK2)
    _type == "renewableEnergyForecast" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      leadingText,
      headerAlignment,
      "apiRegion": coalesce(region, "DK2"),
      showDetails,
      forecastDays
    },

    // Pricing comparison (fast vs variabel) with recommendation card
    _type == "pricingComparison" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      leadingText,
      fixedTitle,
      fixedDescription,
      variableTitle,
      variableDescription,
      "comparisonItems": coalesce(comparisonItems[] {
        feature,
        fixed,
        variable,
        tooltip
      }, []),
      recommendation
    },
    
    // Charging box showcase with products
    _type == "chargingBoxShowcase" => {
      _type,
      _key,
      heading,
      description,
      headerAlignment,
      "products": coalesce(products[]->{
        _id,
        name,
        description,
        originalPrice,
        currentPrice,
        badge,
        "features": coalesce(features, []),
        productImage ${imageProjection},
        ctaLink,
        ctaText
      }, [])
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
      leadingText,
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
      leadingText,
      headerAlignment,
      chartType,
      timeRange
    },
    
    _type == "declarationGridmix" => {
      _type,
      _key,
      title,
      subtitle,
      leadingText,
      headerAlignment,
      chartType,
      timeRange
    },
    
    // Regional comparison (DK1 vs DK2) with descriptive fields
    _type == "regionalComparison" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      leadingText,
      dk1Title,
      dk1Description,
      dk1PriceIndicator,
      "dk1Features": coalesce(dk1Features, []),
      dk2Title,
      dk2Description,
      dk2PriceIndicator,
      "dk2Features": coalesce(dk2Features, []),
      showMap
    },
    
    // Energy tips section (dereference tips -> energySavingTip docs)
    _type == "energyTipsSection" => {
      _type,
      _key,
      title,
      subtitle,
      headerAlignment,
      displayMode,
      showCategories,
      tips[]-> | order(priority desc, _updatedAt desc) {
        _id,
        title,
        "shortDescription": coalesce(shortDescription, description),
        category,
        savingsPotential,
        difficulty,
        icon,
        estimatedSavings,
        implementationTime,
        priority
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
      description,
      leadingText,
      headerAlignment,
      baseConsumption,
      "providers": coalesce(providers[] {
        _key,
        provider->,
        customPricing
      }, [])
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
