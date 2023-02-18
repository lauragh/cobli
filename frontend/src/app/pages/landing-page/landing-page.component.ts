import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit{
  @ViewChild('slider1') slider1!: ElementRef;
  @ViewChild('slider2') slider2!: ElementRef;

  sliders: String[] = ["slider1","slider2", "slider 3", "slider 4"];

  constructor(
    private renderer2: Renderer2,
   ) {}

  ngOnInit(): void {

  }

  ocultar(): void {
    this.renderer2.addClass(this.slider1.nativeElement,'oculto');
    this.renderer2.removeClass(this.slider2.nativeElement,'display-none');
    setTimeout(() => {
      this.renderer2.addClass(this.slider2.nativeElement,'oculto2');
    }, 500);



    // setTimeout(() => {
    //   this.renderer2.removeClass(this.slider1.nativeElement,'oculto')
    // }, 2000);
    // this.renderer2.setAttribute(this.slider1.nativeElement,'class','oculto');

  }

  mostrar(): void {
    console.log('hola');
    this.renderer2.removeClass(this.slider1.nativeElement,'oculto');
    // this.renderer2.addClass(this.slider1.nativeElement,'mostrar')

    // this.renderer2.removeAttribute(this.slider1.nativeElement,'class','oculto');
  }
}
