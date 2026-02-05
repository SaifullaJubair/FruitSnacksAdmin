import { useForm } from "react-hook-form";
import { generateSlug } from "../../utils/generateSlug";
import { RxCross1 } from "react-icons/rx";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";

const UpdateAttribute = ({
  setOpenAttributeUpdateModal,
  attributeUpdateValue,
  refetch,
  user,
}) => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  // SINGLE STATE FOR OLD + NEW VALUES
  const [attributeValues, setAttributeValues] = useState(
    attributeUpdateValue?.attribute_values?.map((item) => ({
      id: item._id || crypto.randomUUID(),
      _id: item._id, // backend id
      attribute_value_name: item.attribute_value_name || "",
      attribute_value_code: item.attribute_value_code || "",
      attribute_value_status: item.attribute_value_status || "active",
    })) || [],
  );

  // ADD NEW VALUE
  const handleAddField = () => {
    setAttributeValues((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        attribute_value_name: "",
        attribute_value_code: "",
        attribute_value_status: "active",
      },
    ]);
  };

  // DELETE VALUE
  const handleDeleteField = (id) => {
    if (attributeValues.length === 1) return;
    setAttributeValues((prev) => prev.filter((item) => item.id !== id));
  };

  // EDIT VALUE
  const handleChange = (id, name, value) => {
    setAttributeValues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
    );
  };

  // TOGGLE ACTIVE / INACTIVE
  const handleToggleStatus = (id) => {
    setAttributeValues((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              attribute_value_status:
                item.attribute_value_status === "active"
                  ? "in-active"
                  : "active",
            }
          : item,
      ),
    );
  };

  // SUBMIT
  const handleDataPost = async (data) => {
    setLoading(true);

    try {
      const sendData = {
        _id: attributeUpdateValue?._id,
        attribute_updated_by: user?._id,

        attribute_name:
          data?.attribute_name || attributeUpdateValue?.attribute_name,

        attribute_slug: generateSlug(
          data?.attribute_name || attributeUpdateValue?.attribute_name,
        ),

        attribute_status:
          data?.attribute_status || attributeUpdateValue?.attribute_status,

        attribute_values: attributeValues
          .filter((item) => item.attribute_value_name.trim() !== "")
          .map((item) => ({
            _id: item._id,
            attribute_value_name: item.attribute_value_name,
            attribute_value_code: item.attribute_value_code,
            attribute_value_slug: generateSlug(item.attribute_value_name),
            attribute_value_status: item.attribute_value_status,
          })),
      };

      const response = await fetch(`${BASE_URL}/attribute`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });

      const result = await response.json();

      if (result?.success) {
        toast.success(result?.message || "Updated successfully");
        refetch();
        setOpenAttributeUpdateModal(false);
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[550px] lg:w-[660px] rounded-lg shadow-xl p-6 max-h-[95vh] overflow-y-auto relative">
        {/* HEADER */}
        <h3 className="text-2xl font-bold mb-4">Update Attribute</h3>
        <button
          className="absolute right-3 top-3"
          onClick={() => setOpenAttributeUpdateModal(false)}
        >
          <RxCross1 size={20} />
        </button>

        <form onSubmit={handleSubmit(handleDataPost)}>
          {/* NAME */}
          <label className="text-xs font-medium">Attribute Name</label>
          <input
            {...register("attribute_name")}
            defaultValue={attributeUpdateValue?.attribute_name}
            className="w-full border-2 p-2 rounded mt-1"
          />

          {/* STATUS */}
          <label className="text-xs font-medium mt-3 block">
            Attribute Status
          </label>
          <select
            {...register("attribute_status")}
            defaultValue={attributeUpdateValue?.attribute_status}
            className="w-full border-2 p-2 rounded mt-1"
          >
            <option value="active">Active</option>
            <option value="in-active">In-Active</option>
          </select>

          {/* VALUES */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleAddField}
              className="flex items-center gap-2 border px-3 py-2 rounded hover:bg-blue-50"
            >
              <FaPlus size={14} /> Add Value
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {attributeValues.map((item) => (
              <div key={item.id} className="flex gap-2 items-center">
                {/* NAME */}
                <input
                  value={item.attribute_value_name}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "attribute_value_name",
                      e.target.value,
                    )
                  }
                  placeholder="Value Name"
                  className="w-full border-2 p-2 rounded"
                />

                {/* HEX input */}
                <input
                  value={item.attribute_value_code}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "attribute_value_code",
                      e.target.value,
                    )
                  }
                  className="w-full border-2 p-2 rounded"
                  placeholder="Hex Value (#123456)"
                />

                {/* COLOR PICKER */}
                <input
                  type="color"
                  value={item.attribute_value_code || "#ffffff"}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "attribute_value_code",
                      e.target.value,
                    )
                  }
                  className="w-40 h-10 cursor-pointer"
                />

                {/* TOGGLE STATUS */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-2 w-52 text-nowrap text-sm py-1 capitalize rounded font-semibold ${
                    item.attribute_value_status === "active"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {item.attribute_value_status}
                </button>

                {/* DELETE */}
                <button
                  type="button"
                  onClick={() => handleDeleteField(item.id)}
                  disabled={attributeValues.length === 1}
                  className="p-2 border rounded hover:bg-red-50 disabled:opacity-40"
                >
                  <RiDeleteBin6Line />
                </button>
              </div>
            ))}
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setOpenAttributeUpdateModal(false)}
              className="border px-6 py-2 rounded"
            >
              Cancel
            </button>

            {loading ? (
              <MiniSpinner />
            ) : (
              <button className="bg-primaryColor text-white px-6 py-2 rounded">
                Update
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAttribute;
