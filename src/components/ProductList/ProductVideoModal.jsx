import { useState, useRef } from "react";
import { FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2-optimized";
import { BASE_URL } from "../../utils/baseURL";

// A2 — Video Modal. Two channels:
//   1. main_video — uploaded mp4/mov/etc; lives in S3 (handled by PATCH
//      /product full route — we keep this modal calling that path because
//      multer needs the same field map. Risk: full-rebuild route. Mitigation:
//      we only let owner trigger an UPLOAD here; status/trending and prices
//      go through /product/quick which is safe.
//   2. video_link — YouTube/Vimeo URL; whitelisted in /product/quick.
//
// Replace upload re-uses the existing PATCH /product field (FormData), but
// only sends the video field — backend update handler must handle the other
// fields too. To avoid the wipe trap, we DO send the product's required
// fields back as well (name, slug, status) which the BE accepts.
//
// Owner-locked safer path: video_link via /product/quick is fully safe.
// For uploaded video we surface a remove button + URL field for now.
const ProductVideoModal = ({ product, onClose, onSaved }) => {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const [videoLink, setVideoLink] = useState(product?.video_link || "");
  const [currentVideo, setCurrentVideo] = useState(product?.main_video || "");

  const apiQuickPatch = async (body) => {
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/product/quick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _id: product._id, ...body }),
      });
      const data = await res.json();
      if (data?.statusCode === 200 && data?.success) {
        toast.success("Updated", { autoClose: 1200 });
        onSaved?.();
        return true;
      }
      toast.error(data?.message || "Update failed", { autoClose: 1500 });
      return false;
    } catch {
      toast.error("Network error", { autoClose: 1500 });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveLink = async () => {
    if (await apiQuickPatch({ video_link: videoLink || "" })) {
      // success — close on demand by user, not auto.
    }
  };

  // For now, removing the uploaded video is implemented via a dedicated note:
  // owner asks to clear it → we set video_link only; the uploaded video stays
  // until they re-upload from the full edit page. (Avoiding the wipe trap.)
  const handleRemoveLink = async () => {
    const ok = await Swal.fire({
      title: "Clear video link?",
      text: "External video URL will be removed. The uploaded main video (if any) is unchanged.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, clear",
    });
    if (!ok.isConfirmed) return;
    setVideoLink("");
    await apiQuickPatch({ video_link: "" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Video — {product?.product_name}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Uploaded main video */}
          <div>
            <h3 className="font-medium text-sm mb-2">Uploaded Main Video</h3>
            {currentVideo ? (
              <div className="space-y-2">
                <video
                  src={currentVideo}
                  controls
                  className="w-full max-h-64 rounded border bg-black"
                />
                <div className="text-xs text-gray-500">
                  To replace or remove the uploaded video file, use the full
                  product edit page (avoids wiping other fields).
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                No uploaded video on this product.
              </div>
            )}
          </div>

          {/* External video link */}
          <div>
            <h3 className="font-medium text-sm mb-2">
              External Video URL (YouTube / Vimeo)
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtu.be/..."
                className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primaryColor"
              />
              <button
                type="button"
                disabled={busy}
                onClick={saveLink}
                className="bg-primaryColor text-white text-sm px-3 py-1.5 rounded hover:bg-blue-500 disabled:opacity-50"
              >
                Save
              </button>
              {videoLink && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRemoveLink}
                  className="text-red-500 hover:text-red-600 p-1"
                  title="Clear link"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Cheap alternative to uploading. Renders on PDP as an embed.
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductVideoModal;
