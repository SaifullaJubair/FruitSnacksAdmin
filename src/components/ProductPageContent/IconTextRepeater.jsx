import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";

// Reusable repeater for arrays of {icon_url, icon_key, text}
// Used for: short_features, process_steps, use_cases
const IconTextRepeater = ({ value = [], onChange, label, max = 4, helper }) => {
  const [uploading, setUploading] = useState(false);

  const addRow = () => {
    if (value.length >= max) {
      toast.info(`Max ${max} items allowed`);
      return;
    }
    onChange([...value, { icon_url: "", icon_key: "", text: "" }]);
  };

  const updateRow = (i, patch) => {
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const removeRow = (i) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const handleIconUpload = async (i, file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(`${BASE_URL}/image_upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        updateRow(i, {
          icon_url: data.data.Location,
          icon_key: data.data.Key,
        });
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          {label}{" "}
          <span className="text-xs font-normal text-gray-400">
            (max {max})
          </span>
        </label>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blueColor-50 text-blueColor-600 rounded hover:bg-blueColor-100"
        >
          <FaPlus /> Add
        </button>
      </div>
      {helper && <p className="text-xs text-gray-400 -mt-1">{helper}</p>}
      {value.length === 0 ? (
        <p className="text-xs text-gray-400 italic">কিছু যোগ করা হয়নি।</p>
      ) : (
        value.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white border rounded"
          >
            {row.icon_url ? (
              <img
                src={row.icon_url}
                alt=""
                className="w-10 h-10 object-cover rounded border bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center text-gray-300 text-xs">
                icon
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleIconUpload(i, e.target.files?.[0])}
              className="text-xs flex-shrink-0 w-32"
              disabled={uploading}
            />
            <input
              type="text"
              value={row.text}
              onChange={(e) => updateRow(i, { text: e.target.value })}
              placeholder="Text"
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              <FaTrash />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default IconTextRepeater;
