'use client';

export function TrustBadges() {
  const badges = [
    {
      icon: '🚚',
      title: 'Free Shipping',
      subtitle: 'On orders over $50'
    },
    {
      icon: '🔒',
      title: 'Secure Payment',
      subtitle: '100% protected'
    },
    {
      icon: '↩️',
      title: 'Easy Returns',
      subtitle: '30-day policy'
    },
    {
      icon: '📞',
      title: '24/7 Support',
      subtitle: 'Always here to help'
    }
  ];

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center justify-center md:justify-start space-x-3 p-4">
              <div className="text-2xl">{badge.icon}</div>
              <div className="text-center md:text-left">
                <div className="font-semibold text-gray-900 text-sm">{badge.title}</div>
                <div className="text-gray-600 text-xs">{badge.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
