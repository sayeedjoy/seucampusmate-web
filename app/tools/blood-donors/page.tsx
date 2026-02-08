'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer/footer';
import { BloodDonorList } from '@/components/blooddonation/BloodDonorList';
import { BloodDonorResponse } from '@/lib/blood-donor-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Heart, Droplets } from 'lucide-react';

export default function BloodDonorsPage() {
    const [data, setData] = useState<BloodDonorResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchBloodDonors(): Promise<void> {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://apppulse.dev/backend/api/blood_donors_list.php');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: BloodDonorResponse = await response.json();

            if (result.success) {
                setData(result);
            } else {
                throw new Error(result.message || 'Failed to fetch blood donors');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBloodDonors();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-12 min-h-screen bg-white">
                    <Container className="py-16">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-red-500 rounded-xl">
                                    <Droplets className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    Blood Donors
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Connect with blood donors in the university community during emergencies.
                                </p>
                            </div>

                            <Card className="p-12 text-center bg-white border border-gray-200">
                                <RefreshCw className="h-10 w-10 mx-auto mb-4 text-red-500 animate-spin" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Loading blood donors...
                                </h3>
                                <p className="text-gray-500">
                                    Please wait while we fetch the latest donor information.
                                </p>
                            </Card>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="pt-12 min-h-screen bg-white">
                    <Container className="py-16">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-red-500 rounded-xl">
                                    <Droplets className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    Blood Donors
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Connect with blood donors in the university community during emergencies.
                                </p>
                            </div>

                            <Card className="p-12 text-center bg-white border border-gray-200">
                                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Unable to load blood donors
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {error}
                                </p>
                                <Button onClick={fetchBloodDonors}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                            </Card>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <>
            <Navbar />
            <main className="pt-12 min-h-screen bg-white">
                <Container className="py-16">
                    <div className="max-w-6xl mx-auto">
                        {/* Directory Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-lg">
                                    <Heart className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Donor Directory
                                    </h2>
                                    <p className="text-sm text-gray-500">Browse and search available donors</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={fetchBloodDonors}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {/* Donors List */}
                        <div className="mb-10">
                            <BloodDonorList donors={data.data.donors} />
                        </div>

                        {/* Emergency Notice */}
                        <Card className="p-6 bg-red-50 border border-red-200">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 mb-1">
                                        Emergency Blood Donation
                                    </h3>
                                    <p className="text-red-800 text-sm">
                                        In case of emergency, contact donors directly using their phone numbers.
                                        Always verify blood type compatibility before transfusion.
                                        This directory is for emergency use only.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}