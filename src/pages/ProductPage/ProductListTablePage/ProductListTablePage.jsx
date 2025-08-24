// import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2-optimized";
// import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../../utils/baseURL";
import { LoaderOverlay } from "../../../components/common/loader/LoderOverley";
import NoDataFound from "../../../shared/NoDataFound/NoDataFound";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthProvider";
import useDebounced from "../../../hooks/useDebounced";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/pagination/Pagination";

const ProductListTablePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  const searchText = useDebounced({ searchQuery: searchValue, delay: 500 });
  useEffect(() => {
    setSearchTerm(searchText);
  }, [searchText]);

  // handle item search function....
  const handleSearchValue = (value) => {
    setSearchValue(value);
    setLimit(10);
    setPage(1);
  };

  const {
    data: productData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/product/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
    ],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/product/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      return data;
    },
  });

  // delete a Staff
  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this ${item?.product_name} Product!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const sendData = {
          _id: item?._id,
        };
        try {
          const response = await fetch(`${BASE_URL}/product`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(sendData),
          });
          const result = await response.json();
          // console.log(result);
          if (result?.statusCode === 200 && result?.success === true) {
            refetch();
            Swal.fire({
              title: "Deleted!",
              text: `${item?.product_name} Product has been deleted!`,
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
          console.log(error);
        }
      }
    });
  };
  if (isLoading) {
    return <LoaderOverlay />;
  }

  return (
    <>
      {user?.role_id?.product_show === true && (
        <div className="bg-white rounded-lg py-6 px-4 shadow">
          <div className="flex justify-between mt-6">
            <div>
              <h1 className="text-2xl">Product List</h1>
            </div>
            {user?.role_id?.product_create === true && (
              <div>
                <Link
                  to="/product/product-create"
                  type="button"
                  className="rounded-[8px] py-[10px] px-[14px] bg-primaryColor hover:bg-blue-500 duration-200 text-white text-sm"
                >
                  Create Product
                </Link>
              </div>
            )}
          </div>
          {/* search Product... */}
          <div className="mt-3">
            <input
              type="text"
              defaultValue={searchTerm}
              onChange={(e) => handleSearchValue(e.target.value)}
              placeholder="Search Product..."
              className="w-full sm:w-[350px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          {/* Table for showing data */}
          {productData?.data?.length > 0 ? (
            <div className="mt-5 overflow-x-auto rounded">
              <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm border rounded">
                <thead className=" bg-[#fff9ee]">
                  <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Product Name
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Product Image
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Product Video
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Status
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Buying Price
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Discount Price
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Selling Price
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Category
                    </th>
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Sub Category
                    </th>
                    {/* <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Child Category
                    </th> */}
                    <th className="whitespace-nowrap p-4  text-gray-900 text-center">
                      Brand
                    </th>

                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y  divide-gray-200 text-center ">
                  {productData?.data?.map((item, i) => (
                    <tr
                      key={item?._id}
                      className={`divide-x divide-gray-200 ${
                        i % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.product_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-1 font-semibold flex justify-center">
                        <img
                          src={item?.main_image}
                          alt=""
                          className="w-20 h-12 object-cover rounded-md"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.main_video ? (
                          <div className="flex justify-center items-center">
                            <video
                              className="w-20 h-16 rounded-md object-cover"
                              src={item?.main_video}
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
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.product_status}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.product_buying_price
                          ? item?.product_buying_price
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.product_discount_price
                          ? item?.product_discount_price
                          : 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.product_price}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.category_id?.category_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.sub_category_id?.sub_category_name
                          ? item?.sub_category_id?.sub_category_name
                          : "-"}
                      </td>
                      {/* <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.child_category_id?.child_category_name
                          ? item?.child_category_id?.child_category_name
                          : "-"}
                      </td> */}
                      <td className="whitespace-nowrap px-4 py-2 font-semibold">
                        {item?.brand_id?.brand_name
                          ? item?.brand_id?.brand_name
                          : "-"}
                      </td>
                      <td className=" whitespace-nowrap px-4 py-2 ">
                        <span className="flex items-center justify-center gap-2">
                          {user?.role_id?.product_delete === true && (
                            <MdDeleteForever
                              onClick={() => handleDelete(item)}
                              className="cursor-pointer text-red-500 hover:text-red-300"
                              size={22}
                            />
                          )}
                          {user?.role_id?.product_update === true && (
                            <Link to={`/product/product-update/${item?._id}`}>
                              <FiEdit
                                className="cursor-pointer text-gray-500 hover:text-gray-300"
                                size={22}
                              />
                            </Link>
                          )}
                        </span>
                      </td>
                      {/* <td className="whitespace-nowrap px-4 py-2 space-x-1 flex items-center justify-center gap-4">
                    {user?.role_id?.staff_permission_delete ||
                    user?.role_id?.staff_permission_update ? (
                      <>
                        {user?.role_id?.staff_permission_delete && (
                          <MdDeleteForever
                            onClick={() => handleDelete(item)}
                            className="cursor-pointer text-red-500 hover:text-red-300"
                            size={25}
                          />
                        )}
                        {user?.role_id?.staff_permission_update && (
                          <FiEdit
                            onClick={() => updateStaffModal(item)}
                            className="cursor-pointer text-gray-500 hover:text-gray-300"
                            size={25}
                          />
                        )}
                      </>
                    ) : (
                      <small>Access Denied</small>
                    )}
                  </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <NoDataFound />
          )}
          {/* pagination */}
          {productData?.totalData > 10 && (
            <Pagination
              setLimit={setLimit}
              page={page}
              setPage={setPage}
              limit={limit}
              totalData={productData?.totalData}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ProductListTablePage;
