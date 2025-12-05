import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  AlertTriangle,
  GamepadIcon,
  TrendingUp,
  Lock,
  Eye,
  CheckCircle,
  Info,
  Users,
  Database,
  Globe,
  Mail,
} from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      <main className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Privacy & Legal Disclaimer
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Your privacy matters to us. Please read our policies and understand the nature of this fantasy trading game.
            </p>
            <div className="mt-6">
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2">
                <GamepadIcon className="h-4 w-4 mr-2" />
                Educational Fantasy Game Only
              </Badge>
            </div>
          </div>

          {/* Important Disclaimer */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-3">⚠️ IMPORTANT DISCLAIMER</h2>
                <div className="space-y-3 text-red-800">
                  <p className="font-semibold">
                    THIS IS A FANTASY TRADING GAME FOR EDUCATIONAL AND ENTERTAINMENT PURPOSES ONLY.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>No Real Money:</strong> All transactions use virtual currency</li>
                    <li>• <strong>Not Financial Advice:</strong> This game does not constitute investment advice</li>
                    <li>• <strong>Educational Purpose:</strong> Designed to teach investing concepts in a risk-free environment</li>
                    <li>• <strong>Risky Real Investing:</strong> Real stock trading involves significant financial risk</li>
                    <li>• <strong>Consult Professionals:</strong> Always consult qualified financial advisors for real investments</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Policy */}
          <Card className="bg-white border border-slate-200 shadow-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
            </div>

            <div className="space-y-8">
              {/* Data Collection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-600" />
                  Information We Collect
                </h3>
                <div className="space-y-4 text-slate-600">
                  <div className="pl-4 border-l-4 border-blue-200">
                    <h4 className="font-medium text-slate-900">Account Information</h4>
                    <p className="text-sm">Email address, display name, and authentication credentials managed by Firebase.</p>
                  </div>
                  <div className="pl-4 border-l-4 border-emerald-200">
                    <h4 className="font-medium text-slate-900">Game Activity</h4>
                    <p className="text-sm">Fantasy portfolio transactions, league memberships, rankings, and game statistics.</p>
                  </div>
                  <div className="pl-4 border-l-4 border-purple-200">
                    <h4 className="font-medium text-slate-900">Usage Data</h4>
                    <p className="text-sm">Application usage patterns, features accessed, and performance metrics.</p>
                  </div>
                </div>
              </div>

              {/* How We Use Data */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                  How We Use Your Information
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    Provide and maintain the fantasy trading game experience
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    Calculate rankings and leaderboards within leagues
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    Enable social features like league creation and joining
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    Improve application performance and user experience
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-1 flex-shrink-0" />
                    Provide customer support and respond to inquiries
                  </li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-600" />
                  Information Sharing
                </h3>
                <div className="space-y-4 text-slate-600">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-medium text-slate-900 mb-2">We DO NOT sell or share your personal information with third parties for marketing purposes.</p>
                    <p className="text-sm">Your data may be visible to other players in the following contexts:</p>
                    <ul className="mt-2 space-y-1 text-sm ml-4">
                      <li>• Display name and rankings within shared leagues</li>
                      <li>• Portfolio performance in league leaderboards</li>
                      <li>• Public league membership (if you join public leagues)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-600" />
                  Data Security
                </h3>
                <div className="space-y-3 text-slate-600">
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Secure authentication via Firebase</li>
                    <li>• Encrypted data transmission (HTTPS)</li>
                    <li>• Secure database hosting with Supabase</li>
                    <li>• Regular security updates and monitoring</li>
                  </ul>
                </div>
              </div>

              {/* Third-Party Services */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-slate-600" />
                  Third-Party Services
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900">Firebase</h4>
                    <p className="text-sm text-slate-600">Authentication and user management</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900">Supabase</h4>
                    <p className="text-sm text-slate-600">Database hosting and real-time features</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900">Alpha Vantage</h4>
                    <p className="text-sm text-slate-600">Stock market data for game purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Terms of Use */}
          <Card className="bg-white border border-slate-200 shadow-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Info className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Terms of Use</h2>
            </div>

            <div className="space-y-6 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Acceptable Use</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Use the application for educational and entertainment purposes only</li>
                  <li>• Do not attempt to manipulate or exploit the scoring system</li>
                  <li>• Respect other players and maintain appropriate conduct</li>
                  <li>• Do not share account credentials with others</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Prohibited Activities</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Using the platform for actual investment advice or recommendations</li>
                  <li>• Attempting to hack, compromise, or reverse engineer the application</li>
                  <li>• Creating multiple accounts to gain unfair advantages</li>
                  <li>• Harassment or inappropriate communication with other users</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Limitation of Liability</h3>
                <p className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                  InvestorsArena is provided "as is" for educational purposes. We are not liable for any decisions 
                  made based on the fantasy game experience. Real investing involves substantial risk of loss, 
                  and past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Contact & Updates</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600">
                If you have questions about this privacy policy or our practices, please contact us.
              </p>
              
              <div className="p-4 bg-white rounded-lg border border-emerald-200">
                <h3 className="font-medium text-slate-900 mb-2">Policy Updates</h3>
                <p className="text-sm text-slate-600">
                  We may update this privacy policy from time to time. We will notify users of any material 
                  changes through the application or via email. Continued use of the service after changes 
                  indicates acceptance of the updated policy.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  <strong>Last Updated:</strong> December 5, 2024
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-emerald-200">
                <h3 className="font-medium text-slate-900 mb-2">Your Rights</h3>
                <p className="text-sm text-slate-600">
                  You have the right to access, update, or delete your personal information. 
                  You may also request data portability or restrict processing of your data.
                </p>
              </div>
            </div>
          </Card>

          {/* Final Reminder */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 rounded-lg">
              <GamepadIcon className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-medium">
                Remember: This is a fantasy game. Always consult financial professionals for real investment decisions.
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}