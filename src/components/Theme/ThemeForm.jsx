import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaImage,
  FaCheckCircle,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import ColorAutoPreview from "./ColorAutoPreview";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const FONT_OPTIONS = [
  { key: "hind-siliguri", label: "Hind Siliguri" },
  { key: "tiro-bangla", label: "Tiro Bangla" },
  { key: "noto-sans-bengali", label: "Noto Sans Bengali" },
  { key: "baloo-da-2", label: "Baloo Da 2" },
  { key: "mina", label: "Mina" },
];

const SECTION_OPTIONS = [
  "hero",
  "order",
  "benefits",
  "use_cases",
  "nutrition",
  "reviews",
  "faq",
  "any",
];

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ThemeForm = ({ initial = null, mode = "create" }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Floating assets local state (uploaded to backend after theme save)
  const [pendingAssets, setPendingAssets] = useState([]); // [{file, position, section, ...}]
  const [existingAssets, setExistingAssets] = useState(initial?.floating_assets || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      theme_name: initial?.theme_name || "",
      theme_slug: initial?.theme_slug || "",
      theme_for: initial?.theme_for || "",
      status: initial?.status || "draft",
      colors: {
        primary: initial?.colors?.primary || "#10B981",
        page_bg: initial?.colors?.page_bg || "#FAFAFA",
        accent: initial?.colors?.accent || "#F59E0B",
      },
      typography: {
        font_key: initial?.typography?.font_key || "hind-siliguri",
        heading_weight: initial?.typography?.heading_weight || "700",
        style: initial?.typography?.style || "rounded",
      },
      button_style: {
        border_radius: initial?.button_style?.border_radius || "8px",
        variant: initial?.button_style?.variant || "filled",
      },
      preview_data: {
        product_name: initial?.preview_data?.product_name || "",
        short_description: initial?.preview_data?.short_description || "",
        price: initial?.preview_data?.price || "",
        discount_price: initial?.preview_data?.discount_price || "",
        image_url: initial?.preview_data?.image_url || "",
      },
    },
  });

  const watchedName = watch("theme_name");
  const watchedSlug = watch("theme_slug");
  const watchedColors = watch("colors");

  // Auto-suggest slug from name when admin hasn't edited slug manually
  useEffect(() => {
    if (mode !== "create") return;
    if (!watchedName) return;
    if (!watchedSlug || watchedSlug === slugify(watchedName).slice(0, watchedSlug.length)) {
      setValue("theme_slug", slugify(watchedName));
    }
  }, [watchedName, mode, setValue, watchedSlug]);

  const addPendingAsset = () => {
    setPendingAssets((prev) => [
      ...prev,
      {
        file: null,
        position: "left",
        section: "hero",
        animation_type: "float",
        animation_speed: "normal",
        size: "md",
        opacity: 1,
        hide_on_mobile: true,
      },
    ]);
  };

  const updatePendingAsset = (idx, patch) => {
    setPendingAssets((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    );
  };

  const removePendingAsset = (idx) => {
    setPendingAssets((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingAsset = async (idx) => {
    if (!initial?._id) return;
    try {
      const res = await fetch(
        `${BASE_URL}/theme/${initial._id}/floating-asset/${idx}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data?.success) {
        setExistingAssets((prev) => prev.filter((_, i) => i !== idx));
        toast.success("Floating asset removed");
      } else {
        toast.error(data?.message || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const onSubmit = async (form) => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("theme_name", form.theme_name);
      payload.append("theme_slug", form.theme_slug);
      payload.append("theme_for", form.theme_for);
      payload.append("status", form.status);
      payload.append("colors", JSON.stringify(form.colors));
      payload.append("typography", JSON.stringify(form.typography));
      payload.append("button_style", JSON.stringify(form.button_style));
      payload.append(
        "preview_data",
        JSON.stringify({
          ...form.preview_data,
          price: form.preview_data.price ? Number(form.preview_data.price) : undefined,
          discount_price: form.preview_data.discount_price
            ? Number(form.preview_data.discount_price)
            : undefined,
        }),
      );
      if (thumbnailFile) {
        payload.append("thumbnail_preview", thumbnailFile);
      }

      const url =
        mode === "create" ? `${BASE_URL}/theme` : `${BASE_URL}/theme/${initial._id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: payload,
      });
      const data = await res.json();

      if (!data?.success) {
        toast.error(data?.message || "Save failed");
        setSubmitting(false);
        return;
      }

      const themeId = mode === "create" ? data?.data?._id : initial._id;

      // Upload pending floating assets one by one
      for (const a of pendingAssets) {
        if (!a.file) continue;
        const fd = new FormData();
        fd.append("asset", a.file);
        fd.append("position", a.position);
        fd.append("section", a.section);
        fd.append("animation_type", a.animation_type);
        fd.append("animation_speed", a.animation_speed);
        fd.append("size", a.size);
        fd.append("opacity", String(a.opacity));
        fd.append("hide_on_mobile", String(a.hide_on_mobile));
        await fetch(`${BASE_URL}/theme/${themeId}/floating-asset`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
      }

      toast.success(mode === "create" ? "Theme created" : "Theme updated");
      navigate("/theme");
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1 — Basic info */}
      <Section title="1. Basic Info" subtitle="Theme এর নাম, কোন fruit এর জন্য, status">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Theme Name *" error={errors.theme_name}>
            <input
              type="text"
              {...register("theme_name", { required: "Required" })}
              className="form-input"
              placeholder="e.g. Apple Red Premium"
            />
          </Field>
          <Field label="Slug *" error={errors.theme_slug}>
            <input
              type="text"
              {...register("theme_slug", { required: "Required" })}
              className="form-input font-mono"
              placeholder="apple-red-premium"
              disabled={mode === "update"}
            />
          </Field>
          <Field label="Theme For *" error={errors.theme_for}>
            <input
              type="text"
              {...register("theme_for", { required: "Required" })}
              className="form-input"
              placeholder="Apple / Mango / Lichu / default"
            />
          </Field>
          <Field label="Status">
            <select {...register("status")} className="form-input">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Thumbnail Preview (optional)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="form-input"
            />
            {initial?.thumbnail_preview && !thumbnailFile && (
              <img
                src={initial.thumbnail_preview}
                alt="thumb"
                className="mt-2 w-24 h-24 object-cover rounded border"
              />
            )}
          </Field>
        </div>
      </Section>

      {/* Section 2 — Colors */}
      <Section
        title="2. Colors"
        subtitle="তোমাকে শুধু ৩টা color দিতে হবে — বাকি 5 shade backend নিজে generate করবে।"
      >
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Field label="Primary *">
            <div className="flex items-center gap-2">
              <input type="color" {...register("colors.primary")} className="h-10 w-14" />
              <input
                type="text"
                {...register("colors.primary")}
                className="form-input flex-1 font-mono"
              />
            </div>
          </Field>
          <Field label="Page Background *">
            <div className="flex items-center gap-2">
              <input type="color" {...register("colors.page_bg")} className="h-10 w-14" />
              <input
                type="text"
                {...register("colors.page_bg")}
                className="form-input flex-1 font-mono"
              />
            </div>
          </Field>
          <Field label="Accent *">
            <div className="flex items-center gap-2">
              <input type="color" {...register("colors.accent")} className="h-10 w-14" />
              <input
                type="text"
                {...register("colors.accent")}
                className="form-input flex-1 font-mono"
              />
            </div>
          </Field>
        </div>
        <ColorAutoPreview
          primary={watchedColors.primary}
          page_bg={watchedColors.page_bg}
          accent={watchedColors.accent}
        />
      </Section>

      {/* Section 3 — Floating images */}
      <Section
        title="3. Floating Images"
        subtitle="প্রতিটা page section এ ভাসমান fruit image যোগ করো (transparent PNG/WebP)।"
      >
        {existingAssets.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500">
              Existing Assets
            </h4>
            {existingAssets.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded border"
              >
                <img
                  src={a.asset_url}
                  alt=""
                  className="w-12 h-12 object-cover rounded border bg-white"
                />
                <div className="flex-1 text-xs text-gray-600">
                  <div>
                    <strong>{a.section}</strong> · {a.position} · {a.animation_type} ·{" "}
                    {a.size}
                  </div>
                  <div className="text-gray-400">
                    opacity {a.opacity} · {a.hide_on_mobile ? "hidden mobile" : "shown mobile"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingAsset(i)}
                  className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {pendingAssets.map((a, idx) => (
            <div key={idx} className="border rounded p-3 bg-white">
              <div className="grid md:grid-cols-3 gap-3">
                <Field label="File">
                  <input
                    type="file"
                    accept="image/png,image/webp"
                    onChange={(e) =>
                      updatePendingAsset(idx, { file: e.target.files?.[0] || null })
                    }
                    className="form-input"
                  />
                </Field>
                <Field label="Section">
                  <select
                    value={a.section}
                    onChange={(e) =>
                      updatePendingAsset(idx, { section: e.target.value })
                    }
                    className="form-input"
                  >
                    {SECTION_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Position">
                  <select
                    value={a.position}
                    onChange={(e) =>
                      updatePendingAsset(idx, { position: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
                <Field label="Animation">
                  <select
                    value={a.animation_type}
                    onChange={(e) =>
                      updatePendingAsset(idx, { animation_type: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="float">Float</option>
                    <option value="spin">Spin</option>
                    <option value="bounce">Bounce</option>
                    <option value="sway">Sway</option>
                    <option value="none">None</option>
                  </select>
                </Field>
                <Field label="Speed">
                  <select
                    value={a.animation_speed}
                    onChange={(e) =>
                      updatePendingAsset(idx, { animation_speed: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </Field>
                <Field label="Size">
                  <select
                    value={a.size}
                    onChange={(e) => updatePendingAsset(idx, { size: e.target.value })}
                    className="form-input"
                  >
                    <option value="xs">XS</option>
                    <option value="sm">SM</option>
                    <option value="md">MD</option>
                    <option value="lg">LG</option>
                  </select>
                </Field>
                <Field label="Opacity (0-1)">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={a.opacity}
                    onChange={(e) =>
                      updatePendingAsset(idx, { opacity: Number(e.target.value) })
                    }
                    className="form-input"
                  />
                </Field>
                <Field label="">
                  <label className="inline-flex items-center gap-2 mt-7">
                    <input
                      type="checkbox"
                      checked={a.hide_on_mobile}
                      onChange={(e) =>
                        updatePendingAsset(idx, {
                          hide_on_mobile: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm text-gray-700">Hide on mobile</span>
                  </label>
                </Field>
              </div>
              <button
                type="button"
                onClick={() => removePendingAsset(idx)}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                <FaTrash className="inline mr-1" /> Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addPendingAsset}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blueColor-50 text-blueColor-600 rounded text-sm hover:bg-blueColor-100"
          >
            <FaPlus /> Add Floating Image
          </button>
        </div>
      </Section>

      {/* Section 4 — Typography & buttons */}
      <Section title="4. Typography & Buttons">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Font">
            <select {...register("typography.font_key")} className="form-input">
              {FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Heading Weight">
            <select {...register("typography.heading_weight")} className="form-input">
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
            </select>
          </Field>
          <Field label="Style">
            <select {...register("typography.style")} className="form-input">
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
              <option value="elegant">Elegant</option>
              <option value="bold">Bold</option>
            </select>
          </Field>
          <Field label="Button Border Radius">
            <select {...register("button_style.border_radius")} className="form-input">
              <option value="0px">Square (0px)</option>
              <option value="8px">Default (8px)</option>
              <option value="24px">Pill (24px)</option>
              <option value="9999px">Fully Rounded</option>
            </select>
          </Field>
          <Field label="Button Variant">
            <select {...register("button_style.variant")} className="form-input">
              <option value="filled">Filled</option>
              <option value="outlined">Outlined</option>
              <option value="gradient">Gradient</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Section 5 — Preview data */}
      <Section
        title="5. Preview Data"
        subtitle="Theme preview এ যে dummy product দেখানো হবে তার তথ্য।"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Product Name">
            <input
              type="text"
              {...register("preview_data.product_name")}
              className="form-input"
              placeholder="শুকনো আপেল"
            />
          </Field>
          <Field label="Image URL">
            <input
              type="text"
              {...register("preview_data.image_url")}
              className="form-input"
              placeholder="https://..."
            />
          </Field>
          <Field label="Short Description">
            <input
              type="text"
              {...register("preview_data.short_description")}
              className="form-input"
              placeholder="স্বাস্থ্যকর স্ন্যাকস, প্রতিদিনের এনার্জি"
            />
          </Field>
          <Field label="Price (BDT)">
            <input
              type="number"
              {...register("preview_data.price")}
              className="form-input"
            />
          </Field>
          <Field label="Discount Price (BDT)">
            <input
              type="number"
              {...register("preview_data.discount_price")}
              className="form-input"
            />
          </Field>
        </div>
      </Section>

      {/* Submit row */}
      <div className="flex items-center justify-between pt-2 border-t">
        {mode === "update" && initial?._id && (
          <a
            href={`/theme/preview/${initial._id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
          >
            <FaImage /> Open Preview
          </a>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 disabled:opacity-60"
        >
          {submitting ? <MiniSpinner /> : <FaSave />}{" "}
          {mode === "create" ? "Create Theme" : "Update Theme"}
        </button>
      </div>
    </form>
  );
};

const Section = ({ title, subtitle, children }) => (
  <section className="bg-white rounded-lg border border-gray-200 p-5">
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);

export default ThemeForm;
