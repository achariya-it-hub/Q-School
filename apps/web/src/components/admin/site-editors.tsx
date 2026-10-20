"use client";

/* One form per home-page section (Admin Console › Website). */

import { BLANK_SLIDE, type HeroSlide, type HomeContent, type SectionKey } from "@/lib/site/home-content";
import { Segmented } from "@/components/admin/ui";
import { ColorField, Group, IconPicker, ImageField, LinkField, ListEditor, NumberField, Row, StringList, TextField, Toggle } from "@/components/admin/site-fields";

type Ed<K extends keyof HomeContent> = { value: HomeContent[K]; onChange: (v: HomeContent[K]) => void };

/** Small helper: returns a setter for one field of an object. */
const f =
  <T,>(v: T, on: (v: T) => void) =>
  <K extends keyof T>(k: K) =>
  (x: T[K]) =>
    on({ ...v, [k]: x });

function Heading({ value, onChange, link }: { value: { kicker: string; title: string; linkLabel?: string }; onChange: (v: never) => void; link?: boolean }) {
  const set = f(value, onChange as (v: typeof value) => void);
  return (
    <Group title="Heading">
      <Row>
        <TextField label="Small label above" value={value.kicker} onChange={set("kicker")} max={80} />
        {link && <TextField label="Link text on the right" hint="empty hides it" value={value.linkLabel ?? ""} onChange={set("linkLabel")} max={40} />}
      </Row>
      <TextField label="Title" value={value.title} onChange={set("title")} max={120} />
    </Group>
  );
}

/* ───────── hero ───────── */

function SlideForm({ s, set }: { s: HeroSlide; set: (v: HeroSlide) => void }) {
  const u = f(s, set);
  const card = f(s.card, u("card"));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Slide layout"
          value={s.layout}
          onChange={u("layout")}
          options={[
            { value: "photo", label: "Full-width photo" },
            { value: "collage", label: "Brand collage" },
          ]}
        />
        <div className="min-w-[220px] flex-1 sm:max-w-[260px]">
          <Toggle label="Show this slide" checked={s.enabled} onChange={u("enabled")} />
        </div>
      </div>
      <TextField label="Slide name" hint="used by screen readers and in this list" value={s.label} onChange={u("label")} max={80} />

      <Group title="Text">
        <Row>
          <TextField label="Badge" hint="e.g. NEW" value={s.badge} onChange={u("badge")} max={24} />
          <TextField label="Text next to the badge" value={s.kicker} onChange={u("kicker")} max={80} />
        </Row>
        <Row>
          <TextField label="Headline" value={s.title} onChange={u("title")} max={120} />
          <TextField label="Highlighted words" hint="shown in mint green" value={s.accent} onChange={u("accent")} max={120} />
        </Row>
        <TextField label="Description" value={s.body} onChange={u("body")} max={400} multiline />
      </Group>

      <Group title="Buttons">
        <LinkField label="Main button" value={s.primary} onChange={u("primary")} />
        <LinkField label="Second button" value={s.secondary} onChange={u("secondary")} />
      </Group>

      <Group title={s.layout === "photo" ? "Background photo" : "Photo in the class window"}>
        <ImageField
          label="Image"
          hint={s.layout === "photo" ? "landscape, at least 1600 px wide" : "landscape, about 1000 px wide"}
          value={s.image}
          onChange={u("image")}
          alt={s.imageAlt}
          onAlt={u("imageAlt")}
        />
      </Group>

      {s.layout === "collage" ? (
        <>
          <Group title="Class window">
            <Row cols={3}>
              <TextField label="Class title" value={s.windowTitle} onChange={u("windowTitle")} max={80} />
              <TextField label="Mentor" value={s.windowMentor} onChange={u("windowMentor")} max={60} />
              <TextField label="Session" value={s.windowMeta} onChange={u("windowMeta")} max={60} />
            </Row>
          </Group>
          <Group title="Trust row">
            <Row>
              <TextField label="Learners" hint="empty hides it" value={s.trustLearners} onChange={u("trustLearners")} max={40} />
              <TextField label="Rating" hint="empty hides it" value={s.trustRating} onChange={u("trustRating")} max={20} />
            </Row>
          </Group>
        </>
      ) : (
        <>
          <ListEditor
            label="Feature chips"
            items={s.chips}
            onChange={u("chips")}
            max={6}
            defaultOpen={null}
            addLabel="Add chip"
            create={() => ({ icon: "check", label: "" })}
            title={(c) => c.label || "New chip"}
            render={(c, setC) => (
              <Row>
                <IconPicker label="Icon" value={c.icon} onChange={(icon) => setC({ ...c, icon })} />
                <TextField label="Text" value={c.label} onChange={(label) => setC({ ...c, label })} max={40} />
              </Row>
            )}
          />
          <Group title="Info card">
            <Toggle label="Show the info card" hint="glass card on the right with batch details" checked={s.card.show} onChange={card("show")} />
            {s.card.show && (
              <>
                <Row cols={3}>
                  <TextField label="Small heading" value={s.card.heading} onChange={card("heading")} max={30} />
                  <TextField label="Title" value={s.card.title} onChange={card("title")} max={80} />
                  <TextField label="Mentor" value={s.card.mentor} onChange={card("mentor")} max={60} />
                </Row>
                <ListEditor
                  label="Detail lines"
                  items={s.card.lines}
                  onChange={card("lines")}
                  max={5}
                  defaultOpen={null}
                  addLabel="Add line"
                  create={() => ({ icon: "calendar", text: "" })}
                  title={(l) => l.text || "New line"}
                  render={(l, setL) => (
                    <Row>
                      <IconPicker label="Icon" value={l.icon} onChange={(icon) => setL({ ...l, icon })} />
                      <TextField label="Text" value={l.text} onChange={(text) => setL({ ...l, text })} max={60} />
                    </Row>
                  )}
                />
                <Row>
                  <NumberField label="Total seats" hint="0 hides the bar" value={s.card.seatsTotal} onChange={card("seatsTotal")} />
                  <NumberField label="Seats left" value={s.card.seatsLeft} onChange={card("seatsLeft")} max={s.card.seatsTotal || 9999} />
                </Row>
              </>
            )}
          </Group>
        </>
      )}
    </>
  );
}

