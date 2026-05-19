"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { config } from "../../../config";
import {
  Info, Image as ImageIcon, BookOpen, Target, Eye, BarChart3, Heart, Megaphone, Plus, Trash2,
} from "lucide-react";
import {
  PageHeader, SectionCard, FormField, Input, Textarea, ActionBtn,
  ErrorBanner, SuccessAlert, FormGrid, FileUpload, RepeatableItem, CollapsibleSection,
} from "../../components/Dashboard/DashUI";

const apiUrl     = config.apiUrl;
const imageUrl   = config.imageUrl;

const EMPTY = {
  hero_eyebrow: "",  hero_title: "",  hero_subtitle: "",
  story_title: "",   story_content: "",
  mission_title: "", mission_content: "",
  vision_title: "",  vision_content: "",
  stats: [],
  values: [],
  cta_title: "", cta_subtitle: "", cta_button_label: "", cta_button_url: "",
};

const compressOptions = {
  maxSizeMB: 0.5, maxWidthOrHeight: 1600, useWebWorker: true, fileType: "image/webp",
};

const ViewAbout = () => {
  const [form, setForm]           = useState(EMPTY);
  const [heroImage, setHeroImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [heroPreview, setHeroPreview]   = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [heroSaved, setHeroSaved]     = useState(null);
  const [storySaved, setStorySaved]   = useState(null);
  const [heroClear, setHeroClear]     = useState(false);
  const [storyClear, setStoryClear]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    axios.get(`${apiUrl}/about`)
      .then((res) => {
        const d = res.data || {};
        setForm({
          hero_eyebrow:    d.hero_eyebrow    || "",
          hero_title:      d.hero_title      || "",
          hero_subtitle:   d.hero_subtitle   || "",
          story_title:     d.story_title     || "",
          story_content:   d.story_content   || "",
          mission_title:   d.mission_title   || "",
          mission_content: d.mission_content || "",
          vision_title:    d.vision_title    || "",
          vision_content:  d.vision_content  || "",
          stats:           Array.isArray(d.stats)  ? d.stats  : [],
          values:          Array.isArray(d.values) ? d.values : [],
          cta_title:        d.cta_title        || "",
          cta_subtitle:     d.cta_subtitle     || "",
          cta_button_label: d.cta_button_label || "",
          cta_button_url:   d.cta_button_url   || "",
        });
        setHeroSaved(d.hero_image  || null);
        setStorySaved(d.story_image || null);
      })
      .catch(() => setError("Failed to load About page content"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = async (e, setFile, setPreview, setClear) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setError(null);
    try {
      const blob = await imageCompression(file, compressOptions);
      const compressed = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, "") + ".webp",
        { type: "image/webp", lastModified: Date.now() }
      );
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setClear(false);
    } catch {
      setError("Image compression failed");
    } finally {
      setCompressing(false);
    }
  };

  const clearImage = (setFile, setPreview, setSaved, setClear) => {
    setFile(null);
    setPreview(null);
    setSaved(null);
    setClear(true);
  };

  const updateRepeatable = (key, idx, field, value) => {
    setForm((p) => {
      const list = [...(p[key] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...p, [key]: list };
    });
  };

  const addItem = (key, template) => {
    setForm((p) => ({ ...p, [key]: [...(p[key] || []), { ...template }] }));
  };

  const removeItem = (key, idx) => {
    setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const data = new FormData();
      data.append("_method", "PUT");
      [
        "hero_eyebrow","hero_title","hero_subtitle",
        "story_title","story_content",
        "mission_title","mission_content",
        "vision_title","vision_content",
        "cta_title","cta_subtitle","cta_button_label","cta_button_url",
      ].forEach((k) => data.append(k, form[k] ?? ""));

      (form.stats || []).forEach((s, i) => {
        data.append(`stats[${i}][label]`, s.label || "");
        data.append(`stats[${i}][value]`, s.value || "");
        data.append(`stats[${i}][icon]`,  s.icon  || "");
      });

      (form.values || []).forEach((v, i) => {
        data.append(`values[${i}][title]`,       v.title       || "");
        data.append(`values[${i}][description]`, v.description || "");
        data.append(`values[${i}][icon]`,        v.icon        || "");
      });

      if (heroImage)  data.append("hero_image",  heroImage);
      if (storyImage) data.append("story_image", storyImage);
      if (heroClear)  data.append("hero_image_clear",  "1");
      if (storyClear) data.append("story_image_clear", "1");

      const res = await axios.post(`${apiUrl}/about`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data?.data || {};
      setHeroSaved(d.hero_image  || null);
      setStorySaved(d.story_image || null);
      setHeroImage(null);  setHeroPreview(null);  setHeroClear(false);
      setStoryImage(null); setStoryPreview(null); setStoryClear(false);
      setSuccess("About page updated successfully");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const data = err.response?.data;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      setError(first || data?.message || "Failed to save About page");
    } finally {
      setSaving(false);
    }
  };

  const heroDisplay  = heroPreview  || (heroSaved  ? `${imageUrl}/${heroSaved}`  : null);
  const storyDisplay = storyPreview || (storySaved ? `${imageUrl}/${storySaved}` : null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="About Us"
        subtitle="Manage every section of your public About page"
        icon={Info}
      />

      <ErrorBanner message={error} />
      {success && <SuccessAlert message={success} />}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Hero ─────────────────────────────────────────────── */}
        <CollapsibleSection title="Hero Section" subtitle="Top banner — eyebrow, headline, image" icon={ImageIcon} defaultOpen accent="indigo">
          <FormGrid>
            <FormField label="Eyebrow" hint="Small text above the headline">
              <Input name="hero_eyebrow" value={form.hero_eyebrow} onChange={handleChange} placeholder="e.g. WHO WE ARE" maxLength={100} />
            </FormField>
            <FormField label="Hero Title">
              <Input name="hero_title" value={form.hero_title} onChange={handleChange} placeholder="e.g. About Our Store" maxLength={255} />
            </FormField>
          </FormGrid>
          <FormField label="Hero Subtitle">
            <Textarea name="hero_subtitle" value={form.hero_subtitle} onChange={handleChange} rows={3} placeholder="One or two sentences shown under the hero title" />
          </FormField>
          <FormField label="Hero Image" hint="Auto-compressed to WebP. Recommended 1600px wide, landscape.">
            <FileUpload
              preview={heroDisplay}
              onChange={(e) => handleImageUpload(e, setHeroImage, setHeroPreview, setHeroClear)}
              onClear={() => clearImage(setHeroImage, setHeroPreview, setHeroSaved, setHeroClear)}
              loading={compressing}
              hint="PNG / JPG / WebP"
              height="h-48"
              inputName="hero_image"
            />
          </FormField>
        </CollapsibleSection>

        {/* Story ────────────────────────────────────────────── */}
        <CollapsibleSection title="Our Story" subtitle="Brand story narrative with side image" icon={BookOpen} accent="violet">
          <FormField label="Story Title">
            <Input name="story_title" value={form.story_title} onChange={handleChange} placeholder="e.g. Our Journey" maxLength={255} />
          </FormField>
          <FormField label="Story Content" hint="HTML allowed (paragraphs, bold, links)">
            <Textarea name="story_content" value={form.story_content} onChange={handleChange} rows={6} placeholder="Tell your brand story..." />
          </FormField>
          <FormField label="Story Image">
            <FileUpload
              preview={storyDisplay}
              onChange={(e) => handleImageUpload(e, setStoryImage, setStoryPreview, setStoryClear)}
              onClear={() => clearImage(setStoryImage, setStoryPreview, setStorySaved, setStoryClear)}
              loading={compressing}
              hint="PNG / JPG / WebP"
              height="h-48"
              inputName="story_image"
            />
          </FormField>
        </CollapsibleSection>

        {/* Mission & Vision ────────────────────────────────── */}
        <CollapsibleSection title="Mission & Vision" subtitle="Two side-by-side blocks" icon={Target} accent="emerald">
          <FormGrid>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={12} /> Mission
              </p>
              <FormField label="Mission Title">
                <Input name="mission_title" value={form.mission_title} onChange={handleChange} placeholder="Our Mission" maxLength={255} />
              </FormField>
              <FormField label="Mission Content">
                <Textarea name="mission_content" value={form.mission_content} onChange={handleChange} rows={4} placeholder="What drives your business..." />
              </FormField>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={12} /> Vision
              </p>
              <FormField label="Vision Title">
                <Input name="vision_title" value={form.vision_title} onChange={handleChange} placeholder="Our Vision" maxLength={255} />
              </FormField>
              <FormField label="Vision Content">
                <Textarea name="vision_content" value={form.vision_content} onChange={handleChange} rows={4} placeholder="Where you're heading..." />
              </FormField>
            </div>
          </FormGrid>
        </CollapsibleSection>

        {/* Stats ────────────────────────────────────────────── */}
        <CollapsibleSection title="Stats" subtitle="Key numbers (e.g. 10K+ Customers, 5★ Rating)" icon={BarChart3} badge={form.stats.length} accent="amber">
          <div className="space-y-3">
            {form.stats.length === 0 && (
              <p className="text-xs text-gray-400 italic">No stats yet. Click below to add one.</p>
            )}
            {form.stats.map((s, i) => (
              <RepeatableItem key={i} index={i} onRemove={() => removeItem("stats", i)}>
                <FormGrid cols={3}>
                  <FormField label="Value" hint="e.g. 10K+">
                    <Input value={s.value || ""} onChange={(e) => updateRepeatable("stats", i, "value", e.target.value)} placeholder="10K+" maxLength={50} />
                  </FormField>
                  <FormField label="Label" hint="e.g. Happy Customers">
                    <Input value={s.label || ""} onChange={(e) => updateRepeatable("stats", i, "label", e.target.value)} placeholder="Happy Customers" maxLength={100} />
                  </FormField>
                  <FormField label="Icon" hint="Emoji or short string">
                    <Input value={s.icon || ""} onChange={(e) => updateRepeatable("stats", i, "icon", e.target.value)} placeholder="😊" maxLength={50} />
                  </FormField>
                </FormGrid>
              </RepeatableItem>
            ))}
            <ActionBtn type="button" variant="secondary" size="sm" icon={Plus} onClick={() => addItem("stats", { label: "", value: "", icon: "" })}>
              Add Stat
            </ActionBtn>
          </div>
        </CollapsibleSection>

        {/* Values ───────────────────────────────────────────── */}
        <CollapsibleSection title="Values" subtitle="Core values shown as cards" icon={Heart} badge={form.values.length}>
          <div className="space-y-3">
            {form.values.length === 0 && (
              <p className="text-xs text-gray-400 italic">No values yet. Click below to add one.</p>
            )}
            {form.values.map((v, i) => (
              <RepeatableItem key={i} index={i} onRemove={() => removeItem("values", i)}>
                <FormGrid>
                  <FormField label="Title">
                    <Input value={v.title || ""} onChange={(e) => updateRepeatable("values", i, "title", e.target.value)} placeholder="Quality" maxLength={150} />
                  </FormField>
                  <FormField label="Icon" hint="Emoji or short string">
                    <Input value={v.icon || ""} onChange={(e) => updateRepeatable("values", i, "icon", e.target.value)} placeholder="⭐" maxLength={50} />
                  </FormField>
                </FormGrid>
                <FormField label="Description" className="mt-3">
                  <Textarea
                    value={v.description || ""}
                    onChange={(e) => updateRepeatable("values", i, "description", e.target.value)}
                    rows={2}
                    placeholder="We never compromise on quality..."
                    maxLength={500}
                  />
                </FormField>
              </RepeatableItem>
            ))}
            <ActionBtn type="button" variant="secondary" size="sm" icon={Plus} onClick={() => addItem("values", { title: "", description: "", icon: "" })}>
              Add Value
            </ActionBtn>
          </div>
        </CollapsibleSection>

        {/* CTA ──────────────────────────────────────────────── */}
        <CollapsibleSection title="Call To Action" subtitle="Bottom banner button" icon={Megaphone} accent="violet">
          <FormGrid>
            <FormField label="CTA Title">
              <Input name="cta_title" value={form.cta_title} onChange={handleChange} placeholder="Ready to shop?" maxLength={255} />
            </FormField>
            <FormField label="Button Label">
              <Input name="cta_button_label" value={form.cta_button_label} onChange={handleChange} placeholder="Browse Products" maxLength={100} />
            </FormField>
          </FormGrid>
          <FormField label="CTA Subtitle">
            <Textarea name="cta_subtitle" value={form.cta_subtitle} onChange={handleChange} rows={2} placeholder="One-line CTA description" />
          </FormField>
          <FormField label="Button URL" hint="Internal path like /shop or full URL">
            <Input name="cta_button_url" value={form.cta_button_url} onChange={handleChange} placeholder="/shop" maxLength={500} />
          </FormField>
        </CollapsibleSection>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 -mx-4 md:-mx-6 px-4 md:px-6 py-3 flex items-center justify-end gap-3 z-10">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium"
          >
            View Live →
          </a>
          <ActionBtn type="submit" variant="primary" loading={saving}>
            Save About Page
          </ActionBtn>
        </div>
      </form>
    </div>
  );
};

export default ViewAbout;
