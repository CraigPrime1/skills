---
name: lookup-public-sds
description: Look up publicly listed SDS/MSDS safety data for a chemical from official government sources (PubChem LCSS, CAMEO, NIOSH). Use when the user asks for an MSDS, SDS, safety data sheet, chemical safety sheet, GHS classification, or LCSS.
---

Fetch the **public LCSS**, then point at the manufacturer SDS if they still need that.

A **public LCSS** is NIH PubChem's Laboratory Chemical Safety Summary: GHS pictograms, signal word, hazard statements, first aid, PPE, CAS. It is listed, free, and has an API. It is not the supplier's 16-section SDS. Workplace HazCom still wants that manufacturer sheet; we find a public PDF of it by CAS, we do not scrape vendor portals.

Read [SOURCES.md](SOURCES.md) when you need the API contract, the MSDS-vs-SDS history, or the manufacturer-PDF rule.

## Process

### 1. Lock the identity

Take the name, CAS, or PubChem CID the user gave. If they named a product brand ("Windex", "Goof Off") and not a chemical, say so and ask for the ingredient or CAS. One identity per lookup.

**Done when:** you have a name, a CAS (`digits-digits-digit`), or a CID, and you know which.

### 2. Pull the public LCSS

Run the skill's lookup against PubChem (no API key):

```bash
node skills/misc/lookup-public-sds/lookup.mjs "<name-or-CAS>"
```

Flags: `--cas 67-64-1`, `--cid 180`, `--json`. Several chemicals are fine on one command; the script spaces requests to stay under PubChem's 5/s cap.

**Done when:** the script printed a sheet (or a clear "not found"), and you have not invented hazards the API did not return.

### 3. Hand the sheet over

Show the markdown the script wrote. Keep the source links (PubChem LCSS, CAMEO, NIOSH, OSHA). Keep the line that this is a public LCSS, not a manufacturer SDS.

If they asked for a **manufacturer SDS**, add the public PDF search URL from the output and open any already-published PDF you can confirm. Quote that URL. Stop at listed pages.

**Done when:** the user can open the LCSS, see the GHS block, and (if they asked) has a public manufacturer SDS URL or a reason there isn't one.
