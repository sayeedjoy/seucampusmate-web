import { Container } from '@/components/ui/container';

export default function ImportantContactsPage() {
    return (
        <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Important Contacts
                    </h1>
                    <p className="text-xl text-gray-600">
                        Quick access to important university contacts and emergency numbers.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        University Contacts
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Find contact information for departments, offices, and emergency services.
                    </p>
                    
                    {/* Important Contacts component will go here */}
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500">Important Contacts component coming soon...</p>
                    </div>
                </div>
            </div>
        </Container>
    );
}