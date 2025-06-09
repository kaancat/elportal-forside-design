
import { client } from '@/lib/sanity'
import { HomePage, BlogPost } from '@/types/sanity'

export class SanityService {
  // Fetch homepage content
  static async getHomePage(): Promise<HomePage | null> {
    const query = `*[_type == "homePage"][0]{
      _id,
      _type,
      title,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          title,
          content,
          image{
            asset,
            alt,
            hotspot,
            crop
          },
          imagePosition
        },
        _type == "faqItem" => {
          question,
          answer
        },
        _type == "faqGroup" => {
          title,
          faqItems[]{
            _key,
            question,
            answer
          }
        },
        _type == "priceExampleTable" => {
          title,
          leadingText,
          example1_title,
          example1_kwh_price,
          example1_subscription,
          example2_title,
          example2_kwh_price,
          example2_subscription
        },
        _type == "videoSection" => {
          title,
          videoUrl,
          customThumbnail{
            asset,
            alt,
            hotspot,
            crop
          }
        },
        _type == "richTextSection" => {
          content
        },
        _type == "callToActionSection" => {
          title,
          buttonText,
          buttonUrl
        },
        _type == "renewableEnergyForecast" => {
          ...
        },
        _type == "livePriceGraph" => {
          title,
          subtitle,
          apiRegion
        }
      }
    }`
    
    try {
      const homePage = await client.fetch<HomePage>(query)
      return homePage
    } catch (error) {
      console.error('Error fetching homepage:', error)
      return null
    }
  }

  // Fetch all blog posts
  static async getAllBlogPosts(): Promise<BlogPost[]> {
    const query = `*[_type == "blogPost"] | order(publishedAt desc){
      _id,
      _type,
      title,
      slug,
      mainImage{
        asset,
        alt,
        hotspot,
        crop
      },
      body,
      publishedAt,
      seoMetaTitle,
      seoMetaDescription
    }`
    
    try {
      const posts = await client.fetch<BlogPost[]>(query)
      return posts
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  // Fetch single blog post by slug
  static async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const query = `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      _type,
      title,
      slug,
      mainImage{
        asset,
        alt,
        hotspot,
        crop
      },
      body,
      publishedAt,
      seoMetaTitle,
      seoMetaDescription
    }`
    
    try {
      const post = await client.fetch<BlogPost>(query, { slug })
      return post
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }
}
