import type { SheetVariant } from '../services/crewService';

export const loadImage = (imageDataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler esse look.'));
    image.src = imageDataUrl;
  });

export const cropVariantFromSheet = (
  imageDataUrl: string,
  variantIndex: SheetVariant['index'],
) =>
  new Promise<string>((resolve, reject) => {
    loadImage(imageDataUrl)
      .then((image) => {
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const cellSize = sourceSize / 2;
        const trim = cellSize * 0.035;
        const cropSize = cellSize - trim * 2;
        const column = variantIndex % 2;
        const row = Math.floor(variantIndex / 2);
        const sourceX = (image.naturalWidth - sourceSize) / 2 + column * cellSize + trim;
        const sourceY = (image.naturalHeight - sourceSize) / 2 + row * cellSize + trim;
        const outputSize = Math.floor(cellSize);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context || outputSize <= 0 || cropSize <= 0) {
          reject(new Error('Não foi possível salvar esse look.'));
          return;
        }

        canvas.width = outputSize;
        canvas.height = outputSize;
        context.drawImage(
          image,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          outputSize,
          outputSize,
        );
        resolve(canvas.toDataURL('image/png'));
      })
      .catch(reject);
  });

const getColorDistance = (
  data: Uint8ClampedArray,
  index: number,
  background: { r: number; g: number; b: number },
) => {
  const red = data[index] - background.r;
  const green = data[index + 1] - background.g;
  const blue = data[index + 2] - background.b;
  return Math.sqrt(red * red + green * green + blue * blue);
};

const sampleBackground = (data: Uint8ClampedArray, width: number, height: number) => {
  const sample = Math.max(4, Math.floor(Math.min(width, height) * 0.04));
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const addPixel = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  };

  for (let y = 0; y < sample; y += 1) {
    for (let x = 0; x < sample; x += 1) {
      addPixel(x, y);
      addPixel(width - 1 - x, y);
      addPixel(x, height - 1 - y);
      addPixel(width - 1 - x, height - 1 - y);
    }
  }

  return {
    r: red / count,
    g: green / count,
    b: blue / count,
  };
};

export const removeNeutralBackground = (imageDataUrl: string) =>
  new Promise<string>((resolve, reject) => {
    loadImage(imageDataUrl)
      .then((image) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          reject(new Error('Não foi possível limpar o fundo.'));
          return;
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);

        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = frame;
        const background = sampleBackground(data, width, height);
        const threshold = 54;
        const featherThreshold = 86;
        const visited = new Uint8Array(width * height);
        const queue = new Uint32Array(width * height);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return;

          const pixelIndex = y * width + x;
          if (visited[pixelIndex]) return;
          visited[pixelIndex] = 1;

          const dataIndex = pixelIndex * 4;
          if (data[dataIndex + 3] > 0 && getColorDistance(data, dataIndex, background) <= threshold) {
            queue[tail] = pixelIndex;
            tail += 1;
          }
        };

        for (let x = 0; x < width; x += 1) {
          enqueue(x, 0);
          enqueue(x, height - 1);
        }

        for (let y = 0; y < height; y += 1) {
          enqueue(0, y);
          enqueue(width - 1, y);
        }

        while (head < tail) {
          const pixelIndex = queue[head];
          head += 1;
          const dataIndex = pixelIndex * 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          data[dataIndex + 3] = 0;
          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        for (let y = 1; y < height - 1; y += 1) {
          for (let x = 1; x < width - 1; x += 1) {
            const pixelIndex = y * width + x;
            const dataIndex = pixelIndex * 4;
            if (data[dataIndex + 3] === 0) continue;

            const hasTransparentNeighbor =
              data[((y - 1) * width + x) * 4 + 3] === 0 ||
              data[((y + 1) * width + x) * 4 + 3] === 0 ||
              data[(y * width + x - 1) * 4 + 3] === 0 ||
              data[(y * width + x + 1) * 4 + 3] === 0;

            if (!hasTransparentNeighbor) continue;

            const distance = getColorDistance(data, dataIndex, background);
            if (distance <= featherThreshold) {
              const alphaRatio = Math.max(0, (distance - threshold) / (featherThreshold - threshold));
              data[dataIndex + 3] = Math.round(data[dataIndex + 3] * alphaRatio);
            }
          }
        }

        context.putImageData(frame, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      })
      .catch(reject);
  });
