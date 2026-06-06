import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { deleteImage, uploadImage } from '@/lib/cloudinary';
import { requireHackathonManager } from '@/lib/roles';
import { deleteHackathon, getHackathonById, updateHackathon } from '@/lib/db/hackathons';
import { isValidEventLink, resolveDateRange, resolveLocation } from '@/lib/hackathons/validation';

type RouteContext = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  const denied = requireHackathonManager(session);
  if (denied) return denied;

  const { id: idParam } = await context.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const existing = await getHackathonById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

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

  let bannerUrl = existing.bannerUrl;
  let bannerFileId = existing.bannerFileId;
  let fileIdToDelete: string | null = null;

  if (banner instanceof File && banner.size > 0) {
    // Replace with a freshly uploaded image.
    try {
      const uploaded = await uploadImage(banner, banner.name || 'hackathon.jpg', 'hackathon');
      bannerUrl = uploaded.url;
      bannerFileId = uploaded.fileId;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Banner upload failed.';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    fileIdToDelete = existing.bannerFileId;
  } else if (bannerUrlRaw && bannerUrlRaw !== existing.bannerUrl) {
    // Switch to a pasted URL; drop any previously owned Cloudinary asset.
    if (!isValidEventLink(bannerUrlRaw)) {
      return NextResponse.json({ error: 'Banner URL must be a valid http(s) URL.' }, { status: 400 });
    }
    bannerUrl = bannerUrlRaw;
    bannerFileId = null;
    fileIdToDelete = existing.bannerFileId;
  }

  const hackathon = await updateHackathon(id, {
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
  });

  if (fileIdToDelete) {
    try {
      await deleteImage(fileIdToDelete);
    } catch {
      // best-effort cleanup
    }
  }

  return NextResponse.json({ hackathon });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  const denied = requireHackathonManager(session);
  if (denied) return denied;

  const { id: idParam } = await context.params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }

  const existing = await getHackathonById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  await deleteHackathon(id);

  if (existing.bannerFileId) {
    try {
      await deleteImage(existing.bannerFileId);
    } catch {
      // best-effort cleanup
    }
  }

  return NextResponse.json({ success: true });
}
