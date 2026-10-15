# Giving Propel access to your Meta accounts

*Client-facing guide. Send it as-is (fill the bracket), or walk the client through it on a screen share. The screen share is still the recommended route (see `clients/shalom-park/04-meta-access-pack.md`). Works for any client; first used for Shalom Park.*

**Method (ruled 2026-10-15 by ADEDAMOLA):** the client invites **getpropel.ng@gmail.com** as a **person with full control** of their Meta Business account. We chose this over Partner access so that day-to-day work (adding a number, a new Page, an ad account, a webhook app) never waits on the client clicking something. See the internal notes at the bottom for what this costs and how we handle it.

**Before sending, ADEDAMOLA fills in:** `[CLIENT NAME]`, and ticks only the accounts this client's engagement actually covers in Step 3.

---

## The short version

> You invite **getpropel.ng@gmail.com** to your company's Meta Business account with **full control**. That lets our team set up and run your WhatsApp assistant, Instagram and ads **without having to chase you every time something needs changing**. **No password of yours is ever shared.** Everything stays owned by [CLIENT NAME], and you can remove us in two clicks whenever you like.

**Who must do this:** someone who is already an **admin** on your company's Meta Business account (business.facebook.com). An "employee" login can't invite people with full control. If you're not sure who that is, it's usually a director or whoever set up the company's ads.

**Time:** about 5 minutes, on a laptop. (It works on a phone browser, but the screens are cramped.)

---

## Step 1: Open your Business settings

1. Go to **business.facebook.com** and log in with your normal Facebook account.
2. Top-left, make sure your **company's business account** is selected (not a personal one).
3. Click **Settings** (the ⚙️ gear, bottom-left).

## Step 2: Invite Propel

1. In the left menu: **Users → People**.
2. Click **Invite people** (or **+ Add**).
3. Enter the email **`getpropel.ng@gmail.com`** → **Next**.
4. Under access level, choose **Full control** (Meta may call this **Admin access**) → **Next**.

## Step 3: Give access to the accounts

Meta then asks which accounts this person can use. Select each one below and switch on **Full control** for it.

| Account type | Which one | Why we need it |
|---|---|---|
| **Instagram accounts** | Your business Instagram | To connect the assistant to your DMs and manage content |
| **Pages** | Your Facebook Page | Instagram messaging runs through the connected Page |
| **WhatsApp accounts** | The assistant's WhatsApp account *(if it already exists)* | To connect the number and run the assistant |
| **Ad accounts** *(only if we run your ads)* | Your ad account | To build and run campaigns. **Your card stays yours and you see every naira spent** |
| **Apps** *(if listed)* | Any app named for the assistant | To connect the assistant to WhatsApp and Instagram |

Then click **Send invitation**. If an account you expect isn't listed, don't worry: with full control we can add it ourselves once we're in.

## Step 4: Tell us it's sent

Message us on WhatsApp ("invite sent"). We accept the invitation from our side, and you'll see **getpropel.ng@gmail.com** move from "Pending" to active under **Users → People**. That's it; you won't need to do anything else for routine work.

---

## What you're agreeing to (and what you're not)

- **You own everything.** The Instagram, Page, WhatsApp number, every conversation and every ad stay in your company's account. Full control lets us *work in* your account, not take it.
- **You can see everything we do.** Changes are logged in your Business account, and your own admins keep full control alongside us.
- **We will never:** remove your admins, change your company's details or verification, add payment methods, or invite anyone else without asking you first in writing.
- **You never share a password with us.** If anyone, including us, asks for your password or a login code, say no.
- **You can remove us at any time:** **Settings → Users → People → getpropel.ng@gmail.com → Remove**. It takes effect immediately, no need to ask us.

## If something goes wrong

| What you see | What it means |
|---|---|
| No **Invite people** button, or **Full control** is greyed out | Your login isn't an admin. Ask whoever is admin to do it, or to make you admin first |
| Our invite still shows "Pending" after a day | Tell us; invitations expire and we'll ask you to resend |
| The account you want isn't in the list | It isn't in your Business account yet. Send the invite anyway; we'll add it once we're in |
| Meta asks you to confirm with a code or password | That's Meta checking it's really you. Enter it yourself; never send that code to anyone |

Stuck for more than five minutes? Message us on WhatsApp **+234 901 912 0968** and we'll do it with you on a screen share.

*Propel · We move property · getpropel.tech*

---

## WhatsApp-ready version (paste this, then send the guide)

> Hi [name], to connect your accounts please add us to your Meta Business account. It takes about 5 minutes:
>
> business.facebook.com → Settings → Users → People → Invite people → **getpropel.ng@gmail.com** → choose **Full control** → tick your Instagram, Facebook Page and WhatsApp → Send.
>
> That way we can set things up and fix things without chasing you each time. You still own everything and can remove us in two clicks any time. No passwords needed. Happy to do it with you on a quick screen share if easier.
>
> Adedamola · Propel

---

## Internal notes (delete before sending to a client)

- **Why People + full control, not Partner (ADEDAMOLA, 2026-10-15):** Partner access means every new asset (a new number, Page, ad account or app) has to be shared by the client first, and waiting on them was a serious bottleneck. With full control we add and configure assets ourselves. Decided; don't relitigate.
- **The Meta account behind the invite must be a real person's profile.** The invite goes to getpropel.ng@gmail.com, but it's accepted by logging in with a Facebook account. Meta disables "business-named" or shared personal profiles, and when it does we lose access to every client portfolio at once. Accept invites with ADEDAMOLA's own Facebook profile, with getpropel.ng@gmail.com added to it as a contact email, and **2FA switched on** (many portfolios require it before an admin can act).
- **Single point of failure:** one profile holds full control of every client. If it's locked, all clients are blocked. Once there are 2+ clients, add a second real person (or a Meta system user once our own portfolio is verified) as backup.
- **Full control means we could lock a client out, so the "we will never" list above is a promise we keep.** Never remove client admins, never change portfolio settings, verification or payment methods, never invite third parties. Breaking any of these is how an agency gets sued and loses the referral market. Ask in writing first, every time.
- **Commission evidence still lives in Propel's own database** (`ops/concierge/attribution-ledger.md`). Full control of their account does not change that: access can be revoked in two clicks, so nothing we need may live only inside it.
- **Meta renames these menus regularly** (Business Manager → Business Suite → Business portfolio). Re-check the click-path against the live UI before each new client and update this file if it has moved.
- **This does not replace business verification** (Security Centre → Start verification, client's CAC). That runs in parallel; see `04-meta-access-pack.md` step 3 and `ops/setup/SOP-01-client-waba-onboarding.md`.
- Never ask a client for passwords or 2FA codes. If a client offers them, decline and send this guide.
