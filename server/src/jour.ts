/** Date du jour à Paris, au format AAAA-MM-JJ (la locale en-CA écrit les dates ainsi). */
export function jourCourant(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}
