import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaTimes, FaSave } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";

const CATEGORIES = ["shelf_life", "storage", "ingredients", "usage", "health", "general"];
const PLACEHOLDER_HINT = `Available placeholders: {{product_name}}, {{shelf_life}}, {{weight}}, {{price}}, {{origin}}`;

const FaqTemplateModal = ({ open, onClose, initial = null, refetch }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      question: initial?.question || "",
      answer: initial?.answer || "",
      category: initial?.category || "general",
      is_active: initial?.is_active ?? true,
    },
  });

  useEffect(() => {
    reset({
      question: initial?.question || "",
      answer: initial?.answer || "",
      category: initial?.category || "general",
      is_active: initial?.is_active ?? true,
    });
  }, [initial, reset]);

  if (!open) return null;

  const onSubmit = async (form) => {
    const url = initial?._id
      ? `${BASE_URL}/faq-template/${initial._id}`
      : `${BASE_URL}/faq-template`;
    const method = initial?._id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(initial ? "Template updated" : "Template created");
        refetch();
        onClose();
      } else {
        toast.error(data?.message || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {initial ? "Edit FAQ Template" : "Add FAQ Template"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Category</label>
            <select {...register("category")} className="form-input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Question</label>
            <input
              type="text"
              {...register("question", { required: true })}
              className="form-input"
              placeholder="{{product_name}} কতদিন ভালো থাকে?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Answer</label>
            <textarea
              {...register("answer", { required: true })}
              rows={4}
              className="form-input"
              placeholder="সঠিকভাবে রাখলে {{product_name}} {{shelf_life}} পর্যন্ত ভালো।"
            />
          </div>

          <p className="text-[11px] text-gray-500">{PLACEHOLDER_HINT}</p>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} />
            Active
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blueColor-600 text-white hover:bg-blueColor-700 rounded"
            >
              <FaSave /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaqTemplateModal;
