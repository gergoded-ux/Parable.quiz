// components/HomeBackground.tsx
// Fixed, full-viewport hero painting behind the homepage. `fixed` keeps it
// static while the cards scroll over it. A soft cream scrim keeps the quiz
// cards and text readable on top of the busy painting.
// Drop the artwork at public/home-bg.webp.
export function HomeBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Set the image via inline style: Tailwind v4 does not reliably generate
          an arbitrary background-image utility from a quoted URL. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home-bg.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream-1/70 via-cream-1/40 to-cream-1/65" />
    </div>
  );
}
