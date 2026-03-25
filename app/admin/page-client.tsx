"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

type TopicPackCategory = "foundation" | "current_affairs" | "sector_deep_dive"

type TopicPackRow = {
  id: string
  title: string | null
  slug: string | null
  description: string | null
  category: TopicPackCategory | null
  icon: string | null
  is_free: boolean | null
  key_takeaways: string[] | null
  total_sections: number | null
  is_published: boolean | null
  published_at: string | null
}

type TopicSectionRow = {
  id: string
  topic_pack_id: string
  title: string | null
  content: string | null
  position: number | null
}

const CATEGORY_OPTIONS: { value: TopicPackCategory; label: string }[] = [
  { value: "foundation", label: "foundation" },
  { value: "current_affairs", label: "current_affairs" },
  { value: "sector_deep_dive", label: "sector_deep_dive" },
]

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function takeawaysToText(value: string[] | null | undefined) {
  return (value ?? []).join("\n")
}

function takeawaysFromText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function AdminPageClient({ adminEmail }: { adminEmail: string }) {
  const supabase = React.useMemo(() => createClient(), [])

  const [packs, setPacks] = React.useState<TopicPackRow[]>([])
  const [selectedPackId, setSelectedPackId] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [slugDirty, setSlugDirty] = React.useState(false)
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState<TopicPackCategory>("foundation")
  const [icon, setIcon] = React.useState("📦")
  const [isFree, setIsFree] = React.useState(false)
  const [keyTakeawaysText, setKeyTakeawaysText] = React.useState("")
  const [isPublished, setIsPublished] = React.useState(false)

  const [sections, setSections] = React.useState<TopicSectionRow[]>([])
  const [newSectionTitle, setNewSectionTitle] = React.useState("")
  const [newSectionContent, setNewSectionContent] = React.useState("")

  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const currentPack = React.useMemo(
    () => packs.find((p) => p.id === selectedPackId) ?? null,
    [packs, selectedPackId]
  )

  async function refreshPackList() {
    const { data, error: listError } = await supabase
      .from("topic_packs")
      .select(
        "id,title,slug,description,category,icon,is_free,key_takeaways,total_sections,is_published,published_at"
      )
      .order("created_at", { ascending: false })

    if (listError) throw listError
    setPacks((data ?? []) as TopicPackRow[])
  }

  async function refreshSections(topicPackId: string) {
    const { data, error: sectionsError } = await supabase
      .from("topic_sections")
      .select("id,topic_pack_id,title,content,position")
      .eq("topic_pack_id", topicPackId)
      .order("position", { ascending: true })

    if (sectionsError) throw sectionsError
    setSections((data ?? []) as TopicSectionRow[])
  }

  async function updateTotalSections(topicPackId: string, total: number) {
    const { error: updateError } = await supabase
      .from("topic_packs")
      .update({ total_sections: total })
      .eq("id", topicPackId)

    if (updateError) throw updateError
    await refreshPackList()
  }

  function resetFormForNew() {
    setSelectedPackId(null)
    setTitle("")
    setSlug("")
    setSlugDirty(false)
    setDescription("")
    setCategory("foundation")
    setIcon("📦")
    setIsFree(false)
    setKeyTakeawaysText("")
    setIsPublished(false)
    setSections([])
    setNewSectionTitle("")
    setNewSectionContent("")
  }

  async function loadPackForEdit(topicPackId: string) {
    setError(null)
    setNotice(null)
    setBusy("Loading topic pack…")
    try {
      const { data, error: fetchError } = await supabase
        .from("topic_packs")
        .select(
          "id,title,slug,description,category,icon,is_free,key_takeaways,total_sections,is_published,published_at"
        )
        .eq("id", topicPackId)
        .single()

      if (fetchError) throw fetchError
      const pack = data as TopicPackRow

      setSelectedPackId(pack.id)
      setTitle(pack.title ?? "")
      setSlug(pack.slug ?? "")
      setSlugDirty(true)
      setDescription(pack.description ?? "")
      setCategory((pack.category ?? "foundation") as TopicPackCategory)
      setIcon(pack.icon ?? "📦")
      setIsFree(Boolean(pack.is_free))
      setKeyTakeawaysText(takeawaysToText(pack.key_takeaways))
      setIsPublished(Boolean(pack.is_published))

      await refreshSections(pack.id)
    } finally {
      setBusy(null)
    }
  }

  async function saveTopicPack() {
    setError(null)
    setNotice(null)
    setBusy("Saving topic pack…")
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category,
        icon: icon.trim(),
        is_free: isFree,
        key_takeaways: takeawaysFromText(keyTakeawaysText),
      }

      if (!payload.title) throw new Error("Title is required.")
      if (!payload.slug) throw new Error("Slug is required.")

      if (!selectedPackId) {
        const { data, error: insertError } = await supabase
          .from("topic_packs")
          .insert({
            ...payload,
            total_sections: 0,
            is_published: false,
            published_at: null,
          })
          .select(
            "id,title,slug,description,category,icon,is_free,key_takeaways,total_sections,is_published,published_at"
          )
          .single()

        if (insertError) throw insertError
        const created = data as TopicPackRow
        await refreshPackList()
        setSelectedPackId(created.id)
        setNotice("Topic pack created. You can add sections below.")
        await refreshSections(created.id)
        return
      }

      const { error: updateError } = await supabase
        .from("topic_packs")
        .update(payload)
        .eq("id", selectedPackId)

      if (updateError) throw updateError
      await refreshPackList()
      setNotice("Topic pack saved.")
    } finally {
      setBusy(null)
    }
  }

  async function addSection() {
    if (!selectedPackId) {
      setError("Create/save the topic pack first, then add sections.")
      return
    }
    setError(null)
    setNotice(null)
    setBusy("Adding section…")
    try {
      const sectionTitle = newSectionTitle.trim()
      const sectionContent = newSectionContent.trim()
      if (!sectionTitle) throw new Error("Section title is required.")
      if (!sectionContent) throw new Error("Section content is required.")

      const nextPos = sections.length + 1
      const { error: insertError } = await supabase.from("topic_sections").insert({
        topic_pack_id: selectedPackId,
        title: sectionTitle,
        content: sectionContent,
        position: nextPos,
      })

      if (insertError) throw insertError
      setNewSectionTitle("")
      setNewSectionContent("")
      await refreshSections(selectedPackId)
      await updateTotalSections(selectedPackId, nextPos)
      setNotice("Section added.")
    } finally {
      setBusy(null)
    }
  }

  async function deleteSection(sectionId: string) {
    if (!selectedPackId) return
    setError(null)
    setNotice(null)
    setBusy("Deleting section…")
    try {
      const { error: delError } = await supabase
        .from("topic_sections")
        .delete()
        .eq("id", sectionId)
        .eq("topic_pack_id", selectedPackId)

      if (delError) throw delError

      const remaining = sections.filter((s) => s.id !== sectionId)
      const renumber = remaining.map((s, idx) => ({
        id: s.id,
        topic_pack_id: selectedPackId,
        position: idx + 1,
      }))

      if (renumber.length > 0) {
        const { error: reorderError } = await supabase
          .from("topic_sections")
          .upsert(renumber, { onConflict: "id" })

        if (reorderError) throw reorderError
      }

      await refreshSections(selectedPackId)
      await updateTotalSections(selectedPackId, remaining.length)
      setNotice("Section deleted.")
    } finally {
      setBusy(null)
    }
  }

  async function saveSection(section: TopicSectionRow, titleValue: string, contentValue: string) {
    if (!selectedPackId) return
    setError(null)
    setNotice(null)
    setBusy("Saving section…")
    try {
      const { error: updateError } = await supabase
        .from("topic_sections")
        .update({
          title: titleValue.trim(),
          content: contentValue.trim(),
        })
        .eq("id", section.id)
        .eq("topic_pack_id", selectedPackId)

      if (updateError) throw updateError
      await refreshSections(selectedPackId)
      setNotice("Section updated.")
    } finally {
      setBusy(null)
    }
  }

  async function moveSection(fromIndex: number, direction: -1 | 1) {
    if (!selectedPackId) return
    const toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= sections.length) return

    const next = [...sections]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    setSections(next.map((s, idx) => ({ ...s, position: idx + 1 })))

    setError(null)
    setNotice(null)
    setBusy("Reordering…")
    try {
      const payload = next.map((s, idx) => ({
        id: s.id,
        topic_pack_id: selectedPackId,
        position: idx + 1,
      }))
      const { error: reorderError } = await supabase
        .from("topic_sections")
        .upsert(payload, { onConflict: "id" })
      if (reorderError) throw reorderError
      await refreshSections(selectedPackId)
      setNotice("Reordered.")
    } finally {
      setBusy(null)
    }
  }

  const dragIndexRef = React.useRef<number | null>(null)

  async function reorderByDrag(from: number, to: number) {
    if (!selectedPackId) return
    if (from === to) return
    const next = [...sections]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setSections(next.map((s, idx) => ({ ...s, position: idx + 1 })))

    setError(null)
    setNotice(null)
    setBusy("Reordering…")
    try {
      const payload = next.map((s, idx) => ({
        id: s.id,
        topic_pack_id: selectedPackId,
        position: idx + 1,
      }))
      const { error: reorderError } = await supabase
        .from("topic_sections")
        .upsert(payload, { onConflict: "id" })
      if (reorderError) throw reorderError
      await refreshSections(selectedPackId)
      setNotice("Reordered.")
    } finally {
      setBusy(null)
    }
  }

  async function togglePublish(next: boolean) {
    if (!selectedPackId) {
      setError("Save the topic pack first, then publish.")
      return
    }
    setError(null)
    setNotice(null)
    setBusy(next ? "Publishing…" : "Unpublishing…")
    try {
      const { error: updateError } = await supabase
        .from("topic_packs")
        .update({
          is_published: next,
          published_at: next ? new Date().toISOString() : null,
        })
        .eq("id", selectedPackId)

      if (updateError) throw updateError
      setIsPublished(next)
      await refreshPackList()
      setNotice(next ? "Published." : "Unpublished.")
    } finally {
      setBusy(null)
    }
  }

  async function generateQuizAndFlashcards() {
    if (!selectedPackId) {
      setError("Save the topic pack first.")
      return
    }
    if (sections.length === 0) {
      setError("Add at least one section first.")
      return
    }

    setError(null)
    setNotice(null)
    setBusy("Generating quiz & flashcards…")
    try {
      const quizRes = await fetch("/api/generate/topic-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_pack_id: selectedPackId }),
      })
      const quizJson = (await quizRes.json()) as { quiz?: unknown[]; error?: string }
      if (!quizRes.ok) throw new Error(quizJson.error || "Quiz generation failed.")
      if (!Array.isArray(quizJson.quiz) || quizJson.quiz.length === 0) {
        throw new Error("Quiz generation returned no data.")
      }

      const flashRes = await fetch("/api/generate/topic-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_pack_id: selectedPackId }),
      })
      const flashJson = (await flashRes.json()) as { flashcards?: unknown[]; error?: string }
      if (!flashRes.ok) throw new Error(flashJson.error || "Flashcard generation failed.")
      if (!Array.isArray(flashJson.flashcards) || flashJson.flashcards.length === 0) {
        throw new Error("Flashcard generation returned no data.")
      }

      setNotice("Generated and saved quiz + flashcards.")
    } finally {
      setBusy(null)
    }
  }

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshPackList()
        if (!cancelled) setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load topic packs.")
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (slugDirty) return
    setSlug(slugify(title))
  }, [title, slugDirty])

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-2 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">Admin</h1>
        <p className="text-sm text-gray-600">
          Signed in as <span className="font-semibold">{adminEmail}</span>
        </p>
      </header>

      {(error || notice || busy) && (
        <Card className="rounded-xl bg-white">
          <CardContent className="space-y-1 p-4 text-sm">
            {busy ? <p className="font-semibold text-black">{busy}</p> : null}
            {notice ? <p className="text-black">{notice}</p> : null}
            {error ? <p className="text-red-700">{error}</p> : null}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl bg-white">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="text-lg font-black uppercase">Create Topic Pack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., UK Inflation: What it means"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugDirty(true)
                      setSlug(e.target.value)
                    }}
                    placeholder="uk-inflation-what-it-means"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for the library card."
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TopicPackCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (emoji)</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📈"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white p-3 md:col-span-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold uppercase tracking-wide">Is Free</p>
                    <p className="text-sm text-gray-600">Show this pack as free in the library.</p>
                  </div>
                  <Switch checked={isFree} onCheckedChange={setIsFree} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="takeaways">Key Takeaways (one per line)</Label>
                  <Textarea
                    id="takeaways"
                    value={keyTakeawaysText}
                    onChange={(e) => setKeyTakeawaysText(e.target.value)}
                    placeholder={"One takeaway per line.\nE.g.\nHow CPI impacts rates\nHow rates affect valuations"}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={saveTopicPack} disabled={Boolean(busy)}>
                  {selectedPackId ? "Save Topic Pack" : "Create Topic Pack"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFormForNew}
                  disabled={Boolean(busy)}
                >
                  New Pack
                </Button>
                {selectedPackId ? (
                  <div className="ml-auto flex items-center gap-3 rounded-lg border-2 border-black bg-white px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold uppercase tracking-wide">Publish</p>
                      <p className="text-sm text-gray-600">
                        {isPublished ? "Published" : "Draft"}
                      </p>
                    </div>
                    <Switch checked={isPublished} onCheckedChange={togglePublish} />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl bg-white">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="text-lg font-black uppercase">Manage Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section title</Label>
                  <Input
                    id="section-title"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="e.g., What is inflation?"
                    disabled={!selectedPackId || Boolean(busy)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-content">Section content</Label>
                  <Textarea
                    id="section-content"
                    value={newSectionContent}
                    onChange={(e) => setNewSectionContent(e.target.value)}
                    placeholder="Paste or write the content for this section…"
                    className="min-h-40"
                    disabled={!selectedPackId || Boolean(busy)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={addSection} disabled={!selectedPackId || Boolean(busy)}>
                    Add Section
                  </Button>
                  <p className="text-sm text-gray-600">
                    {selectedPackId ? `Total: ${sections.length}` : "Create a pack to add sections."}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {sections.length === 0 ? (
                  <p className="text-sm text-gray-600">No sections yet.</p>
                ) : (
                  sections.map((s, idx) => (
                    <SectionRow
                      key={s.id}
                      index={idx}
                      section={s}
                      disabled={Boolean(busy)}
                      onDelete={() => deleteSection(s.id)}
                      onSave={(t, c) => saveSection(s, t, c)}
                      onMoveUp={() => moveSection(idx, -1)}
                      onMoveDown={() => moveSection(idx, 1)}
                      onDragStart={() => {
                        dragIndexRef.current = idx
                      }}
                      onDrop={() => {
                        const from = dragIndexRef.current
                        dragIndexRef.current = null
                        if (typeof from === "number") void reorderByDrag(from, idx)
                      }}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl bg-white">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="text-lg font-black uppercase">Generate Quiz & Flashcards</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-gray-600">
                Generates 30 scenario-based quiz questions and 20 flashcards from all sections.
              </p>
              <Button onClick={generateQuizAndFlashcards} disabled={!selectedPackId || Boolean(busy)}>
                Generate Quiz & Flashcards
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-xl bg-white">
          <CardHeader className="border-b-2 border-black">
            <CardTitle className="text-lg font-black uppercase">Existing Topic Packs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Button
              variant="outline"
              onClick={async () => {
                setError(null)
                setNotice(null)
                setBusy("Refreshing…")
                try {
                  await refreshPackList()
                } finally {
                  setBusy(null)
                }
              }}
              disabled={Boolean(busy)}
            >
              Refresh
            </Button>
            <Separator />
            <div className="space-y-3">
              {packs.length === 0 ? (
                <p className="text-sm text-gray-600">No topic packs yet.</p>
              ) : (
                packs.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border-2 border-black bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase text-black">
                          {p.icon ? `${p.icon} ` : ""}
                          {p.title ?? "(untitled)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {p.category ?? "—"} • {p.total_sections ?? 0} sections •{" "}
                          {p.is_published ? "Published" : "Draft"}
                        </p>
                        {p.slug ? (
                          <p className="text-xs text-gray-500">/{p.slug}</p>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        variant={p.id === selectedPackId ? "secondary" : "outline"}
                        onClick={() => void loadPackForEdit(p.id)}
                        disabled={Boolean(busy)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {currentPack ? (
              <p className="text-xs text-gray-600">
                Editing: <span className="font-semibold">{currentPack.title ?? currentPack.id}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function SectionRow({
  section,
  index,
  disabled,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDrop,
}: {
  section: TopicSectionRow
  index: number
  disabled: boolean
  onSave: (title: string, content: string) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDragStart: () => void
  onDrop: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [title, setTitle] = React.useState(section.title ?? "")
  const [content, setContent] = React.useState(section.content ?? "")

  React.useEffect(() => {
    if (editing) return
    setTitle(section.title ?? "")
    setContent(section.content ?? "")
  }, [editing, section.content, section.title])

  return (
    <div
      className="rounded-xl border-2 border-black bg-white p-3"
      draggable={!disabled}
      onDragStart={() => onDragStart()}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={() => onDrop()}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
            Section {index + 1}
          </p>
          <p className="truncate text-sm font-black uppercase text-black">
            {section.title ?? "(untitled)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={onMoveUp} disabled={disabled || index === 0}>
            Up
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={onMoveDown}
            disabled={disabled}
          >
            Down
          </Button>
          <Button
            size="xs"
            variant={editing ? "secondary" : "outline"}
            onClick={() => setEditing((v) => !v)}
            disabled={disabled}
          >
            {editing ? "Close" : "Edit"}
          </Button>
          <Button size="xs" variant="destructive" onClick={onDelete} disabled={disabled}>
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 grid gap-3">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onSave(title, content)
                setEditing(false)
              }}
              disabled={disabled}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTitle(section.title ?? "")
                setContent(section.content ?? "")
                setEditing(false)
              }}
              disabled={disabled}
            >
              Cancel
            </Button>
            <p className="text-xs text-gray-600">Tip: you can drag rows to reorder.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
