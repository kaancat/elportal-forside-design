import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN || 'skIDqhqG738GYFAcpeX4sQrl1sN67o3dV38IpW4kPWaPkm7jJUBu3tkHKWAnGI2FwVkn1CGDibmXDRAS0hQpVwmtZ2wNWOAhDx8iCsbEgjW3vbXv4LDeAwP4tuQYMezZCwOPNLZaHo0yL0060BTKHl8A0zaF112cIUDt9YrqEx1XuHr5i4RN'
});

async function addVindstodProvider() {
  try {
    // Create the main Vindstød DanskVind provider
    const provider = {
      _type: 'provider',
      _id: 'provider.vindstod-danskvind',
      
      // Basic Info
      providerName: 'Vindstød',
      productName: 'DanskVind',
      signupLink: 'https://vindstoed.dk/bestil',
      
      // Pricing Components (in øre/kWh)
      spotPriceMarkup: 0.625, // 0.63 øre/kWh markup on spot price
      greenCertificateFee: 0, // Included in their business model (100% Danish wind)
      tradingCosts: 0, // Not mentioned, likely included in markup
      
      // Fixed Fees
      monthlySubscription: 0, // No monthly fee
      signupFee: 0, // Free signup
      yearlySubscription: 0, // No yearly fee
      
      // Product Features
      isVindstoedProduct: true, // This is our featured partner
      isVariablePrice: true, // Variable hourly pricing
      bindingPeriod: 0, // No binding period
      isGreenEnergy: true, // 100% certificeret el fra danske vindmøller
      
      // Benefits
      benefits: [
        { _type: 'benefit', _key: 'b1', text: '100% dansk vindenergi', included: true },
        { _type: 'benefit', _key: 'b2', text: 'Ingen binding', included: true },
        { _type: 'benefit', _key: 'b3', text: 'Ingen abonnement', included: true },
        { _type: 'benefit', _key: 'b4', text: 'Gratis fakturagebyr', included: true },
        { _type: 'benefit', _key: 'b5', text: 'Time-for-time afregning', included: true },
        { _type: 'benefit', _key: 'b6', text: 'Selvbetjening via kontrolpanel', included: true },
        { _type: 'benefit', _key: 'b7', text: 'Under 20.000 kWh årsforbrug', included: true }
      ],
      
      // Metadata
      lastPriceUpdate: new Date().toISOString(),
      priceUpdateFrequency: 'hourly',
      notes: 'Senest kendte pris juli 2025. DK1: 77.86 øre/kWh, DK2: 75.21 øre/kWh (uden afgifter). Tillæg til spotpris kun 0.63 øre/kWh. Tilbydes private husstande med forbrug under 20.000 kWh.',
      isActive: true
    };

    console.log('Creating Vindstød DanskVind provider...');
    const result = await client.createOrReplace(provider);
    console.log('✅ Successfully created provider:', result._id);

    // Create regional pricing for DK1 (Jylland/Fyn)
    const dk1Pricing = {
      _type: 'providerRegionalPricing',
      _id: 'regionalPricing.vindstod-dk1',
      provider: {
        _type: 'reference',
        _ref: 'provider.vindstod-danskvind'
      },
      region: 'DK1',
      regionalSpotMarkup: 0.625, // Same markup for both regions
      regionalGreenCertificateFee: 0,
      regionalTradingCosts: 0,
      regionalMonthlyFee: 0,
      effectiveFrom: new Date().toISOString(),
      isActive: true,
      notes: 'Juli 2025 gennemsnitspris: 77.86 øre/kWh (62.29 øre/kWh ekskl. moms)'
    };

    console.log('Creating DK1 regional pricing...');
    const dk1Result = await client.createOrReplace(dk1Pricing);
    console.log('✅ Successfully created DK1 pricing:', dk1Result._id);

    // Create regional pricing for DK2 (Sjælland)
    const dk2Pricing = {
      _type: 'providerRegionalPricing',
      _id: 'regionalPricing.vindstod-dk2',
      provider: {
        _type: 'reference',
        _ref: 'provider.vindstod-danskvind'
      },
      region: 'DK2',
      regionalSpotMarkup: 0.625, // Same markup for both regions
      regionalGreenCertificateFee: 0,
      regionalTradingCosts: 0,
      regionalMonthlyFee: 0,
      effectiveFrom: new Date().toISOString(),
      isActive: true,
      notes: 'Juli 2025 gennemsnitspris: 75.21 øre/kWh (60.17 øre/kWh ekskl. moms)'
    };

    console.log('Creating DK2 regional pricing...');
    const dk2Result = await client.createOrReplace(dk2Pricing);
    console.log('✅ Successfully created DK2 pricing:', dk2Result._id);

    console.log('\n🎉 All Vindstød data successfully added to Sanity!');
    console.log('You can now view and edit it at: https://dinelportal.sanity.studio');

  } catch (error) {
    console.error('❌ Error adding provider:', error);
  }
}

// Run the script
addVindstodProvider();