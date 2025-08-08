import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function updateOldProviders() {
  try {
    // Fetch all providers with null isActive
    const oldProviders = await client.fetch(`*[_type == "provider" && isActive == null]{ _id }`);
    
    console.log(`Found ${oldProviders.length} providers to update`);
    
    for (const provider of oldProviders) {
      console.log(`Updating provider ${provider._id}...`);
      
      await client
        .patch(provider._id)
        .set({ 
          isActive: true,
          lastPriceUpdate: new Date().toISOString(),
          // Set default values for new required fields
          spotPriceMarkup: 5, // Default 5 øre markup
          monthlySubscription: 39, // Default 39 kr/month
          signupFee: 0,
          yearlySubscription: 0,
          isVariablePrice: true,
          bindingPeriod: 0,
          isGreenEnergy: false,
          priceUpdateFrequency: 'monthly'
        })
        .commit();
      
      console.log(`✅ Updated ${provider._id}`);
    }
    
    console.log('\n🎉 All providers updated!');
    
  } catch (error) {
    console.error('Error updating providers:', error);
  }
}

updateOldProviders();