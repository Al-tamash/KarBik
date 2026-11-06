import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { loanLeads, cars } from "@/lib/db/schema";
import { apiHandler, getSessionUser } from "@/lib/guards";
import { normalizeIndianMobile } from "@/lib/inquiry-helpers";

/**
 * POST /api/loans/apply
 * 
 * WHAT: Captures used car loan / finance application leads.
 * WHY: Auto financing commissions (1.5% - 2.5% of disbursed loan value)
 *      represent 40-50% of revenue in top car marketplaces.
 *      These leads are routed directly to BankSathi, GroMo, or local bank DSAs.
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const sessionUser = await getSessionUser();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "Hyderabad";
    const employmentType =
      typeof body.employmentType === "string" ? body.employmentType : "salaried";
    const monthlyIncome =
      typeof body.monthlyIncome === "number"
        ? body.monthlyIncome
        : parseInt(String(body.monthlyIncome || "30000"), 10);
    const loanAmountRequested =
      typeof body.loanAmountRequested === "number"
        ? body.loanAmountRequested
        : parseInt(String(body.loanAmountRequested || "300000"), 10);
    const carId = typeof body.carId === "string" && body.carId.length === 36 ? body.carId : null;

    const normalizedPhone = normalizeIndianMobile(phone);

    if (!name || !phone || !city) {
      return Response.json(
        { message: "Name, phone, and city are required." },
        { status: 400 }
      );
    }

    if (!normalizedPhone) {
      return Response.json(
        { message: "Please provide a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Rate limiting: 1 application per phone per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentApp] = await db
      .select({ id: loanLeads.id })
      .from(loanLeads)
      .where(
        and(
          eq(loanLeads.phone, normalizedPhone),
          gte(loanLeads.createdAt, oneDayAgo)
        )
      )
      .limit(1);

    if (recentApp) {
      return Response.json(
        {
          message:
            "A loan application for this mobile number was already received today. Our loan specialist will call you shortly.",
          applicationId: recentApp.id,
        },
        { status: 200 }
      );
    }

    // Verify car existence if attached
    if (carId) {
      const [car] = await db
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.id, carId))
        .limit(1);
      if (!car) {
        // Continue without car if not found
      }
    }

    const [lead] = await db
      .insert(loanLeads)
      .values({
        name,
        phone: normalizedPhone,
        city,
        employmentType,
        monthlyIncome,
        loanAmountRequested,
        car: carId,
        status: "new",
        notes: "Applied via KarBik Live EMI Calculator",
        userId: sessionUser?.id || null,
      })
      .returning();

    return Response.json(
      {
        message: "Loan application received successfully! A representative will call you in 15 minutes.",
        leadId: lead.id,
      },
      { status: 201 }
    );
  });
}

