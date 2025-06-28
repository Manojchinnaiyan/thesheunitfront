'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const heroSlides = [
  {
    id: 1,
    title: "Summer Collection 2024",
    subtitle: "Discover the latest trends",
    description: "Explore our new summer collection with exclusive designs and comfortable fits.",
    cta: "Shop Now",
    link: "/products?is_featured=true",
    bgColor: "from-blue-500 to-purple-600",
    image: "🌟"
  },
  {
    id: 2,
    title: "Special Offers",
    subtitle: "Up to 50% Off",
    description: "Limited time deals on selected items. Don't miss out on amazing savings!",
    cta: "View Deals",
    link: "/products?is_featured=true",
    bgColor: "from-pink-500 to-red-500",
    image: "🎯"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Fresh & Trendy",
    description: "Check out our latest products that just arrived in store.",
    cta: "Explore",
    link: "/products?sort_by=created_at&sort_order=desc",
    bgColor: "from-green-500 to-teal-500",
    image: "✨"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${currentHero.bgColor} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <div className="text-6xl md:text-8xl mb-4 animate-bounce">
              {currentHero.image}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              {currentHero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-2 font-semibold">
              {currentHero.subtitle}
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {currentHero.description}
            </p>
            <Link
              href={currentHero.link}
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full text-gray-900 bg-white hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {currentHero.cta}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
