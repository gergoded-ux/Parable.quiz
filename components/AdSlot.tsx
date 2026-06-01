// components/AdSlot.tsx
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: 'auto' | 'rectangle' | 'horizontal' }) {
  if (!ADSENSE_CLIENT) return null;
  return (
    <div className="my-6 mx-8 text-center">
      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        style={{ display: 'block' }}
      />
    </div>
  );
}
