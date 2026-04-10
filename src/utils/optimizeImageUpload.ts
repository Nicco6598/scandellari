const MAX_DIMENSION = 1920;
const MAX_ORIGINAL_BYTES = 450 * 1024;
const MIN_SAVINGS_RATIO = 0.04;
const TRANSPARENCY_SAMPLE_SIZE = 64;

type LoadedImage = {
  height: number;
  revoke?: () => void;
  source: CanvasImageSource;
  width: number;
};

function shouldOptimize(file: File) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

function getOutputName(fileName: string, mimeType: string) {
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName}.${extension}`;
}

function getTargetDimensions(width: number, height: number) {
  const longestSide = Math.max(width, height);
  if (longestSide <= MAX_DIMENSION) {
    return { height, width };
  }

  const scale = MAX_DIMENSION / longestSide;
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    return {
      height: bitmap.height,
      revoke: () => bitmap.close(),
      source: bitmap,
      width: bitmap.width,
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Impossibile leggere il file ${file.name}.`));
      element.src = objectUrl;
    });

    return {
      height: image.naturalHeight,
      revoke: () => URL.revokeObjectURL(objectUrl),
      source: image,
      width: image.naturalWidth,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

  if (!blob) {
    throw new Error('Impossibile generare il file immagine ottimizzato.');
  }

  return blob;
}

function hasTransparency(source: CanvasImageSource, width: number, height: number) {
  const sampleCanvas = createCanvas(TRANSPARENCY_SAMPLE_SIZE, TRANSPARENCY_SAMPLE_SIZE);
  const context = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  context.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  context.drawImage(source, 0, 0, width, height, 0, 0, sampleCanvas.width, sampleCanvas.height);

  const { data } = context.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 250) return true;
  }

  return false;
}

export async function optimizeImageUpload(file: File): Promise<File> {
  if (!shouldOptimize(file)) return file;

  const loadedImage = await loadImage(file);

  try {
    const originalNeedsResize = loadedImage.width > MAX_DIMENSION || loadedImage.height > MAX_DIMENSION;
    const originalIsHeavy = file.size > MAX_ORIGINAL_BYTES;

    if (!originalNeedsResize && !originalIsHeavy) {
      return file;
    }

    const { width, height } = getTargetDimensions(loadedImage.width, loadedImage.height);
    const transparent = file.type === 'image/png' && hasTransparency(loadedImage.source, loadedImage.width, loadedImage.height);
    const outputType = transparent ? 'image/png' : 'image/webp';
    const quality = transparent ? undefined : 0.8;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(loadedImage.source, 0, 0, loadedImage.width, loadedImage.height, 0, 0, width, height);

    const optimizedBlob = await canvasToBlob(canvas, outputType, quality);
    const savingsRatio = (file.size - optimizedBlob.size) / file.size;

    if (optimizedBlob.size >= file.size || savingsRatio < MIN_SAVINGS_RATIO) {
      return file;
    }

    return new File([optimizedBlob], getOutputName(file.name, outputType), {
      lastModified: Date.now(),
      type: outputType,
    });
  } finally {
    loadedImage.revoke?.();
  }
}
