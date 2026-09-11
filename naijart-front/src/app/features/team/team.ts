// src/app/features/team/team.ts

import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface TeamMember {
  id: number;
  name: string;
  roleKey: string;   // clave de traducción, ej. 'team.members.m1.role'
  bioKey: string;
  initials: string;
  accent: 'green' | 'gold' | 'blue';
  email: string;
  photo?: string;
  instagram?: string;
  linkedin?: string;
}

interface Partner {
  id: number;
  name: string;
  logo?: string;   // TODO: rellenar cuando nos pasen el logo (ambos pendientes)
  url?: string;    // TODO: rellenar cuando tengamos la URL real
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './team.html',
  styleUrl: './team.scss'
})
export class Team {
  readonly members = signal<TeamMember[]>([
    {
      id: 1,
      name: 'Nelly Idagba',
      roleKey: 'team.members.m1.role',
      bioKey: 'team.members.m1.bio',
      initials: 'NI',
      accent: 'gold',
      email: 'nelly@naijart.org',
      photo: 'images/team/nellyIdagba.jpg',
      instagram: 'https://instagram.com/naijart',
      linkedin: 'https://linkedin.com/company/naijart'
    },
    {
      id: 2,
      name: 'Carlos García Martínez',
      roleKey: 'team.members.m2.role',
      bioKey: 'team.members.m2.bio',
      initials: 'CG',
      accent: 'green',
      email: 'carlos@naijart.org',
      photo: 'images/team/CarlosGarciaMartinez.jpeg',
      instagram: 'https://instagram.com/naijart'
    },
    {
      id: 3,
      name: 'Sergio González Montes',
      roleKey: 'team.members.m3.role',
      bioKey: 'team.members.m3.bio',
      initials: 'SG',
      accent: 'blue',
      email: 'sergio@naijart.org',
      photo: 'images/team/SergioGonzalezMontes.jpeg',
      linkedin: 'https://linkedin.com/company/naijart'
    }
  ]);

  // TODO: sustituir logo/url en cuanto os los pasen
  readonly partners = signal<Partner[]>([
    {
      id: 1,
      name: 'Retorika',
      logo: 'images/partners/retorika-gold.png',
      url: 'https://asesoriaretorika.com'
    },
    {
      id: 2,
      name: 'Fundación',
      logo: 'images/partners/fundacion-gold.png',
      // url: 'https://fundacion.example.com'
    }
  ]);

  readonly selectedMember = signal<TeamMember | null>(null);

  openMember(member: TeamMember): void {
    this.selectedMember.set(member);
  }

  closeModal(): void {
    this.selectedMember.set(null);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
