'use client';

import { Container } from '@/components/ui/container';
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer/footer';
import Image from 'next/image';

export default function QuestionBankPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white pt-12">
                <Container className="py-8 md:py-12 lg:py-16">
                    <div className="max-w-2xl mx-auto">
                    

                        {/* Mobile App Call to Action */}
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                                Mobile App Exclusive
                            </h2>
                            <p className="text-gray-600 text-base md:text-lg mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
                                This feature is available exclusively in our mobile app. Download now to access the complete question bank with previous years' papers and practice tests.
                            </p>

                            {/* Download Button */}
                            <a 
                                href="#"
                                className="inline-block transition-transform duration-300 hover:scale-105"
                            >
                                <Image
                                    src="/google-play.webp"
                                    alt="Get it on Google Play"
                                    width={200}
                                    height={60}
                                    className="object-contain"
                                />
                            </a>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}