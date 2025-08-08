import { VercelRequest, VercelResponse } from '@vercel/node'

// This endpoint handles the callback from Eloverblik
// It should be accessible at both mondaybrew.dk/api/eloverblik-callback 
// and dinelportal.dk/api/eloverblik-callback

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Eloverblik callback received:', {
    query: req.query,
    headers: req.headers,
    url: req.url
  })

  // Extract any parameters from Eloverblik
  const { customerId, status, error } = req.query

  // Build redirect URL with parameters
  let redirectUrl = 'https://www.dinelportal.dk/forbrug-tracker?authorized=true'
  
  if (customerId) {
    redirectUrl += `&customer=${customerId}`
  }
  
  if (status) {
    redirectUrl += `&status=${status}`
  }
  
  if (error) {
    redirectUrl = `https://www.dinelportal.dk/forbrug-tracker?authorized=false&error=${error}`
  }

  // Redirect to the forbrug-tracker page with authorization status
  console.log('Redirecting to:', redirectUrl)
  
  // Use 302 temporary redirect
  res.status(302).setHeader('Location', redirectUrl)
  res.end()
}