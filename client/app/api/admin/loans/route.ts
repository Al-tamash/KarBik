import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { loanLeads, cars, user } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";

/**
 * GET /api/admin/loans
 * WHAT: Returns all used car loan applications for monetization through
 *       fintech aggregator portals (BankSathi, GroMo, or bank DSAs).
 */
export async function GET() {
  return apiHandler(async () => {
    await requireAdmin();

    const leads = await db
      .select({
        id: loanLeads.id,
        name: loanLeads.name,
        phone: loanLeads.phone,
        city: loanLeads.city,
        employmentType: loanLeads.employmentType,
        monthlyIncome: loanLeads.monthlyIncome,
        loanAmountRequested: loanLeads.loanAmountRequested,
        status: loanLeads.status,
        notes: loanLeads.notes,
        createdAt: loanLeads.createdAt,
        carId: cars.id,
        carTitle: cars.title,
        carBrand: cars.brand,
        carPrice: cars.price,
        userEmail: user.email,
      })
      .from(loanLeads)
      .leftJoin(cars, eq(loanLeads.car, cars.id))
      .leftJoin(user, eq(loanLeads.userId, user.id))
      .orderBy(desc(loanLeads.createdAt))
      .limit(100);

    return { loans: leads };
  });
}

/**
 * PATCH /api/admin/loans
 * WHAT: Updates the status and payout/disbursal notes of a loan application.
 */
export async function PATCH(request: Request) {
  return apiHandler(async () => {
    await requireAdmin();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "in_process";
    const notes = typeof body.notes === "string" ? body.notes : "";

    if (!id) {
      return Response.json({ message: "Loan application id is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(loanLeads)
      .set({
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(loanLeads.id, id))
      .returning();

    if (!updated) {
      return Response.json({ message: "Loan application not found" }, { status: 404 });
    }

    return { loan: updated, message: "Loan lead updated successfully" };
  });
}