function HeroEditor({ value, onChange }: Ed<"hero">) {
  const set = f(value, onChange);
  const live = value.slides.filter((s) => s.enabled).length;
  return (
    <div className="space-y-5">
      <Row>
        <NumberField label="Seconds per slide" min={3} max={30} value={value.interval} onChange={set("interval")} />
        <p className="self-end rounded-xl bg-[#F1F7F5] px-3.5 py-2.5 text-[12.5px] text-[#41564f]">
          {live} of {value.slides.length} slides showing. {live > 1 ? "The slider auto-plays with arrows and dots." : "With one slide there are no slider controls."}
        </p>
      </Row>
      <ListEditor
        label="Slides"
        items={value.slides}
        onChange={set("slides")}
        max={8}
        addLabel="Add slide"
        create={() => ({ ...structuredClone(BLANK_SLIDE), id: `s${Date.now().toString(36)}` })}
        title={(s) => (
          <span className="flex items-center gap-2">
            {s.label || s.title || "Untitled slide"}
            <span className="rounded-full bg-[#EEF5F3] px-2 py-0.5 text-[10.5px] font-semibold text-[#41564f]">{s.layout === "photo" ? "Photo" : "Collage"}</span>
            {!s.enabled && <span className="rounded-full bg-[#FFF6E0] px-2 py-0.5 text-[10.5px] font-semibold text-[#8A5A00]">Hidden</span>}
          </span>
        )}
        render={(s, setS) => <SlideForm s={s} set={(v) => setS({ ...v, id: v.id || s.id })} />}
      />
    </div>
  );
}

/* ───────── other sections ───────── */

