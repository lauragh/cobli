import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit{
  animation: any;
  botonMostrar: any;
  threshold = 100;

  @ViewChild('elemento') elemento!: ElementRef;

  constructor(
    private renderer2: Renderer2,
   ) {}

  ngOnInit(): void {
    this.animation = document.getElementById('my-element');
    window.addEventListener('scroll', () => {
      if (window.scrollY > this.threshold) {
        this.animation.classList.add('fade-out');
      } else {
        this.animation.classList.remove('fade-out');
      }
    });
  }

  ocultar(): void {
    this.renderer2.setAttribute(this.elemento.nativeElement,'class','oculto');
  }

  mostrar(): void {
    this.renderer2.removeAttribute(this.elemento.nativeElement,'class','oculto');

  }

}
