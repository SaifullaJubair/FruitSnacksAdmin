import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import UpdateChildCategory from "./UpdateChildCategory";
import Swal from "sweetalert2-optimized";
import Pagination from "../common/pagination/Pagination";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import DuplicateChildCategory from "./DuplicateChildCategory";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import NoDataFound from "../../shared/NoDataFound/NoDataFound";
import TableLoadingSkeleton from "./../common/loadingSkeleton/TableLoadingSkeleton";

const ChildCategoryTable = ({
  setPage,
  setLimit,
  user,
  childCategoryTypes,
  refetch,
  totalData,
  page,
  limit,
  categoryTypes,
  subCategoryTypes,
  categoryLoading,
  subCategoryLoading,
  isLoading,
}) => {
  const [serialNumber, setSerialNumber] = useState();
  useEffect(() => {
    const newSerialNumber = (page - 1) * limit;
    setSerialNumber(newSerialNumber);
  }, [page, limit]);

  //Child category Update modal open state
  const [childUpdateData, setChildUpdateData] = useState({});
  const [childCategoryUpdateModal, setChildCategoryUpdateModal] =
    useState(false);
  const handleChildCategoryUpdateModal = (childCategory) => {
    setChildCategoryUpdateModal(true);
    setChildUpdateData(childCategory);
  };
  // Duplicate Child Category Modal
  const [childCategoryDuplicateModal, setChildCategoryDuplicateModal] =
    useState(false);

  const handleChildCategoryDuplicateModal = (childCategory) => {
    setChildCategoryDuplicateModal(true);
    setChildUpdateData(childCategory);
  };

  //handle Delete ChildCategory Table Row
  const handleDeleteChildCategoryTableRow = (childCategory) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this ${childCategory?.child_category_name} child category!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sendData = {
          _id: childCategory?._id,
        };
        try {
          const response = await fetch(
            `
            ${BASE_URL}/child_category`,
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
              text: `${childCategory?.child_category_name} child category has been deleted!`,
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

  const handleSubCategoryActiveStatus = async (id, child_category_status) => {
    try {
      const data = {
        _id: id,
        child_category_status,
      };
      const response = await fetch(
        `${BASE_URL}/child_category`,
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
            : "Child Category status successfully",
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
  const handleSubCategoryInActiveStatus = async (id, child_category_status) => {
    try {
      const data = {
        _id: id,
        child_category_status,
      };
      const response = await fetch(
        `${BASE_URL}/child_category`,
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
            : "Child Category status successfully",
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
          {childCategoryTypes?.data?.length > 0 ? (
            <div className="rounded-lg border border-gray-200 mt-6">
              <div className="overflow-x-auto rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right bg-[#fff9ee]">
                    <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        SL No
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Child Category Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Serial No
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Category Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Sub Category Name
                      </th>

                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center">
                    {childCategoryTypes?.data?.map((childCategory, i) => (
                      <tr
                        key={childCategory?._id}
                        className={`divide-x divide-gray-200 ${
                          i % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                          {serialNumber + i + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                          {childCategory?.child_category_name}
                        </td>

                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {childCategory?.child_category_serial}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {childCategory?.category_id?.category_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {childCategory?.sub_category_id?.sub_category_name}
                        </td>

                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {childCategory?.child_category_status === "active" ? (
                            <button
                              className="bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]"
                              onClick={() =>
                                handleSubCategoryActiveStatus(
                                  childCategory?._id,
                                  childCategory?.child_category_status
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
                                  childCategory?._id,
                                  childCategory?.child_category_status
                                    ? "active"
                                    : "in-active"
                                )
                              }
                            >
                              <span>In-Active</span>
                            </button>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {user?.role_id?.child_category_delete === true && (
                            <button className="ml-[8px]">
                              <MdDeleteForever
                                size={25}
                                className="cursor-pointer text-red-500 hover:text-red-300"
                                onClick={() =>
                                  handleDeleteChildCategoryTableRow(
                                    childCategory
                                  )
                                }
                              />
                            </button>
                          )}

                          {user?.role_id?.child_category_update === true && (
                            <>
                              <button className="ml-[8px]">
                                <HiOutlineDocumentDuplicate
                                  className="cursor-pointer text-gray-500 hover:text-gray-300"
                                  size={25}
                                  onClick={() =>
                                    handleChildCategoryDuplicateModal(
                                      childCategory
                                    )
                                  }
                                />
                              </button>
                              <button
                                className="ml-[8px]"
                                onClick={() =>
                                  setChildCategoryUpdateModal(true)
                                }
                              >
                                <FiEdit
                                  className="cursor-pointer text-gray-500 hover:text-gray-300"
                                  size={25}
                                  onClick={() =>
                                    handleChildCategoryUpdateModal(
                                      childCategory
                                    )
                                  }
                                />
                              </button>
                            </>
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

          {/* ---Pagination---- */}
          {totalData > 10 && (
            <Pagination
              totalData={totalData}
              setPage={setPage}
              setLimit={setLimit}
              limit={limit}
              page={page}
            />
          )}

          {/* Show Child Category Update Modal */}

          {childCategoryUpdateModal && (
            <UpdateChildCategory
              setChildCategoryUpdateModal={setChildCategoryUpdateModal}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              categoryLoading={categoryLoading}
              subCategoryLoading={subCategoryLoading}
              childUpdateData={childUpdateData}
              refetch={refetch}
              user={user}
            />
          )}
          {/* Show Child Category Duplicate Modal */}

          {childCategoryDuplicateModal && (
            <DuplicateChildCategory
              setChildCategoryDuplicateModal={setChildCategoryDuplicateModal}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              categoryLoading={categoryLoading}
              subCategoryLoading={subCategoryLoading}
              childUpdateData={childUpdateData}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ChildCategoryTable;
