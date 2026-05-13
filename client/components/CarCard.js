/**
 * CarCard — Reusable card component for the car listing grid
 *
 * Displays a car's first image, title, brand, year, and price.
 * Clicking the card navigates to the full detail page.
 */
import Link from "next/link";

export default function CarCard({ car }) {
  // Use the first image or a placeholder gradient if no images
  const hasImage = car.images && car.images.length > 0;

  return (
    <Link
      href={`/cars/${car._id}`}
      className="group block rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {hasImage ? (
          <img
            src={car.images[0].url}
            alt={car.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Gradient placeholder when no image
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-3xl">🚗</span>
          </div>
        )}

        {/* Year badge overlaid on the image */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm">
          {car.year}
        </span>
      </div>

      {/* Text content */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          {car.brand}
        </p>
        <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {car.title}
        </h3>
        <p className="mt-2 text-lg font-bold text-foreground">
          ₹{car.price.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
