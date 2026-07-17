"use client";

import { useState } from "react";
import Image from "next/image";

type AvatarProps = {
  name: string;
  src?: string;
  initials?: string;
  size?: number;
  className?: string;
};

export function Avatar({
  name,
  src,
  initials,
  size = 40,
  className = "",
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;
  const fallback =
    initials ??
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  const dimensionClass =
    size === 40
      ? "w-10 h-10"
      : size === 48
        ? "w-12 h-12"
        : size === 56
          ? "w-14 h-14"
          : `w-10 h-10`;
  const fontClass = size >= 48 ? "font-headline-md" : "font-label-md";

  if (showImage) {
    return (
      <Image
        alt={name}
        src={src}
        width={size}
        height={size}
        unoptimized
        onError={() => setErrored(true)}
        className={`${dimensionClass} rounded-full object-cover border border-outline-variant/20 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dimensionClass} rounded-full bg-surface-container-highest flex items-center justify-center text-primary ${fontClass} border border-outline-variant/20 ${className}`}
    >
      {fallback || "?"}
    </div>
  );
}
