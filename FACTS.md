# Boadman - product facts

**What this is:** verifiable facts about the product, the audiences, the money, the data
and the legal position. Nothing else.

**What this deliberately is not:** a design brief. There is no positioning line here, no
principles, no voice guidance, no success criterion, no opinion about what the page should
argue or how it should feel. Two earlier documents in this repo carry that direction and
both trace back to the same author, so reusing either produces variations on one idea
rather than genuinely independent work. Form your own view from the facts below.

---

## The product

Boadman is a competition platform for video-game players, 18+.

Players buy **coins** with a card. They stake coins in **1v1 challenges** and in
**tournaments**. The result of the match decides who takes the pot. Winnings can be
converted back to money and paid out to a bank account.

Coins are the unit throughout. Current rate: **1 coin = 10p**.

## The money path, step by step

1. A player buys coins by card. Coins land in their wallet.
2. Entering a competition moves the stake out of the wallet immediately.
3. From the start of a match until it settles, both players' stakes are held by Boadman.
   Neither side can spend, withdraw or re-stake them during play.
4. The match is played in the game itself. Boadman does not run the game; it holds the pot
   and records the result.
5. At settlement the pot pays the winner, minus platform commission.
6. A prize is then held for **48 hours** before it can be spent, so other entrants can
   raise a complaint about cheating. It matures automatically when the window closes.
7. Cash-out goes only to a bank account in the **same legal name** as the Boadman account.

### What can stop the money

- Losing. A lost stake pays the winner and is not returned.
- A complaint raised inside the 48-hour hold freezes the prize until an admin rules.
- A dispute ruled frivolous carries a fee, deducted from the person who filed it.
- A money-laundering review can freeze cash-out while it runs.
- A bank account whose name does not match the account holder's does not get paid.
- Identity checks are required before a first cash-out, and again at higher amounts.

## Audiences

**Players.** The volume audience and the only mobile-first one. Competitive gamers, 18+.
Many have used a platform that took deposits and did not pay out. Route: `/signup`.

**Brands / sponsors.** Fund prize pools to reach that audience. Desk-based. Blocked from
moving any value until business verification passes; there is no bypass.
Route: `/signup-brand`.

**Publishers / studios.** Rights-holders who license their titles to the platform and earn
a royalty share of platform commission. Desk-based. **They are the only mechanism by which
the platform acquires the right to run competitions on any game.** The only door that
exists today is `/waitlist/publishers`; there is no publisher signup route.

**Internal compliance and admin staff.** Not a landing-page audience. Noted because the
codebase carries a second complete theme for those screens, so a palette change has to
work twice.

## Operating state, as of 2026-08-12

- **Soft-live.** boadman.com is publicly reachable and accounts can be created. Payment
  rails are gated pending processor approval, so there are no real deposits or payouts yet.
- **No publisher has onboarded.** The platform therefore holds rights to no game, and no
  game has a cover image. Tournament cards render with no artwork.
- **The tournament board is empty in production right now.**
- No public tournament index exists. `/p/tournament/{id}` is the only anonymous-reachable
  competition page. Every other competition, game and challenge route requires an account.
- A cookie consent banner covers roughly the **bottom 180 to 260px** of the viewport on a
  first anonymous visit, and can escalate to a full-screen modal.
- Access is geofenced by IP. A blocked visitor lands on a real page telling them so.

## Data the page can show

From the platform, live:

- **Public counters:** tournaments live, prizes paid in the last 30 days, active players in
  the last 30 days, supported games. Counts render literally only from 0 to 999, then
  compact to `3.8k` and `1.2M`; money compacts to `£1.5k`. Maximum about 7 characters.
- **Featured competitions:** title, game name, live/open/starting-soon state, host name and
  type, prize pool in coins, the amount the host put up, entry fee, entrants and cap.
  Pool and entry render with full thousands separators and no width cap, so a cell must
  hold `1,250,000`. An entry fee of exactly 0 means free entry.
