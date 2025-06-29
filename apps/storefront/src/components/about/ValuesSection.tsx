'use client';

export function ValuesSection() {
  const values = [
    {
      icon: '💡',
      title: 'Innovation',
      description: 'We constantly push boundaries to deliver cutting-edge solutions that meet evolving market needs.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Building lasting relationships through transparency, reliability, and unwavering commitment to our promises.'
    },
    {
      icon: '🎨',
      title: 'Excellence',
      description: 'We strive for perfection in every detail, from code quality to customer service.'
    },
    {
      icon: '🌍',
      title: 'Sustainability',
      description: 'Committed to environmentally responsible practices and supporting sustainable commerce.'
    },
    {
      icon: '⚡',
      title: 'Speed',
      description: 'Fast development, quick responses, and rapid adaptation to market changes.'
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Your data and transactions are protected with enterprise-grade security measures.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-xl text-gray-600">
            The principles that guide our decisions and shape our culture
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50 p-6 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-2 h-full">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
