'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const heroSlides = [
  {
    id: 1,
    title: "Discover Amazing Products",
    subtitle: "Up to 70% Off Summer Sale",
    description: "Shop the latest trends with unbeatable prices and fast, free shipping.",
    cta: "Shop Sale Now",
    ctaSecondary: "Browse Categories",
    link: "/products",
    secondaryLink: "/categories",
    bgImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "New Collection Arrived",
    subtitle: "Premium Quality, Affordable Prices",
    description: "Explore our carefully curated selection of products designed for modern living.",
    cta: "Explore Now",
    ctaSecondary: "View Collection",
    link: "/products?sort_by=created_at&sort_order=desc",
    secondaryLink: "/categories",
    bgImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Free Shipping Worldwide",
    subtitle: "On Orders Over $50",
    description: "Fast delivery, secure payments, and 30-day money-back guarantee.",
    cta: "Start Shopping",
    ctaSecondary: "Learn More",
    link: "/products",
    secondaryLink: "/about",
    bgImage: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    textColor: "text-white"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ background: currentHero.bgImage }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        
        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium text-white backdrop-blur-sm">
                  🔥 Limited Time Offer
                </span>
              </div>
              
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-4 ${currentHero.textColor} leading-tight`}>
                {currentHero.title}
              </h1>
              
              <p className={`text-xl md:text-2xl mb-2 ${currentHero.textColor} font-semibold`}>
                {currentHero.subtitle}
              </p>
              
              <p className={`text-lg md:text-xl mb-8 ${currentHero.textColor} opacity-90 max-w-2xl`}>
                {currentHero.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={currentHero.link}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {currentHero.cta}
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
                
                <Link
                  href={currentHero.secondaryLink}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                >
                  {currentHero.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all backdrop-blur-sm"
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all backdrop-blur-sm"
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );
}
