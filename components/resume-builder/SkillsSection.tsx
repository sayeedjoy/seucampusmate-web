"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SkillsSectionProps = {
  technicalSkills: string;
  softSkills: string;
  languages: string;
  onField: (name: "technicalSkills" | "softSkills" | "languages") => (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function SkillsSection({
  technicalSkills,
  softSkills,
  languages,
  onField,
}: SkillsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resume-technical">Technical Skills</Label>
          <Input id="resume-technical" value={technicalSkills} onChange={onField("technicalSkills")} placeholder="Excel, PowerPoint, Python, MATLAB..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-soft">Soft Skills</Label>
          <Input id="resume-soft" value={softSkills} onChange={onField("softSkills")} placeholder="Communication, Teamwork..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resume-languages">Languages</Label>
          <Input id="resume-languages" value={languages} onChange={onField("languages")} placeholder="Bangla (Native), English (Professional)" />
        </div>
      </CardContent>
    </Card>
  );
}
