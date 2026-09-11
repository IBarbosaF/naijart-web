import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { Language } from './core/services/language';
import { InstagramFloat } from './shared/components/instagram-float/instagram-float';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, InstagramFloat],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private language = inject(Language);

  ngOnInit(): void {
    this.language.init();
  }
}
