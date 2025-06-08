// File: /api/electricity-prices.js
// This is a Vercel Serverless Function, written in pure JavaScript.

export default async function handler(request, response) {
  try {
    const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
    const region = searchParams.get('region') || 'DK1';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStringForAPI = `${year}-${month}-${day}`;

    const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
    const filter = encodeURIComponent(`{"PriceArea":["${region}"]}`);
    const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

    const edsResponse = await fetch(apiUrl);

    if (!edsResponse.ok) {
      return response.status(edsResponse.status).json({ 
        error: `Failed to fetch from EnergiDataService: ${edsResponse.statusText}` 
      });
    }

    const data = await edsResponse.json();

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}