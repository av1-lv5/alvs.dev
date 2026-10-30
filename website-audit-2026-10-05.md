# Website audit — 5 October 2026

**Overall judgment: approximately 7/10.** This is a coherent, pleasant personal website with a credible technical foundation. Its restrained aesthetic fits a developer who writes and makes things. As a hiring portfolio, it undersells the strongest evidence and asks visitors to do too much exploration before contacting you.

These scores are editorial judgments, not Lighthouse scores or a WCAG certification. They capture the original audit before the focused follow-up and have not been rerated. The original audit was read-only; the contrast changes applied on 5 October 2026 are recorded below.

**Scope and evidence.** Inspected the running site at localhost:4321, its source, and a freshly built production version served locally. Viewed desktop layouts at 984 and 1440 CSS pixels and mobile layouts at 390 and 320 pixels. Inspected the homepage, projects, Orbit, contact, hiring, notes, movies, and feeds in the browser; inspected remaining shared templates and content in source. Scanned all 51 generated HTML pages. Tested desktop search, mobile search, Enter navigation, empty results, Escape/focus restoration on desktop, back-control keyboard access, and feed-tab arrow-key behavior. The original contrast checks used computed colors and opacity on plain backgrounds; the follow-up figures below use current CSS tokens against solid page backgrounds. These are targeted checks, not an exhaustive automated accessibility scan.

Not measured: deployed Core Web Vitals, Lighthouse, real network transfer sizes, conversion rates, full screen-reader behavior, browser zoom/text-spacing overrides, physical-device keyboard/safe-area behavior, external-link health, hosting security headers, and every interactive state. Local API/network failures are not evidence that the deployed integrations fail.

| Area | Judgment /10 | Main reason |
| --- | ---: | --- |
| Visual consistency | 8 | Repeated spacing, palette, typography, and editorial layouts |
| Modern feel | 7.5 | Clean rendering, responsive dock, command palette, contemporary type |
| Distinctiveness | 6.5 | Pixel identity is stronger on mobile; desktop first impression is conventional |
| Colors | 8 | Restrained blue and neutral palette suits the author |
| Typography | 7.5 | Comfortable main text; secondary information is too small and faint |
| Hierarchy and composition | 7 | Good macro spacing; weak distinction between evidence and supporting content |
| Accessibility | 5.5 | Measured contrast failures and keyboard/semantics problems |
| Responsive layout | 8 | Sampled narrow layouts reflow without horizontal page overflow |
| Interaction | 7 | Search is useful; contact labels and some keyboard patterns are inconsistent |
| Navigation and discovery | 6.5 | Large content collection sits behind sparse navigation and directory search |
| Hiring clarity | 6 | Role is clear, but outcomes and contact actions are buried |
| Content and credibility | 7 | Strong experience exists; case studies and visible summaries need more proof |
| Performance foundation | 8 | Static output and small shared assets; field performance remains unverified |
| Search/share metadata | 7 | Core tags exist; identity, project previews, and discovery can improve |
| Reliability and error states | 5.5 | Some data failures produce empty or unhelpful pages |

**What should stay.** Keep the black/white/gray/blue palette, readable body typography, narrow editorial layout, straightforward writing, cube identity, and mobile dock. The site feels personal without requiring elaborate visual effects. Geist is a sensible fit here; changing it just to chase a more fashionable typeface would have little value. The command palette and linked engineering notes are useful evidence of care. The project list is easy to scan, and the distinction between work, writing, interests, and backstage content is understandable once discovered.

**Purpose and first impression.** The homepage answers who you are and where you are based. It does not quickly answer what kind of work you are especially good at, what you have shipped, and what the visitor should do next. “Who builds for the web” is accurate but broad. The route-style links `/now`, `/about`, and `/hire-me` fit a technical personal site, but hide the useful verbs a potential client wants to recognize.

Your existing experience data reports Orbit with 100+ users, work rendering 10,000+ map markers, and leading 8 interns to deliver 200+ templates. These are claims already in your content, not independently verified business metrics. They are stronger than the homepage introduction, yet hidden in expandable experience details. Surface one or two accurate, current examples alongside your role. Suggested hierarchy: introduction and availability → selected work with a visible outcome → one recent engineering note → personal exploration. Keep a clear “View selected work” and “Work with me” path near the introduction.

**Visual design and modern feel.** The desktop page is calm and balanced, but can read as a nicely styled README. Almost every section uses the same muted paragraph plus uppercase label and divider, so there is little visual distinction between an important product and supporting information. The homepage’s Orbit section describes a visual product without showing it. Make Orbit a more substantial feature with a compact real screenshot, your role, and a case-study link. Retain the quieter list treatment for secondary projects.

