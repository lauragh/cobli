import { Component, ElementRef, OnInit, AfterViewInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image-service';
import { UserService } from 'src/app/services/user.service';
import { Image } from 'src/app/interfaces/image-interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit{
  imageId!: string;
  userId!: string;
  image!: Image;
  offsetX!: number;
  offsetY!: number;
  colorPickerTop!: any;
  colorPickerBottom!: any;
  container!: any;
  isDragging: boolean = false;
  prevX: number = 0;
  canvas!: any;
  newX!: any;

  @ViewChild('spectrum') spectrum!: ElementRef;
  @ViewChild('color') color!: ElementRef;
  @ViewChild('muestra') muestra!: ElementRef;
  @ViewChild('hexadecimal') hexadecimal!: ElementRef;

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private renderer2: Renderer2
   ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createSpectrum();
    }, 200);
    setTimeout(() => {
      this.colorPickerTop = document.getElementById('pickerTop');
      this.colorPickerBottom = document.getElementById('pickerBottom');
      this.container = document.getElementById('colorPickerContainer');

      console.log('colorpicker',this.colorPickerTop, this.colorPickerBottom);
      this.container.addEventListener('mousedown', this.dragColorPicker.bind(this));
      this.container.addEventListener('mousemove', this.moveColorPicker.bind(this));
      this.container.addEventListener('mouseup', this.stopDrag.bind(this));
    }, 1000);
  }

  ngOnInit() {
    this.loadUser(() => {
      this.loadImage();
    });
  }

  loadUser(callback: () => void): void {
    this.userId = this.authService.getUid();
    console.log('usuario',this.userId);

    callback();
  }

  loadImage() {
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

  createSpectrum() {
    this.canvas = document.getElementById('spectrum') as HTMLCanvasElement;
    const ctx = this.canvas.getContext("2d")!;

    // Dibujar el rectángulo de espectro de colores
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);

    gradient.addColorStop(0, "red");
    gradient.addColorStop(1/6, "orange");
    gradient.addColorStop(2/6, "yellow");
    gradient.addColorStop(3/6, "green");
    gradient.addColorStop(4/6, "blue");
    gradient.addColorStop(5/6, "indigo");
    gradient.addColorStop(1, "violet");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const colorFilter = document.getElementById("color")!;
    colorFilter.addEventListener("change", () => {
      this.colorFilter();
    });

  }

  colorFilter() {
    const ctx = this.canvas.getContext("2d")!;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);

     if(this.color.nativeElement.value === "blue"){
      gradient.addColorStop(0, "rgb(0, 255, 250)");
      gradient.addColorStop(0.1, "rgb(0, 203, 255)");
      gradient.addColorStop(0.2, "rgb(0, 174, 255)");
      gradient.addColorStop(0.3, "rgb(0, 131, 255)");
      gradient.addColorStop(0.4, "rgb(0, 101, 255)");
      gradient.addColorStop(0.5, "rgb(0, 93, 255)");
      gradient.addColorStop(0.6, "rgb(0, 67, 255)");
      gradient.addColorStop(0.7, "rgb(0, 51, 255)");
      gradient.addColorStop(0.8, "rgb(0, 8, 255)");
      gradient.addColorStop(0.9, "rgb(38, 0, 255)");
      gradient.addColorStop(1, "rgb(67, 0, 255)");

      // gradient.addColorStop(0, "#CCE5FF");
      // gradient.addColorStop(0.2, "#B3D9FF");
      // gradient.addColorStop(0.4, "#99CDFF");
      // gradient.addColorStop(0.6, "#80C1FF");
      // gradient.addColorStop(0.8, "#66B5FF");
      // gradient.addColorStop(1, "#4DA9FF");

      //  gradient.addColorStop(0, "lightblue");
      //  gradient.addColorStop(1/3, "blue");
      //  gradient.addColorStop(2/3, "darkblue");
     }
     else {
       gradient.addColorStop(0, "red");
       gradient.addColorStop(1/6, "orange");
       gradient.addColorStop(2/6, "yellow");
       gradient.addColorStop(3/6, "green");
       gradient.addColorStop(4/6, "blue");
       gradient.addColorStop(5/6, "indigo");
       gradient.addColorStop(1, "violet");
     }

     ctx.fillStyle = gradient;
     ctx.fillRect(0, 0, width, height);
  }

  dragColorPicker(event: any){
    this.isDragging = true;
    this.prevX = event.clientX;
    // console.log(this.colorPicker);
    console.log('dragueo');
  }

  moveColorPicker(evento: any){
    if (this.isDragging) {
      const diffX = evento.clientX - this.prevX;
      this.prevX = evento.clientX;
      const rect = this.container.getBoundingClientRect();

      console.log('tamaño rectangulo', rect.width);

      console.log('pickerTop rectangulo', this.colorPickerTop.getBoundingClientRect().width);

      const maxXTop = rect.width - this.colorPickerTop.getBoundingClientRect().width;
      console.log('tamaño max', maxXTop);
      this.newX = this.colorPickerTop.offsetLeft + diffX;
      console.log('nueva pos x', this.newX);

      if (this.newX < 0) {
        console.log('limite');
        this.newX = 0;
      }
      else if (this.newX > maxXTop) {
        console.log('me muevo');
        this.newX = maxXTop;
      }

      this.colorPickerTop.style.left = this.newX + 'px';
      this.colorPickerBottom.style.left = this.newX + 'px';
    }
  }

  stopDrag(event: any){
    console.log('paro');
    this.isDragging = false;

    //Obtengo el color cuando paro de mover
    const rect = this.canvas.getBoundingClientRect();
    const x = this.newX;
    const y = event.clientY - rect.top;
    const ctx = this.canvas.getContext("2d")!;

    const pixel = ctx.getImageData(x, y, 1, 1);
    const data = pixel.data;
    const color = "#" + ("000000" + ((data[0] << 16) | (data[1] << 8) | data[2]).toString(16)).slice(-6);
    // const color = "rgb(" + data[0] + ", " + data[1] + ", " + data[2] + ")";

    console.log("El color seleccionado es: " + color);
    this.showColor(color);
  }

  showColor(color: string){
    this.renderer2.setStyle(this.muestra.nativeElement, 'background-color', color);
    this.hexadecimal.nativeElement.innerHTML = color;
  }

}
