/**
 * Adds a small corner mark to a downloaded card.
 *
 * This is a soft gate, not DRM: the card's own image URL is public and a
 * determined visitor can always fetch it directly. It exists so that "clean
 * download" is a real difference between free and paid — before this, the
 * pricing page advertised no-watermark while nothing was ever marked — and so
 * the shared card carries the site's name. Enforcing it properly would mean
 * serving every card through a signed, server-composited endpoint.
 */

const WATERMARK_TEXT = 'mewtrucard.com';

export async function applyDownloadWatermark(imageUrl: string): Promise<string> {
  if (typeof document === 'undefined' || !imageUrl) return imageUrl;

  try {
    const image = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');
    if (!context) return imageUrl;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Scale the mark to the image so it reads the same on a thumbnail and on a
    // full-resolution export.
    const fontSize = Math.max(14, Math.round(canvas.width * 0.028));
    const padding = Math.round(fontSize * 0.6);
    const margin = Math.round(fontSize * 0.9);

    context.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    context.textBaseline = 'middle';

    const textWidth = context.measureText(WATERMARK_TEXT).width;
    const pillWidth = textWidth + padding * 2;
    const pillHeight = fontSize + padding;
    const x = canvas.width - pillWidth - margin;
    const y = canvas.height - pillHeight - margin;

    context.fillStyle = 'rgba(15, 18, 26, 0.42)';
    roundedRect(context, x, y, pillWidth, pillHeight, pillHeight / 2);
    context.fill();

    context.fillStyle = 'rgba(255, 255, 255, 0.92)';
    context.fillText(WATERMARK_TEXT, x + padding, y + pillHeight / 2);

    return canvas.toDataURL('image/png');
  } catch (error) {
    // A watermark is not worth failing a download over.
    console.error('Could not apply watermark:', error);
    return imageUrl;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Without this the canvas is tainted by the R2-hosted card and toDataURL throws.
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${url}`));
    image.src = url;
  });
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
