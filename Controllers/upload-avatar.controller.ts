import type { Request, Response } from "express";
import cloudinary from "@/Services/cloudinary.service";
import { prisma } from "@/lib/prisma";

export const UploadAvatarController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const folderName = user.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    const folder = `slowwork/avatars/${folderName}`;

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
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

    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: result.secure_url },
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({ message: "Avatar upload failed." });
  }
};
