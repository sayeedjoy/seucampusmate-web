"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { BulletItem } from "@/lib/resume/types";

type AchievementsSectionProps = {
  achievements: BulletItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<BulletItem>) => void;
  onRemove: (id: string) => void;
};

export function AchievementsSection({ achievements, onAdd, onUpdate, onRemove }: AchievementsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base">Key Achievements</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onAdd} aria-label="Add achievement">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add achievement</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {achievements.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <Input
              placeholder="Example: Organized 12 workshops engaging 300+ students"
              value={a.text}
              onChange={(e) => onUpdate(a.id, { text: e.target.value })}
              className="min-w-0 flex-1"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => onRemove(a.id)} aria-label="Remove achievement">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove achievement</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
