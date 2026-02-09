import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import type { BentoCardProps } from "./types"

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      className,
      size = "small",
      imagePlaceholder,
      image,
      title,
      description,
      icon: Icon,
      badge,
      iconColorClass,
      iconBgClass,
      iconVariant = "default",
      priority = false,
      children,
      ...props
    },
    ref
  ) => {
    const isCustomIcon = iconVariant === "custom"
    const iconClassName = isCustomIcon
      ? "size-14"
      : cn("size-14 shrink-0", iconColorClass ?? "text-muted-foreground opacity-70")
    const iconWrapperClassName = isCustomIcon
      ? undefined
      : cn(
          "flex items-center justify-center rounded-xl p-4",
          iconBgClass ?? "bg-muted/50"
        )

    return (
      <div
        ref={ref}
        className={cn(
          size === "large" ? "md:col-span-1 lg:col-span-3" : "lg:col-span-2"
        )}
      >
        <Card
          size={size === "small" ? "sm" : "default"}
          className={cn(
            "flex h-full flex-col overflow-hidden border border-border",
            className
          )}
          {...props}
        >
          {/* Image / icon placeholder area */}
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden text-muted-foreground",
              image
                ? "bg-white dark:bg-zinc-900/80 p-4"
                : "bg-muted/50",
              size === "large"
                ? "aspect-[16/9] text-base font-medium"
                : "aspect-[4/3] text-sm font-medium"
            )}
          >
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                className="object-contain"
                sizes={size === "large" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
                priority={priority}
              />
            ) : Icon ? (
              iconWrapperClassName ? (
                <div className={iconWrapperClassName}>
                  <Icon className={iconClassName} aria-hidden />
                </div>
              ) : (
                <Icon className={iconClassName} aria-hidden />
              )
            ) : (
              imagePlaceholder
            )}
          </div>

          {/* Card content */}
          <CardHeader className="flex-1 space-y-2 pb-2">
            {title && (
              <CardTitle className="text-lg font-semibold leading-tight">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="line-clamp-3 text-sm">
                {description}
              </CardDescription>
            )}
          </CardHeader>

          {children && <CardContent className="pt-0">{children}</CardContent>}
        </Card>
      </div>
    )
  }
)
BentoCard.displayName = "BentoCard"

export { BentoCard }
