#!/usr/bin/env node
/**
 * Fetch a public Laboratory Chemical Safety Summary (LCSS) from PubChem.
 *
 * Usage:
 *   node lookup.mjs acetone
 *   node lookup.mjs --cas 67-64-1
 *   node lookup.mjs --cid 180
 *   node lookup.mjs --json ethanol
 *   node lookup.mjs acetone ethanol
 *
 * Official source: NIH PubChem PUG REST + PUG View.
 * Rate limit: at most 5 requests per second (PubChem usage policy).
 */

const BASE_REST = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const BASE_VIEW = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view";
const USER_AGENT =
  "CraigPrime1-skills-lookup-public-sds/0.1 (https://github.com/CraigPrime1/skills)";
const GAP_MS = 220;

const CAS_RE = /^\d{2,7}-\d{2}-\d$/;

function parseArgs(argv) {
  const out = { json: false, queries: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      out.json = true;
    } else if (arg === "--cas" || arg === "--cid" || arg === "--name") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error(`Missing value after ${arg}`);
      }
      out.queries.push({
        kind: arg.slice(2),
        value,
      });
      i += 1;
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      out.queries.push({
        kind: CAS_RE.test(arg) ? "cas" : /^\d+$/.test(arg) ? "cid" : "name",
        value: arg,
      });
    }
  }
  if (out.queries.length === 0) {
    throw new Error(
      "Pass a chemical name, CAS number, CID, or --cas / --cid / --name",
    );
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function pubchemGet(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `PubChem returned non-JSON (${response.status}) from ${url}`,
    );
  }
  if (!response.ok || body.Fault) {
    const message =
      body.Fault?.Message || body.Fault?.Code || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.notFound = /not successful|not found|invalid/i.test(String(message));
    throw error;
  }
  return body;
}

