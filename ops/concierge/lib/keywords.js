/**
 * Keyword fast lane.
 *
 * A deterministic layer that sits IN FRONT of the Concierge brain. An exact
 * rule match returns a pre-written, human-approved response with no model
 * call: ~0ms, ₦0, and zero hallucination surface. Anything that does not
 * match falls through to the brain, which still has the KB and the
 * guardrails.
 *
 * Same doctrine as docs/13 "arithmetic never goes to a language model":
 * an answer we already know the exact words for should never be regenerated.
 *
 * Two invariants this file exists to hold:
 *   1. An escalate_only rule BEATS any commercial rule when both match, so
 *      "what is the ROI on the 4 bedroom" can never fire the price card.
 *   2. A rule whose link cannot be resolved ships with no link at all.
 *      A keyword automation that DMs a dead link is worse than none.
 *
 * Unit-tested (tools/test-keywords.js) and embedded verbatim into the
 * workflow JSON at build time, so shipped code is tested code.
 */
'use strict';

/** Spelled numbers and shorthand people actually type in Lagos IG comments. */
const WORD_NUMBERS = {
  one: '1', two: '2', three: '3', four: '4', five: '5', six: '6',
  seven: '7', eight: '8', nine: '9', ten: '10'
};

/**
 * Fold a raw message into comparable tokens.
 * Strips emoji and punctuation (IG comments are ~40% emoji), normalises
 * "4bed" / "4-bedroom" / "four bedroom" to one shape, and lowercases.
 */
