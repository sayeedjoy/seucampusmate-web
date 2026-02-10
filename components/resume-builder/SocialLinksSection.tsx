"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LinkItem } from "@/lib/resume/types";

type SocialLinksSectionProps = {
  links: LinkItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<LinkItem>) => void;
  onRemove: (id: string) => void;
};

export function SocialLinksSection({ links, onAdd, onUpdate, onRemove }: SocialLinksSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <CardTitle className="text-base">Social Links</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" onClick={onAdd} aria-label="Add link">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add link</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="LinkedIn / Portfolio"
              value={link.platform}
              onChange={(e) => onUpdate(link.id, { platform: e.target.value })}
              className="w-full sm:w-1/3 sm:shrink-0"
            />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                className="min-w-0 flex-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => onRemove(link.id)} aria-label="Remove link">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove link</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
