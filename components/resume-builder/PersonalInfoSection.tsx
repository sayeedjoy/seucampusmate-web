"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PersonalInfoSectionProps = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  onField: (name: "name" | "title" | "email" | "phone" | "location" | "summary") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export function PersonalInfoSection({
  name,
  title,
  email,
  phone,
  location,
  summary,
  onField,
}: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="resume-name">Full Name</Label>
            <Input id="resume-name" value={name} onChange={onField("name")} placeholder="Kazi Azmainur Rahman" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resume-title">Title</Label>
            <Input id="resume-title" value={title} onChange={onField("title")} placeholder="Full Stack Developer" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resume-email">Email</Label>
            <Input id="resume-email" type="email" value={email} onChange={onField("email")} placeholder="yourmail@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resume-phone">Phone</Label>
            <Input id="resume-phone" value={phone} onChange={onField("phone")} placeholder="+880 1XXXXXXXXX" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-location">Location</Label>
          <Input id="resume-location" value={location} onChange={onField("location")} placeholder="Dhaka, Bangladesh" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-summary">Summary</Label>
          <Textarea id="resume-summary" value={summary} onChange={onField("summary")} className="min-h-28 sm:min-h-32" placeholder="Write 2–4 lines about yourself..." />
        </div>
      </CardContent>
    </Card>
  );
}
