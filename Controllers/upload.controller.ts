import type { Request, Response } from "express";
import cloudinary from "@/Services/cloudinary.service";
import { prisma } from "@/lib/prisma";

export const UploadServiceImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const profile = await prisma.freelancer_profile.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Freelancer profile not found." });
    }

    const folderName = profile.user.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    const folder = `slowwork/services/${folderName}`;

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 1280, height: 720, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file!.buffer);
      }
    );

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Image upload failed." });
  }
};
