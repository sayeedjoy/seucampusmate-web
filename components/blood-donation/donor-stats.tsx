'use client';

import type { BloodDonor } from '@/lib/blood-donor-types';
import { Card } from '@/components/ui/card';
import { Heart, Droplets, Users } from 'lucide-react';

interface BloodDonorStatisticsProps {
  availableDonors: BloodDonor[];
}

export function BloodDonorStatistics({ availableDonors }: BloodDonorStatisticsProps) {
  const totalAvailableDonors = availableDonors.length;
  const readyDonors = availableDonors.filter(donor => donor.blood_donor_status === 'Available').length;

  // Calculate blood group distribution for available donors
  const bloodGroupDistribution = availableDonors.reduce((acc, donor) => {
    acc[donor.blood_group] = (acc[donor.blood_group] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const getBloodGroupStyle = (bloodGroup: string) => {
    const styles: { [key: string]: { bg: string; bar: string; text: string } } = {
      'A+': { bg: 'bg-red-50', bar: 'bg-gradient-to-r from-red-400 to-red-500', text: 'text-red-700' },
      'A-': { bg: 'bg-red-50', bar: 'bg-gradient-to-r from-red-300 to-red-400', text: 'text-red-600' },
      'B+': { bg: 'bg-blue-50', bar: 'bg-gradient-to-r from-blue-400 to-blue-500', text: 'text-blue-700' },
      'B-': { bg: 'bg-blue-50', bar: 'bg-gradient-to-r from-blue-300 to-blue-400', text: 'text-blue-600' },
      'AB+': { bg: 'bg-purple-50', bar: 'bg-gradient-to-r from-purple-400 to-purple-500', text: 'text-purple-700' },
      'AB-': { bg: 'bg-purple-50', bar: 'bg-gradient-to-r from-purple-300 to-purple-400', text: 'text-purple-600' },
      'O+': { bg: 'bg-emerald-50', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500', text: 'text-emerald-700' },
      'O-': { bg: 'bg-emerald-50', bar: 'bg-gradient-to-r from-emerald-300 to-emerald-400', text: 'text-emerald-600' },
    };
    return styles[bloodGroup] || { bg: 'bg-muted', bar: 'bg-muted-foreground/50', text: 'text-foreground' };
  };

  const sortedBloodGroups = Object.entries(bloodGroupDistribution)
    .sort(([, a], [, b]) => b - a);

  const maxCount = Math.max(...Object.values(bloodGroupDistribution), 1);

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <Card className="p-6 bg-gradient-to-br from-red-50 via-background to-pink-50 dark:from-red-950/20 dark:via-background dark:to-pink-950/20 border-0 shadow-lg overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-100 to-rose-100 rounded-full blur-2xl opacity-40 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg shadow-red-200">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Blood Group Distribution</h3>
                <p className="text-sm text-muted-foreground">Available donors by blood type</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{totalAvailableDonors}</span>
                </div>
                <span className="text-xs text-muted-foreground">Total Donors</span>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">{readyDonors}</span>
                </div>
                <span className="text-xs text-muted-foreground">Ready Now</span>
              </div>
            </div>
          </div>

          {/* Blood Group Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sortedBloodGroups.map(([bloodGroup, count]) => {
              const style = getBloodGroupStyle(bloodGroup);
              const percentage = (count / maxCount) * 100;

              return (
                <div key={bloodGroup} className={`p-3 rounded-xl ${style.bg} transition-all duration-200 hover:scale-[1.02]`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold ${style.text}`}>{bloodGroup}</span>
                    <span className="text-xl font-bold text-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${style.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
