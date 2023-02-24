import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit{

  // @ViewChild('elemento') elemento!: ElementRef;

  constructor(
    private renderer2: Renderer2,
   ) {}

  ngOnInit(): void {

  }

  // ocultar(): void {
  //   this.renderer2.setAttribute(this.elemento.nativeElement,'class','oculto');
  // }

  // mostrar(): void {
  //   this.renderer2.removeAttribute(this.elemento.nativeElement,'class','oculto');

  // }

}
