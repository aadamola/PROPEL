# Step 0 — the Instagram test (about 45 minutes)

*Replaces the WhatsApp-era Step 0 in `ops/setup/meta-app-setup.md` for this client. It answers one question before any date goes to Shalom Park: **will Meta let an app inside IFT Realty's own portfolio answer real buyers without App Review?***

**Already done (2026-10-16):** the `Shalom Park Concierge` app (ID `1739429447113718`) is **owned by IFT Realty Ltd**. The Page `Shalom Park Nigeria` and `@shalomparknigeria` are in the portfolio and linked. The system user `propel-concierge` is Employee, with the app, the Page and the IG account assigned.

**Safe while Phase 0 runs:** no webhook is subscribed, so nothing automatic answers anybody. The test sends one "please ignore" DM, and only to an account you name.

---

## A · Add the permissions to the app (10 min)

developers.facebook.com → **Shalom Park Concierge → Use cases → Manage messaging & content on Instagram → Customize**.

- If it asks *Instagram login* or *Facebook login*, pick **API setup with Facebook login**. Our workflows send through the Page, at `graph.facebook.com`.
- Click **Add required messaging permissions**. Then, under **Permissions and features**, add `instagram_manage_comments`.
- The set you need: `instagram_basic` · `instagram_manage_messages` · `instagram_manage_comments` · `pages_show_list` · `pages_read_engagement` · `business_management`. All six showed **Ready for testing** on 2026-10-16. `pages_manage_metadata` isn't offered under this use case any more, so skip it. The check reports whether it's missing but doesn't count that as a failure.
- **Screenshot the permission list.** Next to each permission it says either *Ready for testing* or something about review, and that wording is part of the answer.

## B · Make the token (5 min)

business.facebook.com → IFT Realty Ltd → **Users → System users → propel-concierge → Generate token**

- App: **Shalom Park Concierge** · Expiration: **Never** · tick the six permissions above → Generate.
- **Copy it and keep that tab open.** Meta shows it once. Don't paste it into WhatsApp, chat, email or notes. It goes into the server prompt in C and nowhere else.

## C · Run the check on the server (5 min)

```
cd /opt/propel-repo && git fetch origin main && git checkout main && git pull
bash ops/setup/vps-tools.sh step0
```

Paste the token when it asks. Nothing shows while you paste, and that's expected. **Press Enter to skip the username** the first time. Screenshot the result. It's safe, because the tool never prints a token, and it scrubs one out of Meta's errors too.

It checks: the token is valid, belongs to this app, never expires and has every permission · Graph **v21.0** (what our workflows call today) and **v26.0** (what the dashboard offers) · the Page can issue a Page token and is linked to @shalomparknigeria · the app can read the account's DMs.

## D · The real question: can it message someone with no role on the app? (15 min)

1. **You first:** from your own Instagram, DM `test` to @shalomparknigeria. Run `step0` again and enter **your username**.
2. **Then an outsider:** someone with **no role on the app**. Collins or Mercy is ideal, because they're client staff, not personal contacts. They DM `test` to @shalomparknigeria. Run `step0` and enter **their username**.

The person must have messaged within the last 24 hours, or Meta refuses the send no matter what permissions the app has.

## E · Read the answer

| What you see | What it means | Next |
|---|---|---|
| ✓ the DM reaches the **outsider** | 🟢 **Fast lane confirmed.** No review needed | I set the Graph version, then cutover (`12-phase1-golive.md` step 10) |
| ✓ for you, ✖ for the outsider | 🟡 **Dev mode is the ceiling.** Try **Publish** on the app dashboard. If it publishes, re-run D.2. If it asks for Business Verification, start it with CAC RC 640603 | Days, not weeks |
| ✖ for both, with a permissions error | 🔴 **App Review required** | Tell Shalom Park honestly, and our own CAC goes back on the critical path |

**Send me the screenshots from A, C and both D runs.** The date for Shalom Park depends on which row we land in, so don't give them one until we know.
