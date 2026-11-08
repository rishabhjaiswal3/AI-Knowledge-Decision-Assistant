import { ArrowUp, Check, FileText, HelpCircle, Sparkles, X } from "lucide-react";
import { useAuth } from "../lib/useAuth";

// Design only: a sample conversation until the ask API exists.
type Decision = { label: string; kind: "Boolean" | "Choice" | "Score"; value: string; pass: boolean };
type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; decisions?: Decision[]; sources?: string[]; noAnswer?: boolean };

const CONVERSATION: Message[] = [
  { role: "user", text: "What documents do I need to apply for the merit scholarship?" },
  {
    role: "assistant",
    text: "You'll need your latest official transcript, one recommendation letter from a faculty member, and a 500-word personal statement. Applications close on March 15.",
    sources: ["Scholarship_Rules.pdf · p.3"],
  },
  { role: "user", text: "I'm a 2nd-year student with a 3.7 GPA and I already have a sports scholarship. Am I eligible for the merit scholarship too?" },
  {
    role: "assistant",
    text: "Yes, you're eligible. You meet the year and GPA requirements, and the merit scholarship can be combined with an athletic award, as long as the total doesn't exceed full tuition.",
    decisions: [
      { label: "Year 2 or above", kind: "Boolean", value: "true", pass: true },
      { label: "GPA at least 3.5", kind: "Boolean", value: "true", pass: true },
      { label: "Combining with athletic award", kind: "Choice", value: "allowed with cap", pass: true },
    ],
    sources: ["Scholarship_Rules.pdf · p.4", "Athletics_Policy.pdf · p.2"],
  },
  { role: "user", text: "What's the cafeteria menu this week?" },
  {
    role: "assistant",
    noAnswer: true,
    text: "I couldn't find that in our documents, so I won't guess. Please contact the campus office for the cafeteria menu.",
  },
];

const SUGGESTIONS = ["How do I appeal a decision?", "Compare merit and need-based awards", "When are applications due?"];

export default function Assistant() {
  const { organization } = useAuth();

  return (
    <div className="page page--chat">
      <header className="page__head">
        <div>
          <p className="eyebrow">Preview</p>
          <h1 className="page__title">Assistant</h1>
          <p className="page__lede">This is what visitors see. Answers come only from your documents, with sources.</p>
        </div>
      </header>

      <section className="chat">
        <div className="chat__head">
          <span className="chat__avatar"><Sparkles size={16} /></span>
          <div className="chat__who">
            <span className="chat__name">{organization?.name} Assistant</span>
            <span className="chat__status"><span className="dot" /> Online · answers from 4 documents</span>
          </div>
        </div>

        <div className="chat__body">
          <p className="chat__day">Today</p>
          {CONVERSATION.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="msg msg--user"><div className="bubble bubble--user">{m.text}</div></div>
            ) : (
              <div key={i} className="msg msg--bot">
                <span className="msg__avatar"><Sparkles size={13} /></span>
                <div className={`bubble bubble--bot ${m.noAnswer ? "bubble--muted" : ""}`}>
                  {m.noAnswer && <span className="bubble__flag"><HelpCircle size={13} /> Not in the knowledge base</span>}

                  {m.decisions && (
                    <div className="checks">
                      <span className="checks__title">Checked {m.decisions.length} conditions</span>
                      {m.decisions.map((d) => (
                        <div key={d.label} className="check">
                          <span className={`check__icon ${d.pass ? "is-pass" : "is-fail"}`}>{d.pass ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}</span>
                          <span className="check__label">{d.label}</span>
                          <span className="check__value">{d.kind} · {d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p>{m.text}</p>

                  {m.sources && (
                    <div className="sources">
                      {m.sources.map((s) => <span key={s} className="ref"><FileText size={12} /> {s}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          <div className="msg msg--bot">
            <span className="msg__avatar"><Sparkles size={13} /></span>
            <div className="bubble bubble--bot bubble--typing" aria-label="Assistant is typing"><span /><span /><span /></div>
          </div>
        </div>

        <div className="chat__foot">
          <div className="suggestions">
            {SUGGESTIONS.map((s) => <button key={s} type="button" className="chip">{s}</button>)}
          </div>
          <form className="composer" onSubmit={(e) => e.preventDefault()}>
            <input className="composer__input" placeholder="Ask a question about our documents…" aria-label="Your question" />
            <button className="composer__send" aria-label="Send"><ArrowUp size={16} strokeWidth={2.4} /></button>
          </form>
          <p className="chat__note">Answers are generated from uploaded documents and may need checking.</p>
        </div>
      </section>
    </div>
  );
}
