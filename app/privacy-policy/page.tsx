// app/privacy-policy/page.tsx
import { Shield, Lock, Eye, FileText, Mail, AlertCircle, Database, Globe, Cookie, UserCheck, Bell, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GamesLib',
  description: 'Learn how GamesLib collects, uses, and protects your personal information',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const sections = [
    {
      id: 'information-collected',
      icon: FileText,
      title: '1. Information We Collect',
      color: 'purple',
      content: [
        {
          subtitle: 'Information You Provide',
          items: [
            'Account information (email address, username, password)',
            'Profile information (display name, avatar, bio)',
            'Comments and reviews you post on games',
            'Messages sent through contact forms',
            'Newsletter subscription preferences',
            'Feedback and support requests',
          ],
        },
        {
          subtitle: 'Automatically Collected Information',
          items: [
            'IP address and approximate location',
            'Device information (type, operating system, browser)',
            'Pages visited and time spent on our site',
            'Referral sources and search terms',
            'Download history and preferences',
            'Cookies and similar tracking technologies',
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      icon: Eye,
      title: '2. How We Use Your Information',
      color: 'blue',
      items: [
        { label: 'Provide Services', desc: 'To operate, maintain, and improve our website and services' },
        { label: 'Personalization', desc: 'To customize your experience and provide relevant game recommendations' },
        { label: 'Communication', desc: 'To send you updates, newsletters, and important notices about your account' },
        { label: 'Analytics', desc: 'To understand how users interact with our site and improve performance' },
        { label: 'Security', desc: 'To detect, prevent, and address fraud, abuse, and security issues' },
        { label: 'Compliance', desc: 'To comply with legal obligations and enforce our terms of service' },
      ],
    },
    {
      id: 'data-protection',
      icon: Lock,
      title: '3. How We Protect Your Data',
      color: 'green',
      items: [
        'SSL/TLS encryption for all data transmission',
        'Secure password hashing using industry standards',
        'Regular security audits and vulnerability assessments',
        'Strict access controls and employee training',
        'Encrypted database storage',
        'Regular backups with secure offsite storage',
        'Incident response procedures',
      ],
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: '4. Cookies and Tracking',
      color: 'orange',
      description: 'We use cookies and similar technologies to enhance your experience:',
      items: [
        'Essential cookies for site functionality and security',
        'Preference cookies to remember your settings',
        'Analytics cookies to understand site usage',
        'Performance cookies to improve site speed',
      ],
      note: 'You can control cookie preferences through your browser settings. Disabling cookies may limit some functionality.',
    },
    {
      id: 'third-party',
      icon: Globe,
      title: '5. Third-Party Services',
      color: 'cyan',
      description: 'We may share information with trusted third parties:',
      items: [
        'Analytics providers (Google Analytics, Vercel Analytics)',
        'Content delivery networks (CDN) for faster loading',
        'Email service providers for newsletters',
        'Cloud hosting providers',
        'Payment processors (if applicable)',
      ],
      note: 'These services have their own privacy policies. We encourage you to review them.',
    },
    {
      id: 'your-rights',
      icon: UserCheck,
      title: '6. Your Rights',
      color: 'pink',
      rights: [
        { title: 'Access', desc: 'Request a copy of your personal data', icon: Eye },
        { title: 'Correction', desc: 'Update inaccurate or incomplete information', icon: FileText },
        { title: 'Deletion', desc: 'Request deletion of your personal data', icon: Trash2 },
        { title: 'Portability', desc: 'Export your data in a machine-readable format', icon: Database },
        { title: 'Opt-out', desc: 'Unsubscribe from marketing communications', icon: Bell },
        { title: 'Restrict', desc: 'Limit how we process your data', icon: Lock },
      ],
    },
    {
      id: 'data-retention',
      icon: Database,
      title: '7. Data Retention',
      color: 'indigo',
      description: 'We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy. When you delete your account, we will delete or anonymize your personal information within 30 days, unless we are required to retain it for legal purposes.',
    },
    {
      id: 'children',
      icon: AlertCircle,
      title: '8. Children\'s Privacy',
      color: 'red',
      description: 'Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately and we will take steps to delete such information.',
    },
    {
      id: 'international',
      icon: Globe,
      title: '9. International Transfers',
      color: 'teal',
      description: 'Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our services, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place to protect your data.',
    },
    {
      id: 'changes',
      icon: Bell,
      title: '10. Changes to This Policy',
      color: 'yellow',
      description: 'We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting a notice on our website or sending you an email. We encourage you to review this policy periodically.',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
      purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
      blue: { bg: 'bg-blue-900/20', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-900/20', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500 to-green-600' },
      orange: { bg: 'bg-orange-900/20', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' },
      cyan: { bg: 'bg-cyan-900/20', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
      pink: { bg: 'bg-pink-900/20', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600' },
      red: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400', gradient: 'from-red-500 to-red-600' },
      indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-500/30', text: 'text-indigo-400', gradient: 'from-indigo-500 to-indigo-600' },
      teal: { bg: 'bg-teal-900/20', border: 'border-teal-500/30', text: 'text-teal-400', gradient: 'from-teal-500 to-teal-600' },
      yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', text: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-600' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Legal Document</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Your privacy is important to us
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Quick Summary</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                At GamesLib, we collect only the information necessary to provide you with the best gaming experience. 
                We use industry-standard security measures to protect your data, never sell your personal information, 
                and give you full control over your privacy settings. This policy explains in detail how we handle your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors py-1"
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm">{section.title}</span>
              </a>
            ))}
            <a href="#contact" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors py-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">11. Contact Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-12">
          {sections.map((section) => {
            const colors = getColorClasses(section.color);
            const Icon = section.icon;

            return (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{section.title}</h2>
                </div>

                <div className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
                  {section.description && (
                    <p className="text-gray-300 mb-4">{section.description}</p>
                  )}

                  {section.content && section.content.map((block, idx) => (
                    <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
                      <h4 className={`font-semibold ${colors.text} mb-3`}>{block.subtitle}</h4>
                      <ul className="space-y-2">
                        {block.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300">
                            <span className={`${colors.text} mt-1.5`}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {section.items && !section.content && (
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className={`${colors.text} mt-1`}>•</span>
                          {typeof item === 'string' ? (
                            <span>{item}</span>
                          ) : (
                            <span>
                              <strong className="text-white">{item.label}:</strong> {item.desc}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.rights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.rights.map((right, idx) => {
                        const RightIcon = right.icon;
                        return (
                          <div key={idx} className="bg-gray-800/50 rounded-lg p-4 flex items-start gap-3">
                            <RightIcon className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                            <div>
                              <h5 className="font-semibold text-white">{right.title}</h5>
                              <p className="text-sm text-gray-400">{right.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {section.note && (
                    <p className="mt-4 text-sm text-gray-500 italic">{section.note}</p>
                  )}
                </div>
              </section>
            );
          })}

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">11. Contact Us</h2>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6">
                If you have any questions, concerns, or requests regarding this privacy policy or our data practices, 
                please don't hesitate to contact us:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
                  <Mail className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <a href="mailto:privacy@gameslib.com" className="text-purple-400 hover:text-purple-300 font-medium">
                      privacy@gameslib.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-500">Data Protection Officer</div>
                    <a href="mailto:dpo@gameslib.com" className="text-purple-400 hover:text-purple-300 font-medium">
                      dpo@gameslib.com
                    </a>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                We aim to respond to all privacy-related inquiries within 48 hours.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center text-sm text-gray-500">
          <p>
            By using GamesLib, you agree to the collection and use of information in accordance with this policy.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} GamesLib. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
