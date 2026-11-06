import { apiHandler, requireDealer } from "@/lib/guards";
import {
  fetchVehicleDetails,
  isValidRegistrationNumber,
} from "@/lib/vahan";

// GET /api/cars/verify-vehicle/:regNo — dealer only: mock RTO/Vahan lookup
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regNo: string }> }
) {
  return apiHandler(async () => {
    await requireDealer();
    const { regNo } = await params;

    if (!regNo) {
      return Response.json(
        { message: "Registration number is required" },
        { status: 400 }
      );
    }

    const cleanReg = regNo.replace(/[\s-]/g, "").toUpperCase();
    if (!isValidRegistrationNumber(cleanReg)) {
      return Response.json(
        { message: "Invalid vehicle registration number format" },
        { status: 400 }
      );
    }

    const vehicleData = await fetchVehicleDetails(cleanReg);
    return Response.json(vehicleData);
  });
}
