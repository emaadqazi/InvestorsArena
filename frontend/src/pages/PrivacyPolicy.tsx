import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  BookOpen,
  Lock,
  Eye,
  Info,
  Users,
  Database,
  Globe,
  Mail,
  Target,
  CheckCircle,
  TrendingUp,
  GamepadIcon,
} from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      <main className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                  Ethics & Privacy Policy
                </h1>
                <p className="text-lg text-slate-600 max-w-4xl leading-relaxed">
                  Understanding how we protect your data and the educational nature of our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Key Message */}
          <Card className="bg-white border border-slate-200 shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Educational Trading Simulator</h2>
                <p className="text-slate-700 leading-relaxed text-lg mb-6">
                  Investor Arena is a fantasy trading platform designed to teach investment concepts 
                  through simulation. All transactions use virtual currency, and no real money is ever at risk.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                    100% Virtual Trading
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    Educational Purpose
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Performance vs. Reality</h2>
                <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                  Success in this simulation does not guarantee similar results in real markets. 
                  Virtual trading removes the emotional and financial pressures that significantly impact real investment decisions.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-amber-200 shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-3 text-lg">Fantasy Trading</h4>
                    <ul className="text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        No emotional stress
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Zero financial risk
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Simplified conditions
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-amber-200 shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-3 text-lg">Real Investing</h4>
                    <ul className="text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Emotional decision-making
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Real financial consequences
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Complex market factors
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Policy */}
          <Card className="bg-white border border-slate-200 shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h2>
            </div>

            <div className="space-y-10">
              {/* Data Collection */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-600" />
                  Information We Collect
                </h3>
                <div className="space-y-6 text-slate-600">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Account Information</h4>
                    <p>Email address, display name, and authentication credentials managed through Firebase.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Trading Activity</h4>
                    <p>Portfolio transactions, league participation, rankings, and performance statistics within the simulation.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Usage Analytics</h4>
                    <p>Basic application usage patterns to improve platform performance and user experience.</p>
                  </div>
                </div>
              </div>

              {/* How We Use Data */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                  How We Use Your Information
                </h3>
                <div className="space-y-4 text-slate-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p>Provide and maintain the trading simulation experience</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p>Calculate performance rankings and leaderboards within leagues</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p>Enable league creation and social trading features</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p>Improve platform performance and user experience</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p>Provide customer support and technical assistance</p>
                  </div>
                </div>
              </div>

              {/* Data Sharing */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-600" />
                  Information Sharing
                </h3>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="font-medium text-slate-900 mb-3">We do not sell or share your personal information with third parties for marketing purposes.</p>
                  <p className="text-slate-600 mb-4">Limited information is visible to other users in these contexts:</p>
                  <div className="space-y-2 text-slate-600">
                    <p>• Display name and performance rankings within shared leagues</p>
                    <p>• Portfolio performance in league leaderboards</p>
                    <p>• Public league membership (when you join public leagues)</p>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-600" />
                  Data Security
                </h3>
                <div className="space-y-4 text-slate-600">
                  <p>We implement standard security measures to protect your information:</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <p>• Secure authentication via Firebase</p>
                      <p>• Encrypted data transmission (HTTPS)</p>
                    </div>
                    <div className="space-y-2">
                      <p>• Secure database hosting with Supabase</p>
                      <p>• Regular security monitoring</p>
                    </div>
                  </div>
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
          <Card className="bg-white border border-slate-200 shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Info className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Terms of Use</h2>
            </div>

            <div className="space-y-8 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-lg">Platform Guidelines</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Use the platform for educational purposes and skill development</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Maintain respectful interaction with other users</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Keep your account secure and do not share login credentials</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p>Report any technical issues or inappropriate behavior</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-lg">Prohibited Activities</h3>
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <div className="space-y-3 text-red-800">
                    <p>• Treating simulation results as investment advice</p>
                    <p>• Attempting to compromise platform security</p>
                    <p>• Creating multiple accounts for unfair advantage</p>
                    <p>• Harassment or inappropriate communication</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-lg">Educational Disclaimer</h3>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <p className="leading-relaxed text-slate-700">
                    InvestorsArena is an educational simulation platform. We provide no investment advice or guarantees. 
                    Real investing involves substantial risk, and past performance does not indicate future results. 
                    Always consult qualified financial advisors before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white border border-slate-200 shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Contact & Updates</h2>
            </div>

            <div className="space-y-8">
              <p className="text-slate-600 text-lg leading-relaxed">
                Questions about this privacy policy or our platform? We're here to help.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 text-lg">Policy Updates</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    We may update this policy from time to time. Material changes will be communicated 
                    through the platform or via email.
                  </p>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    Last Updated: December 5, 2024
                  </Badge>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                  <h3 className="font-semibold text-slate-900 mb-3 text-lg">Your Rights</h3>
                  <p className="text-slate-600 leading-relaxed">
                    You have the right to access, update, or delete your personal information. 
                    Contact us to exercise these rights.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Final Reminder */}
          <div className="text-center mt-16">
            <Card className="inline-block bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-4 px-8 py-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-emerald-900 font-semibold mb-1">Questions about our policies?</p>
                  <p className="text-emerald-700">Contact us at support@investorsarena.com</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}