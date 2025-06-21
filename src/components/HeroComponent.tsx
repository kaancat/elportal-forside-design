import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HeroBlock } from '@/types/sanity';

interface HeroProps {
  block: HeroBlock; 
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { headline, subheadline, cta } = block;

  return (
    <section className="py-16 md:py-24 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark mb-6">
          {headline}
        </h1>
        {subheadline && (
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-neutral-600 mb-8">
            {subheadline}
          </p>
        )}
        {cta?.text && cta?.link && (
          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 py-6 text-lg">
            <a href={cta.link}>{cta.text}</a>
          </Button>
        )}
      </div>
    </section>
  );
};

export default HeroComponent; 