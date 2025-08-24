import { useEffect, useState } from "react";
import Pagination from "../common/pagination/Pagination";
import TableLoadingSkeleton from "../common/loadingSkeleton/TableLoadingSkeleton";
import { Link } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";

const OfferOrderListTable = ({
  offerOrdersData,
  limit,
  page,
  setPage,
  setLimit,
  isLoading,
  totalData,
  user,
  loading,
  refetch,
}) => {
  const [serialNumber, setSerialNumber] = useState();

  useEffect(() => {
    const newSerialNumber = (page - 1) * limit;
    setSerialNumber(newSerialNumber);
  }, [page, limit]);

  //   handle order status
  const handleOrderStatus = async (order_status, _id, offer_products) => {
    try {
      const sendData = {
        _id: _id,
        order_status: order_status,
        order_updated_by: user?._id,
      };
      if (order_status === "processing") {
        const today =
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString();
        sendData.processing_time = today;
      }
      if (order_status === "shipped") {
        const today =
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString();
        sendData.shipped_time = today;
      }
      if (order_status === "delivered") {
        const today =
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString();
        sendData.delivered_time = today;
      }
      if (order_status === "cancel") {
        const today =
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString();
        sendData.cancel_time = today;
        sendData.offer_products = offer_products;
      }
      if (order_status === "return") {
        const today =
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString();
        sendData.return_time = today;
      }
      const response = await fetch(`${BASE_URL}/offer_order`, {
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
          result?.message ? result?.message : "Status Update successfully",
          {
            autoClose: 1000,
          }
        );
        refetch();
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        refetch();
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
      refetch();
    } finally {
      refetch();
    }
  };

  if (loading) {
    return <TableLoadingSkeleton />;
  }

  return (
    <>
      {isLoading ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="">
          {/* Make the table wrapper horizontally scrollable */}
          <div className="mt-5 overflow-x-auto rounded ">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm border rounded">
              <thead className="bg-[#fff9ee]">
                <tr className="divide-x divide-gray-300  font-semibold text-center text-gray-900">
                  <td className="whitespace-nowrap p-4 ">SL No</td>
                  <td className="whitespace-nowrap p-4 ">Invoice No</td>
                  <td className="whitespace-nowrap p-4 ">Offer Name</td>
                  <td className="whitespace-nowrap p-4 ">Customer Name</td>
                  <td className="whitespace-nowrap p-4 ">Customer Phone</td>
                  {user?.role_id?.offer_order_update === true && (
                    <td className="whitespace-nowrap p-4 ">Order Status</td>
                  )}

                  <td className="whitespace-nowrap p-4 ">Total Amount</td>
                  <td className="whitespace-nowrap p-4 ">Discount Amount</td>
                  <td className="whitespace-nowrap p-4 ">Shipping Cost</td>
                  <td className="whitespace-nowrap p-4 ">Grand Total Amount</td>
                  <td className="whitespace-nowrap p-4 ">Shipping Location</td>

                  <td className="whitespace-nowrap p-4 ">View Details</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-center">
                {offerOrdersData?.map((offerOrder, index) => (
                  <tr
                    key={offerOrder?._id}
                    className={`divide-x divide-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                    }`}
                  >
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {serialNumber + index + 1}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      <Link
                        to={`/all-offerOrder-info/${offerOrder?._id}`}
                        className="underline font-medium text-blue-600"
                      >
                        {offerOrder?.invoice_id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.offer_id?.offer_title}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.customer_id?.user_name}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.customer_phone}
                    </td>
                    {user?.role_id?.offer_order_update === true && (
                      <td className="whitespace-nowrap p-1">
                        <select
                          onChange={(e) =>
                            handleOrderStatus(
                              e.target.value,
                              offerOrder?._id,
                              offerOrder?.offer_products
                            )
                          }
                          id="order_status"
                          className="block w-full px-1 py-1 text-gray-700 bg-white border border-gray-200 rounded-xl cursor-pointer"
                        >
                          <option selected value={offerOrder?.order_status}>
                            {offerOrder?.order_status}
                          </option>
                          {offerOrder?.order_status !== "pending" &&
                            offerOrder?.order_status !== "processing" &&
                            offerOrder?.order_status !== "shipped" &&
                            offerOrder?.order_status !== "delivered" &&
                            offerOrder?.order_status !== "cancel" &&
                            offerOrder?.order_status !== "return" && (
                              <option value="pending">Pending</option>
                            )}
                          {offerOrder?.order_status == "pending" && (
                            <option value="processing">Processing</option>
                          )}
                          {offerOrder?.order_status == "processing" && (
                            <option value="shipped">Shipped</option>
                          )}
                          {offerOrder?.order_status == "shipped" && (
                            <option value="delivered">Delivered</option>
                          )}
                          {offerOrder?.order_status !== "cancel" &&
                            offerOrder?.order_status !== "return" &&
                            offerOrder?.order_status !== "delivered" && (
                              <option value="cancel">Cancel</option>
                            )}
                          {offerOrder?.order_status == "delivered" && (
                            <option value="return">Return</option>
                          )}
                        </select>
                      </td>
                    )}

                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.sub_total_amount}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.discount_amount}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.shipping_cost}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.grand_total_amount}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {" "}
                      {offerOrder?.shipping_location}
                    </td>

                    <td className="whitespace-nowrap p-4 flex justify-center">
                      <Link
                        to={`/all-offerOrder-info/${offerOrder?._id}`}
                        className=" text-gray-500 hover:text-gray-900"
                      >
                        <FaRegEye size={23} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* pagination */}
          {totalData > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              totalData={totalData}
            />
          )}
        </div>
      )}
    </>
  );
};

export default OfferOrderListTable;
