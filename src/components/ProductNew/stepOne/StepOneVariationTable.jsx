import { useEffect, useState } from "react";

const StepOneVariationTable = ({ data, inputValueData, setFormData }) => {

  const getCombinations = (arrays) => {
    if (arrays.length === 0) return [[]];
    const first = arrays[0];
    const rest = getCombinations(arrays.slice(1));
    return first.flatMap((item) => rest.map((combo) => [item, ...combo]));
  };

  const attributes = data?.map((attr) => attr?.attribute_values);
  const combinations = getCombinations(attributes);

  const [prevSelectedAttributes, setPrevSelectedAttributes] = useState([]);

  useEffect(() => {
    if (
      combinations &&
      JSON.stringify(prevSelectedAttributes) !== JSON.stringify(data)
    ) {
      const initialData = combinations?.map((combo) => ({
        variation_name: combo?.map(item => item?.attribute_value_name).join("-"),
        variation_price: 1,
        variation_discount_price: 0,
        variation_buying_price: 0,
        variation_quantity:1,
        variation_alert_quantity: 0,
        variation_barcode: '',
        variation_image: null,
        variation_video: null,
        variation_sku: combo
          .map((item) => item?.attribute_value_name?.toLowerCase())
          .join("-"),
      }));
      setFormData(initialData);
      setPrevSelectedAttributes(data);
    }
  }, [combinations, data, prevSelectedAttributes]);

  // State for bulk inputs including the image
  const [bulkInput, setBulkInput] = useState({
    variation_price: 1,
    variation_discount_price: 0,
    variation_buying_price: 0,
    variation_quantity: 1,
    variation_alert_quantity: 0,
    variation_image: null,
    variation_video: null,
  });

  // Handle bulk input changes
  const handleBulkInputChange = (field, value) => {
    setBulkInput({ ...bulkInput, [field]: value });
  };

  // Handle bulk image upload
  const handleBulkImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBulkInputChange("variation_image", file);
    }
  };

  // Handle bulk Video upload
  const handleBulkVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBulkInputChange("variation_video", file);
    }
  };

  // Handle bulk form submission
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = inputValueData?.map((row) => ({
      ...row,
      variation_price: bulkInput?.variation_price || row?.variation_price,
      variation_discount_price:
        bulkInput?.variation_discount_price || row?.variation_discount_price,
      variation_buying_price:
        bulkInput?.variation_buying_price || row?.variation_buying_price,
      variation_quantity:
        bulkInput?.variation_quantity || row?.variation_quantity,
      variation_alert_quantity:
        bulkInput?.variation_alert_quantity || row?.variation_alert_quantity,
      variation_image: bulkInput?.variation_image || row?.variation_image, // Apply the image
      variation_video: bulkInput?.variation_video || row?.variation_video, // Apply the image
    }));
    setFormData(updatedFormData);
  };

  // Handle individual row input changes
  const handleChange = (index, field, value) => {
    const updatedFormData = [...inputValueData];
    updatedFormData[index][field] = value;
    setFormData(updatedFormData);
  };

  return (
    <>
      {/* Bulk input form */}
      <div style={{ marginBottom: "20px" }}>
        <h3 className="font-semibold my-2">Bulk Update:</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Price:</label>
            <input
              type="number"
              placeholder="Variant price"
              className="p-2 border rounded-md outline-primaryColor w-full"
              value={bulkInput?.variation_price}
              min={1}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 1 || value === "") {
                  handleBulkInputChange("variation_price", value);
                }
              }}
            />
          </div>

          <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Discount Price:</label>
            <input
              type="number"
              placeholder="Variant Discount price"
              className="p-2 border rounded-md outline-primaryColor w-full"
              value={bulkInput?.variation_discount_price}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0 || value === "") {
                  handleBulkInputChange("variation_discount_price", value);
                }
              }}
            />
          </div>

          <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Buying Price:</label>
            <input
              type="number"
              placeholder="Variant Buying price"
              className="p-2 border rounded-md outline-primaryColor w-full"
              value={bulkInput?.variation_buying_price}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0 || value === "") {
                  handleBulkInputChange("variation_buying_price", value);
                }
              }}
            />
          </div>

          <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Variant Quantity:</label>
            <input
              type="number"
              placeholder="Variant Quantity"
              className="p-2 border rounded-md outline-primaryColor w-full"
              value={bulkInput?.variation_quantity}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0 || value === "") {
                  handleBulkInputChange("variation_quantity", value);
                }
              }}
            />
          </div>

          {/* <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">
              Variant Alert Quantity:
            </label>
            <input
              type="number"
              placeholder="Variant Alert Quantity"
              className="p-2 border rounded-md outline-primaryColor w-full"
              value={bulkInput?.variation_alert_quantity}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0 || value === "") {
                  handleBulkInputChange("variation_alert_quantity", value);
                }
              }}
            />
          </div> */}
          {/* Add image input for bulk upload */}
          {/* <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Image:</label>
            <input
              type="file"
              accept="image/*,.gif"
              className="p-2 border rounded-md outline-primaryColor w-full"
              onChange={handleBulkImageUpload}
            />
          </div> */}
          {/* <div className="my-2 flex items-center">
            <label className="w-full text-right pr-4">Video:</label>
            <input
              type="file"
              accept="video/*"
              className="p-2 border rounded-md outline-primaryColor w-full"
              onChange={handleBulkVideoUpload}
            />
          </div> */}
          <button
            type="button"
            className="btn py-3 px-3 my-4 bg-primaryColor text-white font-semibold hover:bg-gray-300 hover:text-gray-700 rounded-md"
            onClick={handleBulkSubmit}
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Variation table */}
      <div className="rounded-lg border border-gray-200 mt-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-hide ">
          <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="bg-[#fff9ee]">
              <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
                <td className="whitespace-nowrap px-4 py-5">#SL No</td>
                <td className="whitespace-nowrap px-4 py-5">Variant</td>
                <td className="whitespace-nowrap px-4 py-5">Variant Price</td>
                <td className="whitespace-nowrap px-4 py-5">Discount Price</td>
                <td className="whitespace-nowrap px-4 py-5">Buying Price</td>
                <td className="whitespace-nowrap px-4 py-5">
                  Variant Quantity
                </td>
                {/* <td className="whitespace-nowrap px-4 py-5">
                  Variant Alert Quantity
                </td> */}
                {/* <td className="whitespace-nowrap px-4 py-5">Variant SKU</td> */}
                <td className="whitespace-nowrap px-4 py-5">Image</td>
                <td className="whitespace-nowrap px-4 py-5">Video</td>
              </tr>
            </thead>
            <tbody>
              {combinations?.map((combo, idx) => (
                <tr
                  key={idx}
                  className={`divide-x divide-gray-200 ${
                    idx % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                  }`}
                >
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 text-center">
                    {idx + 1}
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 text-center">
                    {combo.map((item) => item?.attribute_value_name).join("-")}
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      placeholder="Variant price"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_price}
                      min={1}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 1 || value === "") {
                          handleChange(idx, "variation_price", value);
                        }
                      }}
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      placeholder="Variant Discount price"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_discount_price}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 || value === "") {
                          handleChange(idx, "variation_discount_price", value);
                        }
                      }}
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      placeholder="Variant Buyian price"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_buying_price}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 || value === "") {
                          handleChange(idx, "variation_buying_price", value);
                        }
                      }}
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      placeholder="Variant Quantity"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_quantity}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 || value === "") {
                          handleChange(idx, "variation_quantity", value);
                        }
                      }}
                    />
                  </td>
                  {/* <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      placeholder="Variant Alert Quantity"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_alert_quantity}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 || value === "") {
                          handleChange(idx, "variation_alert_quantity", value);
                        }
                      }}
                    />
                  </td> */}

                  {/* <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="text"
                      placeholder="Variant Sku"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={inputValueData[idx]?.variation_sku}
                      onChange={(e) => {
                        const value = e.target.value;
                          handleChange(idx, "variation_sku", value);
                      }}
                    />
                  </td> */}
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden" // Hide the file input
                      id={`file-input-${idx}`} // Unique ID for accessibility
                      onChange={(e) =>
                        handleChange(idx, "variation_image", e.target.files[0])
                      }
                    />
                    <label
                      htmlFor={`file-input-${idx}`} // Associate label with the input
                      className="p-2 border rounded-md cursor-pointer"
                    >
                      {inputValueData[idx]?.variation_image
                        ? inputValueData[idx].variation_image.name // Display the file name
                        : "No file chosen"}
                    </label>
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden" // Hide the file input
                      id={`file-video-${idx}`} // Unique ID for accessibility
                      onChange={(e) =>
                        handleChange(idx, "variation_video", e.target.files[0])
                      }
                    />
                    <label
                      htmlFor={`file-video-${idx}`} // Associate label with the input
                      className="p-2 border rounded-md cursor-pointer"
                    >
                      {inputValueData[idx]?.variation_video
                        ? inputValueData[idx].variation_video.name // Display the file name
                        : "No file chosen"}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StepOneVariationTable;