function normalizeText(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')       // emoji, ₦, punctuation -> space
    .replace(/'/g, '')                        // don't -> dont, governor's -> governors
    .replace(/(\d)\s*(bedrooms?|beds?|bdrm|br)\b/g, '$1 bedroom')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return normalizeText(s)
    .split(' ')
    .filter(Boolean)
    .map(t => WORD_NUMBERS[t] || t);
}

/**
 * Contiguous token-subsequence match.
 *
 * Token-based on purpose: a naive substring search matches "land" inside
 * "Ireland" and "landscape", which is the single most common way a keyword
 * bot embarrasses a client in public.
 */
function containsPhrase(hay, needle) {
  if (!needle.length || needle.length > hay.length) return false;
  outer:
  for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/** Pre-tokenise a rule's phrases once, at compile time. */
function compileRule(rule) {
  return {
    ...rule,
    _phrases: (rule.trigger_phrases || []).map(p => ({ raw: p, tokens: tokenize(p) }))
                                          .filter(p => p.tokens.length > 0)
  };
}

function compile(rules) {
  return rules.map(compileRule);
}

/**
 * Score a rule against a tokenised message.
 * Longer matched phrases win — "2 bedroom price" resolves to the 2-bedroom
 * card, not the generic price card.
 */
function scoreRule(rule, hay) {
  let best = null;
  for (const p of rule._phrases || []) {
    if (!containsPhrase(hay, p.tokens)) continue;
    if (!best || p.tokens.length > best.tokens.length) best = p;
  }
  if (!best) return null;
  return { phrase: best.raw, score: best.tokens.length * 100 - (rule.priority || 50) };
}

/** Deterministic ordering so the same message always resolves the same way. */
function pickBest(hits) {
  return hits.sort((a, b) =>
    b.score - a.score ||
    (a.rule.priority || 50) - (b.rule.priority || 50) ||
    String(a.rule.rule_id).localeCompare(String(b.rule.rule_id))
  )[0];
}

/**
 * Resolve a rule's outbound link from client config.
 * Returns '' when the link cannot be built — never a half-formed URL.
 */
function resolveLink(rule, links) {
  const cfg = links || {};
  if (!rule.link_kind || rule.link_kind === 'none') return '';
  if (rule.link_kind === 'website') return cfg.website || '';
  if (rule.link_kind === 'whatsapp') {
    if (cfg.mode !== 'concierge' && cfg.mode !== 'human_line') return '';
    if (!cfg.wa_e164 || !cfg.whatsapp_template) return '';
    return cfg.whatsapp_template
      .replace('{{WA_E164}}', String(cfg.wa_e164))
      .replace('{{CODE}}', encodeURIComponent(rule.link_code || rule.rule_id));
  }
  return '';
}

/**
 * Is this rule's promotional text in force right now?
 *
 * A promotion is time-bound by definition. The failure mode we are designing
 * out is an automation still quoting a N5,000,000 entry deposit in November
 * for an offer that ended in September -- and a buyer turning up with the
 * wrong money because a robot never got the memo. A promo with no end date
 * cannot be compiled (tools/build-keywords.js enforces it), and an expired
 * one falls back to the standard warranted terms on its own.
 */
function isPromoLive(rule, now) {
  if (!rule.promo_response) return false;

  if (rule.promo_from) {
    const start = Date.parse(rule.promo_from + 'T00:00:00Z');
    if (Number.isFinite(start) && now < start) return false;
  }

  // A campaign that runs "until we sell out" has no end date, and pretending
  // otherwise would be inventing a fact. What it must have instead is a
  // REVIEW date: someone re-confirms it is still running, or the assistant
  // quietly goes back to the signed standard terms. Same safety property,
  // fitted to how the client actually sells.
  if (rule.promo_until) {
    const end = Date.parse(rule.promo_until + 'T23:59:59Z');
    if (!Number.isFinite(end) || now > end) return false;
  } else if (rule.promo_review_by) {
    const due = Date.parse(rule.promo_review_by + 'T23:59:59Z');
    if (!Number.isFinite(due) || now > due) return false;
  } else {
    return false;   // neither an end nor a review date: fail safe
  }
  return true;
}

/**
 * Build the outbound message body for a matched rule.
 * When no link resolves, the call to action degrades to "reply here" rather
 * than pointing a buyer at nothing.
 */
function buildBody(rule, cfg, bodyText) {
  const link = resolveLink(rule, cfg && cfg.links);
  const parts = [bodyText || rule.dm_response];
  if (link) parts.push(link);
  else if (rule.link_kind && rule.link_kind !== 'none') {
    parts.push('Reply here and the team will pick it up with you.');
  }
  if (cfg && cfg.assistant_signature) parts.push(cfg.assistant_signature);
  return parts.join('\n\n');
}

/**
 * Match a message against the compiled rule set.
 *
 * @returns {object} always an object; `matched:false` means "hand to the brain".
 */
function match(rules, text, cfg) {
  const hay = tokenize(text);
  if (!hay.length) return { matched: false, reason: 'empty_text' };

  const escalations = [];
  const fast = [];

  for (const rule of rules) {
    if (rule.status !== 'live') continue;
    const hit = scoreRule(rule, hay);
    if (!hit) continue;
    (rule.class === 'escalate_only' ? escalations : fast).push({ rule, ...hit });
  }

  // Invariant 1: safety class outranks commercial class, always. A buyer
  // asking about returns on a specific unit gets a human, not a price card.
  const winner = escalations.length ? pickBest(escalations) : (fast.length ? pickBest(fast) : null);
  if (!winner) return { matched: false, reason: 'no_rule_matched' };

  const r = winner.rule;
  const now = (cfg && cfg.now) || Date.now();
  const promoLive = isPromoLive(r, now);
  return {
    matched: true,
    rule_id: r.rule_id,
    intent: r.intent,
    rule_class: r.class,
    matched_phrase: winner.phrase,
    score: winner.score,
    promo_active: promoLive,
    promo_until: promoLive ? r.promo_until : '',
    reply: buildBody(r, cfg, promoLive ? r.promo_response : r.dm_response),
    public_comment_reply: r.public_comment_reply || '',
    link: resolveLink(r, cfg && cfg.links),
    link_code: r.link_code || r.rule_id,
    escalate: r.escalate === true,
    escalation_reason: r.escalate === true ? ('keyword rule ' + r.rule_id + ': ' + r.intent) : '',
    grounded_in: r.grounded_in || [],
    unit_interest: r.unit_id || ''
  };
}

module.exports = { normalizeText, tokenize, containsPhrase, compile, compileRule, match, resolveLink, buildBody, scoreRule, pickBest, isPromoLive };