function StatsEditor({ value, onChange }: Ed<"stats">) {
  return (
    <ListEditor
      label="Numbers"
      items={value.items}
      onChange={(items) => onChange({ items })}
      max={6}
      addLabel="Add number"
      create={() => ({ value: "", label: "" })}
      title={(s) => `${s.value || "…"} · ${s.label || "label"}`}
      render={(s, set) => (
        <Row>
          <TextField label="Number" hint="counts up, e.g. 25,000+ or 4.8 / 5" value={s.value} onChange={(v) => set({ ...s, value: v })} max={20} />
          <TextField label="Label" value={s.label} onChange={(label) => set({ ...s, label })} max={50} />
        </Row>
      )}
    />
  );
}

function SubjectsEditor({ value, onChange }: Ed<"subjects">) {
  return (
    <ListEditor
      label="Subjects"
      items={value.items}
      onChange={(items) => onChange({ items })}
      max={24}
      defaultOpen={null}
      addLabel="Add subject"
      create={() => ({ label: "", count: "", color: "#0E937E" })}
      title={(s) => (
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
          {s.label || "New subject"} <span className="font-normal text-[#8aa39c]">{s.count}</span>
        </span>
      )}
      render={(s, set) => (
        <>
          <Row>
            <TextField label="Subject" value={s.label} onChange={(label) => set({ ...s, label })} max={40} />
            <TextField label="Count" hint="optional, e.g. 85+" value={s.count} onChange={(count) => set({ ...s, count })} max={12} />
          </Row>
          <ColorField label="Dot colour" value={s.color} onChange={(color) => set({ ...s, color })} />
        </>
      )}
    />
  );
}

function FormatsEditor({ value, onChange }: Ed<"formats">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <ListEditor
        label="Cards"
        items={value.items}
        onChange={set("items")}
        max={8}
        addLabel="Add card"
        create={() => ({ icon: "live", title: "", body: "", href: "#programs", color: "#0E937E" })}
        title={(x) => x.title || "New card"}
        render={(x, s) => (
          <>
            <Row>
              <IconPicker label="Icon" value={x.icon} onChange={(icon) => s({ ...x, icon })} />
              <TextField label="Title" value={x.title} onChange={(title) => s({ ...x, title })} max={50} />
            </Row>
            <TextField label="Text" value={x.body} onChange={(body) => s({ ...x, body })} max={220} multiline rows={2} />
            <Row>
              <TextField label="Link" hint="#live, /courses…" value={x.href} onChange={(href) => s({ ...x, href })} max={200} />
              <ColorField label="Icon colour" value={x.color} onChange={(color) => s({ ...x, color })} />
            </Row>
          </>
        )}
      />
    </div>
  );
}

function ProgramsEditor({ value, onChange }: Ed<"programs">) {
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} link />
      <Row>
        <NumberField label="How many programs to show" min={1} max={12} value={value.count} onChange={(count) => onChange({ ...value, count })} />
        <p className="self-end rounded-xl bg-[#F1F7F5] px-3.5 py-2.5 text-[12.5px] text-[#41564f]">Program cards come from the course catalogue. Edit them under Academics › Courses.</p>
      </Row>
    </div>
  );
}

function HowEditor({ value, onChange }: Ed<"how">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <ListEditor
        label="Steps"
        items={value.steps}
        onChange={set("steps")}
        max={4}
        addLabel="Add step"
        create={() => ({ icon: "check", title: "", body: "" })}
        title={(x, i) => `Step ${i + 1}: ${x.title || "untitled"}`}
        render={(x, s) => (
          <>
            <Row>
              <IconPicker label="Icon" value={x.icon} onChange={(icon) => s({ ...x, icon })} />
              <TextField label="Title" value={x.title} onChange={(title) => s({ ...x, title })} max={60} />
            </Row>
            <TextField label="Text" value={x.body} onChange={(body) => s({ ...x, body })} max={200} multiline rows={2} />
          </>
        )}
      />
      <LinkField label="Button under the steps" value={value.cta} onChange={set("cta")} />
    </div>
  );
}

