import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testFetch() {
  try {
    // Test 1: Fetch all providers (no filter)
    console.log('Test 1: Fetching ALL providers...');
    const allProviders = await client.fetch(`*[_type == "provider"]{ _id, providerName, productName, isActive }`);
    console.log('All providers:', allProviders);
    
    // Test 2: Fetch active providers
    console.log('\nTest 2: Fetching ACTIVE providers...');
    const activeProviders = await client.fetch(`*[_type == "provider" && isActive == true]{ _id, providerName, productName, isActive }`);
    console.log('Active providers:', activeProviders);
    
    // Test 3: Fetch with no isActive filter
    console.log('\nTest 3: Fetching providers without isActive filter...');
    const noFilterProviders = await client.fetch(`*[_type == "provider" && isActive != false]{ _id, providerName, productName, isActive }`);
    console.log('Providers (not explicitly false):', noFilterProviders);

    // Test 4: Full query as used in frontend
    console.log('\nTest 4: Full frontend query...');
    const query = `*[_type == "provider" && isActive == true] {
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
    const fullProviders = await client.fetch(query);
    console.log('Full query results:', fullProviders);

  } catch (error) {
    console.error('Error:', error);
  }
}

testFetch();