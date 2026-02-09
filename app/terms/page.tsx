import { Container } from '@/components/ui/container';
import {Header} from '@/components/navbar/header';
import { Footer } from '@/components/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read SEU CampusMate\'s terms of service and usage guidelines. Understand your rights and responsibilities when using our platform.',
  keywords: ['terms of service', 'terms', 'legal', 'SEU CampusMate', 'usage guidelines', 'user agreement'],
  openGraph: {
    title: 'Terms of Service - SEU CampusMate',
    description: 'Read SEU CampusMate\'s terms of service and usage guidelines. Understand your rights and responsibilities when using our platform.',
    type: 'website',
    url: 'https://campusmate.app/terms',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - SEU CampusMate',
    description: 'Read SEU CampusMate\'s terms of service and usage guidelines. Understand your rights and responsibilities when using our platform.',
  },
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="pt-12">
                <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-xl text-gray-600">
                        Please read these terms carefully before using CampusMate.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Acceptance of Terms
                        </h2>
                        <p className="text-gray-600">
                            By accessing and using CampusMate, you accept and agree to be bound by the terms and provision of this agreement. 
                            If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Eligibility
                        </h2>
                        <p className="text-gray-600 mb-4">
                            CampusMate is intended for use by:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Current students of Southeast University</li>
                            <li>• Faculty and staff members of Southeast University</li>
                            <li>• Alumni with valid university credentials</li>
                            <li>• Authorized university personnel</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            You must be at least 18 years old or have parental consent to use this service.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            User Accounts and Responsibilities
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Creation</h3>
                                <p className="text-gray-600">
                                    You must provide accurate and complete information when creating your account. 
                                    You are responsible for maintaining the confidentiality of your account credentials.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                                <ul className="text-gray-600 space-y-1">
                                    <li>• Sharing false or misleading academic information</li>
                                    <li>• Attempting to access other users accounts or data</li>
                                    <li>• Using the platform for commercial purposes without authorization</li>
                                    <li>• Violating university policies or academic integrity guidelines</li>
                                    <li>• Engaging in harassment or inappropriate behavior</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Academic Data and Accuracy
                        </h2>
                        <p className="text-gray-600 mb-4">
                            CampusMate provides tools to help you track and calculate academic metrics. However:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• You are responsible for entering accurate data</li>
                            <li>• Calculations are estimates and may not reflect official university records</li>
                            <li>• Always verify important academic information with official university sources</li>
                            <li>• We are not responsible for decisions made based on app calculations</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Intellectual Property
                        </h2>
                        <p className="text-gray-600 mb-4">
                            The CampusMate platform, including its design, functionality, and content, is owned by the development team 
                            and Southeast University. You may not:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Copy, modify, or distribute our software or content</li>
                            <li>• Reverse engineer or attempt to extract source code</li>
                            <li>• Use our trademarks or branding without permission</li>
                            <li>• Create derivative works based on our platform</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Service Availability
                        </h2>
                        <p className="text-gray-600">
                            We strive to maintain high availability of our services, but we cannot guarantee uninterrupted access. 
                            We reserve the right to modify, suspend, or discontinue any part of the service with or without notice. 
                            We are not liable for any inconvenience or loss resulting from service interruptions.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Privacy and Data Protection
                        </h2>
                        <p className="text-gray-600">
                            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                            use, and protect your information. By using CampusMate, you consent to our data practices as 
                            described in the Privacy Policy.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Limitation of Liability
                        </h2>
                        <p className="text-gray-600">
                            CampusMate is provided as is without warranties of any kind. We are not liable for any direct, 
                            indirect, incidental, or consequential damages arising from your use of the platform. This includes 
                            but is not limited to academic decisions made based on app calculations or any data loss.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Termination
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We may terminate or suspend your account at any time for:
                        </p>
                        <ul className="text-gray-600 space-y-2">
                            <li>• Violation of these terms</li>
                            <li>• Inappropriate or harmful behavior</li>
                            <li>• Inactivity for extended periods</li>
                            <li>• At your request</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            Upon termination, your access to the service will cease, and we may delete your account data 
                            in accordance with our data retention policies.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Changes to Terms
                        </h2>
                        <p className="text-gray-600">
                            We reserve the right to modify these terms at any time. We will notify users of significant changes 
                            through the app or email. Continued use of CampusMate after changes constitutes acceptance of the new terms.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Contact Information
                        </h2>
                        <p className="text-gray-600 mb-4">
                            If you have questions about these Terms of Service, please contact us:
                        </p>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">
                                <strong>Email:</strong> legal@campusmate.seu.edu<br/>
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