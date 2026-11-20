NIYAS & DHIYA — WEDDING RECEPTION INVITATION
=============================================

UPLOADING (Hostinger or any static host)
  Upload everything in this folder to the site's root (public_html on Hostinger),
  so index.html sits at the top level. No build step needed.

1) DATE
  The date is set in script.js (CONFIG.event.date = '2026-12-16', Wednesday 16 December 2026).
  It drives the date in the reception panel, the countdown (Asia/Kolkata, from 5:00 PM)
  and the "Add to Calendar" button (a 4-hour entry; change calendarHours if needed).

1b) RSVP
  Replies go to a Google Sheet. Follow RSVP-SETUP.txt (supplied with Code.gs), then paste the
  Apps Script /exec URL into CONFIG.rsvp.endpoint in script.js. Until then the form shows
  "RSVP is not connected yet".

2) WHATSAPP PREVIEW
  index.html points og:url / og:image at https://niyas-dhiya.vercel.app/ .
  If the domain changes, update those three URLs (og:url, og:image, twitter:image) and the canonical link.
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
