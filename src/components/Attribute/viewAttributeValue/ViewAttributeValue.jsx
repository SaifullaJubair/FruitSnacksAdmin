import { useState } from "react";
import { RxCross1 } from "react-icons/rx";

const ViewAttributeValue = ({
  setViewAttributeValueModal,
  attributesValue,
}) => {
  const [previewColor, setPreviewColor] = useState(null);

  // safer color attribute check
  const isColorAttribute =
    attributesValue?.attribute_name?.toLowerCase() === "color" ||
    attributesValue?.attribute_slug === "color" ||
    attributesValue?.attribute_type === "color";

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-xl w-[600px] p-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
          {/* Header */}
          <div>
            <h3 className="text-[20px] font-bold text-gray-800 text-center">
              View Attribute Value
            </h3>
            <button
              type="button"
              className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setViewAttributeValueModal(false)}
            >
              <RxCross1 size={20} />
            </button>
          </div>

          {/* Attribute Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md text-sm">
            <div className="font-bold">
              Attribute Name:{" "}
              <span className="font-medium text-slate-700">
                {attributesValue?.attribute_name}
              </span>
            </div>

            <div className="font-bold">
              Category Name:{" "}
              <span className="font-medium text-slate-700">
                {attributesValue?.category_id?.category_name || "N/A"}
              </span>
            </div>

            <div className="font-bold">
              Attribute Status:{" "}
              <span
                className={`font-medium ${
                  attributesValue?.attribute_status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {attributesValue?.attribute_status}
              </span>
            </div>
          </div>

          {/* Attribute Values Table */}
          <div className="mt-6">
            <span className="font-bold text-gray-700">Attributes Values:</span>

            <div className="mt-3 overflow-x-auto border rounded-lg">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 border-r">Name</th>
                    <th className="p-3 border-r">Value / Preview</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attributesValue?.attribute_values?.map((values) => (
                    <tr key={values?._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3 border-r font-medium">
                        {values?.attribute_value_name}
                      </td>

                      <td className="px-3 py-3 border-r">
                        <div className="flex items-center justify-center gap-3">
                          {/* Color Preview */}
                          {isColorAttribute && (
                            <div className="relative group">
                              <div
                                className="w-6 h-6 rounded-full border border-gray-300 shadow-sm cursor-pointer transition hover:scale-110"
                                style={{
                                  backgroundColor: values?.attribute_value_code,
                                }}
                                onClick={() =>
                                  setPreviewColor(values?.attribute_value_code)
                                }
                              ></div>

                              {/* Hover Big Preview (Desktop) */}
                              <div className="absolute left-1/2 top-[-70px] hidden group-hover:flex -translate-x-1/2 items-center justify-center z-50">
                                <div
                                  className="w-14 h-14 rounded-xl border-2 border-white shadow-xl"
                                  style={{
                                    backgroundColor:
                                      values?.attribute_value_code,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <code className="bg-gray-100 px-2 py-1 rounded text-[10px]">
                            {values?.attribute_value_code}
                          </code>
                        </div>
                      </td>

                      <td
                        className={`px-3 py-3 font-bold capitalize ${
                          values?.attribute_value_status === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {values?.attribute_value_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Click / Mobile Preview Modal */}
      {previewColor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewColor(null)}
        >
          <div
            className="w-40 h-40 rounded-2xl border-4 border-white shadow-2xl"
            style={{ backgroundColor: previewColor }}
          ></div>
        </div>
      )}
    </>
  );
};

export default ViewAttributeValue;
