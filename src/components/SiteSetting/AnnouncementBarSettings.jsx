import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

// Top-of-page rolling banner (3 items in design, but admin can add up to 5)
const MAX_ITEMS = 5;

const AnnouncementBarSettings = ({ getInitialCurrencyData, refetch }) => {
  const settingId = getInitialCurrencyData?._id;
  const initial = getInitialCurrencyData?.announcement_bar || [];
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(getInitialCurrencyData?.announcement_bar || []);
  }, [getInitialCurrencyData]);

  const addItem = () => {
    if (items.length >= MAX_ITEMS) {
      toast.info(`Max ${MAX_ITEMS} items`);
      return;
    }
    setItems((prev) => [...prev, { text: "", icon: "" }]);
  };
  const updateItem = (i, patch) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!settingId) {
      toast.error("Site setting record not initialised yet. Save other settings first.");
      return;
    }
    const cleaned = items
      .map((it) => ({ text: (it.text || "").trim(), icon: (it.icon || "").trim() }))
      .filter((it) => it.text);

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/setting`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: settingId, announcement_bar: cleaned }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("Announcement bar saved");
        refetch?.();
      } else toast.error(data?.message || "Save failed");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Top Announcement Bar</h3>
          <p className="text-xs text-gray-500">
            Site এর top এ ৩-৫ টা rolling text যোগ করো (e.g. সারা বাংলাদেশে ফ্রি ডেলিভারি)।
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blueColor-50 text-blueColor-600 rounded text-sm hover:bg-blueColor-100"
        >
          <FaPlus /> Add
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">কিছু যোগ করা হয়নি।</p>
        ) : (
          items.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 bg-white border rounded"
            >
              <input
                type="text"
                value={it.icon || ""}
                onChange={(e) => updateItem(i, { icon: e.target.value })}
                placeholder="Icon (emoji বা URL, optional)"
                className="form-input w-48"
              />
              <input
                type="text"
                value={it.text || ""}
                onChange={(e) => updateItem(i, { text: e.target.value })}
                placeholder="Announcement text"
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blueColor-600 text-white rounded hover:bg-blueColor-700 disabled:opacity-60"
        >
          {saving ? <MiniSpinner /> : <FaSave />} Save
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBarSettings;
