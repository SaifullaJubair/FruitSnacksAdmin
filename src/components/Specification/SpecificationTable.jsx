import { FiEdit } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";

import { useEffect, useState } from "react";
import UpdateSpecification from "./UpdateSpecification";
import ViewSpecificationValue from "./ViewSpecificationValue/ViewSpecificationValue";
import Swal from "sweetalert2-optimized";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import DuplicateSpecification from "./DuplicateSpecification";
import Pagination from "../common/pagination/Pagination";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/baseURL";
import { GoEye } from "react-icons/go";
import NoDataFound from "../../shared/NoDataFound/NoDataFound";
//import { BASE_URL } from '../../utils/baseURL'
//import { toast } from 'react-toastify'
import TableLoadingSkeleton from "./../common/loadingSkeleton/TableLoadingSkeleton";

const SpecificationTable = ({
  specificationValues,
  setPage,
  setLimit,
  page,
  limit,
  totalData,
  categoryTypes,
  subCategoryTypes,
  refetch,
  user,
  isLoading,
}) => {
  //get Serial Number From..index....
  const [serialNumber, setSerialNumber] = useState();
  useEffect(() => {
    const newSerialNumber = (page - 1) * limit;
    setSerialNumber(newSerialNumber);
  }, [page, limit]);

  //specification Update Modal
  const [specificationUpdateModal, setSpecificationUpdateModal] =
    useState(false);
  //get Specification Update data state
  const [getSpecificationUpdateValue, setGetSpecificationUpdateValue] =
    useState({});

  //specification value Modal open State
  const [viewSpecificationValueModal, setViewSpecificationValueModal] =
    useState(false);

  //get Specification Data State
  const [getSpecificationValue, setGetSpecificationValue] = useState({});

  //Specification Duplicate Modal
  const [viewSpecificationDuplicateModal, setViewSpecificationDuplicateModal] =
    useState(false);
  //Specification Duplicate Modal
  const [
    getSpecificationDuplicateModalValue,
    setGetSpecificationDuplicateModalValue,
  ] = useState(false);

  //handle Specification Value Modal ...
  const handleViewSpecificationValue = (specification) => {
    setGetSpecificationValue(specification);
    setViewSpecificationValueModal(true);
  };

  //Handle Specification Duplicate Modal
  const handleSpecificationDuplicateModal = (specification) => {
    setGetSpecificationDuplicateModalValue(specification);
    setViewSpecificationDuplicateModal(true);
  };

  //Handle Specification Update Modal
  const handleUpdateSpecificationValue = (specification) => {
    setSpecificationUpdateModal(true);
    setGetSpecificationUpdateValue(specification);
  };

  //Toggle show button status in table
  const handleSpecificationToggle = async (id, specification_show) => {
    try {
      const data = {
        _id: id,
        specification_show,
      };
      const response = await fetch(
        `${BASE_URL}/specification`,
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
            : "Brand Category show successfully",
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

  //handle Specific Status update

  const handleSpecificationActiveStatus = async (id, specification_status) => {
    try {
      const data = {
        _id: id,
        specification_status,
      };
      const response = await fetch(
        `${BASE_URL}/specification`,
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
            : "Specification status update successfully",
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

  const handleSpecificationInActiveStatus = async (
    id,
    specification_status
  ) => {
    try {
      const data = {
        _id: id,
        specification_status,
      };
      const response = await fetch(
        `${BASE_URL}/specification`,
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
            : "Specification status update successfully",
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

  // handle Specific Status update End...

  //handle Delete Specification Table Row Function

  const handleDeleteSpecificationTableRow = (specification) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this ${specification?.specification_name} Specification!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sendData = {
          _id: specification?._id,
        };
        try {
          const response = await fetch(
            `
            ${BASE_URL}/specification`,
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
              text: `${specification?.specification_name} Specification has been deleted!`,
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

  return (
    <>
      {isLoading ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="max-h-[80vh]">
          <div className="rounded-lg border border-gray-200 mt-6 ">
            {specificationValues?.data?.length > 0 ? (
              <div className="overflow-x-auto overflow-y-auto relative scrollbar-thin  max-h-[70vh] rounded-t-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm ">
                  <thead className="ltr:text-left rtl:text-right bg-[#fff9ee]  sticky top-0 z-10">
                    <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        SL No
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Specification Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Specification Serial
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Specification Show
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Specification Status
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Category Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Sub Category Name
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Specification Values
                      </th>
                      <th className="whitespace-nowrap p-4 font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center">
                    {specificationValues?.data?.map((specification, i) => (
                      <tr
                        key={specification?._id}
                        className={`divide-x divide-gray-200 ${
                          i % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {serialNumber + i + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {specification?.specification_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                          {specification?.specification_serial}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          <label
                            htmlFor={specification?._id}
                            className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800"
                          >
                            <span className="relative">
                              <input
                                id={specification?._id}
                                type="checkbox"
                                checked={specification?.specification_show}
                                className="hidden peer"
                                onChange={() => {
                                  handleSpecificationToggle(
                                    specification?._id,
                                    specification?.specification_show
                                      ? false
                                      : true
                                  );
                                }}
                              />
                              <div className="w-10 h-4 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive"></div>
                              <div className="absolute left-0 w-6 h-6 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white"></div>
                            </span>
                          </label>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {specification?.specification_status === "active" ? (
                            <button
                              className="bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]"
                              onClick={() =>
                                handleSpecificationActiveStatus(
                                  specification?._id,
                                  specification?.specification_status
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
                                handleSpecificationInActiveStatus(
                                  specification?._id,
                                  specification?.specification_status
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
                          {specification?.category_id?.category_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 ">
                          {specification?.sub_category_id
                            ? specification?.sub_category_id?.sub_category_name
                            : "---"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 ">
                          <button
                            onClick={() =>
                              handleViewSpecificationValue(specification)
                            }
                          >
                            <GoEye
                              size={25}
                              className="cursor-pointer text-gray-500 hover:text-gray-300"
                            />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          {user?.role_id?.specification_delete && (
                            <button className="ml-[8px]">
                              <MdDeleteForever
                                size={25}
                                onClick={() =>
                                  handleDeleteSpecificationTableRow(
                                    specification
                                  )
                                }
                                className="cursor-pointer text-red-500 hover:text-red-300"
                              />
                            </button>
                          )}
                          {user?.role_id?.specification_update && (
                            <>
                              {" "}
                              {/* <button className="ml-[8px]">
                                <HiOutlineDocumentDuplicate
                                  className="cursor-pointer text-gray-500 hover:text-gray-300"
                                  size={25}
                                  onClick={() =>
                                    handleSpecificationDuplicateModal(
                                      specification
                                    )
                                  }
                                />
                              </button> */}
                              <button
                                className="ml-[8px]"
                                onClick={() =>
                                  handleUpdateSpecificationValue(specification)
                                }
                              >
                                <FiEdit
                                  size={25}
                                  className="cursor-pointer text-gray-500 hover:text-gray-300"
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
            ) : (
              <NoDataFound />
            )}
          </div>
          {/* pagination */}
          {totalData > 10 && (
            <Pagination
              setPage={setPage}
              setLimit={setLimit}
              page={page}
              limit={limit}
              totalData={totalData}
            />
          )}

          {/* Show Specification Update Modal */}

          {specificationUpdateModal && (
            <UpdateSpecification
              setSpecificationUpdateModal={setSpecificationUpdateModal}
              getSpecificationUpdateValue={getSpecificationUpdateValue}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              refetch={refetch}
              user={user}
            />
          )}

          {/* View Specification values modal */}

          {viewSpecificationValueModal && (
            <ViewSpecificationValue
              setViewSpecificationValueModal={setViewSpecificationValueModal}
              getSpecificationValue={getSpecificationValue}
            />
          )}
          {/* View Specification Duplicate modal */}
          {viewSpecificationDuplicateModal && (
            <DuplicateSpecification
              setViewSpecificationDuplicateModal={
                setViewSpecificationDuplicateModal
              }
              getSpecificationDuplicateModalValue={
                getSpecificationDuplicateModalValue
              }
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SpecificationTable;
