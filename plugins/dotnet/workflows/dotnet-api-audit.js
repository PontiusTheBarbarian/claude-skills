// dotnet-api-audit — fan out a REST/architecture audit across many endpoint files.
//
// Workflow names are FLAT, not namespaced per plugin, so meta.name is
// self-prefixed to avoid colliding with workflows from other installed plugins.
//
// Runtime constraints (these are hard — the script body is not Node):
//   - no `import`, no `require`
//   - no `fs`, no `process`
//   - no `Date.now()`, `new Date()`, `Math.random()` (they break resume)
// The script itself cannot read files. The CALLING SESSION enumerates the paths
// and passes them in `args`; the spawned agents do their own file I/O via Read.
//
// Invoke:
//   Workflow({ name: "dotnet-api-audit", args: { files: ["src/Api/OrdersController.cs", ...] } })

export const meta = {
  name: 'dotnet-api-audit',
  description: 'Audit ASP.NET Core endpoints in parallel against the REST design and Clean Architecture skills, then adversarially verify each finding.',
  whenToUse: 'Use for a solution-wide API audit spanning many controllers, where one context cannot hold every file. For a handful of files, the /dotnet:review-api command is cheaper. The caller must pass the file list in args — this script cannot glob for itself.',
  phases: [
    { title: 'Review', detail: 'one agent per endpoint file, findings scored against the plugin skills' },
    { title: 'Verify', detail: 'adversarial refutation pass — findings survive only if a skeptic cannot kill them' },
    { title: 'Synthesize', detail: 'dedupe, group by severity, report' },
  ],
}

// `args` may arrive as a parsed object or as a raw JSON string. Guard both.
const input = typeof args === 'string' && args.trim()
  ? JSON.parse(args)
  : (args || {})

const files = Array.isArray(input) ? input : (input.files || [])

if (!files.length) {
  log('No files passed. Call with args: { files: ["src/Api/FooController.cs", ...] } — this script cannot glob for itself.')
  return { findings: [], reviewed: 0, note: 'no input files' }
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string' },
          summary: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['file', 'line', 'severity', 'summary', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['refuted', 'reason'],
}

log(`Auditing ${files.length} file(s).`)

// Pipeline, not parallel-with-barriers: each file's findings go straight into
// verification as soon as that file's review lands, rather than waiting for the
// slowest reviewer.
const results = await pipeline(
  files,

  // Stage 1 — review one file.
  (file) => agent(
    `Review the ASP.NET Core endpoints in \`${file}\` for REST design and architecture defects.

Load the \`dotnet-rest-api-design\` and \`dotnet-clean-architecture\` skills first and review against those, not from memory.

Look for: wrong HTTP verbs or status codes, verbs in route templates, EF or domain
entities serialized at the boundary, unbounded collections with no pagination,
ad-hoc error shapes instead of ProblemDetails, missing ProducesResponseType,
and any dependency pointing the wrong way through the layers.

Report only defects you can name a concrete consequence for. An empty findings
array is a valid and useful answer — do not invent findings to fill it.`,
    { label: `review:${file}`, phase: 'Review', schema: FINDINGS_SCHEMA },
  ),

  // Stage 2 — try to refute each finding from that file.
  (review, file) => parallel(
    (review?.findings || []).map((f) => () =>
      agent(
        `Attempt to REFUTE this claimed defect in \`${f.file}\` at line ${f.line}:

"${f.summary}"

Proposed fix: ${f.fix}

Read the file. The claim is refuted if the code is actually correct, if the
pattern is deliberate and justified elsewhere in the file, or if the proposed fix
would break something. Default to refuted=true when you are genuinely uncertain —
a false finding costs more than a missed one here.`,
        { label: `verify:${f.file}:${f.line}`, phase: 'Verify', schema: VERDICT_SCHEMA },
      ).then((v) => ({ ...f, verdict: v })),
    ),
  ),
)

const confirmed = results
  .flat()
  .filter(Boolean)
  .filter((f) => f.verdict && !f.verdict.refuted)

const RANK = { high: 0, medium: 1, low: 2 }
confirmed.sort((a, b) => (RANK[a.severity] ?? 3) - (RANK[b.severity] ?? 3))

log(`${confirmed.length} finding(s) survived verification across ${files.length} file(s).`)

return {
  reviewed: files.length,
  confirmed: confirmed.length,
  findings: confirmed,
}
