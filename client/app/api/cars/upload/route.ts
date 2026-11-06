import { apiHandler, requireDealer } from "@/lib/guards";
import { parseFormData, validateFiles } from "@/lib/form";
import { uploadCarImage } from "@/lib/cloudinary-server";

// POST /api/cars/upload — dealer only: immediate image uploads (wizard step 2)
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();

    const { fileGroups } = await parseFormData(request);
    const files = fileGroups["images"] ?? [];

    if (files.length === 0) {
      return Response.json({ message: "No images uploaded" }, { status: 400 });
    }
    validateFiles(files);

    const images = [];
    for (const file of files) {
      images.push(await uploadCarImage(Buffer.from(await file.arrayBuffer()), user.id));
    }

    return Response.json({ images });
  });
}
