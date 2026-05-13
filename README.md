# Japanese Talk

Projet Next.js pour pratiquer le japonais.

## Developpement

Si tu lances le projet depuis WSL, installe aussi les dépendances depuis WSL.
Évite de mélanger `npm install` Windows et `npm run dev` WSL, car Next.js utilise un binaire SWC différent selon l'OS.

```bash
npm install --include=optional --no-audit --no-fund --strict-ssl=false
npm run dev
```

Si Next indique que `@next/swc-linux-x64-gnu` manque, force sa réinstallation depuis WSL :

```bash
npm install @next/swc-linux-x64-gnu@15.5.18 --save-optional --no-audit --no-fund --strict-ssl=false
npm run dev
```

## Supabase

Les variables sont dans `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://nzhqtfkxiciajdkgiadc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Pour créer la table utilisateur applicative, exécute le contenu de
`supabase/schema.sql` dans Supabase SQL Editor.
