type Type = 'ecoute' | 'lecture';

/**
 * Compte le temps d'écoute (un audio joue vraiment) et de lecture (page ouverte sans audio,
 * arrêtée après 60 s sans interaction). Rien ne compte quand l'onglet est caché.
 * `tic` est appelé chaque seconde ; l'envoi se fait toutes les 15 s cumulées et à l'arrêt.
 */
export class Chrono {
  private readonly envoyer: (type: Type, secondes: number) => void;
  private readonly maintenant: () => number;
  private joue = false;
  private estVisible = true;
  private derniere: number;
  private enAttente: Record<Type, number> = { ecoute: 0, lecture: 0 };

  constructor(envoyer: (type: Type, secondes: number) => void, maintenant: () => number = Date.now) {
    this.envoyer = envoyer;
    this.maintenant = maintenant;
    this.derniere = maintenant();
  }

  audio(joue: boolean): void {
    if (joue !== this.joue) this.derniere = this.maintenant(); // la fin d'un audio relance le délai de lecture
    this.joue = joue;
  }

  interaction(): void {
    this.derniere = this.maintenant();
  }

  visible(v: boolean): void {
    this.estVisible = v;
    if (v) this.interaction();
  }

  tic(): void {
    if (!this.estVisible) return;
    if (this.joue) this.enAttente.ecoute++;
    else if (this.maintenant() - this.derniere <= 60_000) this.enAttente.lecture++;
    if (this.enAttente.ecoute + this.enAttente.lecture >= 15) this.vider();
  }

  arreter(): void {
    this.vider();
  }

  private vider(): void {
    for (const type of ['ecoute', 'lecture'] as const) {
      if (this.enAttente[type] > 0) {
        this.envoyer(type, this.enAttente[type]);
        this.enAttente[type] = 0;
      }
    }
  }
}
