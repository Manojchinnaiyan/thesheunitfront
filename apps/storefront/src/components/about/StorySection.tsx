'use client';

export function StorySection() {
  return (
    <section id="story" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Founded in 2024, TheShe Unit began with a simple yet powerful vision: 
                to create an e-commerce platform that truly understands and serves 
                modern consumers' needs.
              </p>
              <p>
                What started as a small team of passionate developers and designers 
                has evolved into a comprehensive e-commerce solution that powers 
                businesses of all sizes, from emerging startups to established enterprises.
              </p>
              <p>
                We believe that technology should enhance human connection, not replace it. 
                That's why every feature we build is designed with both functionality 
                and user experience in mind.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">2024</div>
                <div className="text-sm text-gray-600">Founded</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Customer Focus</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-2">Innovation Driven</h3>
                  <p className="text-lg opacity-90">Building the future of e-commerce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
