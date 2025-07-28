import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function restoreNavigationComplete() {
  console.log('🔧 COMPLETE NAVIGATION RESTORATION\n')
  console.log('=' .repeat(80))
  console.log('\n📋 This will restore your navigation to the original 5-item structure:')
  console.log('  1. Elpriser (link)')
  console.log('  2. Elselskaber (link)')
  console.log('  3. Ladeboks (link)')
  console.log('  4. Bliv klogere på (mega menu dropdown)')
  console.log('  5. Sammenlign Priser (yellow button)')
  console.log('\n' + '=' .repeat(80) + '\n')

  try {
    // Fetch the current site settings
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0] {
        _id,
        _type,
        title,
        description,
        colorThemes,
        logo,
        favicon,
        headerLinks,
        footerLinks
      }
    `)

    if (!siteSettings) {
      console.log('❌ No site settings document found!')
      return
    }

    console.log('📋 Current state:')
    console.log(`  - Found ${siteSettings.headerLinks?.length || 0} header links\n`)

    // Create the properly structured navigation
    const restoredNavigation = [
      // 1. Elpriser
      {
        _type: 'link',
        _key: '3b87656928f4',
        title: 'Elpriser',
        linkType: 'internal',
        internalLink: {
          _type: 'reference',
          _ref: '1BrgDwXdqxJ08rMIoYfLjP'
        }
      },
      // 2. Elselskaber
      {
        _type: 'link',
        _key: '94a211b654c0',
        title: 'Elselskaber',
        linkType: 'internal',
        internalLink: {
          _type: 'reference',
          _ref: 'I7aq0qw44tdJ3YglBfyS8h'
        }
      },
      // 3. Ladeboks
      {
        _type: 'link',
        _key: '3fc712597bbf',
        title: 'Ladeboks',
        linkType: 'internal',
        internalLink: {
          _type: 'reference',
          _ref: 'Ldbn1aqxfi6rpqe9dn'
        }
      },
      // 4. Bliv klogere på (MEGA MENU)
      {
        _type: 'megaMenu',
        _key: '56ab3fed792b',
        title: 'Bliv klogere på',
        content: [
          {
            _type: 'megaMenuColumn',
            _key: '47b733a63964',
            title: 'Priser',
            items: [
              {
                _type: 'megaMenuItem',
                _key: '552bb5c46f2d',
                title: 'Sammenlign elpriser',
                description: 'Elmarkedet er uoverskueligt – men det behøver det ikke være.',
                icon: {
                  icon: 'streamline-freehand:money-coin-purse',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:money-coin-purse.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'money-coin-purse',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:money-coin-purse.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'money_dollar',
                  provider: 'f7'
                },
                link: {
                  _type: 'link',
                  _key: '552bb5c46f2d-link',
                  title: 'Sammenlign elpriser',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: '80a93cd8-34a6-4041-8b4b-2f65424dcbc6'
                  }
                }
              },
              {
                _type: 'megaMenuItem',
                _key: '66f9b58561ec5b60a472f52ab50737af',
                title: 'Historiske priser',
                description: 'Vi giver dig overblik over de historiske elpriser time for time, dag for dag og måned for måned.',
                icon: {
                  icon: 'streamline-freehand:analytics-board-graph-line',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:analytics-board-graph-line.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'analytics-board-graph-line',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:analytics-board-graph-line.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'chart-upward',
                  provider: 'sa'
                },
                link: {
                  _type: 'link',
                  _key: '66f9b58561ec5b60a472f52ab50737af-link',
                  title: 'Historiske priser',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: 'qgCxJyBbKpvhb2oGYjlhjr'
                  }
                }
              },
              {
                _type: 'megaMenuItem',
                _key: '0da0a48759ee',
                title: 'Prognoser',
                description: 'Vores elprisprognoser hjælper dig med at planlægge dit forbrug og undgå de dyreste timer.',
                icon: {
                  icon: 'streamline-freehand:view-eye-1',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:view-eye-1.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'view-eye-1',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:view-eye-1.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'outline_visibility',
                  provider: 'mdi'
                },
                link: {
                  _type: 'link',
                  _key: '0da0a48759ee-link',
                  title: 'Prognoser',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: 'qgCxJyBbKpvhb2oGYkdQx3'
                  }
                }
              }
            ]
          },
          {
            _type: 'megaMenuColumn',
            _key: 'c07c16e68328',
            title: 'Guides',
            items: [
              {
                _type: 'megaMenuItem',
                _key: '23a331a159b9',
                title: 'Sådan vælger du leverandør',
                description: 'At vælge den rette el-leverandør handler ikke kun om pris, men også om aftaletype, grøn strøm, vilkår og kundeservice.',
                icon: {
                  icon: 'streamline-freehand:task-list-clipboard-check',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:task-list-clipboard-check.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'task-list-clipboard-check',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:task-list-clipboard-check.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'fa-tasks',
                  provider: 'fa'
                },
                link: {
                  _type: 'link',
                  _key: '23a331a159b9-link',
                  title: 'Sådan vælger du leverandør',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: '80a93cd8-34a6-4041-8b4b-2f65424dcbc6'
                  }
                }
              },
              {
                _type: 'megaMenuItem',
                _key: 'c22dec524867',
                title: 'Energibesparende tips',
                description: 'Med enkle og effektive vaner kan du reducere dit strømforbrug uden at gå på kompromis med komforten.',
                icon: {
                  icon: 'streamline-freehand:kindle-read-document-hold',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:kindle-read-document-hold.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'kindle-read-document-hold',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:kindle-read-document-hold.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'fa-file',
                  provider: 'fa'
                },
                link: {
                  _type: 'link',
                  _key: 'c22dec524867-link',
                  title: 'Energibesparende tips',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: 'I7aq0qw44tdJ3YglBpsP1G'
                  }
                }
              }
            ]
          },
          {
            _type: 'megaMenuColumn',
            _key: '46f5c090302d',
            title: 'Værktøjer',
            items: [
              {
                _type: 'megaMenuItem',
                _key: '599ecc9e905f',
                title: 'Prisberegner',
                description: 'Få et hurtigt overblik over, hvad du kan spare.',
                icon: {
                  icon: 'streamline-freehand:calculator-calculator-app',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:calculator-calculator-app.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'calculator-calculator-app',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:calculator-calculator-app.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'calculator',
                  provider: 'hi'
                },
                link: {
                  _type: 'link',
                  _key: '599ecc9e905f-link',
                  title: 'Prisberegner',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: 'f7ecf92783e749828f7281a6e5829d52'
                  }
                }
              },
              {
                _type: 'megaMenuItem',
                _key: '4b4b5af139ed',
                title: 'Forbrug tracker',
                description: 'Følg dit elforbrug time for time og få indsigt i, hvor og hvornår du bruger mest strøm.',
                icon: {
                  icon: 'streamline-freehand:presentation-analytics',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:presentation-analytics.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'presentation-analytics',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:presentation-analytics.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'trending-up',
                  provider: 'fi'
                },
                link: {
                  _type: 'link',
                  _key: '4b4b5af139ed-link',
                  title: 'Forbrug tracker',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: '80a93cd8-34a6-4041-8b4b-2f65424dcbc6'
                  }
                }
              },
              {
                _type: 'megaMenuItem',
                _key: '2e172eeb6bea',
                title: 'Leverandør sammenligning',
                description: 'Sammenlign el-leverandører på pris, vilkår og bæredygtighed.',
                icon: {
                  icon: 'streamline-freehand:business-cash-scale-balance',
                  metadata: {
                    author: {
                      name: 'Streamline',
                      url: 'https://github.com/webalys-hq/streamline-vectors'
                    },
                    collectionId: 'streamline-freehand',
                    collectionName: 'Freehand free icons',
                    color: {
                      hex: '#84db41',
                      rgba: { a: 1, b: 65, g: 219, r: 132 }
                    },
                    downloadUrl: 'https://api.iconify.design/streamline-freehand:business-cash-scale-balance.svg?width=20&height=20&color=%2384db41&download=1',
                    flip: '',
                    hFlip: false,
                    iconName: 'business-cash-scale-balance',
                    license: {
                      name: 'CC BY 4.0',
                      url: 'https://creativecommons.org/licenses/by/4.0/'
                    },
                    palette: false,
                    rotate: 0,
                    size: { height: 20, width: 20 },
                    url: 'https://api.iconify.design/streamline-freehand:business-cash-scale-balance.svg?width=20&height=20&color=%2384db41',
                    vFlip: false
                  },
                  name: 'fa-balance-scale',
                  provider: 'fa'
                },
                link: {
                  _type: 'link',
                  _key: '2e172eeb6bea-link',
                  title: 'Leverandør sammenligning',
                  linkType: 'internal',
                  internalLink: {
                    _type: 'reference',
                    _ref: '80a93cd8-34a6-4041-8b4b-2f65424dcbc6'
                  }
                }
              }
            ]
          }
        ]
      },
      // 5. Sammenlign Priser (BUTTON)
      {
        _type: 'link',
        _key: 'd697d458059b',
        title: 'Sammenlign Priser',
        linkType: 'internal',
        internalLink: {
          _type: 'reference',
          _ref: '80a93cd8-34a6-4041-8b4b-2f65424dcbc6'
        },
        isButton: true
      }
    ]

    console.log('🔨 Restoration process:')
    console.log('  - Setting headerLinks to 5 properly structured items')
    console.log('  - Preserving all icon metadata')
    console.log('  - Converting "Bliv klogere på" to megaMenu type')
    console.log('  - Fixing all menu item link structures')
    console.log('  - Keeping "Sammenlign Priser" as yellow button\n')

    // Update the site settings with the restored navigation
    const result = await client
      .patch(siteSettings._id)
      .set({ headerLinks: restoredNavigation })
      .commit()

    console.log('✅ NAVIGATION RESTORATION COMPLETE!\n')
    console.log('🎉 Your navigation has been restored to:')
    console.log('   1. Elpriser (link)')
    console.log('   2. Elselskaber (link)')
    console.log('   3. Ladeboks (link)')
    console.log('   4. Bliv klogere på (mega menu with 3 columns, 8 items, all icons)')
    console.log('   5. Sammenlign Priser (yellow button)')
    console.log('\n🔄 Please refresh Sanity Studio and your frontend to see the changes')
    console.log('✨ All icons, descriptions, and styling should now work perfectly!')

  } catch (error) {
    console.error('❌ Error restoring navigation:', error)
  }
}

// Run the restoration
restoreNavigationComplete().catch(console.error)