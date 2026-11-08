import { AlertCircle, CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";

// Design only: sample rows until the upload API exists.
type Status = "ready" | "processing" | "failed";
type Doc = { id: string; name: string; pages: number; sizeMb: number; uploaded: string; status: Status; note?: string };

const LIMITS = { documents: 10, pages: 20, sizeMb: 10 };

const SAMPLE: Doc[] = [
  { id: "1", name: "Scholarship_Rules.pdf", pages: 12, sizeMb: 1.8, uploaded: "Nov 6, 2026", status: "ready" },
  { id: "2", name: "Athletics_Policy.pdf", pages: 6, sizeMb: 0.9, uploaded: "Nov 6, 2026", status: "ready" },
  { id: "3", name: "Admissions_Handbook_2026.pdf", pages: 18, sizeMb: 4.2, uploaded: "Nov 7, 2026", status: "processing" },
  { id: "4", name: "Campus_Map_Scanned.pdf", pages: 0, sizeMb: 7.6, uploaded: "Nov 7, 2026", status: "failed", note: "No readable text found" },
];

const STATUS: Record<Status, { label: string; icon: typeof CheckCircle2 }> = {
  ready: { label: "Ready", icon: CheckCircle2 },
  processing: { label: "Processing", icon: Loader2 },
  failed: { label: "Failed", icon: AlertCircle },
};

export default function Documents() {
  const used = SAMPLE.length;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="eyebrow">Knowledge base</p>
          <h1 className="page__title">Documents</h1>
          <p className="page__lede">Your assistant answers only from these PDFs and cites the page it used.</p>
        </div>
        <div className="quota" aria-label={`${used} of ${LIMITS.documents} documents used`}>
          <span className="quota__text"><strong>{used}</strong> / {LIMITS.documents} documents</span>
          <span className="quota__bar"><span style={{ width: `${(used / LIMITS.documents) * 100}%` }} /></span>
        </div>
      </header>

      <label className="dropzone">
        <input type="file" accept="application/pdf" multiple className="sr-only" />
        <span className="dropzone__icon"><UploadCloud size={22} strokeWidth={1.7} /></span>
        <span className="dropzone__title">Drop PDFs here or <u>browse</u></span>
        <span className="dropzone__rules">
          <span>PDF only</span><span aria-hidden="true">·</span>
          <span>Up to {LIMITS.pages} pages</span><span aria-hidden="true">·</span>
          <span>Max {LIMITS.sizeMb} MB each</span><span aria-hidden="true">·</span>
          <span>{LIMITS.documents - used} slots left</span>
        </span>
      </label>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Uploaded</h2>
          <span className="pill">{used} files</span>
        </div>

        <div className="doc-table" role="table" aria-label="Uploaded documents">
          <div className="doc-row doc-row--head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Pages</span>
            <span role="columnheader">Size</span>
            <span role="columnheader">Uploaded</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="sr-only">Actions</span>
          </div>

          {SAMPLE.map((d) => {
            const { label, icon: Icon } = STATUS[d.status];
            return (
              <div key={d.id} className="doc-row" role="row">
                <span className="doc-name" role="cell">
                  <span className="doc-name__icon"><FileText size={16} strokeWidth={1.8} /></span>
                  <span className="doc-name__text">
                    <span className="doc-name__title" title={d.name}>{d.name}</span>
                    {d.note && <span className="doc-name__note">{d.note}</span>}
                  </span>
                </span>
                <span role="cell" className="num" data-label="Pages">{d.pages || "—"}</span>
                <span role="cell" className="num" data-label="Size">{d.sizeMb.toFixed(1)} MB</span>
                <span role="cell" className="muted" data-label="Uploaded">{d.uploaded}</span>
                <span role="cell">
                  <span className={`status status--${d.status}`}>
                    <Icon size={13} strokeWidth={2.2} className={d.status === "processing" ? "spin" : undefined} />
                    {label}
                  </span>
                </span>
                <span role="cell" className="doc-actions">
                  <button type="button" className="icon-btn icon-btn--danger" aria-label={`Delete ${d.name}`} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
