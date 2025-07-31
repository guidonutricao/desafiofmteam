import React from 'react';
import { Button } from '../ui/button';
import { Trophy, Share2, Heart } from 'lucide-react';

/**
 * Visual test component to verify button variants are working correctly
 * This component can be used for manual testing and visual verification
 */
export function ButtonVariantsVisual() {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Button Variants Test</h1>
      
      {/* Celebration Variant */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Celebration Variant</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="celebration" size="sm">
            <Trophy className="w-4 h-4" />
            Small Celebration
          </Button>
          <Button variant="celebration">
            <Trophy className="w-4 h-4" />
            Default Celebration
          </Button>
          <Button variant="celebration" size="lg">
            <Trophy className="w-4 h-4" />
            Large Celebration
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Expected: Amber gradient background, dark amber text, shadow with glow on hover, scale on hover
        </p>
      </section>

      {/* Share Variant */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Share Variant</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="share" size="sm">
            <Share2 className="w-4 h-4" />
            Small Share
          </Button>
          <Button variant="share">
            <Share2 className="w-4 h-4" />
            Default Share
          </Button>
          <Button variant="share" size="lg">
            <Share2 className="w-4 h-4" />
            Large Share
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Expected: Dark zinc background, white text, zinc border that changes to amber on hover, shadow on hover
        </p>
      </section>

      {/* CTA Variant */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">CTA Variant</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="cta" size="sm">
            <Heart className="w-4 h-4" />
            Small CTA
          </Button>
          <Button variant="cta">
            <Heart className="w-4 h-4" />
            Default CTA
          </Button>
          <Button variant="cta" size="lg">
            <Heart className="w-4 h-4" />
            Large CTA
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Expected: Green gradient background, white text, shadow with green glow on hover, scale on hover
        </p>
      </section>

      {/* Hover Effects Test */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Hover Effects Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Celebration Hover</h3>
            <Button variant="celebration" className="w-full">
              Hover me
            </Button>
            <p className="text-xs text-gray-500 mt-2">Should scale and glow amber</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Share Hover</h3>
            <Button variant="share" className="w-full">
              Hover me
            </Button>
            <p className="text-xs text-gray-500 mt-2">Should change border to amber</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">CTA Hover</h3>
            <Button variant="cta" className="w-full">
              Hover me
            </Button>
            <p className="text-xs text-gray-500 mt-2">Should scale and glow green</p>
          </div>
        </div>
      </section>

      {/* Animation Test */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Animation Test</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="celebration" className="animate-pulse">
            Animated Celebration
          </Button>
          <Button variant="share" className="hover:animate-bounce">
            Animated Share
          </Button>
          <Button variant="cta" className="transition-all duration-500 hover:rotate-1">
            Animated CTA
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Testing custom animations work with the new variants
        </p>
      </section>
    </div>
  );
}