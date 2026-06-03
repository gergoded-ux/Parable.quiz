"use client";

import * as React from "react";

/**
 * Renders `text` on a SINGLE line, shrinking the font size until the whole
 * string fits its container. The width is measured at runtime (the only
 * reliable way, since character widths vary), then the size is scaled
 * proportionally and clamped to [min, max]. Re-fits on container resize and
 * after web fonts finish loading (Inter loads async, which changes widths).
 *
 * Used by the quiz cards so long titles never wrap to a second line.
 */
export function FitText({
  text,
  className,
  max = 15,
  min = 5,
}: {
  text: string;
  className?: string;
  /** largest font size in px (used when the title easily fits) */
  max?: number;
  /** smallest font size in px (floor for very long titles) */
  min?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const applied = React.useRef(max);
  const [size, setSize] = React.useState(max);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      // Measure the natural one-line width at the max size.
      const prev = el.style.fontSize;
      el.style.fontSize = `${max}px`;
      const available = el.clientWidth - 1; // visible box width (1px breathing room)
      const needed = el.scrollWidth; // full content width (overflows the box)
      el.style.fontSize = prev;
      if (available <= 0 || needed <= 0) return;

      const next =
        needed <= available
          ? max
          : Math.max(min, Math.min(max, (max * available) / needed));

      // Avoid redundant renders / observer feedback loops.
      if (Math.abs(next - applied.current) > 0.3) {
        applied.current = next;
        setSize(next);
      }
    };

    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(el);

    // Re-fit once web fonts are ready (metrics differ from fallback fonts).
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) fonts.ready.then(fit).catch(() => {});

    return () => ro.disconnect();
  }, [text, max, min]);

  return (
    <span
      ref={ref}
      title={text}
      className={className}
      style={{
        display: "block",
        fontSize: `${size}px`,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
      }}
    >
      {text}
    </span>
  );
}
