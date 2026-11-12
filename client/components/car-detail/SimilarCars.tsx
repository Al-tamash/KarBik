import React from "react";
import CarCard from "@/components/CarCard";
import type { ApiCar } from "@/lib/api-types";

/**
 * Cards for cars a buyer would weigh against the one in hand (car detail) or add to a
 * comparison (compare page). A snap rail with a peek on phones; a grid from sm.
 * Hidden when fewer than two cars match, because a single lonely card reads as a mistake.
 * `wide` is for a full-width section: 2, 3 then 4 columns instead of 2.
 */
export default function SimilarCars({ cars, wide = false }: { cars: ApiCar[]; wide?: boolean }) {
  if (cars.length < 2) return null;
  const grid = wide ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2";
  return (
    <ul
      className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scroll-padding-inline:1rem] [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden ${grid}`}
    >
      {cars.map((c) => (
        <li key={c.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
          <CarCard car={c} />
        </li>
      ))}
    </ul>
  );
}
