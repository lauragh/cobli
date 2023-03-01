import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Image } from 'src/app/interfaces/image-interface';
import { User } from 'src/app/interfaces/user-interface';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image-service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';



@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit{
  images: Image[] = [];
  imagesCopy: Image [] = [];
  imagesId: string[] = [];
  user!: User;
  userId!: string;
  imagenVisible: boolean = false;

  @ViewChildren('imagenes') imagenes!: QueryList<any>;

  constructor(
    private renderer2: Renderer2,
    private userService: UserService,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router

   ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.userId = this.authService.getUid();

    this.userService.getUser(this.userId)
    .subscribe({
      next: res => {
        console.log('usuario', res);
        this.user = res['user'];
        this.loadImages();
      },
      error: error => {
        console.log('Error obteniendo usuario');
      }
    });
  }

  loadImages() {
    this.imageService.getImages(this.userId)
    .subscribe({
      next: res => {
        console.log('imagenes', res);
        this.imagesId = Object.keys(res['images']);
        this.images = Object.values(res['images']);
        console.log('imagenes', this.images);
        this.convertDate();
      },
      error: error => {
        console.log('Error obteniendo imagenes');
      }
    });
  }

  abrirEditor(imageId: string) {
    this.router.navigate(['/editor/' + imageId]);
  }

  mostrarImagen(pos: number) {
    console.log('muestro');
    this.renderer2.removeClass(this.imagenes.get(pos).nativeElement, 'ocultar');
    this.renderer2.addClass(this.imagenes.get(pos).nativeElement, 'ver');
    this.imagenVisible = true;
  }

  ocultarImagen(pos: number) {
    console.log('oculto');
    this.renderer2.removeClass(this.imagenes.get(pos).nativeElement, 'ver');
    this.renderer2.addClass(this.imagenes.get(pos).nativeElement, 'ocultar');
    this.imagenVisible = false;
  }

  eliminarImagen(id: string, titulo: string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-outline-secondary me-3'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Eliminar Imagen',
      text: `La imagen ${titulo} se eliminará permanentemente. ¿Desea continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.imageService.deleteImage(this.userId, id)
        .subscribe({
          next: res => {
            this.loadImages();
          },
          error: error => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
            console.log('Error eliminando imagen');
          }
        });
        swalWithBootstrapButtons.fire(
          'Imagen eliminada',
          'La imagen se ha eliminado correctamente',
          'success'
        )
      }
    });
  }


  //Read dateUpdating
  convertDate(){
    this.imagesCopy = this.images.slice();

    console.log(this.imagesCopy);
    for(let image of this.imagesCopy){

      let fullDate = image.dateUpdating.split(",");
      let fullHour = fullDate[1].split(":");
      let hour = fullHour[0]+":"+fullHour[1];

      let date = fullDate[0].split("/");
      console.log(date);
      let dateCasted = new Date(date[2]+"-"+date[1]+"-"+date[0]);

      console.log(dateCasted);

      const today = new Date();
      today.setHours(0,0,0,0);

      const timeDiff = today.getTime() - dateCasted.getTime();
      console.log(timeDiff);
      const diffInDays = timeDiff / (1000 * 3600 * 24);
      console.log(diffInDays);

      if(dateCasted.getTime() == today.getTime()){
        image.dateUpdating = 'Hoy,'+ hour;
        console.log("hoy");
      }
      else if(diffInDays === 1){
        image.dateUpdating = 'Ayer,'+ hour;
        console.log("ayer")
      }
    }

  }

}
