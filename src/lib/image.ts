// Client-side image compression before upload, mirroring the original
// artifact's resizeImage(): downscale to maxDim on the longer side and
// re-encode as JPEG so photos stay small and cheap to store/serve.
export function resizeImageToBlob(
  file: File,
  maxDim = 480,
  quality = 0.72
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nepavyko nuskaityti failo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Netinkamas paveikslėlio failas."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas nepalaikomas."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Nepavyko suspausti paveikslėlio."));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
