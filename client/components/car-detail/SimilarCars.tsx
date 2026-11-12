import React from "react";
import CarCard from "@/components/CarCard";
import type { ApiCar } from "@/lib/api-types";

/**
 * The only cards on the page: other cars a buyer would compare this one with.
 * A snap rail with a peek on phones, a two-up grid from sm. Hidden when fewer
 * than two cars match, because a single lonely card reads as a mistake.
 */
export default function SimilarCars({ cars }: { cars: ApiCar[] }) {
  if (cars.length < 2) return null;
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scroll-padding-inline:1rem] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      {cars.map((c) => (
        <li key={c.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
          <CarCard car={c} />
        </li>
      ))}
    </ul>
  );
}
