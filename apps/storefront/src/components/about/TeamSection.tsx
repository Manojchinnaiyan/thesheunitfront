'use client';

export function TeamSection() {
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 10+ years in e-commerce and technology innovation.',
      avatar: 'AJ',
      color: 'bg-blue-500'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Technical architect passionate about building scalable and secure platforms.',
      avatar: 'SC',
      color: 'bg-purple-500'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Design',
      bio: 'Creative director focused on user experience and interface design.',
      avatar: 'MR',
      color: 'bg-green-500'
    },
    {
      name: 'Emily Davis',
      role: 'Product Manager',
      bio: 'Product strategist dedicated to understanding and solving customer needs.',
      avatar: 'ED',
      color: 'bg-pink-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600">
            The passionate people behind TheShe Unit
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className={`w-20 h-20 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold text-white">{member.avatar}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
