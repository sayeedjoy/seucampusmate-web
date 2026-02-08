'use client';

import { useState } from 'react';
import { BloodDonor } from '@/lib/blood-donor-types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MathCaptcha } from './challenge';
import { Phone, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface BloodDonorCardProps {
  donor: BloodDonor;
}

export function BloodDonorCard({ donor }: BloodDonorCardProps) {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  function getBloodGroupColor(bloodGroup: string): string {
    const colors: Record<string, string> = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-400',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-400',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-400',
      'O+': 'bg-green-500',
      'O-': 'bg-green-400',
    };
    return colors[bloodGroup] || 'bg-gray-500';
  }

  function formatLastDonateDate(dateString: string | null): string {
    if (!dateString) return 'Never donated';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(name: string): string {
    const colors = [
      'bg-rose-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-amber-500',
      'bg-teal-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  function handleCaptchaSuccess(): void {
    setShowPhoneNumber(true);
  }

  function handleViewPhoneClick(): void {
    setShowCaptcha(true);
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Blood Group Badge */}
      <div className={`absolute top-0 right-0 ${getBloodGroupColor(donor.blood_group)} text-white px-4 py-2 rounded-bl-xl font-bold text-lg`}>
        {donor.blood_group}
      </div>

      <div className="p-5">
        {/* Donor Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={donor.profile_pic_url || undefined} alt={donor.name} />
            <AvatarFallback className={`${getAvatarColor(donor.name)} text-white font-semibold`}>
              {getInitials(donor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-semibold text-foreground truncate pr-16">
              {donor.name}
            </h3>

            {donor.can_donate ? (
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready to donate
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                {donor.blood_donor_status}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Contact & Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            {showPhoneNumber ? (
              <a
                href={`tel:${donor.phone_number}`}
                className="text-foreground font-medium"
              >
                {donor.phone_number}
              </a>
            ) : (
              <Button variant="outline" size="sm" onClick={handleViewPhoneClick}>
                Click to view number
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              Last donated: <span className="font-medium text-foreground">{formatLastDonateDate(donor.last_donate_date)}</span>
            </span>
          </div>
        </div>
      </div>

      {showCaptcha && (
        <MathCaptcha
          isOpen={showCaptcha}
          onClose={() => setShowCaptcha(false)}
          onSuccess={handleCaptchaSuccess}
        />
      )}
    </Card>
  );
}
