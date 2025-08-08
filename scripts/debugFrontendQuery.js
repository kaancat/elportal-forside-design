import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function debugQuery() {
  try {
    // Exact query from frontend
    const query = `*[_type == "provider" && isActive != false] {
      _id,
      providerName,
      productName,
      "logoUrl": logo.asset->url,
      spotPriceMarkup,
      greenCertificateFee,
      tradingCosts,
      monthlySubscription,
      signupFee,
      yearlySubscription,
      signupLink,
      isVindstoedProduct,
      isVariablePrice,
      bindingPeriod,
      isGreenEnergy,
      benefits,
      lastPriceUpdate,
      priceUpdateFrequency,
      notes,
      displayPrice_kWh,
      displayMonthlyFee
    }`;
    
    const providers = await client.fetch(query);
    
    console.log('Total providers fetched:', providers.length);
    console.log('\nProviders with details:');
    
    providers.forEach(p => {
      console.log('\n---', p.providerName, '-', p.productName, '---');
      console.log('ID:', p._id);
      console.log('Is Vindstød Product:', p.isVindstoedProduct);
      console.log('Spot Price Markup:', p.spotPriceMarkup);
      console.log('Monthly Subscription:', p.monthlySubscription);
      console.log('Logo URL:', p.logoUrl);
      console.log('Signup Link:', p.signupLink);
      console.log('Benefits:', p.benefits);
    });
    
    // Check specifically for Vindstød
    const vindstod = providers.find(p => p.isVindstoedProduct === true);
    console.log('\n🔍 Vindstød product found:', vindstod ? 'YES' : 'NO');
    if (vindstod) {
      console.log('Vindstød details:', vindstod);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugQuery();