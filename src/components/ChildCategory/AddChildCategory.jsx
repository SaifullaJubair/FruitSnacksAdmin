import { useForm } from "react-hook-form";
import { RxCross1 } from "react-icons/rx";
import { generateSlug } from "../../utils/generateSlug";
import { useEffect, useState } from "react";
import Select from "react-select";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const AddChildCategory = ({
  setChildCategoryCreateModal,
  categoryTypes,
  subCategoryTypes,
  categoryLoading,
  subCategoryLoading,
  refetch,
  user,
}) => {
  // get category id from select option
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategory_id] = useState("");
  const [sub_category_id, setSubCategory_id] = useState("");
  const [filteredSubCategory, setFilteredSubCategory] = useState([]);
  const [categoryChange, setCategoryChange] = useState(false);
  const [subCategoryOpen, setSubCategoryOpen] = useState(true);

  useEffect(() => {
    const result = subCategoryTypes.data?.filter(
      (item) => item?.category_id?._id === categoryId
    );
    setFilteredSubCategory(result);
  }, [subCategoryTypes, categoryId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle Add Category
  const handleDataPost = async (data) => {
    setLoading(true);
    try {
      const sendData = {
        child_category_slug: generateSlug(data?.child_category_name),
        sub_category_id: sub_category_id,
        category_id: categoryId,
        child_category_serial: data?.child_category_serial,
        child_category_name: data?.child_category_name,
        child_category_status: data?.child_category_status,
        child_category_publisher_id: user?._id,
      };

      const response = await fetch(
        `${BASE_URL}/child_category`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendData),
        }
      );
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : "Child Category created successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
        setLoading(false);
        setChildCategoryCreateModal(false);
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
                Create Child Category
              </h3>
              <button
                type="button"
                className="btn bg-white hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3"
                onClick={() => setChildCategoryCreateModal(false)}
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
                  Child Category Name <span className="text-red-700">*</span>
                </label>

                <input
                  {...register("child_category_name", {
                    required: "Child category name is required",
                  })}
                  type="text"
                  placeholder="Child Category Name"
                  className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />
                {errors.child_category_name && (
                  <p className="text-red-600">
                    {errors.child_category_name?.message}
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Child Category Status<span className="text-red-700">*</span>
                  </label>
                  <select
                    {...register("child_category_status", {
                      required: "Child Category Status is required",
                    })}
                    className="mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full"
                  >
                    <option value="active">Active</option>
                    <option value="in-active">In-Active</option>
                  </select>

                  {errors.child_category_status && (
                    <p className="text-red-600">
                      {errors.child_category_status?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Child Category serial{" "}
                    <span className="text-red-700">*</span>
                  </label>

                  <input
                    {...register("child_category_serial", {
                      required: "Child category Serial is required",
                      validate: (value) => {
                        if (value < 1) {
                          return "serial must be greater than 0";
                        }
                      },
                    })}
                    type="Number"
                    placeholder="Child Category Serial"
                    className="mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                  />
                  {errors.child_category_serial && (
                    <p className="text-red-600">
                      {errors.child_category_serial?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Category Name<span className="text-red-700">*</span>
                  </label>
                  {!categoryLoading && (
                    <Select
                      id="category_id"
                      name="category_id"
                      required
                      aria-label="Category Type"
                      options={categoryTypes?.data}
                      getOptionLabel={(x) => x?.category_name}
                      getOptionValue={(x) => x?._id}
                      onChange={(selectedOption) => {
                        setCategory_id(selectedOption?._id);
                        setSubCategoryOpen(false);
                        setCategoryChange(true);
                        setTimeout(() => {
                          setSubCategoryOpen(true);
                        }, 100);
                      }}
                    ></Select>
                  )}
                  {errors._id && (
                    <p className="text-red-600">{errors._id?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Sub Category Name<span className="text-red-700">*</span>
                  </label>
                  {!subCategoryLoading &&
                    subCategoryOpen &&
                    (categoryChange === true ? (
                      <Select
                        id="sub_category_id"
                        name="sub_category_id"
                        required
                        aria-label="Sub Category Type"
                        options={filteredSubCategory}
                        getOptionLabel={(x) => x?.sub_category_name}
                        getOptionValue={(x) => x?._id}
                        onChange={(selectedOption) =>
                          setSubCategory_id(selectedOption?._id)
                        }
                      ></Select>
                    ) : (
                      <Select
                        id="sub_category_id"
                        name="sub_category_id"
                        required
                        aria-label="Sub Category Type"
                        options={filteredSubCategory}
                        //getOptionLabel={(x) => x?.sub_category_name}
                        getOptionValue={(x) => x?._id}
                        onChange={(selectedOption) =>
                          setSubCategory_id(selectedOption?._id)
                        }
                      ></Select>
                    ))}
                  {errors._id && (
                    <p className="text-red-600">{errors._id?.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mt-6 justify-end">
                <button
                  className="px-10 py-2 border hover:bg-bgBtnInactive hover:text-btnInactiveColor rounded "
                  onClick={() => setChildCategoryCreateModal(false)}
                >
                  Cancel
                </button>
                {loading == true ? (
                  <div className="px-10 py-2 flex items-center justify-center bg-primaryColor text-white rounded">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded"
                    type="Submit"
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

export default AddChildCategory;