The mobile pixel strip and floating dock give the site more character than the desktop opening. Repeat one small identity detail on desktop, rather than introducing a competing aesthetic. Avoid adding glass effects or gradients throughout: the dock already supplies the main visual flourish. Give high-value content more prominence through scale, placement, and imagery.

**Colors and contrast.** The restrained blue and neutral palette still fits the site. The original contrast failures came mostly from opacity applied on top of already-muted colors. A follow-up removed that opacity from informative metadata, strengthened the secondary text and link tokens, underlined inline body links, and fixed the explicit dark-theme palette. The global dark-mode image filter was removed so screenshots and artwork retain their source colors.

The figures below are recalculated from the current CSS tokens against the solid page backgrounds using sRGB relative luminance. They cover these text colors and examples only; they are not an exhaustive accessibility scan or WCAG certification.

| Sample | Light contrast | Dark contrast | Finding |
| --- | ---: | ---: | --- |
| Main muted body text | ~6.92:1 | ~9.75:1 | Passes normal-text minimum |
| Blue text links against page background | ~6.39:1 | ~7.29:1 | Passes normal-text minimum |
| Project years, 11.2px without opacity | ~5.97:1 | ~8.79:1 | Passes normal-text minimum |
| Footer utility links, 12.8px without parent opacity | ~5.97:1 | ~8.79:1 | Passes normal-text minimum |
| Note update dates, 11.2px without opacity | ~5.97:1 | ~8.79:1 | Passes normal-text minimum |
| Game instruction, 12.8px without opacity | ~5.97:1 | ~8.79:1 | Passes normal-text minimum |

Normal-sized informative text needs at least 4.5:1 contrast; qualifying large text needs 3:1. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

The contrast fixes preserve hierarchy through size, weight, and spacing instead of fading informative labels. Inline links now have persistent underlines, so visitors can identify them without relying on color perception; navigation and standalone actions retain their contextual styling.

A source-confirmed theme defect is fixed: explicit `data-theme="dark"` and the system-dark fallback now define the same dark palette. This previously left most of the page using light variables when someone selected Dark on a light-mode OS. Evidence: [minimal.css](/Users/avinash/Developer/Projects/portofolio/src/styles/minimal.css:39).

The global dark-mode image filter that altered portfolio screenshots and artwork has been removed.

**Typography and spacing.** Main body text is 16px with roughly 25.6px line height; introductory text is 18px with 28.8px line height. Main headings are 40px on desktop and 32px on mobile. These choices read well. The desktop content width is 768px, with 351px available at a 390px viewport and 288px at 320px.

The remaining weak point is secondary type size: some years and dates are still 11.2px, action labels are 12px, and all-caps section headings repeat often. Their contrast now passes the targeted checks, but useful metadata could move toward 13–14px. Consider a 65–72ch reading width for long prose while allowing lists and images to use the full content width. Section gaps are generous; keep them on the homepage, but tighten repeated gaps on the hiring page so the next meaningful action arrives sooner.

**Accessibility and interaction defects.**

1. **High priority: the back arrow is unavailable to keyboard users.** It is an anchor with no `href`, accessible name, or button semantics. On Orbit, the first Tab went to Live and skipped the back control. Use a real named button for history behavior, or a real parent-page link. A parent link also gives someone arriving from a search engine a predictable destination. Evidence: [BackInHistory.astro](/Users/avinash/Developer/Projects/portofolio/src/components/BackInHistory.astro:5).
2. **High priority: mobile search has mismatched modal boundaries.** The dialog contains results, but its search input and close button are siblings outside the element carrying `aria-modal="true"`. Focus moves to that outside close button. This creates a risk that assistive technology exposes the results but excludes the controls needed to use them. Put the entire expanded interaction inside one dialog boundary, manage background availability, and test with VoiceOver or another screen reader. Existing focus trapping and focus restoration are valuable. Evidence: [MobileDock.astro](/Users/avinash/Developer/Projects/portofolio/src/components/MobileDock.astro:47).
3. **Medium priority: feed tabs lack the expected arrow-key pattern.** ArrowRight on Technical left focus and selection on Technical. All three tabs remain in the Tab order. Implement roving tab focus and the appropriate arrow/Home/End behavior, or use simpler native controls without tab semantics. Evidence: [Tabs.astro](/Users/avinash/Developer/Projects/portofolio/src/components/ui/Tabs.astro:60).
4. **Medium priority: copy feedback is visual only.** The tooltip is not a live status message. The implementation also adds the success-looking checkmark and success class even when copying fails. Announce “Email address copied” and use a separate failure state. Evidence: [clipboard.ts](/Users/avinash/Developer/Projects/portofolio/src/utils/clipboard.ts:36).
5. **Medium priority: reduced-motion support is partial.** Search transitions have accommodations, but the theme reveal, smooth scrolling, and continuously animated game do not have equivalent coverage. Provide a static or immediate alternative. The game also requires a click to set its internal keyboard-focus flag and has no accessible start control or canvas description.
6. **Lower priority: navigation semantics need refinement.** Add `aria-current="page"` to current navigation links, name the GitHub icon link explicitly, and label the logo link “Avinash — Home.” Add a skip-to-main link, especially for repeat visits and longer pages. Do not treat the presence of an `alt` attribute as proof that the alternative is descriptive: “Project preview” gives little information about the Orbit screenshot.
7. **Lower priority: heading levels skip on 14 generated pages.** Examples include Orbit going H1 → H3 and hiring experience going H2 → H4. Use heading levels for structure and CSS for appearance. A skipped level alone is not automatically a WCAG failure, but the outline is unnecessarily confusing.

