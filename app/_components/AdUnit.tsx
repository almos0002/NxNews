import { getAd } from "@/lib/ads";
import AdSlot from "./AdSlot";

type AdVariant = "leaderboard" | "billboard" | "rectangle" | "halfpage" | "fluid";

interface Props {
  variant?: AdVariant;
  className?: string;
}

export default async function AdUnit({ variant = "leaderboard", className }: Props) {
  const ad = await getAd(variant);

  if (ad && !ad.enabled) return null;

  if (ad?.code) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: ad.code }}
      />
    );
  }

  return <AdSlot variant={variant} className={className} />;
}
