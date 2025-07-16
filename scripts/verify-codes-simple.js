/**
 * Simple script to verify municipality codes from API
 */

async function fetchAndVerify() {
  try {
    console.log('Fetching municipality data from API...\n');
    
    const response = await fetch('http://localhost:8080/api/consumption-map?consumerType=all&aggregation=latest&view=24h');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No municipality data received from API');
    }
    
    console.log(`Received data for ${data.data.length} municipalities from API\n`);
    
    // Sort by code and display
    const sorted = data.data.sort((a, b) => a.municipalityCode.localeCompare(b.municipalityCode));
    
    console.log('All municipalities from API (sorted by code):\n');
    sorted.forEach(m => {
      console.log(`${m.municipalityCode}: ${m.municipalityName}`);
    });
    
    // Check for duplicate codes
    const codes = new Map();
    data.data.forEach(m => {
      if (codes.has(m.municipalityCode)) {
        console.log(`\n⚠️  DUPLICATE CODE ${m.municipalityCode}: ${m.municipalityName} and ${codes.get(m.municipalityCode)}`);
      } else {
        codes.set(m.municipalityCode, m.municipalityName);
      }
    });
    
    console.log(`\nTotal unique codes: ${codes.size}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure the development server is running (npm run dev)');
  }
}

fetchAndVerify();