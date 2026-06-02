// components/HomeBackground.tsx
// Fixed, full-viewport hero painting behind the homepage. `fixed` keeps it
// static while the cards scroll over it. A soft cream scrim keeps the quiz
// cards and text readable on top of the busy painting.
// Drop the artwork at public/home-bg.jpg (or .webp and update the url below).
export function HomeBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[url('/home-bg.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream-1/85 via-cream-1/70 to-cream-1/85" />
    </div>
  );
}
