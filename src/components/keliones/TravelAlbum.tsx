import { LightboxImage } from "@/components/LightboxImage";
import { AddTravelPhotosButton } from "@/components/keliones/AddTravelPhotosButton";
import { deleteTravelPhoto } from "@/app/keliones/actions";
import type { TravelPhoto } from "@/types/database";

const MAX_PHOTOS = 5;

// A small photo album per trip: up to 5 photos in a tidy grid (3 across on
// narrow screens, all 5 in a row once there's room), each opening full-size
// in the shared lightbox. A dashed "+" tile fills the next open slot until
// the cap is reached.
export function TravelAlbum({
  travelId,
  country,
  photos,
}: {
  travelId: string;
  country: string;
  photos: TravelPhoto[];
}) {
  if (photos.length === 0) {
    return (
      <div className="mt-2.5">
        <AddTravelPhotosButton travelId={travelId} max={MAX_PHOTOS} className="h-14 w-14" />
      </div>
    );
  }

  return (
    <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
      {photos.map((p) => (
        <div key={p.id} className="relative aspect-square">
          <LightboxImage src={p.url} alt={country} className="h-full w-full rounded-lg object-cover cursor-zoom-in" />
          <form action={deleteTravelPhoto.bind(null, p.id)} className="absolute -right-1.5 -top-1.5">
            <button
              type="submit"
              title="Ištrinti nuotrauką"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-[10px] text-ink-faint hover:text-ember-ink"
            >
              ✕
            </button>
          </form>
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <div className="aspect-square">
          <AddTravelPhotosButton travelId={travelId} max={MAX_PHOTOS - photos.length} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
