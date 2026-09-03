# Public SDS sources

What this skill can actually retrieve, and from whom. Every claim below traces to the source that owns it.

## What a "publicly listed MSDS" is

- **MSDS** is the old OSHA name. Since the 2012 Hazard Communication Standard, the US document is an **SDS**: a 16-section Safety Data Sheet the *manufacturer or importer* prepares. See [29 CFR 1910.1200](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1200) and OSHA's [HazCom page](https://www.osha.gov/hazcom).
- Manufacturers often **post that SDS as a public PDF** on their own site. Those PDFs are listed, not secret. They are still the supplier's document. We do not scrape vendor portals in bulk.
- Governments publish **safety summaries** that cover the same hazards in a different format. Those are free, have APIs, and are what this skill fetches.

A public LCSS is a real, citable safety sheet. It is not a substitute for the supplier SDS a workplace has to keep on hand.

## Sources this skill uses

| Source | What you get | Access |
| --- | --- | --- |
| [NIH PubChem LCSS](https://pubchem.ncbi.nlm.nih.gov/) via [PUG REST](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest) and [PUG View](https://pubchem.ncbi.nlm.nih.gov/docs/pug-view) | Identity (CID, CAS, formula), GHS pictograms, signal word, H- and P-statements, first aid, PPE | No key. At most 5 requests per second. Contact PubChem for bulk jobs; do not hammer the API. |
| [NOAA CAMEO Chemicals](https://cameochemicals.noaa.gov/) | Emergency-response datasheet (reactivity, isolation distances, fire). HTML, not a JSON API we call. | Linked from the lookup by CAS. |
| [NIOSH Pocket Guide](https://www.cdc.gov/niosh/npg/) | Occupational exposure limits, IDLH, respirator advice | Linked, not scraped. |
| [OSHA Occupational Chemical Database](https://www.osha.gov/chemicaldata) | OSHA PELs and chemical listings | Linked, not scraped. |

PubChem PUG View takes a CID, not a name. Resolve the name or CAS to a CID with PUG REST first, then ask PUG View for the `GHS Classification`, `First Aid`, `Personal Protective Equipment (PPE)`, and `CAS` headings. The LCSS page for humans is `https://pubchem.ncbi.nlm.nih.gov/compound/{CID}#datasheet=LCSS`.

## Manufacturer SDS PDFs

When the user needs the supplier's own 16-section sheet:

1. Use the CAS from the LCSS.
2. Search the manufacturer's site, or a public `SDS OR MSDS {CAS} filetype:pdf` query.
3. Open only PDFs that are already published. Quote the URL. Do not log in, do not scrape a commercial SDS library (VelocityEHS, Chemwatch, 3E, and the like).

## Out of scope

- Commercial SDS authoring or inventory APIs that need a paid key.
- Bulk download of a vendor's SDS corpus.
- Anything that is not already published.
