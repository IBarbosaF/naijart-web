import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-instagram-float',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './instagram-float.html',
  styleUrl: './instagram-float.scss',
})
export class InstagramFloat {
  // Sustituye por la cuenta real del cliente
  protected readonly instagramUrl = 'https://instagram.com/naijart';
}
