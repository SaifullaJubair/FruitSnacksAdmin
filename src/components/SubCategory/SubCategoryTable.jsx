import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

import UpdateSubCateGory from "./UpdateSubCateGory";
import { MdDeleteForever } from "react-icons/md";
import Swal from "sweetalert2-optimized";
import Pagination from "../common/pagination/Pagination";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import NoDataFound from "../../shared/NoDataFound/NoDataFound";
import TableLoadingSkeleton from "../common/loadingSkeleton/TableLoadingSkeleton";

const SubCategoryTable = ({
  isLoading,
  refetch,
  subCategoryTypes,
  setLimit,
  setPage,
  totalData,
  page,
  limit,
  user,
}) => {
  const [serialNumber, setSerialNumber] = useState();
  //Sub category Update Modal state
  const [subcategoryUpdateModal, setSubcategoryUpdateModal] = useState(false);
  const [subCategoryUpdateData, setSubCategoryUpdateData] = useState({});

  const handleSubcategoryUpdateModal = (data) => {
    setSubcategoryUpdateModal(true);
    setSubCategoryUpdateData(data);
  };

  //page serial number
  useEffect(() => {
    const newSerialNumber = (page - 1) * limit;
    setSerialNumber(newSerialNumber);
  }, [page, limit]);

  //handle Delete SubCategory Table Row Function
  const handleDeleteSubCategoryTableRow = (subCategory) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this ${subCategory?.sub_category_name} sub category!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sendData = {
          _id: subCategory?._id,
          sub_category_logo_key: subCategory?.sub_category_logo_key,
        };
        try {
          const response = await fetch(
            `
            ${BASE_URL}/sub_category`,
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
              text: `${subCategory?.sub_category_name} sub category has been deleted!`,
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

  //Update Category Status..
  const handleSubCategoryActiveStatus = async (id, sub_category_status) => {
    console.log(id, sub_category_status);
    try {
      const data = {
        _id: id,
        sub_category_status,
      };
      const response = await fetch(
        `${BASE_URL}/sub_category`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : "Sub Category status update successfully",
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
  const handleSubCategoryInActiveStatus = async (id, sub_category_status) => {
    try {
      const data = {
        _id: id,
        sub_category_status,
      };
      const response = await fetch(
        `${BASE_URL}/sub_category`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : "Sub Category status update successfully",
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
          {subCategoryTypes?.data?.length > 0 ? (
            <div className="rounded-lg border border-gray-200 mt-6">
              <div className="overflow-x-auto rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right bg-[#fff9ee]">
                    <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        SL No
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Sub Category Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Sub Category Logo
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Serial No
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Category Name
                      </th>

                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Sub Category Status
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center">
                    {subCategoryTypes?.data?.map((subCategory, i) => (
                      <tr
                        key={subCategory?._id}
                        className={`divide-x divide-gray-200 ${
                          i % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-1.5 font-medium text-gray-900">
                          {serialNumber + i + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-1.5 font-medium text-gray-900">
                          {subCategory?.sub_category_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-1.5 text-gray-700 flex justify-center">
                          <img
                            className="w-[44px] h-[44px] rounded-[8px] "
                            src={subCategory?.sub_category_logo}
                            alt=""
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-1.5 text-gray-700">
                          {subCategory?.sub_category_serial}
                        </td>
                        <td className="whitespace-nowrap px-4 py-1.5 text-gray-700">
                          {subCategory?.category_id?.category_name}
                        </td>

                        <td className="whitespace-nowrap px-4 py-1.5 ">
                          {subCategory?.sub_category_status === "active" ? (
                            <button
                              className="bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]"
                              onClick={() =>
                                handleSubCategoryActiveStatus(
                                  subCategory?._id,
                                  subCategory?.sub_category_status
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
                                handleSubCategoryInActiveStatus(
                                  subCategory?._id,
                                  subCategory?.sub_category_status
                                    ? "active"
                                    : "in-active"
                                )
                              }
                            >
                              <span>In-Active</span>
                            </button>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-1.5 text-gray-700">
                          {user?.role_id?.sub_category_delete === true && (
                            <button>
                              <MdDeleteForever
                                size={25}
                                onClick={() =>
                                  handleDeleteSubCategoryTableRow(subCategory)
                                }
                                className="cursor-pointer text-red-500 hover:text-red-300"
                              />
                            </button>
                          )}
                          {user?.role_id?.sub_category_update === true && (
                            <button className="ml-[8px]">
                              <FiEdit
                                size={25}
                                onClick={() =>
                                  handleSubcategoryUpdateModal(subCategory)
                                }
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

          {/* Show Sub Category Update Modal */}

          {subcategoryUpdateModal && (
            <UpdateSubCateGory
              setSubcategoryUpdateModal={setSubcategoryUpdateModal}
              subCategoryUpdateData={subCategoryUpdateData}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SubCategoryTable;
