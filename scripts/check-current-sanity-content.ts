import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkCurrentContent() {
  try {
    const page = await client.fetch(`*[_id == "page.ladeboks"][0] {
      "contentBlocks": contentBlocks[] {
        _type,
        _key,
        "title": coalesce(title, heading),
        "valueStructure": select(
          _type == "valueProposition" => {
            "hasValues": defined(values),
            "hasItems": defined(items),
            "valuesCount": count(values),
            "itemsCount": count(items),
            "firstValueSample": values[0] {
              "hasIcon": defined(icon),
              "iconType": select(
                defined(icon) && string(icon) != null => "string",
                defined(icon) && string(icon) == null => "object",
                "undefined"
              ),
              "hasHeading": defined(heading),
              "hasDescription": defined(description),
              "hasText": defined(text)
            },
            "firstItemSample": items[0] {
              "hasIcon": defined(icon),
              "iconType": select(
                defined(icon) && string(icon) != null => "string", 
                defined(icon) && string(icon) == null => "object",
                "undefined"
              ),
              "hasHeading": defined(heading),
              "hasDescription": defined(description),
              "hasText": defined(text)
            }
          }
        )
      }
    }`)
    
    console.log('Current Sanity content structure:')
    console.log(JSON.stringify(page, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkCurrentContent()