# saurabh-aicreates website

Static site for GitHub Pages: pricing, samples, FAQ, privacy.

## Folder structure
```
saurabh-aicreates/  (F:\Git_Repo\saurabh-aicreates)
├── index.html          Home + Pricing + How it works + Samples
├── faq.html            FAQ
├── privacy.html        Privacy Policy
├── README.md
├── assets/
│   ├── css/style.css   All styling
│   └── js/             (future scripts)
├── images/
│   ├── logo/           Page logo, favicon
│   └── posters/        Video cover images (JPG, small)
├── videos/             Compressed MP4 only, each < 20 MB
│   ├── wedding/
│   ├── birthday/
│   ├── family-story/
│   └── devotional/
└── preview/            Client preview pages (later; watermarked only)
```

## Rules
- Keep every video under 20 MB (GitHub max 100 MB per file, repo < 1 GB).
- Big videos: upload to YouTube (unlisted) and embed.
- Never upload client photos or un-watermarked final videos (site is public).

## Publish
1. Create repo `saurabh-aicreates` on GitHub, upload this folder's contents.
2. Settings → Pages → Source: `main` branch, `/root` → Save.
3. Site goes live at `https://<username>.github.io/saurabh-aicreates/`.

## Customer reviews (hidden pages – not linked anywhere)
- `CustomerReview.html` – send this link directly to customers. Shows approved reviews below the form.
- `login.html` – admin page to read all reviews, show/hide them on the site, download as Excel.
- Data is stored in a **Google Sheet** (GitHub Pages cannot save files). Open the sheet → File → Download → .xlsx anytime.

### One-time setup (10 min)
1. Create a new Google Sheet named "Saurabh AI Creates – Reviews".
2. Extensions → Apps Script → delete the sample code, paste `apps-script/Code.gs` → Save.
3. Login is set in `login.html` and `Code.gs` (username `saurabh`). Change both if you change the password.
4. Deploy → New deployment → type **Web app** → Execute as: **Me**, Who has access: **Anyone** → Deploy → authorise → copy the Web app URL.
5. Paste that URL into `assets/js/reviews-config.js`, commit and push.
6. Every new review lands as a row (Approved = No). Turn on "Show on site" in `login.html` to publish it.
- If you change Code.gs later: Deploy → Manage deployments → Edit → Version: New version (keeps the same URL).
