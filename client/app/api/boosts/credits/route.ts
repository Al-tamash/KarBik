import { apiHandler, requireDealer } from "@/lib/guards";
import { getBoostCredits } from "@/lib/boost-credits";

// GET /api/boosts/credits — how many plan boost credits the dealer has left
export async function GET() {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { total, used, remaining } = await getBoostCredits(user.id);
    return Response.json({ total, used, remaining });
  });
}
