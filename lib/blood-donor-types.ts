export interface BloodDonor {
  id: number;
  name: string;
  phone_number: string;
  blood_group: string;
  profile_pic_url: string | null;
  last_donate_date: string | null;
  blood_donor_status: string;
  can_donate: boolean;
}

export interface BloodGroupDistribution {
  [key: string]: number;
}

export interface BloodDonorStatistics {
  total_donors: number;
  available_donors: number;
  restricted_donors: number;
  blood_group_distribution: BloodGroupDistribution;
}

export interface BloodDonorResponse {
  success: boolean;
  message: string;
  data: {
    donors: BloodDonor[];
    statistics: BloodDonorStatistics;
  };
  timestamp: string;
}

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export type BloodGroup = typeof BLOOD_GROUPS[number];
