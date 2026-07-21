const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadVideo(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "gym_exercises");
  formData.append("resource_type", "video");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    );

    // Progress track karo
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status === 200) {
        resolve(res.secure_url); // Cloudinary video URL
      } else {
        reject(new Error(res.error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export function getVideoThumbnail(videoUrl) {
  // Cloudinary auto thumbnail generate karta hai
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_0,w_400,h_300,c_fill/")
    .replace(".mp4", ".jpg");
}
