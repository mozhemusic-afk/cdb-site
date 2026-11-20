# CDB Production · site (cdbproduction.com)

Next.js 16 static export (`output: "export"`, trailing slashes), React 19, GSAP + ScrollTrigger + CustomEase, Lenis. Deployed to Netlify by uploading `out/`.

**Status: v7 rebuild in progress.** The original repository was lost in an environment reset (20 Nov 2026). This code is a rebuild:
* markup was recovered from the server-rendered HTML of the deployed v7 build (`tools/html2jsx.py`, `tools/build_pages.py`), normalised into components;
* `src/app/legacy.css` is the compiled stylesheet of that build (all utilities and custom rules); new styles go in `src/app/site.css`;
* behaviour (hero, Pulse, Night Flow, worlds, transitions, sound) is being rewritten by hand in `src/components` and `src/enhance`.

## Media
`public/media/` (films, posters; about 250 MB) is **not in git**. Copy it from the last delivered site zip (`cdb-next-site.zip`, folder `media/`) into `public/media/`.

## Commands
```
npm install
npm run build      # writes out/
```
