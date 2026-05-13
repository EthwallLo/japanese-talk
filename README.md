# Japanese Talk

Projet Next.js pour pratiquer le japonais.

## Developpement

Si tu lances le projet depuis WSL, installe aussi les dependances depuis WSL.
Evite de melanger `npm install` Windows et `npm run dev` WSL, car Next.js utilise un binaire SWC different selon l'OS.

```bash
npm install --include=optional --no-audit --no-fund --strict-ssl=false
npm run dev
```

Si Next indique que `@next/swc-linux-x64-gnu` manque, force sa reinstall depuis WSL:

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
# japanese-talk