function LiveEditor({ value, onChange }: Ed<"live">) {
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} link />
      <p className="rounded-xl bg-[#F1F7F5] px-3.5 py-2.5 text-[12.5px] text-[#41564f]">The next 3 webinars and workshops are pulled from the Schedule automatically.</p>
    </div>
  );
}

function WhyEditor({ value, onChange }: Ed<"why">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <TextField label="Intro" value={value.body} onChange={set("body")} max={300} multiline />
      <ListEditor
        label="Reasons"
        items={value.items}
        onChange={set("items")}
        max={8}
        defaultOpen={null}
        addLabel="Add reason"
        create={() => ({ icon: "check", title: "", body: "", color: "#0E937E" })}
        title={(x) => x.title || "New reason"}
        render={(x, s) => (
          <>
            <Row>
              <IconPicker label="Icon" value={x.icon} onChange={(icon) => s({ ...x, icon })} />
              <TextField label="Title" value={x.title} onChange={(title) => s({ ...x, title })} max={60} />
            </Row>
            <TextField label="Text" value={x.body} onChange={(body) => s({ ...x, body })} max={160} />
            <ColorField label="Icon colour" value={x.color} onChange={(color) => s({ ...x, color })} />
          </>
        )}
      />
      <Group title="App promo card">
        <Row>
          <TextField label="Badge" value={value.appBadge} onChange={set("appBadge")} max={40} />
          <TextField label="Title" value={value.appTitle} onChange={set("appTitle")} max={60} />
        </Row>
        <TextField label="Text" value={value.appBody} onChange={set("appBody")} max={200} multiline rows={2} />
      </Group>
    </div>
  );
}

function TestimonialsEditor({ value, onChange }: Ed<"testimonials">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <p className="rounded-xl bg-[#FFF6E0] px-3.5 py-2.5 text-[12.5px] text-[#8A5A00]">Use real quotes, with the parent&apos;s permission.</p>
      <ListEditor
        label="Testimonials"
        items={value.items}
        onChange={set("items")}
        max={12}
        addLabel="Add testimonial"
        create={() => ({ quote: "", who: "", city: "", rating: 5 })}
        title={(x) => x.who || x.quote.slice(0, 50) || "New testimonial"}
        render={(x, s) => (
          <>
            <TextField label="Quote" value={x.quote} onChange={(quote) => s({ ...x, quote })} max={400} multiline />
            <Row cols={3}>
              <TextField label="Who" hint="e.g. Parent of a Grade 7 learner" value={x.who} onChange={(who) => s({ ...x, who })} max={60} />
              <TextField label="City" value={x.city} onChange={(city) => s({ ...x, city })} max={40} />
              <NumberField label="Stars" hint="0 hides" min={0} max={5} value={x.rating} onChange={(rating) => s({ ...x, rating })} />
            </Row>
          </>
        )}
      />
    </div>
  );
}

function CentresEditor({ value, onChange }: Ed<"centres">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} link />
      <ListEditor
        label="Centres"
        items={value.items}
        onChange={set("items")}
        max={12}
        defaultOpen={null}
        addLabel="Add centre"
        create={() => ({ name: "", area: "", city: "", tags: ["Regular Classes", "Weekend Batches"] })}
        title={(x) => x.name || "New centre"}
        render={(x, s) => (
          <>
            <TextField label="Name" value={x.name} onChange={(name) => s({ ...x, name })} max={60} />
            <Row>
              <TextField label="Area" value={x.area} onChange={(area) => s({ ...x, area })} max={40} />
              <TextField label="City" value={x.city} onChange={(city) => s({ ...x, city })} max={40} />
            </Row>
            <StringList label="Tags" items={x.tags} onChange={(tags) => s({ ...x, tags })} max={6} placeholder="e.g. Weekend Batches" />
          </>
        )}
      />
    </div>
  );
}

