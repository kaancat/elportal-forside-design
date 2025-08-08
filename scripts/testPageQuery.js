import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testPageQuery() {
  try {
    // Test fetching a page with providerList
    const query = `*[_type == "page"][0] {
      title,
      contentBlocks[] {
        ...,
        _type == "providerList" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          'providers': providers[]->{ 
            "id": _id,
            providerName,
            productName,
            "logoUrl": logo.asset->url,
            // New detailed pricing fields
            spotPriceMarkup,
            greenCertificateFee,
            tradingCosts,
            monthlySubscription,
            signupFee,
            yearlySubscription,
            // Product features
            isVindstoedProduct,
            isVariablePrice,
            bindingPeriod,
            isGreenEnergy,
            benefits,
            signupLink,
            // Metadata
            lastPriceUpdate,
            priceUpdateFrequency,
            notes,
            isActive,
            // Legacy fields for backward compatibility
            displayPrice_kWh,
            displayMonthlyFee
          }
        }
      }
    }`;
    
    const page = await client.fetch(query);
    console.log('Page title:', page.title);
    
    // Find providerList blocks
    const providerLists = page.contentBlocks.filter(b => b._type === 'providerList');
    console.log('\nFound', providerLists.length, 'providerList blocks');
    
    providerLists.forEach((block, index) => {
      console.log(`\n--- ProviderList Block ${index + 1} ---`);
      console.log('Title:', block.title);
      console.log('Subtitle:', block.subtitle);
      console.log('Provider count:', block.providers?.length || 0);
      
      if (block.providers) {
        block.providers.forEach(p => {
          console.log(`\n  Provider: ${p.providerName} - ${p.productName}`);
          console.log('  ID:', p.id);
          console.log('  Is Vindstød:', p.isVindstoedProduct);
          console.log('  Spot Markup:', p.spotPriceMarkup);
          console.log('  Monthly:', p.monthlySubscription);
          console.log('  Logo URL:', p.logoUrl);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPageQuery();