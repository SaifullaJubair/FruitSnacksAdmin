import { useForm } from "react-hook-form";
import { generateSlug } from "../../utils/generateSlug";
import { RxCross1 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useState } from "react";
import Select from "react-select";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";

const AddAttribute = ({
  setAddAttributeModal,
  categoryTypes,
  refetch,
  user,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  // ✅ unique id added (VERY important)
  const [attributeValues, setAttributeValues] = useState([
    {
      id: crypto.randomUUID(),
      attribute_value_name: "",
      attribute_value_code: "",
    },
  ]);

  // ADD FIELD
  const handleAddAttributeValueField = () => {
    setAttributeValues((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        attribute_value_name: "",
        attribute_value_code: "",
      },
    ]);
  };

  // DELETE SPECIFIC FIELD
  const handleRemoveAttributeValueField = (id) => {
    if (attributeValues.length === 1) return;

    setAttributeValues((prev) => prev.filter((item) => item.id !== id));
  };

  // HANDLE CHANGE
  const handleAttributeValueChange = (id, event) => {
    const { name, value } = event.target;

    setAttributeValues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
    );
  };

  // SUBMIT
  const handleDataPost = async (data) => {
    setLoading(true);
    try {
      const sendData = {
        attribute_publisher_id: user?._id,
        attribute_name: data?.attribute_name,
        attribute_slug: generateSlug(data?.attribute_name),
        attribute_status: data?.attribute_status,

        attribute_values: attributeValues.map((item) => ({
          attribute_value_name: item.attribute_value_name,
          attribute_value_code: item.attribute_value_code,
          attribute_value_slug: generateSlug(item.attribute_value_name),
        })),
      };

      const response = await fetch(`${BASE_URL}/attribute`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });

      const result = await response.json();

      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(result?.message || "Attribute created successfully", {
          autoClose: 1000,
        });

        refetch();
        setAddAttributeModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin">
        {/* HEADER */}
        <div className="flex items-center justify-between mt-2">
          <h3 className="text-[26px] font-bold text-gray-800">
            Create Attribute
          </h3>

          <button
            type="button"
            className="p-1 rounded-full hover:bg-gray-100 absolute right-3 top-3"
            onClick={() => setAddAttributeModal(false)}
          >
            <RxCross1 size={20} />
          </button>
        </div>

        <hr className="mt-2 mb-6" />

        <form onSubmit={handleSubmit(handleDataPost)}>
          {/* ATTRIBUTE NAME */}
          <label className="block text-xs font-medium text-gray-700">
            Attribute Name <span className="text-red-600">*</span>
          </label>

          <input
            {...register("attribute_name", {
              required: "Attribute name is required",
            })}
            type="text"
            placeholder="Attribute Name"
            className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
          />

          {errors.attribute_name && (
            <p className="text-red-600">{errors.attribute_name.message}</p>
          )}

          {/* STATUS */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">
              Attribute Status <span className="text-red-600">*</span>
            </label>

            <select
              {...register("attribute_status", {
                required: "Attribute Status is required",
              })}
              className="mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full"
            >
              <option value="active">Active</option>
              <option value="in-active">In-Active</option>
            </select>
          </div>

          {/* ADD BUTTON */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAddAttributeValueField}
              type="button"
              className="border px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
            >
              <FaPlus size={14} />
              Add Value
            </button>
          </div>

          {/* ATTRIBUTE VALUES */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Attributes Values
            </label>

            {attributeValues.map((attribute) => (
              <div key={attribute.id} className="py-2 flex gap-2 items-center">
                {/* NAME */}
                <input
                  name="attribute_value_name"
                  required
                  type="text"
                  value={attribute.attribute_value_name}
                  onChange={(e) => handleAttributeValueChange(attribute.id, e)}
                  placeholder="Attribute Value Name"
                  className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />

                {/* HEX + COLOR */}
                <div className="flex gap-2 w-full">
                  <input
                    name="attribute_value_code"
                    type="text"
                    value={attribute.attribute_value_code}
                    onChange={(e) =>
                      handleAttributeValueChange(attribute.id, e)
                    }
                    placeholder="Hex Color Code"
                    className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    title="Enter valid hex color (e.g. #FFFFFF)"
                  />

                  <input
                    type="color"
                    value={attribute.attribute_value_code || "#ffffff"}
                    onChange={(e) =>
                      handleAttributeValueChange(attribute.id, {
                        target: {
                          name: "attribute_value_code",
                          value: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 cursor-pointer border rounded"
                  />
                </div>

                {/* DELETE BUTTON */}
                <button
                  type="button"
                  onClick={() => handleRemoveAttributeValueField(attribute.id)}
                  disabled={attributeValues.length === 1}
                  className="p-2 rounded border hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RiDeleteBin6Line size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-6 mt-6 justify-end">
            <button
              type="button"
              className="px-10 py-2 border rounded hover:bg-gray-100"
              onClick={() => setAddAttributeModal(false)}
            >
              Cancel
            </button>

            {loading ? (
              <div className="px-10 py-2 flex items-center justify-center bg-primaryColor text-white rounded">
                <MiniSpinner />
              </div>
            ) : (
              <button
                className="px-10 py-2 bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                type="submit"
              >
                Create
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttribute;
