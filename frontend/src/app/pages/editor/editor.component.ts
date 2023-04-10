import { Component, ElementRef, OnInit, AfterViewInit, Renderer2, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image-service';
import { UserService } from 'src/app/services/user.service';
import { ImageUser } from 'src/app/interfaces/image-interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit{
  userId!: string;
  isLogged: boolean = false;

  //image
  imageId!: string;
  imageUrl!: string;
  imageFile!: File;
  image!: ImageUser;

  //Hsl color picker
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


  //canvas
  canvas!: HTMLCanvasElement;
  ctx!: any;
  zoomInBtn!: any;
  zoomOutBtn!: any;
  img!: any;
  zoomNum: number = 1;
  numTag: number = 0;
  tagContainer!: any;
  canvas2!: HTMLCanvasElement;
  zoomX: number = 0;
  zoomY: number = 0;

  //color tags
  tagColors: any[] = [];
  infoColors: any[] = [];

  editar: boolean = false;

  @ViewChild('spectrum') spectrum!: ElementRef;
  @ViewChild('color') color!: ElementRef;
  @ViewChild('muestra') muestra!: ElementRef;
  @ViewChild('hexadecimal') hexadecimal!: ElementRef;
  @ViewChild('hex') hex!: ElementRef;
  @ViewChild('rgb') rgb!: ElementRef;
  @ViewChild('hsl') hsl!: ElementRef;
  @ViewChild('hsv') hsv!: ElementRef;
  @ViewChild('colorName') colorName!: ElementRef;
  @ViewChild('brightness') brightness!: ElementRef;
  @ViewChild('inputFile') inputFile!: ElementRef;
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  @ViewChildren('tagD') tagD!: QueryList<any>;
  @ViewChildren('tagC') tagC!: QueryList<any>;
  @ViewChildren('descriptionValue') descriptionValue!: QueryList<any>;
  @ViewChild('projectName') projectName!: ElementRef;
  @ViewChild('colorAvg') colorAvg!: ElementRef;

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private renderer2: Renderer2
   ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.bgColors = document.querySelector('.bgColors');
      this.getColor();
      this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
      this.tagContainer = document.getElementById('tagContainer')!;
      this.zoomInBtn = document.getElementById("lupaMas");
      this.zoomOutBtn = document.getElementById("lupaMenos");

      if(this.image){
        this.projectName.nativeElement.value = this.image.name;
        this.loadCanvas();
        this.activateFunctions();

        for(let [i ,tagColor] of this.tagColors.entries()){
          const colorInfo = {
            rgb: tagColor.rgb,
            hex: tagColor.hex,
            hsl: tagColor.hsl,
            hsv: tagColor.hsv,
            colorName: tagColor.colorName,
            brightness: tagColor.brightness,
            colorAvg: tagColor.colorAvg
          };
          this.infoColors.push(colorInfo);
          this.pickColorPoint(tagColor.position[0], tagColor.position[1], 'cargar', tagColor.id, tagColor.tagColor);
          if(i === this.tagColors.length - 1){
            this.numTag = tagColor.id
          }
        }
      }
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
    this.userId = this.authService.getUid();
    if(this.userId){
      this.isLogged = true;
    }
    this.route.paramMap.subscribe(params => {
      if (params.has('imageId')) {
        this.imageId = params.get('imageId')!;
        this.editar = true;
        this.getData();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    console.log(window.innerHeight, window.innerWidth);

    const divs = this.tagContainer.getElementsByTagName('div');
    this.tagColors.length;

    for (const [index, tagColor] of this.tagColors.entries()) {
      console.log('antes',tagColor.position[0], tagColor.position[1]);
      let [x, y] = this.getPosicionVentana(tagColor.position[0], tagColor.position[1]);
      console.log('despues',x,y);

      divs[index].style.left = x + 'px';
      divs[index].style.top = y + 'px';

      console.log('resultado',divs[index].style.left, divs[index].style.top);

    }

    // for (let div of divs) {
    //   this.tagColors[divs[div]]
    //   let [x, y] = this.getPosicionVentana(div.style.left , div.style.right);

    //   console.log('miro', div.style.left )
    // }

    // for(let tagColor of this.tagColors){
    //   console.log('antes',tagColor.position[0], tagColor.position[1]);
    //   let [x, y] = this.getPosicionVentana(tagColor.position[0], tagColor.position[1]);
    //   console.log('despues',x,y);
    //   tagColor.position[0] = x;
    //   tagColor.position[1] = y;
    //   console.log('resultado',tagColor.position[0], tagColor.position[1])
    // }
  }


  getData() {
    this.imageService.getImage(this.userId, this.imageId)
    .subscribe({
      next: res => {
        this.image = res.image;
        console.log(this.image);
        console.log('imagenes',res.image.colorTags);
        if(res.image.colorTags !== undefined){
          this.tagColors = res.image.colorTags;
        }
      },
      error: error => {
        console.log(error);
      }
    });
  }

  uploadPic(event: any){
    this.renderer2.removeClass(this.inputFile.nativeElement, 'ver');
    this.renderer2.addClass(this.inputFile.nativeElement, 'ocultar');
    this.imageFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      this.loadCanvas();
      this.activateFunctions();
    };
    reader.readAsDataURL(this.imageFile);

    console.log('base64',this.imageUrl);
  }

  loadCanvas() {
    this.img = new Image();
    this.img.crossOrigin = "anonymous";

    if(this.imageUrl){
      this.img.src = this.imageUrl;
    }
    else{
      console.log('tengo imagen');
      this.img.src = this.image?.img;
    }
    // this.img.src = '../../../assets/img/ejemplo.png';
    // this.img.src = '../../../assets/img/image.png';
    // this.img.src = `https://media.discordapp.net/attachments/1052568195493548082/1083733464571986010/paisaje-e1549600034372.png`;
    // this.img.style.imageRendering = 'auto';
    this.ctx = this.canvas.getContext("2d")!;

    this.img.addEventListener("load", () => {
      console.log(this.img.width, this.img.height);
      this.canvas.width = this.img.width;
      this.canvas.height = this.img.height;
      // this.canvas.style.overflow = "auto";
      // this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
      // this.ctx.drawImage(this.img, 0, 0);

      const ratioX = this.img.width/this.canvas.offsetWidth;
      const ratioY = this.img.width/this.canvas.offsetWidth;

      console.log('ancho y alto al cargar', this.canvas.offsetWidth, this.canvas.offsetHeight);
    });
  }

  listenerClickPos!: () => void;
  listenerZoomCanvas!: () => void;
  listenerZoomIn!: () => void;
  listenerZoomOut!: () => void;

  activateFunctions () {
    this.tagContainer.style.cursor = 'pointer';

    this.listenerClickPos = this.renderer2.listen(this.tagContainer, 'click', (event) => {
      const x = event.layerX;
      const y = event.layerY;
      this.getPositionClicks(x, y);
    });
    this.listenerZoomCanvas =  this.renderer2.listen(this.tagContainer, 'mousemove', (event) => {
      const x = event.layerX;
      const y = event.layerY;
      this.drawZoomCanvas(x, y);
      this.getZoomedPixelsColor(x,y);
    });
    this.listenerZoomIn = this.renderer2.listen(this.zoomInBtn, 'click', (event) => this.zoomIn('in'));
    this.listenerZoomOut = this.renderer2.listen(this.zoomOutBtn, 'click', (event) => this.zoomIn('out'));
  }

  deactivateFunctions () {
    if (this.listenerClickPos) {
      this.listenerClickPos();
    }
    if (this.listenerZoomCanvas) {
      this.listenerZoomCanvas();
    }
    if (this.listenerZoomIn) {
      this.listenerZoomIn();
    }
    if (this.listenerZoomOut) {
      this.listenerZoomOut();
    }
  }

  clearCanvas(){
    if(this.img){
      this.tagColors = [];
      this.infoColors = [];
      this.numTag = 0;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var ctx = this.canvas2.getContext("2d")!;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if(this.inputFile){
        this.renderer2.removeClass(this.inputFile.nativeElement, 'ocultar');
        this.renderer2.addClass(this.inputFile.nativeElement, 'ver');
        this.fileUpload.nativeElement.value = '';
      }
      this.tagContainer.innerHTML = '';
      this.deactivateFunctions();
      this.clearValues();
    }
  }

  clearValues(){
    this.rgb.nativeElement.innerHTML = "";
    this.hex.nativeElement.innerHTML = "";
    this.hsl.nativeElement.innerHTML = "";
    this.hsv.nativeElement.innerHTML = "";
    this.colorName.nativeElement.innerHTML = "";
    this.brightness.nativeElement.innerHTML = "";
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
    img.src = this.img.src;

    let [posX, posY] = this.getPosicionCanvas(x,y);
    img.addEventListener("load", () => {
      // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      ctx.drawImage(img,
        Math.min(posX, img.width ),
        Math.min(posY, img.height ),
        3, 3,
        0, 0,
        150, 150);
    });
  }

  pickColorPoint(pointX: number, pointY: number, accion?: string, num?: number, tagColor?: string) {
    let [x, y] = this.getPosicionCanvas(pointX, pointY);

    if ((x < 0 || x > this.img.width) || (y < 0 || y > this.img.height)){
      return;
    }

    const pixel = this.ctx.getImageData(x, y, this.canvas.offsetWidth, this.canvas.offsetHeight);
    const data = pixel.data;

    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

    const darkness = this.checkDarkness(data[0], data[1], data[2], data[3]/255);
    console.log(darkness);
    if(accion){
      this.createTag(x, y, tagColor, num);
    }
    else{
      this.saveZoomedPixelsColor(x, y);
      this.createTag(x, y, darkness);
    }

    return rgba;
  }

  saveZoomedPixelsColor(x: number, y: number) {
    const rgb = this.getZoomedPixelsColor(x,y);

    this.rgb.nativeElement.innerHTML = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    this.hex.nativeElement.innerHTML = this.rgbToHex(this.rgb.nativeElement.innerHTML);
    const { h, s, l } = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.hsl.nativeElement.innerHTML = "hsl(" + h + ", " + s + "%, " + l + "%)";
    const { h2, s2, v2 } = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.hsv.nativeElement.innerHTML = "hsv(" + h2 + ", " + s2 + ", " + v2 + ")";
    const colorName = this.getColorName(h, s, l);
    this.colorName.nativeElement.innerHTML = colorName;
    const colorIntensity = this.getIntensity(rgb.r, rgb.g, rgb.b);
    this.brightness.nativeElement.innerHTML = colorIntensity;

    this.renderer2.setStyle(this.colorAvg.nativeElement, 'background-color', this.hex.nativeElement.innerHTML);
    const ctx = this.canvas2.getContext('2d')!;

    const colorInfo = {
      rgb: this.rgb.nativeElement.innerHTML,
      hex: this.hex.nativeElement.innerHTML,
      hsl: this.hsl.nativeElement.innerHTML,
      hsv: this.hsv.nativeElement.innerHTML,
      colorName: this.colorName.nativeElement.innerHTML,
      brightness: this.brightness.nativeElement.innerHTML,
      pixelData: ctx.getImageData(0, 0, 150, 150),
      colorAvg: this.hex.nativeElement.innerHTML,
    };
    this.infoColors.push(colorInfo);
  }

  getZoomedPixelsColor(x: number, y: number) {
    const ctx = this.canvas2.getContext('2d')!;
    const pixelData = ctx.getImageData(0, 0, 150, 150).data; // seleccionar la región de 6 píxeles
    let rgb = {
      r: 0,
      g: 0,
      b: 0},
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

    const color = this.rgbToHex("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
    this.renderer2.setStyle(this.colorAvg.nativeElement, 'background-color', color);

    return rgb;
  }

  getColorName(hValue: number, sValue: number, lValue: number){
    let l = Math.floor(lValue);
    let s = Math.floor(sValue);
    let h = Math.floor(hValue);

    if (s <= 10 && l >= 90) {
      return ("Blanco")
    }
    else if (l <= 15) {
      return ("Negro")
    }
     else if ((s <= 10 && l <= 70) || s === 0) {
      return ("Gris")
    }
    else if ((h >= 0 && h <= 15) || h >= 346) {
      return ("Rojo");
    }
    else if (h >= 16 && h <= 35) {
      if (s < 90) {
        return ("Marrón");
      }
      else {
        return ("Naranja");
      }
    }
    else if (h >= 36 && h <= 54) {
      if (s < 90) {
        return ("Marrón");
      }
      else {
        return ("Amarillo");
      }
    }
    else if (h >= 55 && h <= 165) {
      return ("Verde");
    }
    else if (h >= 166 && h <= 260) {
      return ("Azul")
    }
    else if (h >= 261 && h <= 290) {
      return ("Morado")
    }
    else if (h >= 291 && h <= 345) {
      return ("Rosa")
    }
    return
  }

  getIntensity(r: number, g: number, b: number){
    const intensity = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Definir los umbrales para cada categoría de intensidad
    const thresholds = {
      very_light: 230,
      light: 170,
      medium: 100,
      dark: 50,
      very_dark: 0
    };

    // Comparar la intensidad del color con los umbrales para determinar la categoría
    if (intensity >= thresholds.very_light) {
      return "Muy claro";
    } else if (intensity >= thresholds.light) {
      return "Claro";
    } else if (intensity >= thresholds.medium) {
      return "Medio";
    } else if (intensity >= thresholds.dark) {
      return "Oscuro";
    } else {
      return "Muy oscuro";
    }
  }

  getPositionClicks(x: number, y: number){

    // let [posX, posY] = this.getPosicionCanvas(x,y);
    // const bounding = this.tagContainer.getBoundingClientRect();
    // const x = event.clientX - bounding.left;
    // const y = event.clientY - bounding.top;

    console.log('hago click', x, y);
    this.pickColorPoint(x, y);
  }

  //Dada una posición de la ventana devuelve un pixel (aspect ratio considerado)
  getPosicionCanvas(x: number, y: number){
    const tamContainerX = this.tagContainer.offsetWidth;
    const tamContainerY = this.tagContainer.offsetHeight;
    const displX = Math.trunc((tamContainerX - this.canvas.offsetWidth)/2);
    const displY = Math.trunc((tamContainerY - this.canvas.offsetHeight)/2);


    const ratioX = this.img.width/this.canvas.offsetWidth;
    const ratioY = this.img.height/this.canvas.offsetHeight;

    return [(x - displX - 5) * ratioX, (y - displY - 5) * ratioY]
  }

  //Dado un pixel, devuelve la posición de la vetana
  getPosicionVentana(posX: number, posY: number) {
    const tamContainerX = this.tagContainer.offsetWidth;
    const tamContainerY = this.tagContainer.offsetHeight;
    const displX = Math.trunc((tamContainerX - this.canvas.offsetWidth) / 2);
    const displY = Math.trunc((tamContainerY - this.canvas.offsetHeight) / 2);

    const ratioX = this.img.width / this.canvas.offsetWidth;
    const ratioY = this.img.height / this.canvas.offsetHeight;

    const x = Math.trunc(posX / ratioX + displX + 5);
    const y = Math.trunc(posY / ratioY + displY + 5);

    return [x, y];
  }

  createTag(x: number, y: number, darkness?: string, num?: number){
    let contenido;
    if(!num){
      this.numTag += 1;
      contenido = this.renderer2.createText(this.numTag.toString());
    }
    else{
      contenido = this.renderer2.createText(num.toString());
    }
    const tagContainer = document.getElementById('tagContainer')!;

    const div = this.renderer2.createElement('div');
    this.renderer2.setAttribute(div, 'name', 'colorTag');
    this.renderer2.addClass(div, 'nums');

    this.renderer2.setStyle(div, 'color', darkness);
    this.renderer2.setStyle(div, 'border', '2px solid'+ darkness);


    this.renderer2.setStyle(div, 'position', 'absolute');
    this.renderer2.setStyle(div, 'z-index', '3');

    let [posx, posy] = this.getPosicionVentana(x, y);


    this.renderer2.setStyle(div, 'left', `${posx}px`);
    this.renderer2.setStyle(div, 'top', `${posy}px`);

    this.renderer2.appendChild(div,contenido);
    this.renderer2.appendChild(tagContainer, div);

    if(!num){
      const tagModel = {
        id: this.numTag,
        tagColor: darkness,
        description: '',
        colorName: this.colorName.nativeElement.innerHTML,
        brightness: this.brightness.nativeElement.innerHTML,
        rgb: this.rgb.nativeElement.innerHTML,
        hex: this.hex.nativeElement.innerHTML,
        hsl: this.hsl.nativeElement.innerHTML,
        hsv: this.hsv.nativeElement.innerHTML,
        position: [x, y],
        colorAvg: this.hex.nativeElement.innerHTML,
      }
      console.log('voy a pushear',tagModel);
      this.tagColors.push(tagModel);
      setTimeout(() => {
        this.descriptionValue.get(this.tagColors.length - 1).nativeElement.focus();
      },100);
    }
  }

  checkDarkness(r: number, g: number, b: number, a: number){
    const brightness = r * 0.299 + g * 0.587 + b * 0.114 + (1 - a) * 255;
    return brightness > 186 ? "#000000" : "#FFFFFF";
  }

  ////***** COLORTAGS FUNCTIONS *****////

  showImage(pos: number) {
    this.renderer2.removeClass(this.tagD.get(pos).nativeElement, 'ocultar');
    this.renderer2.addClass(this.tagD.get(pos).nativeElement, 'ver');
    this.renderer2.removeClass(this.tagC.get(pos).nativeElement, 'ocultar');
    this.renderer2.addClass(this.tagC.get(pos).nativeElement, 'ver');
  }

  hideImage(pos: number) {
    this.renderer2.removeClass(this.tagD.get(pos).nativeElement, 'ver');
    this.renderer2.addClass(this.tagD.get(pos).nativeElement, 'ocultar');
    this.renderer2.removeClass(this.tagC.get(pos).nativeElement, 'ver');
    this.renderer2.addClass(this.tagC.get(pos).nativeElement, 'ocultar');
  }

  deleteTag(id: string, index: number){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-outline-secondary me-3'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Eliminar etiqueta',
      text: `Se va a eliminar la etiqueta ${id}. ¿Desea continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const pos =  this.tagColors.findIndex(objeto => objeto.id === id);
        if (pos !== -1) {
          this.tagColors.splice(pos, 1);
        }
        const divs = this.tagContainer.getElementsByTagName('div');
        for (let div of divs) {
          if (div.innerHTML === id.toString()) {
            this.tagContainer.removeChild(div);
          }
        }
        this.infoColors.splice(index, 1);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se eliminado con éxito',
          showConfirmButton: false,
          timer: 1500
        })
      }
    });
  }

  copyText(text: string){
    navigator.clipboard.writeText(text);

    const elemento = document.getElementById("posModal")!;

    const mensaje = document.createElement("div");
    mensaje.innerText = "El texto se ha copiado correctamente";
    mensaje.style.position = "fixed";
    mensaje.style.top = `${elemento.offsetTop}px`;
    mensaje.style.left = `${elemento.offsetLeft}px`;
    // mensaje.style.transform = "translate(0%, 20%)";
    mensaje.style.padding = "10px";
    mensaje.style.background = "rgba(0, 0, 0, 0.8)";
    mensaje.style.color = "#fff";
    mensaje.style.borderRadius = "5px";
    mensaje.style.zIndex = "9999";
    document.body.appendChild(mensaje);
    setTimeout(() => {
      mensaje.remove();
    }, 2000);
  }

  copyText2(){
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "c") {
        const mensaje = document.createElement("div");
        mensaje.innerText = "El texto se ha copiado correctamente";
        mensaje.style.position = "fixed";
        mensaje.style.top = "50%";
        mensaje.style.left = "50%";
        mensaje.style.transform = "translate(-50%, -50%)";
        mensaje.style.padding = "10px";
        mensaje.style.background = "rgba(0, 0, 0, 0.8)";
        mensaje.style.color = "#fff";
        mensaje.style.borderRadius = "5px";
        mensaje.style.zIndex = "9999";
        document.body.appendChild(mensaje);
        setTimeout(() => {
          mensaje.remove();
        }, 2000);
      }
    });
  }

  showTagValues(pos: number) {
    console.log(this.infoColors);
    this.rgb.nativeElement.innerHTML = this.infoColors[pos].rgb;
    this.hex.nativeElement.innerHTML = this.infoColors[pos].hex;
    this.hsl.nativeElement.innerHTML = this.infoColors[pos].hsl;
    this.hsv.nativeElement.innerHTML = this.infoColors[pos].hsv;
    this.colorName.nativeElement.innerHTML = this.infoColors[pos].colorName;
    this.brightness.nativeElement.innerHTML = this.infoColors[pos].brightness;
    this.renderer2.setStyle(this.colorAvg.nativeElement, 'background-color', this.infoColors[pos].colorAvg);
    // this.drawZoomCanvas(this.infoColors[pos].pixelDataX, this.infoColors[pos].pixelDataY);
    if(this.infoColors[pos].pixelData){
      const ctx = this.canvas2.getContext('2d')!;
      ctx.putImageData(this.infoColors[pos].pixelData, 0, 0);
    }
  }

  updateDescription(pos: number){
    this.tagColors[pos].description = this.descriptionValue.get(pos).nativeElement.value;

    console.log(this.tagColors[pos]);
  }

  onKeyDown(event: any){
    if (event.key === "Enter") {
      event.target.blur();
    }
  }

  ////***** PROJECT FUNCTIONS *****////
  saveProject(){
    if(this.editar){
      // console.log('colores',this.tagColors, this.image);
      this.image.colorTags = this.tagColors;
      this.image.dateUpdating = new Date().toLocaleString();
      console.log('voy a mandar', this.userId, this.imageId, this.image);
      this.imageService.updateImage(this.userId, this.imageId, this.image)
      .subscribe({
        next: res => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Se guardado con éxito',
            showConfirmButton: false,
            timer: 1500
          })
        },
        error: error => {
          console.log(error);
        }
      });
    }
    else{
      const image: ImageUser = {
        img: this.imageUrl,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        dateCreation: new Date().toLocaleString(),
        dateUpdating: new Date().toLocaleString(),
        name: this.projectName.nativeElement.value ? this.projectName.nativeElement.value : 'Nuevo proyecto',
        colorTags: this.tagColors,
      }
      this.image = image;
      console.log(this.userId, this.image);
      this.imageService.createImage(this.userId, this.image)
      .subscribe({
        next: res => {
          console.log('resultado de crear imagen', res);
          this.imageId = res.image[1];
          this.updateNumImages();
        },
        error: error => {
          console.log(error);
        }
      });
    }
  }

  updateNumImages() {
    const body = {
      action: 'add'
    }
    this.userService.updateNumImages(this.userId, body)
    .subscribe({
      next: res => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se guardado con éxito',
          showConfirmButton: false,
          timer: 1500
        })
        this.editar = true;
      },
      error: error => {
        console.log(error);
      }
    });
  }

  ////***** COLOR CONVERTIONS *****////

  rgbToHex(rgb: string) {
    // Extrae los valores de r, g y b de la cadena rgb(r, g, b)
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

  ////***** HSL COLORPICKER EVENTS *****////

  colorFilter(){
    console.log('entro');
    // this.bgColors.style.background = 'linear-gradient(to right, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 10% ,rgb(0, 0, 0) 20%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 40%, rgb(0, 0, 0) 50% ,rgb(0, 0, 0) 60%, rgb(0, 0, 0) 70%, rgb(0, 0, 0) 80%, rgb(0, 0, 0) 90%, rgb(0, 0, 0) 100%)';

    if(this.color.nativeElement.value === "azul"){
      console.log('entro de azul');
      this.bgColors.style.background = 'linear-gradient(to right, rgb(0, 255, 250) 0%, rgb(0, 203, 255) 10% ,rgb(0, 174, 255) 20%, rgb(0, 131, 255) 30%, rgb(0, 101, 255) 40%, rgb(0, 93, 255) 50% ,rgb(0, 67, 255) 60%, rgb(0, 51, 255) 70%, rgb(0, 8, 255) 80%, rgb(38, 0, 255) 90%, rgb(67, 0, 255) 100%)';
    }
    else if(this.color.nativeElement.value === "verde"){
      this.bgColors.style.background = 'linear-gradient(to right, rgb(0, 255, 119) 0%, rgb(0, 226, 90) 10% ,rgb(0, 198, 79) 20%, rgb(0, 168, 67) 30%, rgb(0, 147, 59) 40%, rgb(0, 127, 50) 50% ,rgb(0, 114, 45) 60%, rgb(0, 91, 36) 70%, rgb(0, 68, 27) 80%, rgb(0, 53, 21) 90%, rgb(0, 33, 13) 100%)';
    }
    else if(this.color.nativeElement.value === "amarillo"){
      this.bgColors.style.background = 'linear-gradient(to right, rgb(255, 246, 0) 0%, rgb(237, 229, 0) 10% ,rgb(216, 209, 0) 20%, rgb(196, 189, 0) 30%, rgb(181, 175, 0) 40%, rgb(163, 157, 0) 50% ,rgb(137, 133, 0) 60%, rgb(119, 115, 0) 70%, rgb(102, 98, 0) 80%, rgb(84, 81, 0) 90%, rgb(63, 61, 0) 100%)';
    }
    else if(this.color.nativeElement.value === "rojo"){
    // this.bgColors.style.background = 'linear-gradient(to right, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 10% ,rgb(0, 0, 0) 20%, rgb(0, 0, 0) 30%, rgb(0, 0, 0) 40%, rgb(0, 0, 0) 50% ,rgb(0, 0, 0) 60%, rgb(0, 0, 0) 70%, rgb(0, 0, 0) 80%, rgb(0, 0, 0) 90%, rgb(0, 0, 0) 100%)';
    }
    this.getColor();
  }

  obtenerColor(event: any){
    const rect = this.container.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const index = Math.round(percent * (this.gradientColors.length - 1));
    const color = this.gradientColors[index];
    this.showColor(this.rgbToHex(color));
  }


  getColor(){
    this.gradientColors = [];
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

  dragColorPicker(event: any){
    this.isDragging = true;
    this.prevX = event.clientX;
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
