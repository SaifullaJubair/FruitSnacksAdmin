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
  const [categoryId, setCategory_id] = useState("");

  const [attributeValues, setAttributeValues] = useState([
    { attribute_value_name: "", attribute_value_code: "" },
  ]);

  //handle Attribute value

  const handleAddAttributeValueField = () => {
    setAttributeValues([
      ...attributeValues,
      { attribute_value_name: "", attribute_value_code: "" },
    ]);
  };

  const handleRemoveAttributeValueField = () => {
    if (attributeValues.length > 1) {
      setAttributeValues(attributeValues.slice(0, -1));
    }
  };

  const handleAttributeValueChange = (index, event) => {
    const updatedAttribute = attributeValues?.map((value, i) =>
      i === index
        ? { ...value, [event.target.name]: event.target.value }
        : value
    );
    setAttributeValues(updatedAttribute);
  };
  //Attribute value handle End.....

  // Handle Add Attribute
  const handleDataPost = async (data) => {
    setLoading(true);
    try {
      const sendData = {
        attribute_publisher_id: user?._id,
        attribute_name: data?.attribute_name,
        attribute_slug: generateSlug(data?.attribute_name),
        attribute_status: data?.attribute_status,
        // category_id: categoryId,

        attribute_values: attributeValues?.map((item) => ({
          attribute_value_name: item?.attribute_value_name,
          attribute_value_code: item?.attribute_value_code,
          attribute_value_slug: generateSlug(item?.attribute_value_name),
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
        toast.success(
          result?.message ? result?.message : "Attribute created successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setAddAttributeModal(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mt-4">
              <h3
                className="text-[26px] font-bold text-gray-800 capitalize"
                id="modal-title"
              >
                Create Attribute
              </h3>
              <button
                type="button"
                className="btn bg-white hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3"
                onClick={() => setAddAttributeModal(false)}
              >
                {" "}
                <RxCross1 size={20}></RxCross1>
              </button>
            </div>

            <hr className="mt-2 mb-6" />

            <form onSubmit={handleSubmit(handleDataPost)} className="">
              <div>
                <label
                  htmlFor="UserEmail"
                  className="block text-xs font-medium text-gray-700"
                >
                  Attribute Names <span className="text-red-600">*</span>
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
                  <p className="text-red-600">
                    {errors.attribute_name?.message}
                  </p>
                )}
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
                  {errors.attribute_status && (
                    <p className="text-red-600">
                      {errors.attribute_status?.message}
                    </p>
                  )}
                </div>
                {/* <div className="my-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Category Name<span className="text-red-600">*</span>
                  </label>

                  <Select
                    id="category_id"
                    name="category_id"
                    required
                    aria-label="Category Type"
                    options={categoryTypes?.data}
                    getOptionLabel={(x) => x?.category_name}
                    getOptionValue={(x) => x?._id}
                    onChange={(selectedOption) =>
                      setCategory_id(selectedOption?._id)
                    }
                  ></Select>

                  {errors._id && (
                    <p className="text-red-600">{errors._id?.message}</p>
                  )}
                </div> */}
              </div>
              <div className="mt-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleAddAttributeValueField}
                    type="button"
                    className="border px-2 py-2 rounded mr-2 hover:bg-bgBtnActive hover:text-btnActiveColor "
                  >
                    <FaPlus size={18} />
                  </button>
                  <button
                    onClick={handleRemoveAttributeValueField}
                    type="button"
                    className="border px-2 py-2 rounded hover:bg-bgBtnInactive hover:text-bgDelete"
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                </div>

                <div className="">
                  <label
                    htmlFor=""
                    className="block text-xs font-medium text-gray-700 mb-2"
                  >
                    Attributes Values
                  </label>
                  {attributeValues.map((attribute, index) => (
                    <div
                      key={index}
                      className="py-1 flex gap-2 items-center justify-between"
                    >
                      <input
                        name="attribute_value_name"
                        required
                        type="text"
                        value={attribute?.attribute_value_name}
                        onChange={(e) => handleAttributeValueChange(index, e)}
                        placeholder="Attribute Value Name"
                        className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                      />
                      <div className="flex gap-2 w-full">
                        <input
                          name="attribute_value_code"
                          type="text"
                          value={attribute?.attribute_value_code}
                          onChange={(e) => handleAttributeValueChange(index, e)}
                          placeholder="Hex Color Code"
                          className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" // Validate hex color code
                          title="Please enter a valid hex color code (e.g., #FFFFFF or #FFF)"
                        />
                        {/* Color picker input */}
                        <input
                          type="color"
                          title="Select a color"
                          value={attribute?.attribute_value_code || "#ffffff"} // Default to white if no color is set
                          onChange={(e) => {
                            // Update the attribute_value_code with the selected color
                            const updatedAttributeValues = [...attributeValues];
                            updatedAttributeValues[index].attribute_value_code =
                              e.target.value;
                            setAttributeValues(updatedAttributeValues);
                          }}
                          className="w-12 h-10 rounded-md border-gray-200 shadow-sm cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 mt-6 justify-end">
                <button
                  className="px-10 py-2 border rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor"
                  onClick={() => setAddAttributeModal(false)}
                >
                  Cancel
                </button>
                {loading == true ? (
                  <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                    type="submit"
                  >
                    Create
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAttribute;
