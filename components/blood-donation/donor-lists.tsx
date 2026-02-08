'use client';

import { useState, useMemo } from 'react';
import { BloodDonor, BLOOD_GROUPS, BloodGroup } from '@/lib/blood-donor-types';
import { BloodDonorCard } from './donor-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown } from 'lucide-react';

interface BloodDonorListProps {
  donors: BloodDonor[];
}

export function BloodDonorList({ donors }: BloodDonorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroups, setSelectedBloodGroups] = useState<BloodGroup[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      if (!donor.can_donate) return false;

      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone_number.includes(searchTerm);

      const matchesBloodGroup = selectedBloodGroups.length === 0 ||
        selectedBloodGroups.includes(donor.blood_group as BloodGroup);

      const matchesAvailability = !showOnlyAvailable || donor.can_donate;

      return matchesSearch && matchesBloodGroup && matchesAvailability;
    });
  }, [donors, searchTerm, selectedBloodGroups, showOnlyAvailable]);

  const visibleDonors = filteredDonors.slice(0, visibleCount);
  const hasMoreDonors = visibleCount < filteredDonors.length;

  function loadMore(): void {
    setVisibleCount(prev => Math.min(prev + 9, filteredDonors.length));
  }

  function toggleBloodGroup(bloodGroup: BloodGroup): void {
    setSelectedBloodGroups(prev =>
      prev.includes(bloodGroup)
        ? prev.filter(bg => bg !== bloodGroup)
        : [...prev, bloodGroup]
    );
  }

  function clearFilters(): void {
    setSearchTerm('');
    setSelectedBloodGroups([]);
    setShowOnlyAvailable(false);
    setVisibleCount(9);
  }

  function getBloodGroupStyle(bloodGroup: string, isSelected: boolean): string {
    const baseStyle = 'px-3 py-1.5 rounded-md text-sm font-medium';

    if (isSelected) {
      const selectedColors: Record<string, string> = {
        'A+': 'bg-red-500 text-white',
        'A-': 'bg-red-400 text-white',
        'B+': 'bg-blue-500 text-white',
        'B-': 'bg-blue-400 text-white',
        'AB+': 'bg-purple-500 text-white',
        'AB-': 'bg-purple-400 text-white',
        'O+': 'bg-green-500 text-white',
        'O-': 'bg-green-400 text-white',
      };
      return `${baseStyle} ${selectedColors[bloodGroup] || 'bg-gray-500 text-white'}`;
    }

    return `${baseStyle} bg-muted text-muted-foreground`;
  }

  const hasActiveFilters = searchTerm || selectedBloodGroups.length > 0 || showOnlyAvailable;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Blood Group Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Filter by Blood Group</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map(bloodGroup => (
                <button
                  key={bloodGroup}
                  onClick={() => toggleBloodGroup(bloodGroup)}
                  className={getBloodGroupStyle(bloodGroup, selectedBloodGroups.includes(bloodGroup))}
                >
                  {bloodGroup}
                </button>
              ))}
            </div>

            {/* Availability Filter */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">Show only available donors</span>
              </label>

              <span className="text-sm text-muted-foreground">
                Showing {visibleDonors.length} of {filteredDonors.length} donors
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Donors Grid */}
      {filteredDonors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleDonors.map(donor => (
              <BloodDonorCard key={donor.id} donor={donor} />
            ))}
          </div>

          {hasMoreDonors && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore}>
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More Donors
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No donors found
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or filters.'
                : 'No blood donors are currently registered.'
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
