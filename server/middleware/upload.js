/**
 * File Upload Middleware (Multer)
 *
 * When a user submits a form with images, the browser sends the data as
 * "multipart/form-data" — this is different from regular JSON. Express
 * can't parse it by default. Multer is a middleware that handles this.
 *
 * Think of Multer like a mailroom clerk:
 * - Regular JSON = a text email → Express handles it
 * - File uploads = a package with attachments → Multer opens the package,
 *   pulls out the files, and makes them available as req.files
 *
 * We use memoryStorage because we're NOT saving files to the server's disk.
 * Instead, we keep them in RAM temporarily, upload them to Cloudinary,
 * and then they're garbage-collected from memory.
 */
import multer from "multer";

// memoryStorage = files are stored as Buffer objects in memory
// diskStorage = files are saved to a folder on the server's hard drive
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  // Limit file size to 5MB per image
  // 5 * 1024 * 1024 = 5,242,880 bytes = 5 megabytes
  limits: { fileSize: 5 * 1024 * 1024 },

  // fileFilter runs for each uploaded file to check if it's allowed
  // We only accept image files (image/jpeg, image/png, image/webp, etc.)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      // cb(null, true) means "accept this file"
      cb(null, true);
    } else {
      // cb(error, false) means "reject this file with an error"
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export default upload;
