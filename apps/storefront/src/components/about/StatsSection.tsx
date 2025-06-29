'use client';

import { useState, useEffect, useRef } from 'react';

export function StatsSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const stats = [
    { number: 10000, suffix: '+', label: 'Happy Customers', icon: '😊' },
    { number: 50000, suffix: '+', label: 'Products Sold', icon: '📦' },
    { number: 99.9, suffix: '%', label: 'Uptime', icon: '⚡' },
    { number: 24, suffix: '/7', label: 'Support', icon: '🛠️' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const AnimatedNumber = ({ number, suffix }: { number: number; suffix: string }) => {
    const [displayNumber, setDisplayNumber] = useState(0);

    useEffect(() => {
      if (inView) {
        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= number) {
            setDisplayNumber(number);
            clearInterval(timer);
          } else {
            setDisplayNumber(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, [inView, number]);

    return (
      <span>
        {displayNumber.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl opacity-90">
            Delivering results that matter to our community
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedNumber number={stat.number} suffix={stat.suffix} />
              </div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
