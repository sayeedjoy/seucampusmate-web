import { Container } from '@/components/ui/container';
import {Header} from '@/components/navbar/header';
import { Footer } from '@/components/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read SEU CampusMate\'s privacy policy to understand how we protect your data and maintain your privacy while using our platform.',
  keywords: ['privacy policy', 'privacy', 'data protection', 'SEU CampusMate', 'user privacy', 'data security'],
  openGraph: {
    title: 'Privacy Policy - SEU CampusMate',
    description: 'Read SEU CampusMate\'s privacy policy to understand how we protect your data and maintain your privacy while using our platform.',
    type: 'website',
    url: 'https://campusmate.app/privacy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - SEU CampusMate',
    description: 'Read SEU CampusMate\'s privacy policy to understand how we protect your data and maintain your privacy while using our platform.',
  },
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <main className="pt-12">
                <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your privacy is important to us. Learn how we protect your data.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Information We Collect
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                                <p className="text-gray-600">
                                    We collect information you provide directly to us, such as your name, student ID, 
                                    email address, and academic information when you create an account or use our services.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Data</h3>
                                <p className="text-gray-600">
                                    To provide our academic tools, we may collect and store your course information, 
                                    grades, attendance records, and other academic-related data that you input into our platform.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
                                <p className="text-gray-600">
                                    We automatically collect information about how you use our app, including features accessed, 
                                    time spent, and interaction patterns to improve our services.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            How We Use Your Information
                        </h2>
                        <ul className="text-gray-600 space-y-3">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Provide and maintain our academic tools and services</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Calculate and track your academic progress (CGPA, attendance, etc.)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Send you important notifications and updates about your academic status</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Improve our app functionality and user experience</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>Ensure the security and integrity of our platform</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Information Sharing
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                            except in the following circumstances:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• With your explicit consent</li>
                            <li>• To comply with legal obligations or court orders</li>
                            <li>• To protect our rights, property, or safety, or that of our users</li>
                            <li>• With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Data Security
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We implement appropriate technical and organizational security measures to protect your personal information against 
                            unauthorized access, alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Encryption of sensitive data in transit and at rest</li>
                            <li>• Regular security assessments and updates</li>
                            <li>• Access controls and authentication mechanisms</li>
                            <li>• Secure data storage and backup procedures</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Your Rights
                        </h2>
                        <p className="text-gray-600 mb-4">
                            You have the right to:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Access and review your personal information</li>
                            <li>• Request corrections to inaccurate data</li>
                            <li>• Request deletion of your account and associated data</li>
                            <li>• Export your data in a portable format</li>
                            <li>• Opt-out of non-essential communications</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Contact Us
                        </h2>
                        <p className="text-gray-600">
                            If you have any questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">
                                <strong>Email:</strong> privacy@campusmate.seu.edu<br/>
                                <strong>Address:</strong> Southeast University, Dhaka, Bangladesh<br/>
                                <strong>Phone:</strong> +880-XXX-XXXXXX
                            </p>
                        </div>
                    </div>
                </div>
                </div>
            </Container>
            </main>
            <Footer />
        </>
    );
}