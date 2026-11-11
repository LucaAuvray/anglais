import type { ReactNode } from 'react';

// Chaque conseil vient du rapport de référence (reports/Apprendre une langue chiffres vérifiés.md) ;
// aucun chiffre de sa liste « à confirmer » n'apparaît ici.
function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-stone-900">
      <h2 className="mb-2 font-semibold">{titre}</h2>
      <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">{children}</ul>
    </section>
  );
}

export default function Memo() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Mémo : bien apprendre</h1>

      <Bloc titre="Chaque jour">
        <li>Lire et écouter un article ou une vidéo : c'est le volume qui fait progresser.</li>
        <li>Envoyer vers Mnemo les mots utiles rencontrés.</li>
        <li>Réviser dans Mnemo, de préférence le soir avant de dormir, puis un peu le lendemain matin.</li>
      </Bloc>

      <Bloc titre="Lire un article">
        <li>Lancez la voix (▶) et suivez le texte des yeux : lire en écoutant aide le plus à retenir les expressions.</li>
        <li>
          Touchez <strong>chaque mot dont vous n'êtes pas sûr</strong> : c'est ce que l'app compte pour régler le niveau.
          Vous devriez connaître environ 95 % des mots ; si vous en touchez souvent plus d'un sur vingt, elle proposera
          un niveau plus facile, et un plus difficile si vous n'en touchez presque aucun.
        </li>
        <li>Trop rapide ? Passez à 0,8×, ou réécoutez la phrase avec ↻.</li>
        <li>Les petits mots (<span lang="en">the, of, is, will</span>…) et les noms propres ne sont pas touchables : c'est voulu.</li>
        <li>Lu sans la voix jusqu'au bout ? Touchez « J'ai fini » en bas de l'article.</li>
      </Bloc>

      <Bloc titre="Quels mots envoyer vers Mnemo">
        <li>Oui : les mots qui reviennent ou qui vous serviront, les verbes à particule (<span lang="en">give up</span>), les expressions (<span lang="en">make a decision</span>), les faux amis.</li>
        <li>Non : les mots transparents pour un francophone (<span lang="en">important, football</span>) ; le bouton n'apparaît pas pour eux.</li>
        <li>Chaque mot donne deux cartes : comprendre (anglais → français) et produire (français → anglais).</li>
      </Bloc>

      <Bloc titre="Réviser dans Mnemo">
        <li>Trouvez la réponse dans votre tête, ou à voix haute, <strong>avant</strong> de retourner la carte. C'est l'effort de rappel qui fixe le mot ; relire ou surligner ne sert presque à rien.</li>
        <li>Un peu chaque jour plutôt que beaucoup d'un coup : Mnemo place les révisions au bon moment.</li>
        <li>Dites le mot à voix haute en appuyant sur la syllabe marquée ˈ : l'accent de mot s'apprend avec le mot.</li>
        <li>Repère pratique : 10 à 20 nouvelles cartes par jour, 20 à 30 minutes de révision. Si les révisions en retard s'accumulent, ajoutez moins de mots quelques jours.</li>
      </Bloc>

      <Bloc titre="Vidéos">
        <li>Sous-titres en anglais, jamais en français.</li>
        <li>Regardez vraiment : l'anglais en fond sonore, en faisant autre chose, ne compte pas.</li>
      </Bloc>

      <Bloc titre="Sommeil et habitude">
        <li>Le sommeil fixe les mots : dormir entre deux sessions divise par deux le travail nécessaire pour les retenir.</li>
        <li>Au moins 7 heures par nuit ; ne sacrifiez jamais une nuit pour réviser.</li>
        <li>Accrochez l'habitude à un moment fixe : « après le café, un article », « au lit, Mnemo ». Un jour raté ne casse rien.</li>
        <li>Téléphone en « ne pas déranger » pendant la session : ce sont les notifications qui coûtent cher.</li>
      </Bloc>

      <Bloc titre="Ce qui ne sert à rien">
        <li>Relire ses listes, surligner, apprendre en dormant, les « styles » visuel ou auditif, les jeux d'entraînement cérébral.</li>
      </Bloc>
    </main>
  );
}
