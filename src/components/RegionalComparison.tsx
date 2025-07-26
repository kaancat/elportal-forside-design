import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, TrendingUp, TrendingDown } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

import type { RegionalComparisonBlock } from '@/types/sanity';

interface RegionalComparisonProps {
  block: RegionalComparisonBlock;
}

const RegionalComparison: React.FC<RegionalComparisonProps> = ({ block }) => {
  const {
    title = 'Regional prisforskel',
    subtitle = 'Danmark er opdelt i to elprisområder',
    headerAlignment = 'center',
    leadingText,
    dk1Title = 'DK1 - Vestdanmark',
    dk1Description,
    dk1PriceIndicator = 'lower',
    dk1Features = ['Jylland', 'Fyn', 'Bornholm'],
    dk2Title = 'DK2 - Østdanmark',
    dk2Description,
    dk2PriceIndicator = 'higher',
    dk2Features = ['Sjælland', 'Lolland-Falster', 'Møn'],
    showMap = true
  } = block;

  const getPriceIndicator = (indicator: string) => {
    switch (indicator) {
      case 'higher':
        return { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', label: 'Typisk højere priser' };
      case 'lower':
        return { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50', label: 'Typisk lavere priser' };
      default:
        return { icon: null, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Samme prisniveau' };
    }
  };

  const dk1Indicator = getPriceIndicator(dk1PriceIndicator);
  const dk2Indicator = getPriceIndicator(dk2PriceIndicator);

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "mb-12",
          headerAlignment === 'left' && "text-left",
          headerAlignment === 'center' && "text-center",
          headerAlignment === 'right' && "text-right"
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              headerAlignment === 'center' && "mx-auto"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(
              "text-lg text-gray-600 mb-8",
              headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}
          {leadingText && leadingText.length > 0 && (
            <div className={cn(
              "text-base text-gray-700",
              headerAlignment === 'center' && "max-w-4xl mx-auto"
            )}>
              <div className="prose prose-lg max-w-none">
                <PortableText 
                  value={leadingText} 
                  components={{
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Denmark Map Visualization (if enabled) */}
        {showMap && (
          <div className="mb-12 flex justify-center">
            <div className="relative bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">Danmarks elprisområder</h3>
              
              {/* SVG Map of Denmark - Detailed and Recognizable */}
              <svg
                viewBox="0 0 800 600"
                className="w-full max-w-2xl h-auto mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background and Effects */}
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#f0f9ff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#dbeafe', stopOpacity: 0.5 }} />
                  </linearGradient>
                  <filter id="landShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="2" dy="2" result="offsetblur"/>
                    <feFlood floodColor="#000000" floodOpacity="0.2"/>
                    <feComposite in2="offsetblur" operator="in"/>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <rect width="800" height="600" fill="url(#bgGradient)" />
                
                {/* Water/Sea */}
                <rect x="20" y="20" width="760" height="560" fill="#bfdbfe" fillOpacity="0.3" rx="8" />
                
                {/* DK1 - West Denmark (Jutland and Funen) */}
                <g filter="url(#landShadow)">
                  {/* Jutland Peninsula - Detailed shape */}
                  <path
                    d="M 200,80
                       C 205,70 210,65 220,60
                       L 225,58 230,57 235,58 240,60
                       C 245,62 250,65 255,70
                       L 260,75 265,80 270,85
                       L 275,90 280,95 282,100
                       L 284,110 286,120 288,130
                       L 290,140 292,150 294,160
                       L 296,170 298,180 300,190
                       L 302,200 304,210 306,220
                       L 308,230 310,240 312,250
                       L 314,260 316,270 318,280
                       L 320,290 322,300 324,310
                       L 325,320 326,330 327,340
                       L 328,350 328,360 327,370
                       L 325,380 322,390 318,398
                       C 314,404 308,408 302,412
                       L 295,415 288,417 280,418
                       L 270,419 260,418 250,416
                       L 240,414 230,411 220,407
                       C 214,404 208,400 203,395
                       L 198,390 194,384 190,378
                       L 186,372 182,365 178,358
                       L 174,350 170,342 166,334
                       L 162,326 158,318 154,310
                       L 150,302 146,294 142,286
                       L 138,278 134,270 130,262
                       L 126,254 122,246 118,238
                       L 114,230 110,222 106,214
                       L 102,206 98,198 94,190
                       L 90,182 86,174 82,166
                       L 78,158 74,150 70,142
                       L 68,134 66,126 64,118
                       L 62,110 60,102 58,94
                       L 56,86 54,78 53,70
                       C 53,64 58,58 65,54
                       L 75,50 85,48 95,49
                       L 105,51 115,54 125,58
                       L 135,62 145,67 155,72
                       L 165,77 175,82 185,86
                       L 195,84 200,80 Z
                       
                       M 130,95
                       L 128,100 126,105 125,110
                       L 124,115 125,120 127,125
                       L 130,130 133,125 135,120
                       L 136,115 135,110 133,105
                       L 131,100 130,95 Z"
                    fill="#60a5fa"
                    fillOpacity="0.9"
                    stroke="#2563eb"
                    strokeWidth="3"
                  />
                  
                  {/* Limfjord inlet (characteristic feature) */}
                  <path
                    d="M 140,140 L 180,142 220,145 260,148 280,150"
                    stroke="#bfdbfe"
                    strokeWidth="4"
                    fill="none"
                  />
                  
                  {/* Funen (Fyn) */}
                  <path
                    d="M 380,280
                       C 388,274 398,270 410,270
                       L 425,271 440,274 455,279
                       C 465,284 473,291 478,300
                       L 482,310 483,320 481,330
                       L 478,340 473,349 465,356
                       C 455,361 445,365 433,367
                       L 420,368 407,367 395,365
                       C 385,361 375,356 367,349
                       L 360,340 357,330 355,320
                       L 356,310 360,300 367,291
                       C 372,284 376,279 380,280 Z"
                    fill="#60a5fa"
                    fillOpacity="0.9"
                    stroke="#2563eb"
                    strokeWidth="3"
                  />
                  
                  {/* Small islands west of Funen */}
                  <ellipse cx="340" cy="310" rx="12" ry="10" fill="#60a5fa" fillOpacity="0.8" stroke="#2563eb" strokeWidth="2" />
                  <ellipse cx="355" cy="295" rx="10" ry="8" fill="#60a5fa" fillOpacity="0.8" stroke="#2563eb" strokeWidth="2" />
                </g>
                
                {/* DK2 - East Denmark (Zealand and islands) */}
                <g filter="url(#landShadow)">
                  {/* Zealand (Sjælland) - Detailed shape */}
                  <path
                    d="M 500,200
                       C 510,194 522,190 535,189
                       L 550,190 565,193 578,198
                       C 590,204 600,212 607,222
                       L 612,232 615,242 616,252
                       L 615,262 613,272 610,282
                       L 607,292 603,302 598,311
                       C 592,319 585,326 577,332
                       L 568,337 558,340 547,342
                       L 535,343 523,342 511,340
                       C 501,337 491,332 483,326
                       L 476,319 470,311 465,302
                       L 461,292 458,282 456,272
                       L 454,262 453,252 454,242
                       L 456,232 460,222 467,212
                       C 474,204 484,198 495,194
                       L 500,200 Z
                       
                       M 510,250
                       C 508,255 507,260 508,265
                       L 510,270 513,275 517,278
                       C 522,280 527,280 532,278
                       L 536,275 539,270 540,265
                       C 541,260 540,255 538,250
                       L 535,245 530,242 525,241
                       L 520,242 515,245 512,248
                       L 510,250 Z"
                    fill="#a78bfa"
                    fillOpacity="0.9"
                    stroke="#7c3aed"
                    strokeWidth="3"
                  />
                  
                  {/* Roskilde Fjord (characteristic inlet) */}
                  <path
                    d="M 520,230 L 522,240 524,250 525,260"
                    stroke="#bfdbfe"
                    strokeWidth="3"
                    fill="none"
                  />
                  
                  {/* Lolland */}
                  <path
                    d="M 480,380
                       C 490,377 503,376 518,377
                       L 535,379 550,382 562,386
                       C 570,390 576,396 578,403
                       L 579,410 577,417 573,423
                       C 568,428 560,431 550,432
                       L 535,433 520,432 505,430
                       C 495,428 485,424 478,419
                       L 473,413 470,406 469,399
                       L 470,392 473,385 478,380 Z"
                    fill="#a78bfa"
                    fillOpacity="0.9"
                    stroke="#7c3aed"
                    strokeWidth="3"
                  />
                  
                  {/* Falster */}
                  <path
                    d="M 590,395
                       C 596,393 603,392 610,394
                       L 617,397 622,402 624,408
                       L 624,414 621,419 616,423
                       C 610,425 603,425 596,423
                       L 590,419 586,414 585,408
                       L 586,402 589,397 590,395 Z"
                    fill="#a78bfa"
                    fillOpacity="0.9"
                    stroke="#7c3aed"
                    strokeWidth="3"
                  />
                  
                  {/* Møn */}
                  <ellipse cx="635" cy="370" rx="18" ry="15" fill="#a78bfa" fillOpacity="0.9" stroke="#7c3aed" strokeWidth="2.5" />
                  
                  {/* Bornholm (far east) */}
                  <g transform="translate(680, 180)">
                    <path
                      d="M 0,0
                         C 8,-4 18,-4 26,0
                         L 32,6 36,14 36,22
                         L 32,30 26,34 18,36
                         C 10,36 2,34 -4,30
                         L -8,22 -8,14 -4,6
                         L 0,0 Z"
                      fill="#a78bfa"
                      fillOpacity="0.9"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                    />
                  </g>
                  <text x="698" y="235" textAnchor="middle" className="fill-gray-700 text-sm font-semibold">Bornholm</text>
                </g>
                
                {/* Great Belt Bridge connection */}
                <line x1="455" y1="320" x2="500" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
                <text x="477" y="315" textAnchor="middle" className="fill-gray-600 text-xs">Storebælt</text>
                
                {/* Region Labels */}
                <g>
                  {/* DK1 Label */}
                  <rect x="180" y="220" width="60" height="35" fill="white" fillOpacity="0.95" rx="6" stroke="#2563eb" strokeWidth="1" />
                  <text x="210" y="243" textAnchor="middle" className="fill-blue-700 font-bold text-2xl">DK1</text>
                  
                  {/* DK2 Label */}
                  <rect x="520" y="260" width="60" height="35" fill="white" fillOpacity="0.95" rx="6" stroke="#7c3aed" strokeWidth="1" />
                  <text x="550" y="283" textAnchor="middle" className="fill-purple-700 font-bold text-2xl">DK2</text>
                </g>
                
                {/* Enhanced Legend */}
                <g transform="translate(40, 40)">
                  <rect x="0" y="0" width="220" height="110" fill="white" fillOpacity="0.97" stroke="#334155" strokeWidth="2" rx="10" />
                  <text x="110" y="28" textAnchor="middle" className="fill-gray-900 font-bold text-xl">Danmarks Elprisområder</text>
                  
                  <rect x="25" y="45" width="28" height="18" fill="#60a5fa" fillOpacity="0.9" rx="4" />
                  <text x="60" y="58" className="fill-gray-800 text-base font-semibold">DK1 - Vestdanmark</text>
                  
                  <rect x="25" y="73" width="28" height="18" fill="#a78bfa" fillOpacity="0.9" rx="4" />
                  <text x="60" y="86" className="fill-gray-800 text-base font-semibold">DK2 - Østdanmark</text>
                </g>
                
                {/* Price zone divider */}
                <path 
                  d="M 350,150 Q 400,250 450,400" 
                  stroke="#475569" 
                  strokeWidth="3" 
                  strokeDasharray="8,6" 
                  fill="none" 
                  opacity="0.6"
                />
                
                {/* Info text */}
                <text x="400" y="570" textAnchor="middle" className="fill-gray-700 text-base font-medium">
                  Danmark er opdelt i to elprisområder baseret på transmissionsnettet
                </text>
              </svg>
              
              {/* Map Description */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Danmark er opdelt i to elprisområder baseret på transmissionsnettet. 
                  Priserne kan variere mellem områderne afhængigt af udbud og efterspørgsel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regional Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* DK1 Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                {dk1Title}
                <Badge className={cn(dk1Indicator.bg, dk1Indicator.color, "border-0")}>
                  {dk1Indicator.icon && <dk1Indicator.icon className="w-4 h-4 mr-1" />}
                  {dk1Indicator.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dk1Description && dk1Description.length > 0 && (
                <div className="mb-6 text-gray-700">
                  <PortableText 
                    value={dk1Description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Omfatter:</h4>
                <div className="flex flex-wrap gap-2">
                  {dk1Features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DK2 Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                {dk2Title}
                <Badge className={cn(dk2Indicator.bg, dk2Indicator.color, "border-0")}>
                  {dk2Indicator.icon && <dk2Indicator.icon className="w-4 h-4 mr-1" />}
                  {dk2Indicator.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dk2Description && dk2Description.length > 0 && (
                <div className="mb-6 text-gray-700">
                  <PortableText 
                    value={dk2Description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Omfatter:</h4>
                <div className="flex flex-wrap gap-2">
                  {dk2Features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegionalComparison;