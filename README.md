# Collart Japan Product Landing Page

A Japanese-language landing page and browser-local creation demo. Six use cases cover product listings, cafe announcements, gifts, beauty campaigns, handmade accessories and shop illustrations.

## Run locally

No installation or build step is required. From this directory:

```sh
python -m http.server 8080
```

Open http://localhost:8080. Deploy this directory to any static host.

## Behavior and limits

- Uploaded images remain in the browser and are not sent to an AI service.
- Generation, login, credits and checkout are simulations. No payment or subscription occurs.
- Reference images were generated using designer.etm.tech; they are not evidence of Collart output quality.
- Production creative/pricing links include `fromapp=eddie`. Attribution reporting requires a corresponding implementation on the destination site. Local demo console events are not a production analytics service.
- This is landing-page source, not the source code of the Collart AI service.

## Search indexing

The homepage permits indexing. `robots.txt` points to `sitemap.xml`, which lists only the clean canonical homepage. On another domain, update the canonical, Open Graph URLs, JSON-LD URL, sitemap and robots sitemap URL together. Do not create canonical entries for tracking parameters.

Google Search Console ownership verification and indexing requests must be completed by the site owner. Being crawlable does not guarantee indexing or ranking.

## Files

- `index.html`: static, accessible Japanese content and reference cards
- `app.js`: local demo state and interactions
- `cases.js`: editable use-case labels and input examples
- `style.css`, `typography.css`, `image-layout.css`: layout, type and image framing
- `assets/`: reference artwork and brand logo (see licensing below)

## Licensing

Original HTML, CSS and JavaScript are provided under the MIT license in `LICENSE`.
The license does **not** cover the Collart name/logo or files in `assets/`; see `ASSETS.md`. Replace those assets and product links for an unrelated project. No branding, endorsement or trademark rights are granted.

Deployment credentials, platform project configuration, Git history and internal review documents are intentionally excluded.
