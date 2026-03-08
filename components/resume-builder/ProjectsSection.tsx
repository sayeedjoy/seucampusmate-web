"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProjectItem } from "@/lib/resume/types";

type ProjectsSectionProps = {
  projects: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
};

export function ProjectsSection({ projects, onAdd, onUpdate, onRemove }: ProjectsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base">Projects / Activities</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onAdd} aria-label="Add project">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add project</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="relative rounded-lg border bg-muted/30 p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => onRemove(proj.id)}
                  aria-label="Remove project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove project</TooltipContent>
            </Tooltip>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                className="font-semibold"
                placeholder="Title"
                value={proj.name}
                onChange={(e) => onUpdate(proj.id, { name: e.target.value })}
              />
              <Input
                placeholder="Tools / Methods (optional)"
                value={proj.tools}
                onChange={(e) => onUpdate(proj.id, { tools: e.target.value })}
              />
            </div>
            <Textarea
              className="mt-2 min-h-20"
              placeholder="Description (what you did + outcome)"
              value={proj.description}
              onChange={(e) => onUpdate(proj.id, { description: e.target.value })}
            />
            <Input className="mt-2" placeholder="Link (optional)" value={proj.link} onChange={(e) => onUpdate(proj.id, { link: e.target.value })} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
