NIYAS & DHIYA — WEDDING RECEPTION INVITATION
=============================================

UPLOADING (Hostinger or any static host)
  Upload everything in this folder to the site's root (public_html on Hostinger),
  so index.html sits at the top level. No build step needed.

1) ADDING THE DATE (once confirmed)
  Open script.js. Near the top, in CONFIG, change
      date: '',
  to the date in YYYY-MM-DD form, for example
      date: '2027-01-31',
  Save and re-upload script.js. That one change will:
    - show the weekday and date in "The Wedding Reception" panel,
    - start the Days / Hours / Minutes / Seconds countdown (Asia/Kolkata time, from 5:00 PM),
    - enable the "Add to Calendar" button (the calendar entry is 4 hours long; change calendarHours if needed).
  Until then the date, countdown and calendar stay hidden or disabled, and the
  panel shows "Date to be announced".

2) WHATSAPP PREVIEW
  In index.html, replace the relative URLs in og:url, og:image and twitter:image
  with absolute ones on your domain, e.g.
      https://your-domain.com/assets/og-image.jpg
  WhatsApp only shows the preview image reliably with an absolute URL.
  WhatsApp caches previews, so test with a new link or a fresh chat.

OTHER DETAILS (all in CONFIG in script.js)
  Time label, venue name, Google Maps link and music volume.

FILES
  index.html, style.css, script.js
  assets/couple/        all pre-wedding photographs (1280 x 1920)
  assets/couple/sm/     the same photographs at 640 x 960 for the gallery
  assets/opening/       envelope, N & D wax seal, botanical wallpaper
  assets/art/           dividers, botanical corner, paper grain
  assets/music.mp3      background music (carried over from the original site)
  assets/og-image.jpg   1200 x 630 social preview
