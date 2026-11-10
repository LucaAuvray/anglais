import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { config } from '../config.ts';

// Repris de Mnemo (server/src/routes/gemini.ts, appelerClaude) : la CLI Claude Code sans tête,
// connectée à l'abonnement de Luca par CLAUDE_CODE_OAUTH_TOKEN (`claude setup-token`).
//  - --safe-mode : ni plugins, ni hooks, ni CLAUDE.md de la machine.
//  - --tools '' : un simple appel de modèle, aucune action possible sur le serveur.
//  - stream-json en sortie : il porte l'événement de quota, qui dit si l'abonnement a refusé.
// 10 min et non 5 comme Mnemo : un article de 450 mots annoté mot à mot a pris près de 5 min (10/11/2026).
const DELAI_MS = 10 * 60_000;

export function appelerClaude(systeme: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(
      'claude',
      ['-p', '--model', config.claudeModel, '--effort', config.claudeEffort, '--safe-mode', '--tools', '',
        '--no-session-persistence', '--input-format', 'stream-json', '--output-format', 'stream-json',
        '--verbose', '--system-prompt', systeme],
      { cwd: tmpdir(), timeout: DELAI_MS },
    );
    let out = '';
    // Décodage en flux : un « é » coupé entre deux morceaux deviendrait « �� ».
    p.stdout.setEncoding('utf8');
    p.stdout.on('data', (d: string) => (out += d));
    // Sans ce gestionnaire, une CLI absente fait lever EPIPE sur stdin, hors de toute promesse.
    p.stdin.on('error', () => {});
    p.on('error', (e) => reject(new Error(`Claude Code introuvable : ${e.message}`)));
    p.on('close', (_code, signal) => {
      if (signal) return reject(new Error("Claude n'a pas répondu en 10 minutes."));
      let result: { subtype?: string; is_error?: boolean; result?: string } | undefined;
      let refuse = false;
      for (const ligne of out.split('\n')) {
        let e: { type?: string; rate_limit_info?: { status?: string } };
        try { e = JSON.parse(ligne); } catch { continue; }
        if (e.type === 'rate_limit_event' && e.rate_limit_info?.status === 'rejected') refuse = true;
        if (e.type === 'result') result = e as typeof result;
      }
      if (refuse) return reject(new Error("Quota de l'abonnement Claude atteint."));
      if (!result || result.is_error || result.subtype !== 'success' || !result.result) {
        return reject(new Error(`Erreur Claude : ${String(result?.result ?? 'réponse illisible').slice(0, 200)}`));
      }
      // Filet : si le modèle entoure son JSON (bloc de code, phrase), on garde du premier { ou [
      // au dernier } ou ].
      let text = result.result;
      const i = text.search(/[[{]/);
      const j = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
      if (i >= 0 && j > i) text = text.slice(i, j + 1);
      resolve(text);
    });
    p.stdin.end(JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text: prompt }] } }) + '\n');
  });
}
