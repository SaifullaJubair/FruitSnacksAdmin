import { useForm } from "react-hook-form";
import { generateSlug } from "./../../utils/generateSlug";
import { RxCross1 } from "react-icons/rx";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import Select from "react-select";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";

const UpdateAttribute = ({
  setOpenAttributeUpdateModal,
  attributeUpdateValue,
  categoryTypes,
  refetch,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategory_id] = useState(
    attributeUpdateValue?.category_id?._id
  );

  //get Default Value of Attributes Values State
  const [defaultValues, setDefaultValues] = useState(
    attributeUpdateValue?.attribute_values
  );
  const { register, handleSubmit } = useForm();

  //AttributeValue State
  const [attributeValues, setAttributeValues] = useState([
    { attribute_value_name: "", attribute_value_code: "" },
  ]);

  //Attributes value handle Start....
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
    const updatedLinks = attributeValues.map((value, i) =>
      i === index
        ? { ...value, [event.target.name]: event.target.value }
        : value
    );
    setAttributeValues(updatedLinks);
  };
  //Attributes value handle End....

  //handle Attribute Values Status State change
  const handleAttributeActiveStatus = (id) => {
    const updatedItems = defaultValues.map((item) =>
      item._id === id
        ? {
            ...item,
            attribute_value_status:
              item?.attribute_value_status === "in-active"
                ? "active"
                : "in-active",
          }
        : item
    );
    setDefaultValues(updatedItems);
  };
  const handleAttributeInActiveStatus = (id) => {
    const updatedItems = defaultValues.map((item) =>
      item._id === id
        ? {
            ...item,
            attribute_value_status:
              item?.attribute_value_status === "active"
                ? "in-active"
                : "active",
          }
        : item
    );
    setDefaultValues(updatedItems);
  };

  // Handle Update Attribute
  const handleDataPost = async (data) => {
    setLoading(true);
    const cleanedAttributeValues = attributeValues.filter(
      (item) => item.attribute_value_name.trim() !== ""
    );

    const cleanedData = {
      ...data,
      attribute_values: cleanedAttributeValues,
    };

    if (!cleanedData.attribute_value_name?.trim()) {
      delete cleanedData.attribute_value_name;
    }

    const combinedArray = defaultValues.concat(cleanedData?.attribute_values);

    const sendData = {
      _id: attributeUpdateValue?._id,
      attribute_updated_by: user?._id,
      attribute_slug: generateSlug(
        cleanedData?.attribute_name
          ? cleanedData?.attribute_name
          : attributeUpdateValue?.attribute_name
      ),
      attribute_name: cleanedData?.attribute_name
        ? cleanedData?.attribute_name
        : attributeUpdateValue?.attribute_name,

      attribute_status: cleanedData?.attribute_status
        ? cleanedData?.attribute_status
        : attributeUpdateValue?.attribute_status,
      // category_id: categoryId,

      attribute_values: combinedArray?.map((item) => ({
        _id: item?._id,
        attribute_value_name: item?.attribute_value_name,
        attribute_value_code: item?.attribute_value_code,
        attribute_value_slug: generateSlug(item?.attribute_value_name),
        attribute_value_status: item?.attribute_value_status,
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
    if (result?.statusCode === 200 && result?.success === true) {
      toast.success(
        result?.message ? result?.message : "Attribute update successfully",
        {
          autoClose: 1000,
        }
      );
      refetch();
      setLoading(false);
      setOpenAttributeUpdateModal(false);
    } else {
      toast.error(result?.message || "Something went wrong", {
        autoClose: 1000,
      });
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
                Update Attribute
              </h3>
              <button
                type="button"
                className="btn bg-white hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3"
                onClick={() => setOpenAttributeUpdateModal(false)}
              >
                {" "}
                <RxCross1 size={20}></RxCross1>
              </button>
            </div>

            <hr className="mt-2 mb-6" />

            <form onSubmit={handleSubmit(handleDataPost)} className="">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Attribute Names
                </label>

                <input
                  {...register("attribute_name")}
                  defaultValue={attributeUpdateValue?.attribute_name}
                  type="text"
                  placeholder="Attribute Name"
                  className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700">
                  Attribute Status
                </label>
                <select
                  {...register("attribute_status")}
                  defaultValue={attributeUpdateValue?.attribute_status}
                  className="mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full"
                >
                  <option value="active">Active</option>
                  <option value="in-active">In-Active</option>
                </select>
              </div>
              {/* <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category Name
                </label>

                <Select
                  id="category_id"
                  name="category_id"
                  defaultValue={{
                    _id: attributeUpdateValue?.category_id?._id,
                    category_name:
                      attributeUpdateValue?.category_id?.category_name,
                  }}
                  aria-label="Category Type"
                  options={categoryTypes?.data}
                  getOptionLabel={(x) => x?.category_name}
                  getOptionValue={(x) => x?._id}
                  onChange={(selectedOption) =>
                    setCategory_id(selectedOption?._id)
                  }
                ></Select>
              </div> */}
              <div className="mt-3">
                {attributeUpdateValue?.attribute_values && (
                  <>
                    <p className="ml-1 font-semibold py-1 text-gray-700">
                      Attribute Values:
                    </p>
                    <table className="min-w-full divide-y-2 divide-gray-200 text-sm border border-gray-300 mt-4 rounded-xl">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                            Attribute Value Name
                          </th>
                          <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                            Attribute Value Code
                          </th>

                          {/* <th className="px-4 py-2 text-center font-medium text-gray-900 whitespace-nowrap">
                            Attribute Value Status
                          </th> */}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {defaultValues?.map((value) => (
                          <tr key={value?._id}>
                            <td className="whitespace-nowrap  px-4 py-2 font-semibold text-justify">
                              {value?.attribute_value_name}
                            </td>
                            <td className="whitespace-nowrap  px-4 py-2 font-semibold text-justify">
                              {value?.attribute_value_code}
                            </td>

                            {/* <td className="whitespace-nowrap px-4 py-2 space-x-1 flex items-center justify-center gap-4 ">
                              {value?.attribute_value_status === "active" ? (
                                <button
                                  type="button"
                                  className="bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]"
                                  onClick={() =>
                                    handleAttributeActiveStatus(value?._id)
                                  }
                                >
                                  <span>Active</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="bg-bgBtnInactive text-btnInactiveColor px-[10px] py-[4px] rounded-[8px]"
                                  onClick={() =>
                                    handleAttributeInActiveStatus(value?._id)
                                  }
                                >
                                  <span>In-Active</span>
                                </button>
                              )}
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
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

                <div className="mt-2">
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
                        type="text"
                        value={attribute?.attribute_value_name}
                        onChange={(e) => handleAttributeValueChange(index, e)}
                        placeholder="Attribute Values"
                        className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                      />
                      {/* Input for attribute value code (hex color) */}
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
                  type="button"
                  onClick={() => setOpenAttributeUpdateModal(false)}
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
                    Update
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

export default UpdateAttribute;
