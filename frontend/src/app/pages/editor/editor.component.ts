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
  // context!: CanvasRenderingContext2D;

  @ViewChild('spectrum') spectrum!: ElementRef;
  @ViewChild('color') color!: ElementRef;

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
    const canvas = document.getElementById('spectrum') as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const width = canvas.width;
    const height = canvas.height;

    // Dibujar el rectángulo de espectro de colores
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1/6, "orange");
    gradient.addColorStop(2/6, "yellow");
    gradient.addColorStop(3/6, "green");
    gradient.addColorStop(4/6, "blue");
    gradient.addColorStop(5/6, "indigo");
    gradient.addColorStop(1, "violet");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    canvas.addEventListener("click", function(event) {
      // Obtener la posición del cursor en relación al borde izquierdo del rectángulo
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Obtener el color de la posición del cursor
      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;
      const color = "rgb(" + data[0] + ", " + data[1] + ", " + data[2] + ")";

      // Hacer algo con el color seleccionado
      console.log("El color seleccionado es: " + color);
    });

    const colorFilter = document.getElementById("color")!;
    colorFilter.addEventListener("change", () => {
      this.colorFilter();
    });

  }

  colorFilter() {
    const canvas = document.getElementById('spectrum') as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const width = canvas.width;
    const height = canvas.height;
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



}
