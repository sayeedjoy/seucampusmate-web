"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { EducationItem } from "@/lib/resume/types";

type EducationSectionProps = {
  education: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
};

export function EducationSection({ education, onAdd, onUpdate, onRemove }: EducationSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base">Education</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onAdd} aria-label="Add education">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add education</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="relative rounded-lg border bg-muted/30 p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => onRemove(edu.id)}
                  aria-label="Remove education"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove education</TooltipContent>
            </Tooltip>
            <Input
              className="mb-2 font-semibold"
              placeholder="Institution"
              value={edu.institute}
              onChange={(e) => onUpdate(edu.id, { institute: e.target.value })}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input placeholder="Degree / Program" value={edu.degree} onChange={(e) => onUpdate(edu.id, { degree: e.target.value })} />
              <Input placeholder="Year / Duration" value={edu.year} onChange={(e) => onUpdate(edu.id, { year: e.target.value })} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