Desktop search opened correctly, focused its input, navigated to Notes with Enter, and returned focus to its trigger on Escape. Mobile search found the hiring page from “hire,” navigated with Enter, and produced an explicit empty-results message. These behaviors are worth preserving.

**Touch and responsive behavior.** Notes, contact, projects, and Orbit showed no horizontal page overflow at 320px. Contact’s email text fits at 320px, but nearly consumes its full 288px content width; make it resilient to larger text or a longer address. The dock targets are 40×40px. The desktop theme target is only 20×20px. Aim for 44×44px hit areas for isolated controls while retaining compact visible icons. WCAG 2.2’s AA minimum is 24×24px with exceptions, including adequate spacing; a 20px icon is not automatically a failure without considering those exceptions. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Below 768px the header and footer are hidden entirely. That avoids duplication and gives the dock room, but removes the direct theme control and footer discovery links. Mobile search indexes only 20 directory pages and does not offer the desktop theme action. Put theme settings and “Explore all pages” somewhere discoverable on mobile. Small visible labels would also help visitors distinguish Projects, Connect, and Search without interpreting icons. The 120px dock fade is elegant, but blurs content while it passes beneath the fixed navigation; verify focused elements remain visible on real devices.

The legacy hamburger menu is currently hidden along with the header on sampled mobile layouts. Its clickable `div` controls, missing focus handling, and malformed LinkedIn URL are dormant source defects, not the active mobile navigation failure. Remove that unused path or repair it before reusing it.

**Contact and hiring flow.** The hiring page’s contact controls were roughly 2,196px down in the sampled wide-screen production layout. Resume and contact links should appear near the first screen, then repeat at the end. “Send an email” currently copies an address instead of opening a composer; rename it “Copy email” and offer a separate `mailto:` action. Evidence: [hire-me.astro](/Users/avinash/Developer/Projects/portofolio/src/pages/hire-me.astro:72).

The contact page is otherwise welcoming: the email is prominent, response expectations are explicit, and suggested inquiry details help. The warning that the address changes and should not be saved undermines the expectation of an ongoing professional relationship. Prefer a stable public professional alias if operationally possible, or explain what happens to existing conversations.

The contribution graph occupies hiring-page space but conveys less useful evidence than outcomes. Its “fat ass commits” caption may fit the personal website’s voice; on a hiring page it can distract from the work. Move optional activity below the contact action or to a personal page. Expand at least the most recent role by default, or summarize its strongest achievement outside the disclosure.

**Projects and credibility.** The project directory currently mixes a 2026 product with 2022–2023 implementations under Featured. Give the original product the strongest visual treatment and identify challenge/learning projects accurately so visitors understand their context. Replace repeated Live/Read/Code labels with contextual accessible names such as “Read the Orbit case study.”

Orbit explains the product’s problem and engineering decisions clearly. It needs a brief role/timeframe/status summary, real interface images, and outcomes near the top. Reuse the reported user count if current and supportable. The Mapbox note and frontend ownership are stronger professional evidence than another technology list. Show a compact “Problem → decision → result” account of that work, with permission for any non-public material. Add a related contact action at the end of case studies.

**Discovery and editorial quality.** The site has 51 generated pages, but search consumes a hand-maintained directory of 20 entries. Someone searching for an article title or Orbit will not receive those individual destinations. Either expand the index to published notes, workflows, projects, and lab entries, or explicitly frame it as a page directory. The sitemap label “Resume” takes visitors to Hire me; use consistent labels and distinguish the actual PDF download.

The About page invites visitors to leave a message in a guestbook, but that destination is Coming Soon. Remove the invitation until usable, or disclose the state before navigation. The note update label “Updated May 2026” has `datetime="2023-10-07"`; fix the machine-readable date. Evidence: [EntryList.astro](/Users/avinash/Developer/Projects/portofolio/src/components/EntryList.astro:35). Copy-edit visible details such as “Its,” “one-self,” “spendings,” and “Updated as evolves.” Keep the informal voice while correcting errors. An RSS feed for your own writing would give regular readers a useful return path.

