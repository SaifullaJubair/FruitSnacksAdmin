import { MdDeleteForever } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { useEffect, useState } from "react";
import UpDateCategory from "./UpDateCategory";
import Swal from "sweetalert2-optimized";
import Pagination from "../common/pagination/Pagination";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import NoDataFound from "../../shared/NoDataFound/NoDataFound";

import TableLoadingSkeleton from "../common/loadingSkeleton/TableLoadingSkeleton";

const CategoryTable = ({
  categoryTypes,
  setPage,
  setLimit,
  page,
  limit,
  totalData,
  refetch,
  user,
  //setSearchTerm,
  isLoading,
}) => {
  const [serialNumber, setSerialNumber] = useState();

  //Update Handle contoler
  const [categoryUpdateModal, setCategoryUpdateModal] = useState(false);
  const [categoryUpdateData, setCategoryUpdateData] = useState({});

  const handleCategoryUpdateModal = (category) => {
    setCategoryUpdateData(category);
    setCategoryUpdateModal(true);
  };

  useEffect(() => {
    const newSerialNumber = (page - 1) * limit;
    setSerialNumber(newSerialNumber);
  }, [page, limit]);

  // Handle Delete Category Table Row function
  const handleDeleteCategoryTableRow = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this ${category?.category_name} category!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sendData = {
          _id: category?._id,
          category_logo_key: category?.category_logo_key,
        };
        try {
          const response = await fetch(
            `
            ${BASE_URL}/category`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(sendData),
            }
          );
          const result = await response.json();
          // console.log(result);
          if (result?.statusCode === 200 && result?.success === true) {
            refetch();
            Swal.fire({
              title: "Deleted!",
              text: `${category?.category_name} category has been deleted!`,
              icon: "success",
            });
          } else {
            toast.error(result?.message, {
              autoClose: 1000,
            });
          }
        } catch (error) {
          toast.error("Network error or server is down", {
            autoClose: 1000,
          });
          console.error(error);
        }
      }
    });
  };

  // update feature category show
  const handleFeatureToggle = async (id, feature_category_show) => {
    try {
      const data = {
        _id: id,
        feature_category_show,
      };
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : "Feature Category show successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
    } finally {
      ("");
    }
  };

  // update explore category status
  const handleExploreToggle = async (id, explore_category_show) => {
    try {
      const data = {
        _id: id,
        explore_category_show,
      };
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : "Feature Category show successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
    } finally {
      ("");
    }
  };

  //Update Category Status..
  const handleCategoryActiveStatus = async (id, category_status) => {
    try {
      const data = {
        _id: id,
        category_status,
      };
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category status successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
    } finally {
      ("");
    }
  };
  const handleCategoryInActiveStatus = async (id, category_status) => {
    try {
      const data = {
        _id: id,
        category_status,
      };
      const response = await fetch(`${BASE_URL}/category`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Category status successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
    } finally {
      ("");
    }
  };

  return (
    <>
      {isLoading ? (
        <TableLoadingSkeleton />
      ) : (
        <div>
          {categoryTypes?.data?.length > 0 ? (
            <div className="rounded-lg border border-gray-200 mt-6">
              <div className="overflow-x-auto rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right bg-[#fff9ee]">
                    <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                      <td className="whitespace-nowrap p-4 ">SL No</td>
                      <td className="whitespace-nowrap p-4 ">Category Name</td>
                      <td className="whitespace-nowrap p-4 ">
                        Category Serial No
                      </td>
                      <td className="whitespace-nowrap p-4 ">Category Logo</td>
                      <td className="whitespace-nowrap p-4 ">Category Video</td>
                      <td className="whitespace-nowrap p-4 ">
                        Explore Category Show
                      </td>
                      <td className="whitespace-nowrap p-4 ">
                        Feature Category Show
                      </td>
                      <td className="whitespace-nowrap p-4 ">Status</td>
                      <td className="whitespace-nowrap p-4 ">Action</td>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center">
                    {categoryTypes?.data?.map((category, i) => (
                      <tr
                        key={category?._id}
                        className={`divide-x divide-gray-200 ${
                          i % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                        }`}
                      >
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                          {serialNumber + i + 1}
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                          {category?.category_name}
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                          {category?.category_serial}
                        </td>
                        <td className="whitespace-nowrap py-1.5 text-gray-700 flex justify-center">
                          <img
                            className="w-16 h-16 rounded-md object-cover"
                            src={category?.category_logo}
                            alt=""
                          />
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                          {category?.category_video ? (
                            <div className="flex justify-center items-center">
                              <video
                                className="w-16 h-16 rounded-md object-cover"
                                src={category?.category_video}
                                muted
                                loop
                                autoPlay
                                controls
                              ></video>
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="whitespace-nowrap py-1.5 text-gray-700">
                          <label
                            htmlFor={category?._id}
                            className="inline-flex items-center  cursor-pointer dark:text-gray-800"
                          >
                            <span className="relative">
                              <input
                                id={category?._id}
                                type="checkbox"
                                className="hidden peer"
                                checked={category?.explore_category_show} // Control the toggle state
                                onChange={() =>
                                  handleExploreToggle(
                                    category?._id,
                                    category?.explore_category_show
                                      ? false
                                      : true
                                  )
                                } // Handle toggle
                              />
                              <div className="w-10 h-4 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive"></div>
                              <div className="absolute left-0 w-6 h-6 rounded-full bg-white ring-[1px] shadow-lg  ring-gray-300 -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor "></div>
                            </span>
                          </label>
                        </td>
                        <td className="whitespace-nowrap py-1.5  text-gray-700">
                          <label
                            htmlFor={i}
                            className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"
                          >
                            <span className="relative">
                              <input
                                id={i}
                                type="checkbox"
                                className="hidden peer"
                                checked={category?.feature_category_show} // Control the toggle state
                                onChange={() =>
                                  handleFeatureToggle(
                                    category?._id,
                                    category?.feature_category_show
                                      ? false
                                      : true
                                  )
                                } // Handle toggle
                              />
                              <div className="w-10 h-4 rounded-full shadow bg-slate-300  peer-checked:bg-bgBtnActive"></div>
                              <div className="absolute left-0 w-6 h-6 rounded-full -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white ring-[1px] shadow-lg  ring-gray-300  "></div>
                            </span>
                          </label>
                        </td>
                        <td className="whitespace-nowrap py-1.5 ">
                          {category?.category_status === "active" ? (
                            <button
                              className="bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]"
                              onClick={() =>
                                handleCategoryActiveStatus(
                                  category?._id,
                                  category?.category_status
                                    ? "in-active"
                                    : "active"
                                )
                              }
                            >
                              <span>Active</span>
                            </button>
                          ) : (
                            <button
                              className="bg-bgBtnInactive text-btnInactiveColor px-[10px] py-[4px] rounded-[8px]"
                              onClick={() =>
                                handleCategoryInActiveStatus(
                                  category?._id,
                                  category?.category_status
                                    ? "active"
                                    : "in-active"
                                )
                              }
                            >
                              <span>In-Active</span>
                            </button>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-1.5 px-2 text-gray-700">
                          {user?.role_id?.category_delete === true && (
                            <button
                              onClick={() =>
                                handleDeleteCategoryTableRow(category)
                              }
                            >
                              <MdDeleteForever
                                size={25}
                                className="cursor-pointer text-red-500 hover:text-red-300"
                              />
                            </button>
                          )}
                          {user?.role_id?.category_update === true && (
                            <button
                              className="ml-3"
                              onClick={() =>
                                handleCategoryUpdateModal(category)
                              }
                            >
                              <FiEdit
                                size={25}
                                className="cursor-pointer text-gray-500 hover:text-gray-300"
                              />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <NoDataFound />
          )}

          {/* pagination */}
          {totalData > 10 && (
            <Pagination
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              totalData={totalData}
            />
          )}

          {/* Show Category Update Modal */}
          {categoryUpdateModal && (
            <UpDateCategory
              setCategoryUpdateModal={setCategoryUpdateModal}
              categoryUpdateData={categoryUpdateData}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
};

export default CategoryTable;
