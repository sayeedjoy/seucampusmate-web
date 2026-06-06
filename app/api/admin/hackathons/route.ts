import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { requireHackathonManager } from '@/lib/roles';
import { createHackathon, listHackathons } from '@/lib/db/hackathons';
import { isValidEventLink, resolveDateRange, resolveLocation } from '@/lib/hackathons/validation';

export async function GET() {
  const session = await auth();
  const denied = requireHackathonManager(session);
  if (denied) return denied;

  const hackathons = await listHackathons();
  return NextResponse.json({ hackathons });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const denied = requireHackathonManager(session);
  if (denied) return denied;

  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();
  const host = String(formData.get('host') ?? '').trim();
  const eventDateRaw = String(formData.get('eventDate') ?? '').trim();
  const endDateRaw = String(formData.get('endDate') ?? '').trim();
  const isOnline = String(formData.get('isOnline') ?? '') === 'true';
  const isPostponed = String(formData.get('isPostponed') ?? '') === 'true';
  const locationRaw = String(formData.get('location') ?? '');
  const eventLink = String(formData.get('eventLink') ?? '').trim();
  const bannerUrlRaw = String(formData.get('bannerUrl') ?? '').trim();
  const banner = formData.get('banner');

  if (!name || !host) {
    return NextResponse.json({ error: 'Event name and host are required.' }, { status: 400 });
  }

  const range = resolveDateRange(eventDateRaw, endDateRaw);
  if (!range.ok) {
    return NextResponse.json({ error: range.error }, { status: 400 });
  }

  if (!isValidEventLink(eventLink)) {
    return NextResponse.json({ error: 'Event link must be a valid http(s) URL.' }, { status: 400 });
  }

  const loc = resolveLocation(isOnline, locationRaw);
  if (!loc.ok) {
    return NextResponse.json({ error: loc.error }, { status: 400 });
  }

  // Banner: an uploaded file takes precedence over a pasted URL.
  let bannerUrl: string;
  let bannerFileId: string | null = null;

  if (banner instanceof File && banner.size > 0) {
    try {
      const uploaded = await uploadImage(banner, banner.name || 'hackathon.jpg', 'hackathon');
      bannerUrl = uploaded.url;
      bannerFileId = uploaded.fileId;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Banner upload failed.';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } else if (bannerUrlRaw) {
    if (!isValidEventLink(bannerUrlRaw)) {
      return NextResponse.json({ error: 'Banner URL must be a valid http(s) URL.' }, { status: 400 });
    }
    bannerUrl = bannerUrlRaw;
  } else {
    return NextResponse.json({ error: 'A banner image (upload or URL) is required.' }, { status: 400 });
  }

  const createdById = session!.user.id ? Number(session!.user.id) : null;

  const hackathon = await createHackathon({
    name,
    host,
    eventDate: range.eventDate,
    endDate: range.endDate,
    isOnline,
    isPostponed,
    location: loc.location,
    bannerUrl,
    bannerFileId,
    eventLink,
    createdById: Number.isFinite(createdById) ? createdById : null,
  });

  return NextResponse.json({ hackathon }, { status: 201 });
}
