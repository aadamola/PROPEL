# Shalom Park: Meta setup + Step 0 test (you have admin)

*2026-10-16. Shalom Park granted ADEDAMOLA admin on IFT Realty's Meta business portfolio, so you can do the whole session yourself. About 45 minutes. **Nothing here goes live**: the app stays in Development mode, the webhook stays unsubscribed, and Phase 0 keeps running by hand.*

> **Meta's screens move.** If a button below isn't where I say, screenshot the page and send it. Don't guess. Never screenshot a token or the App Secret.

---

## Part A — the portfolio (10 min) · business.facebook.com/settings → IFT Realty Ltd

1. **Accounts → Pages:** the Shalom Park Facebook Page is listed. *No Page? Create one (2 min). No Page means no Instagram DMs.*
2. **Accounts → Instagram accounts:** the Shalom Park Instagram is listed and connected to that Page.
3. On the Shalom Park Instagram app: search Settings for **"Allow access to messages"** and switch it **ON**.
4. **Security Centre → Business verification → Start.** Use IFT Realty Ltd, RC **640603**, plus an address document. *Start it and don't wait on it; it can take days.*

## Part B — the app (10 min) · developers.facebook.com

5. **Create app.** Pick the Instagram messaging use case if offered, otherwise *Other → Business*.
   - Name: `Shalom Park Concierge`
   - Contact email: `aadamola@gmail.com`
   - 🔴 **Business portfolio: IFT Realty Ltd.** *This one dropdown decides whether this is self-integration or a two-week App Review queue.*
6. Add the **Instagram messaging** product (Messenger → Instagram settings, or "Instagram API with Facebook Login"). Leave the app in **Development** mode.
7. **App settings → Basic → App secret → Show.** Don't copy it anywhere except the server, in step 11.

## Part C — the system user (10 min) · business.facebook.com/settings → Users → System users

8. **Add** → name `Propel Concierge` → role **Employee** (never Admin).
9. **Assign assets** to it:
   - the **Page** (messaging permissions)
   - the **Instagram account** (messaging + comments)
   - the **app** `Shalom Park Concierge`
10. **Generate new token** → app `Shalom Park Concierge` → expiry **Never** → tick `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_show_list`, `pages_manage_metadata`, `pages_read_engagement` (and `business_management` if listed) → **Generate**. Keep the page open; you paste it once, in step 13.

## Part D — the server (10 min)

11. **App secret → `.env`**, hidden, never echoed:
```
read -rsp "App secret: " S; echo; echo "SHALOM_PARK_APP_SECRET=$S" >> /opt/propel/.env; unset S
bash /opt/propel-repo/ops/setup/vps-tools.sh n8n-env
```
You want `✓ SHALOM_PARK_APP_SECRET set`.

12. **Get the newest tools:**
```
cd /opt/propel-repo && git pull
```

13. **Step 0, first pass.** Paste the system-user token when it asks:
```
bash /opt/propel-repo/ops/setup/vps-tools.sh step0 shalom-park
```
It checks the token, finds the Page and the Instagram account, saves the **Page token** (the one n8n needs) to a root-only file, and lists recent conversations. Nothing secret is printed.

14. **From @getpropel.tech** (Propel's own Instagram: an outside account with no role on the app), DM **Shalom Park's Instagram** the word `test`. *Don't use an account linked to your personal Facebook, because your Facebook is now an app admin and that would fake a pass.*

15. **Step 0, the real test.** Paste the token again:
```
bash /opt/propel-repo/ops/setup/vps-tools.sh step0 shalom-park getpropel.tech
```
@getpropel.tech should receive "Propel Step 0 test…". The tool prints one of:

| You see | Meaning | Next |
|---|---|---|
| 🟢 **FAST LANE** | An app in their portfolio can message outside accounts | We set a cutover date |
| 🟡 **Blocked for this user** | Development mode is the ceiling; Business Verification gates going Live | Days, not weeks |
| 🔴 **Permission block** | Meta wants Advanced Access (App Review) | Weeks; we plan around it |

**Send me a screenshot of the step 0 output.** It never shows a token, so it's safe.

---

## What we don't do tonight
- Don't subscribe the webhook (that's cutover morning: Phase 0 and Phase 1 never both answer)
- Don't switch the app to Live (needs the legal pages online first)
- Don't put the Page token into n8n yet. At cutover prep, the `Shalom Park IG` credential's value becomes `Bearer ` + the contents of `/opt/propel/.secrets/shalom-park-ig-page-token`

## Before cutover (after a 🟢 or 🟡)
1. Legal pages live (PR #10 → Vercel `site-legal` → DNS + hello@ forwarder)
2. `DELETE` reply handling (AI partner, building next)
3. Re-import `05-channel-instagram-shalom-park.json`. It now carries the promo review date of 15 Nov
4. Page token into the n8n credential → handshake → cutover sequence (`12-phase1-golive.md`)