function PricingEditor({ value, onChange }: Ed<"pricing">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <ListEditor
        label="Plans"
        items={value.plans}
        onChange={set("plans")}
        max={4}
        addLabel="Add plan"
        create={() => ({ name: "", price: "", per: "/ month", blurb: "", features: [], cta: { label: "Book a free demo", href: "#demo" }, featured: false })}
        title={(p) => (
          <span className="flex items-center gap-2">
            {p.name || "New plan"} <span className="font-normal text-[#6b807b]">{p.price}</span>
            {p.featured && <span className="rounded-full bg-brand-teal100 px-2 py-0.5 text-[10.5px] font-semibold text-brand-deep">Most popular</span>}
          </span>
        )}
        render={(p, s) => (
          <>
            <Row cols={3}>
              <TextField label="Plan name" value={p.name} onChange={(name) => s({ ...p, name })} max={40} />
              <TextField label="Price" hint="e.g. ₹799 or Free" value={p.price} onChange={(price) => s({ ...p, price })} max={20} />
              <TextField label="Per" hint="e.g. / month" value={p.per} onChange={(per) => s({ ...p, per })} max={20} />
            </Row>
            <TextField label="Short description" value={p.blurb} onChange={(blurb) => s({ ...p, blurb })} max={120} />
            <StringList label="Features" items={p.features} onChange={(features) => s({ ...p, features })} max={10} />
            <LinkField label="Button" value={p.cta} onChange={(cta) => s({ ...p, cta })} />
            <Toggle label="Highlight as Most popular" checked={p.featured} onChange={(featured) => s({ ...p, featured })} />
          </>
        )}
      />
      <TextField label="Note under the plans" value={value.note} onChange={set("note")} max={200} />
    </div>
  );
}

function FaqEditor({ value, onChange }: Ed<"faq">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Heading value={value} onChange={onChange as never} />
      <TextField label="Intro" value={value.body} onChange={set("body")} max={200} />
      <LinkField label="Button" value={value.cta} onChange={set("cta")} />
      <ListEditor
        label="Questions"
        items={value.items}
        onChange={set("items")}
        max={20}
        defaultOpen={null}
        addLabel="Add question"
        create={() => ({ q: "", a: "" })}
        title={(x) => x.q || "New question"}
        render={(x, s) => (
          <>
            <TextField label="Question" value={x.q} onChange={(q) => s({ ...x, q })} max={160} />
            <TextField label="Answer" value={x.a} onChange={(a) => s({ ...x, a })} max={800} multiline rows={4} />
          </>
        )}
      />
    </div>
  );
}

function DemoEditor({ value, onChange }: Ed<"demo">) {
  const set = f(value, onChange);
  return (
    <div className="space-y-5">
      <Group title="Left side">
        <TextField label="Handwritten line" value={value.script} onChange={set("script")} max={60} />
        <TextField label="Title" value={value.title} onChange={set("title")} max={120} />
        <TextField label="Text" value={value.body} onChange={set("body")} max={300} multiline />
        <StringList label="Tick list" items={value.points} onChange={set("points")} max={6} />
      </Group>
      <Group title="Form card">
        <Row>
          <TextField label="Form title" value={value.formTitle} onChange={set("formTitle")} max={60} />
          <TextField label="Note under the title" value={value.formNote} onChange={set("formNote")} max={60} />
        </Row>
        <TextField label="Submit button" value={value.button} onChange={set("button")} max={40} />
        <p className="text-[12.5px] text-[#6b807b]">Form submissions arrive in CRM › Leads with the source “Website”.</p>
      </Group>
    </div>
  );
}

export const EDITORS: { [K in SectionKey]: (p: Ed<K>) => React.ReactNode } = {
  hero: HeroEditor,
  stats: StatsEditor,
  subjects: SubjectsEditor,
  formats: FormatsEditor,
  programs: ProgramsEditor,
  how: HowEditor,
  live: LiveEditor,
  why: WhyEditor,
  testimonials: TestimonialsEditor,
  centres: CentresEditor,
  pricing: PricingEditor,
  faq: FaqEditor,
  demo: DemoEditor,
};
