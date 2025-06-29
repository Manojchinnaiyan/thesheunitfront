'use client';

import Link from 'next/link';
import { HeroAbout } from '@/components/about/HeroAbout';
import { StorySection } from '@/components/about/StorySection';
import { ValuesSection } from '@/components/about/ValuesSection';
import { TeamSection } from '@/components/about/TeamSection';
import { StatsSection } from '@/components/about/StatsSection';
import { MissionVision } from '@/components/about/MissionVision';
import { ContactCTA } from '@/components/about/ContactCTA';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroAbout />
      
      {/* Our Story */}
      <StorySection />
      
      {/* Mission & Vision */}
      <MissionVision />
      
      {/* Company Values */}
      <ValuesSection />
      
      {/* Stats & Achievements */}
      <StatsSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Contact CTA */}
      <ContactCTA />
    </div>
  );
}
