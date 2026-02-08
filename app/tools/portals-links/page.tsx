import { Container } from '@/components/ui/container';

export default function PortalsLinksPage() {
    return (
        <Container className="py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Site and Portals Links
                    </h1>
                    <p className="text-xl text-gray-600">
                        Quick access to university portals, student systems, and important websites.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Important Links & Portals
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Access all important university websites, student portals, and online services.
                    </p>
                    
                    {/* Portals Links component will go here */}
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500">Portals & Links component coming soon...</p>
                    </div>
                </div>
            </div>
        </Container>
    );
}