"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExperienceItem } from "@/lib/resume/types";

type ExperienceSectionProps = {
  experience: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ExperienceItem>) => void;
  onRemove: (id: string) => void;
};

export function ExperienceSection({ experience, onAdd, onUpdate, onRemove }: ExperienceSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base">Experience</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onAdd} aria-label="Add experience">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add experience</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="relative rounded-lg border bg-muted/30 p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => onRemove(exp.id)}
                  aria-label="Remove experience"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove experience</TooltipContent>
            </Tooltip>
            <Input
              className="mb-2 font-semibold"
              placeholder="Organization / Company"
              value={exp.org}
              onChange={(e) => onUpdate(exp.id, { org: e.target.value })}
            />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input placeholder="Role" value={exp.role} onChange={(e) => onUpdate(exp.id, { role: e.target.value })} />
              <Input placeholder="Duration" value={exp.duration} onChange={(e) => onUpdate(exp.id, { duration: e.target.value })} />
            </div>
            <Textarea
              className="mt-2 min-h-20"
              placeholder="Key responsibilities / achievements"
              value={exp.details}
              onChange={(e) => onUpdate(exp.id, { details: e.target.value })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
