export function ratingColor(rating: number): string {
  if (rating >= 2400) return 'text-red-500';
  if (rating >= 2100) return 'text-orange-500';
  if (rating >= 1900) return 'text-violet-500';
  if (rating >= 1600) return 'text-blue-500';
  if (rating >= 1400) return 'text-cyan-500';
  if (rating >= 1200) return 'text-green-500';
  return 'text-gray-400';
}

export function ratingColorBg(rating: number): string {
  if (rating >= 2400) return 'bg-red-50';
  if (rating >= 2100) return 'bg-orange-50';
  if (rating >= 1900) return 'bg-violet-50';
  if (rating >= 1600) return 'bg-blue-50';
  if (rating >= 1400) return 'bg-cyan-50';
  if (rating >= 1200) return 'bg-green-50';
  return 'bg-gray-50';
}

export function ratingColorBorder(rating: number): string {
  if (rating >= 2400) return 'border-red-200';
  if (rating >= 2100) return 'border-orange-200';
  if (rating >= 1900) return 'border-violet-200';
  if (rating >= 1600) return 'border-blue-200';
  if (rating >= 1400) return 'border-cyan-200';
  if (rating >= 1200) return 'border-green-200';
  return 'border-gray-200';
}

export function ratingColorGradient(rating: number): string {
  if (rating >= 2400) return 'from-red-500 to-red-600';
  if (rating >= 2100) return 'from-orange-500 to-orange-600';
  if (rating >= 1900) return 'from-violet-500 to-violet-600';
  if (rating >= 1600) return 'from-blue-500 to-blue-600';
  if (rating >= 1400) return 'from-cyan-500 to-cyan-600';
  if (rating >= 1200) return 'from-green-500 to-green-600';
  return 'from-gray-400 to-gray-500';
}
