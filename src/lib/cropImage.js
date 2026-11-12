// Turns the area picked in the crop dialog into a square JPEG.

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not read this image"));
        image.src = src;
    });
}

/**
 * Draws `area` (in the image's own pixels, as react-easy-crop reports it) of
 * the image at `src` onto a size × size canvas and returns it as a JPEG File.
 */
export async function cropToJpeg(src, area, { size = 512, quality = 0.9, name = "profile.jpg" } = {}) {
    const image = await loadImage(src);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // JPEG has no transparency: without this, a transparent PNG turns black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Could not crop this image");
    return new File([blob], name, { type: "image/jpeg" });
}
