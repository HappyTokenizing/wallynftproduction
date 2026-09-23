# Visitor analytics

Vercel Web Analytics is enabled on the `wallynftproduction` project. The root layout mounts the official Next.js Analytics component through `SiteAnalytics` only when `VERCEL_ENV=production`. Local development and preview builds do not collect traffic.

The collector is served from the NFT site's own Vercel project, keeping its visitor counts separate from RWAF. Only `wallynft.xyz`, `www.wallynft.xyz`, and the production project's main Vercel alias are accepted. Pageviews use Next.js routing; in-page anchors and gallery dialogs do not count as separate pages.

The integration strips query strings and fragments, excludes admin paths, and sends no custom events, form values or wallet identities. Standard anonymous analytics begins when deployed; no historical backfill or permanent analytics archive is created. No Analytics Plus add-on is required.

Dashboard: https://vercel.com/happytokenizings-projects/wallynftproduction/analytics
