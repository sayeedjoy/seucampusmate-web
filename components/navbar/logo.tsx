'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export function Logo() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
    >
      <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 relative">
        <Image
          src="/logo.webp"
          alt="CampusMate Logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-semibold text-lg sm:text-xl md:text-2xl lg:text-2xl text-gray-900">
        <span className="hidden sm:inline">SEU CampusMate</span>
        <span className="sm:hidden">CAMPUSMATE</span>
      </span>
    </Link>
  );
}
