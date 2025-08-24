import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/baseURL";
import { LoaderOverlay } from "../common/loader/LoderOverley";
import { DateFormate } from "../../utils/DateFormate/DateFormate";

const ViewSingleOfferOrder = () => {
  const { id } = useParams();

  const { data: offerOrders, isLoading } = useQuery({
    queryKey: [`/api/v1/offer_order/${id}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/offer_order/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
  });
  if (isLoading) {
    return <LoaderOverlay />;
  }

  return (
    <section className="max-w-7xl mx-auto">
      {/* Order Product */}

      <div className="">
        <div className="flex justify-between bg-[#fff9ee] p-2.5 shadow-md rounded ">
          <p className="text-xl">Offer&apos;s Order Information</p>
        </div>

        <div className="bg-[#fff9ee] p-2.5 shadow-md rounded grid grid-cols-2 divide-x-2 divide-gray-300 mt-3 gap-4">
          <div className=" px-4">
            <p className=" font-medium uppercase">Offer Name</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.offer_id?.offer_title}
            </p>
          </div>

          <div className=" px-4">
            {" "}
            <img
              src={offerOrders?.data?.offer_id?.offer_image}
              alt="offer_image"
              className="w-full h-[100px] rounded-xl"
            />
          </div>
        </div>
        <div className="bg-[#fff9ee] p-2.5 shadow-md rounded grid grid-cols-4 divide-x-2 divide-gray-300 mt-3 gap-4">
          <div className=" px-4">
            <p className=" font-medium uppercase">Billing To</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.customer_id?.user_name}
            </p>
            <p className="">{offerOrders?.data?.customer_id?.user_phone}</p>
            <p className="">{offerOrders?.data?.billing_address}</p>
            <p className="">{offerOrders?.data?.billing_state}</p>
          </div>

          <div className=" px-4">
            {" "}
            <p className=" font-medium uppercase">Invoice Number</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.invoice_id}
            </p>
          </div>
          <div className="  px-4">
            {" "}
            <p className=" font-medium uppercase">Date Issue</p>
            <p className="font-medium text-xl">
              {DateFormate(offerOrders?.data?.customer_id?.createdAt)}
            </p>
          </div>
          <div className=" px-4">
            {" "}
            <p className=" font-medium uppercase">Total Amount</p>
            <p className="font-medium text-xl">
              ৳ {offerOrders?.data?.grand_total_amount}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-4 overflow-x-auto bg-[#fff9ee] p-4 shadow-md rounded">
            <table className="min-w-full text-sm ">
              <thead className="border-b">
                <tr className="text-gray-900">
                  <th className="whitespace-nowrap p-4">SL</th>
                  <th className="whitespace-nowrap p-4">Image</th>
                  <th className="whitespace-nowrap p-4">Product Info</th>
                  <th className="whitespace-nowrap p-4">Offer Price</th>
                  <th className="whitespace-nowrap p-4">Quantity</th>
                  <th className="whitespace-nowrap p-4">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-gray-200">
                {offerOrders?.data?.offer_products?.map((product, idx) => (
                  <tr
                    key={idx}
                    className={`divide-y divide-gray-100 space-y-2 py-2 text-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="whitespace-nowrap p-4">{idx + 1}</td>
                    <td className="py-2 flex justify-center">
                      {product?.variation_id ? (
                        <img
                          src={product?.variation_id?.variation_image}
                          className="w-20 h-[72px] rounded-md border"
                          alt=""
                        />
                      ) : (
                        <img
                          src={product?.offer_product_id?.main_image}
                          className="w-20 h-[72px] rounded-md border"
                          alt=""
                        />
                      )}
                    </td>
                    <td className="min-w-[260px] py-2.5 text-gray-700 px-4">
                      <div className="mt-1">
                        <p className="mb-1">
                          {product?.offer_product_id?.product_name}
                        </p>
                        <div className="text-text-Lighter items-center">
                          {product?.variation_id && (
                            <p>
                              Variation: {product?.variation_id?.variation_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        {product?.offer_product_price}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      {product?.offer_product_quantity}
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      ৳{""}
                      <span>
                        {" "}
                        {product?.offer_product_price *
                          product?.offer_product_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-[#fff9ee] p-2.5 shadow-md rounded  mt-3 gap-4 flex justify-end">
          <div className="px-4 grid grid-cols-2 gap-x-10 gap-y-2">
            <p className=" font-medium uppercase">Shipping Location</p>
            <p className=" font-medium uppercase">
              {offerOrders?.data?.shipping_location}
            </p>
            <p className=" font-medium uppercase">Sub Total Amount</p>
            <p className=" font-medium">
              {" "}
              ৳ {offerOrders?.data?.sub_total_amount}
            </p>
            <p className=" font-medium uppercase">Shipping Cost</p>
            <p className=" font-medium">
              {" "}
              ৳ {offerOrders?.data?.shipping_cost}
            </p>
           

            <p className=" font-medium uppercase">Grand Total Amount</p>
            <p className=" font-medium">
              {" "}
              ৳ {offerOrders?.data?.grand_total_amount}
            </p>
          </div>
        </div>
      </div>

      {/* Order Product */}
    </section>
  );
};

export default ViewSingleOfferOrder;