- **Commission rates**, server-configured.
- **Viewer identity**: signed out, or signed in as player, brand, or admin.

Three hard truths about that data:

- **The counters can be absent entirely.** On a backend failure the whole block is removed
  from the page rather than showing zeros. Nothing may depend on its height.
- **A zero is ambiguous.** The counters endpoint returns success with zeros when part of
  the database fails, so a genuinely quiet platform and a broken one look identical.
- **The rates endpoint never visibly fails.** On error it silently substitutes defaults, so
  a rate on screen may not be the live one.

## Data that does not exist

- Any figure about brands or publishers. Those stories are told with mechanics and words.
- Testimonials, quotes, press mentions, partner or publisher logos, case studies, campaign
  results. No partner has been named or agreed.
- Photography, product screenshots, founder or player imagery, event or crowd imagery.
- Any licensed game artwork, logo, or title. The game art currently in the repository is
  unlicensed and is being removed.
- Player-protection controls beyond an emailed request for manual account suspension. No
  deposit limits, loss limits, session reminders, reality checks, cooling-off timers or
  self-exclusion exist.

## Legal position

- **The licence and regulatory classification are unresolved.** Counsel opinion outstanding.
- No claim of registration, licensing or supervision may appear, with or without a number.
- No self-classification against gambling law may appear, **including the characterisation
  that would be favourable**. Describe events; do not characterise them.
- No wording implying deposit protection, safeguarding, segregation, insurance, or that
  balances survive the company's failure.
- No earnings, income or investment framing, and no figure presented as typical or
  achievable.
- No response-time or support commitments.
- No jurisdiction claim of any kind.
- Identity-check trigger amounts must not be published.
- No urgency or scarcity device that is not a direct render of a real timestamp.
- No sign-up inducement, including calling anything "free" that is not genuinely £0.

## Required on any public page

- **18+**, as text rather than an icon alone, visible in the first viewport and again in the
  footer, in every signed-in state.
- A **risk-of-loss statement in the same visual block as the first prize, pool or payout
  figure**, at body weight: a stake is lost when you lose.
- A **responsible-play block** naming an independent service with a working link and phone
  number: GamCare, 0808 8020 133, gamcare.org.uk.
- A **Terms link** from every block describing stakes, holds, disputes, commission or
  payouts.
- A **cost statement** where coins first appear: coins are bought with real money, and
  commission is deducted on settlement.
- **No protection, holding or payout mechanic without its downside on the same screen**, in
  the same type-size band.

## Real destinations

`/signup` · `/signin` · `/signup-brand` · `/waitlist/publishers` · `/faqs` ·
`/legal/terms` · `/legal/privacy` · `/legal/cookies` · `/legal/responsible-play` ·
`/p/tournament/{id}` · `mailto:support@boadman.com` · `mailto:compliance@boadman.com`

Nothing else exists. Every other route requires an account and will bounce an anonymous
visitor to a sign-in wall.

## Brand assets

- **The mark:** a Spartan helmet with the `BOADMAN` wordmark, one SVG, ratio 164:55. It is
  the only fixed visual element. Do not redraw or distort it.
- Current production colours are near-black `#0B0C10` with a single orange accent
  `#FF5733`, plus semantic green, red, amber and blue. Four self-hosted type families.
  **All of this is the current answer, not a requirement.**
- Money is rendered with tabular figures, an explicit unit, and prizes are never
  abbreviated: `12,400 coins`, not `12.4k`. This binds whatever typeface is chosen, so that
  face needs tabular figures. The compacted public counters above are the exception.

## Known defects in the current build

Fix rather than inherit:

- Body and caption grey measures **3.6:1** against the page. White on the primary button
  measures **3.15:1**. Both fail.
- The focus ring measures **1.9:1**.
- There is **no reduced-motion handling at all**, while several looping animations run.
- Below 1024px there is **no navigation** and no menu.
- The competitions feed costs up to about 25 database queries per page render, and there is
  no loading state or error boundary.