function encodePath(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

async function resolveCid(query) {
  if (query.kind === "cid") {
    const cid = Number(query.value);
    if (!Number.isInteger(cid) || cid <= 0) {
      throw new Error(`Invalid CID: ${query.value}`);
    }
    return cid;
  }
  const key = query.kind === "cas" ? query.value : query.value;
  const url = `${BASE_REST}/compound/name/${encodePath(key)}/cids/JSON`;
  const body = await pubchemGet(url);
  const cids = body.IdentifierList?.CID;
  if (!Array.isArray(cids) || cids.length === 0) {
    throw Object.assign(new Error(`No PubChem CID for ${query.value}`), {
      notFound: true,
    });
  }
  return cids[0];
}

async function fetchProperties(cid) {
  const url = `${BASE_REST}/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`;
  const body = await pubchemGet(url);
  return body.PropertyTable?.Properties?.[0] ?? {};
}

function stringsFromValue(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const rows = value.StringWithMarkup;
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((row) => (typeof row.String === "string" ? row.String.trim() : ""))
    .filter(Boolean);
}

function iconsFromValue(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const rows = value.StringWithMarkup;
  if (!Array.isArray(rows)) {
    return [];
  }
  const icons = [];
  for (const row of rows) {
    for (const mark of row.Markup || []) {
      if (mark.Type === "Icon" && mark.Extra) {
        icons.push({
          name: mark.Extra,
          url: mark.URL ?? null,
        });
      }
    }
  }
  return icons;
}

function collectInformation(section, bucket) {
  for (const info of section.Information || []) {
    const name = info.Name || "Note";
    if (!bucket[name]) {
      bucket[name] = { strings: [], icons: [] };
    }
    bucket[name].strings.push(...stringsFromValue(info.Value));
    bucket[name].icons.push(...iconsFromValue(info.Value));
  }
  for (const child of section.Section || []) {
    collectInformation(child, bucket);
  }
  return bucket;
}

async function fetchHeading(cid, heading) {
  const url = `${BASE_VIEW}/data/compound/${cid}/JSON?heading=${encodePath(heading)}`;
  try {
    const body = await pubchemGet(url);
    return collectInformation(body.Record ?? {}, {});
  } catch (error) {
    if (error.notFound || error.status === 404) {
      return {};
    }
    throw error;
  }
}

function uniqueStrings(strings, limit = 12) {
  const unique = [];
  for (const item of strings) {
    if (!item || unique.includes(item)) {
      continue;
    }
    unique.push(item);
    if (unique.length >= limit) {
      break;
    }
  }
  return unique;
}

function firstStrings(info, name, limit = 12) {
  return uniqueStrings(info[name]?.strings ?? [], limit);
}

function stringsMatching(info, predicate, limit = 12) {
  const collected = [];
  for (const [name, bucket] of Object.entries(info)) {
    if (!predicate(name)) {
      continue;
    }
    for (const item of bucket.strings) {
      collected.push(name && name !== "Note" ? `**${name}:** ${item}` : item);
    }
  }
  return uniqueStrings(collected, limit);
}

function primaryHazardStatements(info, limit = 8) {
  const all = info["GHS Hazard Statements"]?.strings ?? [];
  const leading = [];
  for (const item of all) {
    if (/\(\s*[\d.]+%/.test(item)) {
      if (leading.length > 0) {
        break;
      }
      continue;
    }
    if (/^H\d{3}:/.test(item)) {
      leading.push(item);
    }
  }
  return uniqueStrings(leading.length > 0 ? leading : all, limit);
}

function firstIcons(info, name) {
  const seen = new Set();
  const icons = [];
  for (const icon of info[name]?.icons ?? []) {
    if (seen.has(icon.name)) {
      continue;
    }
    seen.add(icon.name);
    icons.push(icon);
  }
  return icons;
}

function publicPages(record) {
  const cid = record.cid;
  const cas = record.cas;
  const name = encodeURIComponent(record.queryValue);
  const casQuery = encodeURIComponent(cas || record.queryValue);
  return {
    pubchemLcss: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}#datasheet=LCSS`,
    pubchemRecord: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    cameoSearch: `https://cameochemicals.noaa.gov/search/result?term=${casQuery}`,
    nioshSearch: `https://www.cdc.gov/niosh/npg/default.html`,
    oshaSearch: `https://www.osha.gov/chemicaldata`,
    manufacturerSdsSearch: `https://www.google.com/search?q=${encodeURIComponent(
      `"safety data sheet" OR SDS OR MSDS ${cas || record.queryValue} filetype:pdf`,
    )}`,
    nameSearch: `https://pubchem.ncbi.nlm.nih.gov/#query=${name}`,
  };
}

async function lookupOne(query) {
  const cid = await resolveCid(query);
  await sleep(GAP_MS);
  const properties = await fetchProperties(cid);
  await sleep(GAP_MS);
  const casInfo = await fetchHeading(cid, "CAS");
  await sleep(GAP_MS);
  const ghs = await fetchHeading(cid, "GHS Classification");
  await sleep(GAP_MS);
  const firstAid = await fetchHeading(cid, "First Aid");
  await sleep(GAP_MS);
  const ppe = await fetchHeading(cid, "Personal Protective Equipment (PPE)");

  const cas = firstStrings(casInfo, "CAS", 3)[0] || null;
  const record = {
    queryKind: query.kind,
    queryValue: query.value,
    cid,
    iupacName: properties.IUPACName || null,
    molecularFormula: properties.MolecularFormula || null,
    molecularWeight: properties.MolecularWeight || null,
    cas,
    signal: firstStrings(ghs, "Signal", 1)[0] || null,
    pictograms: firstIcons(ghs, "Pictogram(s)"),
    hazardStatements: primaryHazardStatements(ghs, 8),
    precautionaryCodes: firstStrings(ghs, "Precautionary Statement Codes", 2).map(
      (item) => item.replace(/\s*\(click each P-code to see the statement\)\s*$/i, ""),
    ),
    firstAid: stringsMatching(firstAid, (name) => /first aid/i.test(name), 8),
    ppe: stringsMatching(
      ppe,
      (name) => /protective clothing|personal protective|respirator recommendation/i.test(name),
      6,
    ),
    kind: "public-lcss",
    disclaimer:
      "This is a public NIH PubChem Laboratory Chemical Safety Summary (LCSS), not a manufacturer SDS. Workplace HazCom still needs the supplier's own 16-section SDS.",
  };
  record.pages = publicPages(record);
  return record;
}

function renderMarkdown(record) {
  const pictograms = record.pictograms.map((icon) => icon.name).join(", ");
  const lines = [
    `# ${record.queryValue}`,
    "",
    `- **Kind:** public LCSS (NIH PubChem), not a manufacturer SDS`,
    `- **CID:** ${record.cid}`,
    record.cas ? `- **CAS:** ${record.cas}` : null,
    record.molecularFormula
      ? `- **Formula:** ${record.molecularFormula}`
      : null,
    record.molecularWeight
      ? `- **Molecular weight:** ${record.molecularWeight}`
      : null,
    record.iupacName ? `- **IUPAC:** ${record.iupacName}` : null,
    record.signal ? `- **Signal word:** ${record.signal}` : null,
    pictograms ? `- **Pictograms:** ${pictograms}` : null,
    "",
    "## Hazard statements",
    "",
  ].filter((line) => line !== null);

  if (record.hazardStatements.length === 0) {
    lines.push("_No GHS hazard statements on this PubChem record._", "");
  } else {
    for (const item of record.hazardStatements) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (record.precautionaryCodes.length > 0) {
    lines.push("## Precautionary codes", "");
    for (const item of record.precautionaryCodes) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (record.firstAid.length > 0) {
    lines.push("## First aid", "");
    for (const item of record.firstAid) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (record.ppe.length > 0) {
    lines.push("## Personal protective equipment", "");
    for (const item of record.ppe) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  lines.push(
    "## Official public pages",
    "",
    `- [PubChem LCSS](${record.pages.pubchemLcss})`,
    `- [PubChem compound record](${record.pages.pubchemRecord})`,
    `- [CAMEO Chemicals search](${record.pages.cameoSearch})`,
    `- [NIOSH Pocket Guide](${record.pages.nioshSearch})`,
    `- [OSHA Occupational Chemical Database](${record.pages.oshaSearch})`,
    `- [Public manufacturer SDS PDF search](${record.pages.manufacturerSdsSearch})`,
    "",
    record.disclaimer,
    "",
  );
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const records = [];
  for (let i = 0; i < args.queries.length; i += 1) {
    if (i > 0) {
      await sleep(GAP_MS);
    }
    try {
      records.push(await lookupOne(args.queries[i]));
    } catch (error) {
      records.push({
        queryKind: args.queries[i].kind,
        queryValue: args.queries[i].value,
        error: error.message,
        notFound: Boolean(error.notFound),
      });
    }
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify(records, null, 2)}\n`);
    return;
  }

  const parts = records.map((record) => {
    if (record.error) {
      return `# ${record.queryValue}\n\nCould not fetch a public LCSS: ${record.error}\n`;
    }
    return renderMarkdown(record);
  });
  process.stdout.write(`${parts.join("\n---\n\n")}\n`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
