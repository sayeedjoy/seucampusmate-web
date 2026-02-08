import type * as React from "react";

export type Feature = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    link: string;
};