**Performance and technical quality.** `pnpm build` succeeded and generated 51 pages. Static HTML inspection found exactly one H1 and no missing image alt attributes on each page. Every checked root-relative anchor destination corresponded to a generated file or page. This did not validate external URLs, fragment targets, meaningful alt descriptions, or behavior.

The production homepage references approximately 54.4KB of first-party JS and CSS uncompressed, or 16.9KB when individually gzip-compressed for estimation. Its HTML is approximately 7.9KB gzip. The two Latin font files total about 52.5KB. These figures exclude third-party analytics, imported dependencies, other font subsets, images, and HTTP overhead; they are artifact measurements, not captured network-transfer totals. The Orbit preview PNG is approximately 370KB. Use a suitably sized modern image format and intrinsic dimensions when featuring it. CSS already reserves space for several cards, so missing HTML dimensions do not alone prove layout shift.

The footer game starts a requestAnimationFrame loop on every shared-layout page and stops when the document is hidden. It does not stop merely because the footer is below the viewport or CSS-hidden on mobile. Pause offscreen/hidden rendering and load or start the game when requested. Keep the playful detail, but avoid continuous work during reading.

No honest LCP, INP, or CLS claim can come from these build sizes. Validate deployed pages on mobile and desktop, then monitor real-user results where available. Good Core Web Vitals targets are LCP ≤2.5 seconds, INP ≤200 milliseconds, and CLS ≤0.1 at the 75th percentile. [web.dev Web Vitals guidance](https://web.dev/articles/vitals).

**Reliability and content states.** The local build logged failed iTunes lookups and generated an empty podcast list without explanatory copy. Music generated an unavailable-data message, and the hiring graph showed unavailable contribution data. These failures were observed in a restricted local network environment; deployed status was not checked. They nevertheless expose fallback behavior that needs improvement. Keep a last-known-good snapshot or curated local content, display a useful empty state, and avoid making the visitor read internal credential explanations such as “Spotify key expired.” Music is generated during the static build, so “real-time look” also overpromises freshness; show a last-updated date or describe it as a snapshot.

The service worker caches the homepage HTML and returns it when any navigation fetch fails. It does not cache a full offline asset set or the requested page. A visitor can therefore receive homepage content at an article URL while offline. Prefer a clearly identified offline page or a coherent cached-page strategy. Offline behavior was inspected in source, not simulated. Evidence: [sw.js](/Users/avinash/Developer/Projects/portofolio/public/sw.js:29).

**Search and sharing.** Production output has descriptions, canonical URLs, and social metadata pointing to alvs.dev; localhost social URLs seen in development are not a production defect. Several pages and all project layouts fall back to a generic share image. Give your strongest case study a relevant image and informative title. “Hello • avi” has little name/role context outside the site; consider “Avinash — Frontend Engineer.” An XML sitemap, author/writing structured metadata where appropriate, and an RSS feed are useful improvements. No XML sitemap or robots.txt was found in the generated output; neither absence alone means the site cannot be indexed. Deployed indexing, headers, and preview rendering remain unverified.

**Recommended order.**

| Order | Work | Intended improvement | Acceptance check |
| --- | --- | --- | --- |
| 1 | Contrast and dark palette (done); fix the back control, mobile modal, and feed tabs | Reading and navigation work for more people | Targeted text tokens pass contrast minimums in both themes; keyboard flows work; screen-reader modal test passes |
| 2 | Correct copy/email actions and expose contact/resume near the top | Visitors can act immediately | Labels match behavior; copy success/failure announced; contact needs no long scroll |
| 3 | Surface existing outcomes and feature Orbit visually | Visitors can assess your ability quickly | A new visitor can identify your specialty, one result, and next action from the opening content |
| 4 | Improve mobile discovery and search coverage | The wider site becomes easier to explore | Reach Notes, Hire me, and theme settings without knowing route names |
| 5 | Fix guestbook invitation, data fallbacks, dates, and copy | Fewer dead ends and credibility distractions | Empty/unavailable pages explain their state and offer a useful alternative |
| 6 | Optimize game lifecycle/images and verify deployed performance | Preserve the lightweight feel | Hidden game does no continuous rendering; measure representative deployed pages |

**Small metrics to keep watching.** Track homepage-to-case-study clicks, homepage-to-contact clicks, contact-action success, resume downloads, mobile versus desktop search usage, zero-result searches, failed external-data loads, and Core Web Vitals. Use aggregate events in the existing analytics approach where practical; do not record email content or raw visitor search text unnecessarily. Measure changes against your own baseline rather than inventing a universal portfolio conversion target. Pair those numbers with a five-second comprehension check: can a fresh visitor state what you do, cite one piece of evidence, and identify how to reach you?

The strongest direction is a refined personal editorial site with clearer work evidence. Preserve the personality and restraint, increase the visibility of your achievements, and make essential actions reliable and accessible.
