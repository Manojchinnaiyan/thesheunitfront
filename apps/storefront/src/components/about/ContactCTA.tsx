'use client';

import Link from 'next/link';

export function ContactCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12">
          <div className="text-5xl mb-6">🤝</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join thousands of businesses that trust TheShe Unit for their e-commerce needs. 
            Let's build something amazing together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Start Shopping
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
            
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Browse Products
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Have questions? We'd love to hear from you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:hello@thesheunit.com" className="text-blue-600 hover:text-blue-700 font-medium">
                📧 hello@thesheunit.com
              </a>
              <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700 font-medium">
                📞 +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
