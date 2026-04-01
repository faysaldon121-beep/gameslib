// app/privacy-policy/page.tsx
import { Shield, Lock, Eye, FileText, Mail, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GamesLib',
  description: 'Learn how we collect, use, and protect your personal information',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert prose-purple max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Your Privacy Matters</h3>
                  <p className="text-gray-300 text-sm">
                    At GamesLib, we are committed to protecting your privacy and ensuring transparency 
                    about how we collect, use, and safeguard your personal information.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">
                  Information You Provide
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Account information (email address, username, password)</li>
                  <li>• Profile information (display name, avatar, bio)</li>
                  <li>• Comments and reviews you post</li>
                  <li>• Messages you send through our contact forms</li>
                  <li>• Newsletter subscription preferences</li>
                </ul>
              </div>

              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• IP address and device information</li>
                  <li>• Browser type and version</li>
                  <li>• Pages visited and time spent on our site</li>
                  <li>• Referral sources</li>
                  <li>• Download history and preferences</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-blue-400" />
              <h2 className="text-3xl font-bold">2. How We Use Your Information</h2>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Provide Services:</strong> To operate, maintain, and improve our website and services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Personalization:</strong> To customize your experience and provide relevant content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Communication:</strong> To send you updates, newsletters, and important notices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Analytics:</strong> To understand how users interact with our site and improve performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Security:</strong> To detect, prevent, and address fraud and security issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>Compliance:</strong> To comply with legal obligations and enforce our terms</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-bold">3. How We Protect Your Data</h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure password hashing and storage</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication</li>
                <li>• Encrypted database storage</li>
                <li>• Regular backups and disaster recovery plans</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">4. Cookies and Tracking</h2>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Remember your preferences and settings</li>
                <li>• Analyze site traffic and user behavior</li>
                <li>• Provide personalized content and recommendations</li>
                <li>• Improve site functionality and performance</li>
              </ul>
              <p className="text-sm text-gray-400">
                You can control cookie preferences through your browser settings. Note that disabling 
                cookies may limit some functionality of our website.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">5. Third-Party Services</h2>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                We may use third-party services for:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Analytics (Google Analytics, Vercel Analytics)</li>
                <li>• Payment processing (if applicable)</li>
                <li>• Content delivery (CDN services)</li>
                <li>• Email services (newsletter distribution)</li>
                <li>• Social media integration</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                These services have their own privacy policies. We encourage you to review them.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">6. Your Rights</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-5">
                <h4 className="font-semibold text-purple-300 mb-2">Access</h4>
                <p className="text-sm text-gray-300">Request a copy of your personal data</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-5">
                <h4 className="font-semibold text-blue-300 mb-2">Correction</h4>
                <p className="text-sm text-gray-300">Update inaccurate information</p>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-5">
                <h4 className="font-semibold text-green-300 mb-2">Deletion</h4>
                <p className="text-sm text-gray-300">Request deletion of your data</p>
              </div>
              <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-5">
                <h4 className="font-semibold text-pink-300 mb-2">Portability</h4>
                <p className="text-sm text-gray-300">Export your data in a readable format</p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">7. Children's Privacy</h2>
            
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <p className="text-gray-300">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children. If you believe we have collected information 
                from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">8. Changes to This Policy</h2>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
              <p className="text-gray-300">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date. We encourage 
                you to review this policy periodically.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold">9. Contact Us</h2>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6">
                If you have any questions or concerns about this privacy policy or our data practices, 
                please contact us:
              </p>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <a href="mailto:privacy@gameslib.com" className="text-purple-400 hover:text-purple-300">
                    privacy@gameslib.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span>Data Protection Officer</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
