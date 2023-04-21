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
  clear: boolean = false;

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

  //localStorage
  editar: boolean = false;
  imageLoaded: boolean = false;
  saved: boolean = false;


  selectedColor: string = '-';
  filter: string = '-';
  showFilter: boolean = false;


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

  @ViewChild('luminosity') luminosity!: ElementRef;
  @ViewChild('saturation') saturation!: ElementRef;

  @ViewChild('lumFilter') lumFilter!: ElementRef;
  @ViewChild('satFilter') satFilter!: ElementRef;
  @ViewChild('contrastFilter') contrastFilter!: ElementRef;


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

      if(this.image || localStorage.getItem('imageUrl')){
        if(localStorage.getItem('projectName')){
          if(localStorage.getItem('projectName') !== ' '){
            this.projectName.nativeElement.value = localStorage.getItem('projectName');
          }
          else{
            this.projectName.nativeElement.value = '';
          }
        }
        else if(this.image){
          this.projectName.nativeElement.value = this.image.name;
        }

        if(localStorage.getItem('tagColors')){
          this.tagColors = JSON.parse(localStorage.getItem('tagColors')!);
        }
        this.loadCanvas(() => {
          setTimeout(() => {
            this.loadTags();
          },100);
        });

        this.activateFunctions();
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
    if(localStorage.getItem("imageUrl")){
      this.saved = true;
    }
    this.userId = this.authService.getUid();
    if(this.userId){
      this.isLogged = true;
    }
    localStorage.setItem('editar', 'false');

    this.route.paramMap.subscribe(params => {
      if (params.has('imageId')) {
        this.imageId = params.get('imageId')!;
        this.editar = true;
        localStorage.setItem('editar', 'true');
        this.getData();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    const divs = this.tagContainer.getElementsByTagName('div');
    this.tagColors.length;

    if(divs.length > 0){
      for (const [index, tagColor] of this.tagColors.entries()) {
        let [x, y] = this.getPosicionVentana(tagColor.position[0], tagColor.position[1]);
        divs[index].style.left = x + 'px';
        divs[index].style.top = y + 'px';
      }
    }
  }

  getData() {
    this.imageService.getImage(this.userId, this.imageId)
    .subscribe({
      next: res => {
        this.image = res.image;
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
    let bigFile = false;
    const reader = new FileReader();

    if(Number((this.imageFile.size / (1024*1024)).toFixed(2)) > 5){
      console.log("Tamaño de archivo:", this.imageFile.size, (this.imageFile.size / (1024*1024)).toFixed(2));
      bigFile = true;
    }

    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      if((localStorage.getItem('imageLoaded') === 'true' || localStorage.getItem('editar') === 'false') && !bigFile){
        console.log('deberia entrar');
        localStorage.setItem("imageUrl", this.imageUrl);
      }

      this.loadCanvas(() => {

      });
      this.activateFunctions();
    };
    reader.readAsDataURL(this.imageFile);
  }

  loadTags(){
    for(const [i ,tagColor] of this.tagColors.entries()){
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
      this.createTag(tagColor.position[0], tagColor.position[1], tagColor.tagColor, tagColor.id);

      if(i === this.tagColors.length - 1){
        this.numTag = tagColor.id
      }
    }
  }

  loadCanvas(callback: () => void): void {
    this.img = new Image();
    this.img.crossOrigin = "anonymous";
    console.log('entro a loadCanvas');

    if(localStorage.getItem("imageUrl")){
      this.img.src = localStorage.getItem("imageUrl");
    }
    else if(this.editar){
      console.log('tengo imagen');
      this.img.src = this.image?.img;
    }
    else{
      this.img.src = this.imageUrl;
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
      this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
      console.log('ancho y alto al cargar', this.canvas.offsetWidth, this.canvas.offsetHeight);
    });

    callback();

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
      if(this.canvas2){
        var ctx = this.canvas2.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.clear = true;
      this.projectName.nativeElement.value = '';
      localStorage.setItem('projectName', ' ');
      localStorage.setItem('imageLoaded', 'true');
      if(localStorage.getItem('imageUrl')){
        localStorage.removeItem('imageUrl');
      }
      if(localStorage.getItem('tagColors')){
        localStorage.removeItem('tagColors');
      }
      localStorage.setItem('projectSaved', 'false');

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
    else if (h >= 36 && h <= 63) {
      if (s < 82) {
        return ("Marrón");
      }
      else {
        return ("Amarillo");
      }
    }
    else if (h >= 64 && h <= 165) {
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
      localStorage.setItem('tagColors', JSON.stringify(this.tagColors));
      setTimeout(() => {
        this.descriptionValue.get(this.tagColors.length - 1).nativeElement.focus();
      },100);
    }
  }

  checkDarkness(r: number, g: number, b: number, a: number){
    const brightness = r * 0.299 + g * 0.587 + b * 0.114 + (1 - a) * 255;
    if(a < 0.10){
      return "#000000";
    }
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

        if(!this.tagContainer.innerHTML){
          this.numTag = 0;
        }
        localStorage.setItem('tagColors', JSON.stringify(this.tagColors));

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
    pos = pos - 1;
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
      localStorage.setItem('tagColors', JSON.stringify(this.tagColors));
    }
  }

  setProjectName(){
    localStorage.setItem('projectName', this.projectName.nativeElement.value);
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
          localStorage.setItem('projectSaved', 'true');
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
          localStorage.setItem('projectSaved', 'true');
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

  getFilteredTags(selectedColor: string): any[] {
    if (this.selectedColor === "-") {
      return this.tagColors;
    } else {
      return this.tagColors.filter(tag => tag.colorName === selectedColor);
    }
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

  hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
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

  hsvToRgb(h: number, s: number, v: number) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
      r = c;
      g = x;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
    } else if (h >= 120 && h < 180) {
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      b = x;
    }

    r += m;
    g += m;
    b += m;

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  ////***** HSL COLORPICKER EVENTS *****////

  colorFilter(){
    const colorRanges: { [key: string]: number[] } = {
      "rojo": [0, 15],
      "naranja": [16, 48],
      "amarillo": [49, 62],
      "verde": [63, 160],
      "azul": [171, 250],
      "morado": [251, 286],
      "rosa": [287, 330],
    };

    const colorValue = this.color.nativeElement.value;
    const colorRange = colorRanges[colorValue];

    if(colorRange){
      this.bgColors.style.background = this.getHue(colorRange[0], colorRange[1]);
    }
    else{
      this.bgColors.style.background = 'linear-gradient(to right, rgb(255,0,0) 0%, rgb(255,255,0) 17%, rgb(0,255,0) 33%, rgb(0,255,255) 50%, rgb(0,0,255) 66%, rgb(255,0,255) 83%, rgb(255,0,0) 100%)';
    }

    this.getColor();
  }

  //Get the hue color by interpolation
  getHue(min: number, max: number): string{
    const lerp = (a: number, b: number, t: number) => a + t * (b - a);
    const inLerp = (a: number, b: number, v: number) => (v - a) / (b - a);
    const remap = (
      v: number,
      oMin: number,
      oMax: number,
      rMin: number,
      rMax: number
    ) => lerp(rMin, rMax, inLerp(oMin, oMax, v));

    let colores = [];
    for(let i = 0; i <= 100; i = i + 10){
      let hue = remap(i, 0, 100, min, max);
      colores.push(this.hslToRgb(hue, this.saturation.nativeElement.value, this.luminosity.nativeElement.value));
    }

    const gradient = `linear-gradient(to right,
      rgb(${colores[0].r}, ${colores[0].g}, ${colores[0].b}) 0%,
      rgb(${colores[1].r}, ${colores[1].g}, ${colores[1].b}) 10%,
      rgb(${colores[2].r}, ${colores[2].g}, ${colores[2].b}) 20%,
      rgb(${colores[3].r}, ${colores[3].g}, ${colores[3].b}) 30%,
      rgb(${colores[4].r}, ${colores[4].g}, ${colores[4].b}) 40%,
      rgb(${colores[5].r}, ${colores[5].g}, ${colores[5].b}) 50%,
      rgb(${colores[6].r}, ${colores[6].g}, ${colores[6].b}) 60%,
      rgb(${colores[7].r}, ${colores[7].g}, ${colores[7].b}) 70%,
      rgb(${colores[8].r}, ${colores[8].g}, ${colores[8].b}) 80%,
      rgb(${colores[9].r}, ${colores[9].g}, ${colores[9].b}) 90%,
      rgb(${colores[10].r}, ${colores[10].g}, ${colores[10].b}) 100%`

    return gradient;
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


  /** FILTERS */

  showFilters(){
    this.showFilter = true;
  }

  getColorBlindness(object: string){
    this.ctx.drawImage(this.img, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const originalData = data.slice();

    //Los tonos azules se vuelven más grisáceos y con menos brillo mientras que los tonos verdes son más brillantes y saturados
    if(this.filter === 'tritanopia'){
      for(let i = 0; i < data.length; i += 4){
        let red = data[i], green = data[i + 1], blue = data[i + 2];

        // increase brightness and reduce saturation of greens
        if(green > red && green > blue){
          let newRed = Math.round(0.7 * red + 0.3 * green);
          let newGreen = Math.round(0.7 * red + 0.3 * green);
          let newBlue = Math.round(0.3 * blue);

          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        }
        // decrease brightness and increase saturation of blues
        else if(blue > red && blue > green){
          let newRed = Math.round(0.7 * red);
          let newGreen = Math.round(0.7 * green);
          let newBlue = Math.round(0.7 * blue + 0.3 * red + 0.3 * green);

          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        }
      }
    }

    //Cambia tonos rojizos en verdosos y los tonos verdosos en morados (ellos lo verían verde = amarillento y morado/azul = azul)
    else if(this.filter === 'deuteranopia'){
      for (var i = 0; i < data.length; i += 4) {
        let red = data[i], green = data[i + 1], blue = data[i + 2];
        if (red > green && red > blue) { // si el pixel tiene rojo
          let newRed = Math.round(0.0 * red + 0.7 * green + 0.3 * blue);
          let newGreen = Math.round(0.7 * red + 0.0 * green + 0.3 * blue);
          let newBlue = Math.round(0.3 * red + 0.7 * green + 0.0 * blue);
          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        } else if (green > red && green > blue) { // si el pixel tiene verde
          let newRed = Math.round(0.7 * red + 0.3 * green + 0.0 * blue);
          let newGreen = Math.round(0.3 * red + 0.0 * green + 0.7 * blue);
          let newBlue = Math.round(0.0 * red + 0.7 * green + 0.3 * blue);
          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        }
      }
    }

    //Cambia tonos rojizos en verdosos y los tonos verdosos/amarillos en azul oscuro/claro (ellos lo verían verde = amarillento/grisaceo y azul = azul)
    else if(this.filter === 'protanopia'){
      for (var i = 0; i < data.length; i += 4) {
        let red = data[i], green = data[i + 1], blue = data[i + 2];
        if (red > green && red > blue) { // si el pixel tiene rojo
          let newRed = Math.min(Math.round(0.0 * red + 0.56667 * green + 0.43333 * blue), 255);
          let newGreen = Math.min(Math.round(0.55833 * red + 0.0 * green + 0.44167 * blue), 255);
          let newBlue = Math.min(Math.round(0.24167 * red + 0.75833 * green + 0.0 * blue), 255);
          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        } else if (green > red && green > blue) { // si el pixel tiene verde
          let newRed = Math.min(Math.round(0.55833 * red + 0.44167 * blue), 255);
          let newGreen = Math.min(Math.round(0.0 * red + 0.56667 * green + 0.43333 * blue), 255);
          let newBlue = Math.min(Math.round(0.24167 * red + 0.75833 * green + 0.0 * blue), 255);
          data[i] = newRed;
          data[i + 1] = newGreen;
          data[i + 2] = newBlue;
        }
      }
    }

    if(object === 'imageData'){
      return imageData;
    }
    else{
      return [imageData, data, originalData];
    }
  }


  filterImage(){
    this.ctx.drawImage(this.img, 0, 0);
    const imageData = this.getColorBlindness('imageData');
    this.lumFilter.nativeElement.value = 50;
    this.satFilter.nativeElement.value = 50;
    this.contrastFilter.nativeElement.value = 50;

    this.filterLum();
    this.filterSat();
    this.filterContrast();
    this.ctx.putImageData(imageData, 0, 0);
  }

  filterLum(){
    let brightness = this.lumFilter.nativeElement.value;
    console.log('entro');
    // console.log(this.lumFilter.nativeElement.value);
    if(brightness > 50){
      brightness = 1 + brightness / 100;
    }
    else if(brightness == 50){
      brightness = 100 / 100;
    }
    else if(brightness < 50){
      brightness = 0.25 +  brightness / 100;
    }

    const [imageData, data, originalData] = this.getColorBlindness('data');

    for (var i = 0; i < data.length; i += 4) {
      // Aplicar la corrección de brillo solo a los píxeles que han cambiado de color
      if (data[i] !== originalData[i] || data[i+1] !== originalData[i+1] || data[i+2] !== originalData[i+2]) {
        if (brightness !== 0) {
          data[i] = Math.round(data[i] * brightness);
          data[i + 1] = Math.round(data[i + 1] * brightness);
          data[i + 2] = Math.round(data[i + 2] * brightness);
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  filterSat() {
    let saturation = this.satFilter.nativeElement.value;

    if(saturation > 50){
      saturation = 1.25 + saturation / 100;
    }
    else if(saturation == 50){
      saturation = 100 / 100;
    }
    else if(saturation < 50){
      saturation = 0.25 + saturation / 100;
    }

    const [imageData, data, originalData] = this.getColorBlindness('data');

    const modified = [];

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = data.slice(i, i + 3);
      const gray = Math.round((r + g + b) / 3);

      if (r !== originalData[i] || g !== originalData[i + 1] || b !== originalData[i + 2]) {
        const newR = Math.round(gray + (r - gray) * saturation);
        const newG = Math.round(gray + (g - gray) * saturation);
        const newB = Math.round(gray + (b - gray) * saturation);

        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;

        modified.push(i);
      }
    }

    // update only the modified pixels
    for (const i of modified) {
      const [r, g, b] = data.slice(i, i + 3);
      const gray = Math.round((r + g + b) / 3);

      const newR = Math.round(gray + (r - gray) * saturation);
      const newG = Math.round(gray + (g - gray) * saturation);
      const newB = Math.round(gray + (b - gray) * saturation);

      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }


  filterContrast() {
    let contrast = parseFloat(this.contrastFilter.nativeElement.value);
    // console.log(saturation);
    if(contrast > 50){
      contrast = 1.50 + contrast;
    }
    else if(contrast == 50){
      contrast = 1;
    }
    else if(contrast < 50){
      contrast = 0.25 + contrast;
    }

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const [imageData, data, originalData] = this.getColorBlindness('data');

    for (let i = 0; i < data.length; i += 4) {
      // if (data[i] !== originalData[i] || data[i + 1] !== originalData[i + 1] || data[i + 2] !== originalData[i + 2]){
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      // }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

}
