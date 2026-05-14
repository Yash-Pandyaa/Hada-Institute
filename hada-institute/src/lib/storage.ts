import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function signUploadParams(folder: string) {
  configureCloudinary();

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder,
    resource_type: "auto",
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return {
    ...params,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    signature,
  };
}

export function getSecurePdfUrl(pdfKeyOrUrl: string) {
  if (!pdfKeyOrUrl) {
    return "";
  }

  if (pdfKeyOrUrl.startsWith("https://")) {
    return pdfKeyOrUrl;
  }

  configureCloudinary();

  return cloudinary.url(pdfKeyOrUrl, {
    resource_type: "raw",
    secure: true,
    sign_url: true,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 10,
  });
}
