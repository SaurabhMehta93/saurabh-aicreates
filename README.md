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

## Customer reviews
- `CustomerReview.html` – not linked anywhere; send this link directly to customers.
- Reviews go to the Google Form → sheet "Saurabh AI Creates – Reviews" (tab "Form Responses 2").
- To show a review on the site: type `Yes` in column I (Approved). It appears on index.html and CustomerReview.html within ~5 min.
- The site reads only the published "Reviews – Public" tab (assets/js/reviews.js). Do not reorder columns in Form Responses 2.
