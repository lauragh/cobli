import { Component, ElementRef, OnInit, AfterViewInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image-service';
import { UserService } from 'src/app/services/user.service';
import { ImageUser } from 'src/app/interfaces/image-interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit{
  imageId!: string;
  userId!: string;
  image!: ImageUser;
  offsetX!: number;
  offsetY!: number;
  colorPickerTop!: any;
  colorPickerBottom!: any;
  container!: any;
  isDragging: boolean = false;
  prevX: number = 0;
  newX!: any;
  move: boolean = false;
  bgColors: any;
  gradientColors: any[] = [];
  canvas!: HTMLCanvasElement;
  ctx!: any;
  zoomInBtn!: any;
  zoomOutBtn!: any;
  img!: any;
  zoomNum: number = 1;
  numTag: number = 0;
  tagContainer!: any;
  canvas2!: HTMLCanvasElement;
  pixelX: number = 0;
  pixelY: number = 0;

  @ViewChild('spectrum') spectrum!: ElementRef;
  @ViewChild('color') color!: ElementRef;
  @ViewChild('muestra') muestra!: ElementRef;
  @ViewChild('hexadecimal') hexadecimal!: ElementRef;
  @ViewChild('hex') hex!: ElementRef;
  @ViewChild('rgb') rgb!: ElementRef;
  @ViewChild('hsl') hsl!: ElementRef;
  @ViewChild('hsv') hsv!: ElementRef;

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private renderer2: Renderer2
   ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.bgColors = document.querySelector('.bgColors');
      this.getColor();
      this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
      this.loadCanvas();

      this.tagContainer = document.getElementById('tagContainer')!;

      this.renderer2.listen(this.tagContainer, 'click', (event) => this.getPositionClicks(event));
      this.renderer2.listen(this.tagContainer, 'mousemove', (event) => {
        const x = event.layerX;
        const y = event.layerY;
        this.drawZoomCanvas(x, y);
      });

      this.zoomInBtn = document.getElementById("lupaMas");
      this.zoomOutBtn = document.getElementById("lupaMenos");

      this.renderer2.listen(this.zoomInBtn, 'click', (event) => this.zoomIn('in'));
      this.renderer2.listen(this.zoomOutBtn, 'click', (event) => this.zoomIn('out'));

    }, 200);
    setTimeout(() => {
      this.colorPickerTop = document.getElementById('pickerTop');
      this.colorPickerBottom = document.getElementById('pickerBottom');
      this.container = document.getElementById('colorPickerContainer');

      this.renderer2.listen(this.container, 'mousedown', (event) => this.dragColorPicker(event));
      this.renderer2.listen(this.container, 'mousemove', (event) => this.moveColorPicker(event));
      this.renderer2.listen(this.container, 'mouseup', (event) => this.stopDrag(event));
    }, 1000);
  }

  ngOnInit() {
    const logged = this.route.snapshot.paramMap.has('imageId');
    if(logged){
      this.loadUser(() => {
        this.getImage();
      });
    }
    else{

    }
  }

  loadUser(callback: () => void): void {
    this.userId = this.authService.getUid();
    console.log('usuario',this.userId);

    callback();
  }

  getImage() {
    this.route.paramMap.subscribe(params => {
      this.imageId = params.get('imageId')!;
      this.imageService.getImage(this.userId, this.imageId)
      .subscribe({
        next: res => {
          this.image = res.image;
          console.log(this.image);
        },
        error: error => {
          console.log(error);
        }
      });
    });
  }

  loadCanvas() {
    this.img = new Image();
    this.img.crossOrigin = "anonymous";

    // this.img.src = `data:image/png;base64,${this.image.img}`;
    this.img.src = '../../../assets/img/ejemplo.png';
    // this.img.src = '../../../assets/img/image.png';
    // this.img.src = `https://media.discordapp.net/attachments/1052568195493548082/1083733464571986010/paisaje-e1549600034372.png`;
    this.img.style.imageRendering = 'auto';
    this.ctx = this.canvas.getContext("2d")!;

    this.img.addEventListener("load", () => {
      this.canvas.width = this.img.width;
      this.canvas.height = this.img.height;
      this.canvas.style.overflow = "auto";
      // this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
      // this.ctx.drawImage(this.img, 0, 0);
      console.log('ancho y alto al cargar', this.canvas.width, this.canvas.height);
    });
  }

  zoomIn(tipo: string){
    if(tipo === 'in'){
      this.zoomNum += 0.10;
    }
    else {
      this.zoomNum -= 0.10;
    }
    if (this.zoomNum < 2 && this.zoomNum >= 1) {
      const newWidth = this.img.width * this.zoomNum;
      const newHeight = this.img.height * this.zoomNum;
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const offsetX = (centerX - this.canvas.scrollLeft) * (this.zoomNum - 1);
      const offsetY = (centerY - this.canvas.scrollTop) * (this.zoomNum - 1);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.img,
        0, 0, this.img.width, this.img.height,
        -offsetX, -offsetY, newWidth, newHeight);
    }
  }

  drawZoomCanvas(x: number ,y: number){
    this.canvas2 = document.getElementById('canvas2')! as HTMLCanvasElement;
    var ctx = this.canvas2.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = '../../../assets/img/ejemplo.png';

    // console.log(this.tagContainer.width, this.tagContainer.height);
    const tamContainerX = this.tagContainer.offsetWidth;
    const tamContainerY = this.tagContainer.offsetHeight;
    const displX = Math.trunc((tamContainerX - this.canvas.width)/2);
    const displY = Math.trunc((tamContainerY - this.canvas.height)/2);
    // console.log(x, displX, y, displY);

    img.addEventListener("load", () => {
      // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      ctx.drawImage(img,
        Math.min(Math.max(0, x - displX - 5), img.width - 10),
        Math.min(Math.max(0, y - displY - 5), img.height - 10),
        3, 3,
        0, 0,
        150, 150);
        this.pixelX =  x - displX - 5;
        this.pixelY = y - displY - 5;
    });
  }

  pickColorPoint(x:number, y: number) {
    const tamContainerX = this.tagContainer.offsetWidth;
    const tamContainerY = this.tagContainer.offsetHeight;
    // console.log(this.tagContainer.width, this.tagContainer.height);
    const displX = Math.trunc((tamContainerX - this.canvas.width)/2);
    const displY = Math.trunc((tamContainerY - this.canvas.height)/2);
    // console.log(x, displX, y, displY);
    const pixel = this.ctx.getImageData(x - displX, y - displY, this.canvas.width, this.canvas.height);
    const data = pixel.data;

    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

    this.getZoomedPixels()

    const darkness = this.checkDarkness(data[0], data[1], data[2], data[3]/255);
    this.createTag(x,y,darkness);

    return rgba;
  }

  getZoomedPixels() {
    const ctx = this.canvas2.getContext('2d')!;
    const pixelData = ctx.getImageData(0, 0, 150, 150).data; // seleccionar la región de 6 píxeles
    let rgb = {r:0,g:0,b:0},
        count = 0;

    for (let i = 0; i < pixelData.length; i += 4) { // iterar sobre los valores de los píxeles
      ++count;
      rgb.r += pixelData[i];
      rgb.g += pixelData[i+1];
      rgb.b += pixelData[i+2];
    }

    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    this.rgb.nativeElement.innerHTML = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    console.log(this.rgb.nativeElement.innerHTML);
    this.hex.nativeElement.innerHTML = this.rgbToHex(this.rgb.nativeElement.innerHTML);
    const { h, s, l } = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.hsl.nativeElement.innerHTML = "hsl(" + h + ", " + s + "%, " + l + "%)";
    const { h2, s2, v2 } = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.hsv.nativeElement.innerHTML = "hsv(" + h2 + ", " + s2 + ", " + v2 + ")";

  }

  getPositionClicks(event: any){
    const bounding = this.tagContainer.getBoundingClientRect();
    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;
    // console.log(x,y);
    this.pickColorPoint(x,y);
  }

  createTag(x:number, y:number, darkness: string){
    this.numTag += 1;
    const tagContainer = document.getElementById('tagContainer')!;

    const div = this.renderer2.createElement('div');
    const contenido = this.renderer2.createText(this.numTag.toString());
    this.renderer2.addClass(div, 'nums');

    // this.renderer2.setStyle(div, 'color', 'red');
    // this.renderer2.setStyle(div, 'border', '2px solid red');

    this.renderer2.setStyle(div, 'color', darkness);
    this.renderer2.setStyle(div, 'border', '2px solid'+ darkness);


    this.renderer2.setStyle(div, 'position', 'absolute');
    this.renderer2.setStyle(div, 'z-index', '3');

    this.renderer2.setStyle(div, 'left', `${x}px`);
    this.renderer2.setStyle(div, 'top', `${y}px`);
    // console.log('ancho y alto',tagContainer.style.width, tagContainer.style.height);

    this.renderer2.appendChild(div,contenido);
    this.renderer2.appendChild(tagContainer, div);
  }

  checkDarkness(r: number, g: number, b: number, a: number){
    const brightness = r * 0.299 + g * 0.587 + b * 0.114 + (1 - a) * 255;
    return brightness > 186 ? "#000000" : "#FFFFFF";
  }

  getColor(){
    // Analizamos la cadena de texto del estilo para obtener los colores del gradiente
    const style = window.getComputedStyle(this.bgColors);
    const backgroundImage = style.backgroundImage;
    const regex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    let match = regex.exec(backgroundImage);

    while (match) {
      const color = `rgb(${match[1]},${match[2]},${match[3]})`;
      this.gradientColors.push(color);
      match = regex.exec(backgroundImage);
    }
  }

  obtenerColor(event: any){
    const rect = this.container.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const index = Math.round(percent * (this.gradientColors.length - 1));
    const color = this.gradientColors[index];
    console.log(color);
    this.showColor(this.rgbToHex(color));
  }

  rgbToHex(rgb: string) {
    // Extrae los valores de r, g y b de la cadena rgb(r, g, b)
    console.log(rgb);
    const match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    if (!match) {
      throw new Error('Formato de color incorrecto: ' + rgb);
    }
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    // Convierte cada valor a su representación hexadecimal de 2 dígitos
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    // Concatena los valores hexadecimales en una cadena con formato #RRGGBB
    const hex = '#' + rHex + gHex + bHex;

    return hex
  }

  rgbToHsl(r: number, g: number, b: number){
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g: h = (b - r) / d + 2;
          break;
        case b: h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    h = Math.trunc(h * 360);
    s = Math.trunc(s * 100);
    l = Math.trunc(l * 100);

    return { h, s, l };
  }

  rgbToHsv(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;

    let h2 = 0, s2 = 0, v2 = max;

    if (delta !== 0) {
      s2 = delta / max;
      if (max === r) {
        h2 = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h2 = 60 * (((b - r) / delta) + 2);
      } else {
        h2 = 60 * (((r - g) / delta) + 4);
      }
    }

    h2 = (h2 < 0) ? h2 + 360 : h2;

    h2 = Math.trunc(h2);
    s2 = Math.trunc(s2 * 100);
    v2 = Math.trunc(v2 * 100);

    return { h2, s2, v2 };
  }

  dragColorPicker(event: any){
    this.isDragging = true;
    this.prevX = event.clientX;
    console.log('dragueo');

  }

  moveColorPicker(evento: any){
    if (this.isDragging) {
      this.move = true;
      const diffX = evento.clientX - this.prevX;
      this.prevX = evento.clientX;
      const rect = this.container.getBoundingClientRect();

      const maxXTop = rect.width - this.colorPickerTop.getBoundingClientRect().width;
      // console.log('tamaño max', maxXTop);
      this.newX = this.colorPickerTop.offsetLeft + diffX;
      // console.log('nueva pos x', this.newX);

      if (this.newX < 0) {
        // console.log('limite');
        this.newX = 0;
      }
      else if (this.newX > maxXTop) {
        // console.log('me muevo');
        this.newX = maxXTop;
      }

      this.colorPickerTop.style.left = this.newX + 'px';
      this.colorPickerBottom.style.left = this.newX + 'px';

      this.obtenerColor(evento);

    }
  }



  stopDrag(event: any){
    console.log('paro');
    if(this.move){
        const color = this.muestra.nativeElement.style.backgroundColor;
        this.rgbToHex(color);
    }
    this.isDragging = false;
    this.move = false;
  }

  showColor(color: string){
    this.renderer2.setStyle(this.muestra.nativeElement, 'background-color', color);
    this.hexadecimal.nativeElement.innerHTML = color;
  }



}
