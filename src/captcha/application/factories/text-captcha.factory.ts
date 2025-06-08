import { Canvas, CanvasRenderingContext2D, FontLibrary } from 'skia-canvas';
import { CaptchaPortFactory } from './port/captcha-port.factory';

export class TextCaptchaFactory implements CaptchaPortFactory {
  private canvas: Canvas;
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private text: string;

  public constructor() {
    this.width = 300;
    this.height = 120;
    this.canvas = new Canvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
  }

  public generate(): TextCaptchaFactory {
    this.text = this.randomAlphanumeric(7, 7);

    FontLibrary.use('Poppins', ['/app/resources/fonts/Poppins/*.ttf']);
    FontLibrary.use('Roboto', ['/app/resources/fonts/Roboto/static/*.ttf']);
    FontLibrary.use('Bitter', ['/app/resources/fonts/Bitter/static/*.ttf']);

    this.ctx.fillStyle = `hsl(${Math.random() * 360}, 0%, 100%)`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.addAlphanumeric(40);
    this.addTextDistortionRendering();
    this.addNoiseLines(5);
    this.addNoisePoints(8);
    this.addNoiseCurves(5);
    this.applyWaveDistortion();
    this.applyNoise();
    //.applySkew();

    return this;
  }

  public async toDataURL(): Promise<string> {
    return await this.canvas.toDataURL('webp');
  }

  public async toBuffer(): Promise<Buffer> {
    return await this.canvas.toBuffer('webp');
  }

  public getCanvas(): Canvas {
    return this.canvas;
  }

  get answer(): string {
    return this.text;
  }

  private addTextDistortionRendering(): TextCaptchaFactory {
    const xStart = 20;
    this.ctx.beginPath();
    this.ctx.font = 'bold italic 45px Bitter';
    this.ctx.fillStyle = `rgba(38, 50, 84, 0.87)`;
    console.log(' ------------->>>>>>>>>>>>>>> ', this.text);
    for (let i = 0; i < this.text.length; i++) {
      const x = xStart + i * 38;
      const y = Math.floor(65 + Math.random() * (this.height - 90));
      this.ctx.fillText(this.text[i], x, y);
    }
    this.ctx.save();
    this.ctx.restore();
    return this;
  }

  private addNoisePoints(total: number = 10): TextCaptchaFactory {
    const points = this.generateUniquePoints(this.width, this.height, total);

    this.ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      this.ctx.beginPath();
      this.ctx.arc(x, y, Math.floor(Math.random() * 30) + 10, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(144, 98, 98, 0.3)`;
      this.ctx.fill();
    }

    return this;
  }

  private addAlphanumeric(total: number = 15): TextCaptchaFactory {
    // random alphanumeric

    function generateUniquePoints(width, height, total) {
      const uniquePoints = new Set();

      while (uniquePoints.size < total) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        uniquePoints.add(`${x},${y}`);
      }

      return Array.from(uniquePoints).map((point: string) => {
        const [x, y] = point.split(',').map(Number);
        return { x, y };
      });
    }

    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.ctx.beginPath();
    this.ctx.font = 'blond 12px Sans-serif';
    this.ctx.fillStyle = `rgba(156, 141, 141, 0.94)`;

    const points = generateUniquePoints(this.width, this.height, total);
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      const text = alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
      this.ctx.fillText(text, x, y);
    }
    this.ctx.save();
    this.ctx.restore();

    return this;
  }

  private addNoiseLines(total: number = 5): TextCaptchaFactory {
    this.ctx.beginPath();
    this.ctx.strokeStyle = `rgba(185, 152, 152, 0.2)`;
    this.ctx.shadowColor = `rgba(185, 152, 152, 0.2)`;
    this.ctx.shadowBlur = 20;
    const points = this.generateUniquePoints(this.width, this.height, total);

    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(Math.random() * this.width, Math.random() * this.height);
      this.ctx.lineWidth = 1 + Math.random() * 2;
      this.ctx.stroke();
    }

    this.ctx.closePath();

    return this;
  }

  private addNoiseCurves(total: number = 10): TextCaptchaFactory {
    for (let i = 0; i < total; i++) {
      this.ctx.beginPath();
      const startX = Math.random() * this.width;
      const startY = Math.random() * this.height;
      const controlX = Math.random() * this.width;
      const controlY = Math.random() * this.height;
      const endX = Math.random() * this.width;
      const endY = Math.random() * this.height;

      // Dibujar una curva Bezier cuadrática
      this.ctx.moveTo(startX, startY);
      this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);

      this.ctx.strokeStyle = `rgba(144, 98, 98, 0.3)`;
      this.ctx.lineWidth = 1 + Math.random() * 2;
      this.ctx.stroke();
    }

    return this;
  }

  private applyWaveDistortion(): TextCaptchaFactory {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const tempData = new Uint8ClampedArray(imageData.data);

    const amplitude = 8;
    const frequency = 0.1;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const displacement = Math.sin(y * frequency) * amplitude;
        const newX = Math.floor(x + displacement) % this.width;

        if (newX >= 0 && newX < this.width) {
          const index = (y * this.width + x) * 4;
          const newIndex = (y * this.width + newX) * 4;

          imageData.data[index] = tempData[newIndex];
          imageData.data[index + 1] = tempData[newIndex + 1];
          imageData.data[index + 2] = tempData[newIndex + 2];
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
    return this;
  }

  private applyNoise(): TextCaptchaFactory {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const rand = Math.random() * 20;
      imageData.data[i] += rand;
      imageData.data[i + 1] += rand;
      imageData.data[i + 2] += rand;
    }

    this.ctx.putImageData(imageData, 0, 0);
    return this;
  }

  private applySkew(): TextCaptchaFactory {
    this.ctx.setTransform(1, 0.3 * Math.random(), 0.1 * Math.random(), 1, 0, 0);
    return this;
  }

  private randomAlphanumeric(min = 6, max = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

  private generateUniquePoints(width, height, total) {
    const uniquePoints = new Set();

    while (uniquePoints.size < total) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      uniquePoints.add(`${x},${y}`);
    }

    return Array.from(uniquePoints).map((point: string) => {
      const [x, y] = point.split(',').map(Number);
      return { x, y };
    });
  }
}
