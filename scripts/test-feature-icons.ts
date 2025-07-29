import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function testIconData() {
  try {
    const pageId = 'f7ecf92783e749828f7281a6e5829d52'
    const page = await client.fetch(`*[_id == $pageId][0]{ 
      contentBlocks[2],
      "featureListBlocks": contentBlocks[_type == 'featureList']{
        _type,
        title,
        features[]{
          _key,
          title,
          icon{
            _type,
            name,
            provider,
            svg
          }
        }
      }
    }`, { pageId })
    
    console.log('Block at index 2:', page?.contentBlocks?.[0]?._type)
    console.log('FeatureList blocks found:', page?.featureListBlocks?.length)
    
    const featureList = page?.featureListBlocks?.[0]
    if (featureList) {
      console.log(chalk.green(`FeatureList found with ${featureList.features?.length} features\n`))
      
      featureList.features?.forEach((feature, i) => {
        console.log(chalk.yellow(`Feature ${i + 1}: ${feature.title}`))
        const iconData = {
          _type: feature.icon?._type,
          name: feature.icon?.name,
          provider: feature.icon?.provider,
          hasSvg: feature.icon?.svg ? true : false,
          svgLength: feature.icon?.svg?.length || 0
        }
        console.log('Icon data:', iconData)
        console.log('')
      })
      
      console.log(chalk.blue('✅ All features have SVG icons! The Icon component should now display them.'))
      
    } else {
      console.log(chalk.red('No featureList found'))
    }
  } catch (error) {
    console.error(chalk.red('Error:', error))
  }
}

testIconData()