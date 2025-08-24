//import { useState } from 'react'
import { useForm } from "react-hook-form";
import { RxCross1 } from "react-icons/rx";
import { BASE_URL } from "../../utils/baseURL";
import { toast } from "react-toastify";
import { useState } from "react";
import MiniSpinner from "../../shared/MiniSpinner/MiniSpinner";

const UpdateCoupon = ({ setCouponUpdate, getCouponUpdateData, refetch }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  //Initialize the state for coupon type
  // const [couponType, setCouponType] = useState('fixed')
  // //Coupon Customer Type State
  // const [couponCustomerType, setCouponCustomerType] = useState('all')
  // //Coupon Product  Type State
  // const [couponProductType, setCouponProductType] = useState('all')

  const handleDataPost = async (data) => {
    setLoading(true)
    const sendData = {
      _id: getCouponUpdateData?._id,
      coupon_status: data?.coupon_status,
    };
    const response = await fetch(`${BASE_URL}/coupon`, {
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
        result?.message ? result?.message : "Coupon update successfully",
        {
          autoClose: 1000,
        }
      );
      refetch();
      setLoading(false);
      setCouponUpdate(false);
    } else {
      toast.error(result?.message || "Something went wrong", {
        autoClose: 1000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative overflow-hidden bg-white w-[550px]  p-6  max-h-[90vh] rounded overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-[24px] font-semibold text-[#0A0A0A] capitalize pb-2">
            Update Coupon Status
          </h3>
          <button className="btn bg-white   p-1 absolute right-3 rounded-full top-3 hover:bg-bgBtnInactive hover:text-btnInactiveColor">
            <RxCross1
              onClick={() => {
                setCouponUpdate(false);
              }}
              size={20}
            ></RxCross1>
          </button>
        </div>
        <hr />
        <form onSubmit={handleSubmit(handleDataPost)} className="mt-3">
          {/* <div className='mt-4 w-full  grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Code
              </label>
              <input
                {...register('coupon_code', {})}
                type='text'
                placeholder='Coupon code'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Amount
              </label>
              <input
                {...register('coupon_amount')}
                type='number'
                placeholder='Coupon amount'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Start Date
              </label>
              <input
                {...register('coupon_start_date')}
                type='date'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon End Date
              </label>
              <input
                {...register('coupon_end_date')}
                type='date'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Use Per Person
              </label>
              <input
                {...register('coupon_use_per_person', {
                  validate: (value) => {
                    if (value < 1) {
                      return 'serial must be greater than 0'
                    }
                    // else if (value > 100) {
                    //   return 'Serial must be less then 100'
                    // }
                  },
                })}
                type='number'
                placeholder='Coupon use per person'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Use total Person
              </label>
              <input
                {...register('coupon_use_total_person', {
                  validate: (value) => {
                    if (value < 1) {
                      return 'serial must be greater than 0'
                    }
                    // else if (value > 100) {
                    //   return 'Serial must be less then 100'
                    // }
                  },
                })}
                type='number'
                placeholder='Coupon use total person'
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Customer Type
              </label>
              <select
                {...register('coupon_customer_type')}
                value={couponCustomerType}
                onChange={(e) => setCouponCustomerType(e.target.value)}
                className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
              >
                <option value='all'>All</option>
                <option value='specific'>Specific</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Type
              </label>
              <select
                {...register('coupon_type')}
                value={couponType}
                onChange={(e) => setCouponType(e.target.value)}
                className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
              >
                <option value='fixed'>Fixed</option>
                <option value='percent'>Percent</option>
              </select>
            </div>
           
            <div>
              <label className='block text-xs font-medium text-gray-700'>
                Coupon Product Type
              </label>
              <select
                {...register('coupon_product_type')}
                value={couponProductType}
                onChange={(e) => setCouponProductType(e.target.value)}
                className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
              >
                <option value='all'>All</option>
                <option value='specification'>Specification</option>
              </select>
            </div>

            {couponType === 'fixed' ? (
              <div>
                {' '}
                <label className='block text-xs font-medium text-gray-700'>
                  Coupon Max Amount <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('coupon_max_amount', {
                    validate: (value) => {
                      if (value < 1) {
                        return 'serial must be greater than 0'
                      }
                      // else if (value > 100) {
                      //   return 'Serial must be less then 100'
                      // }
                    },
                  })}
                  type='number'
                  placeholder='Coupon Max Amount'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
              </div>
            ) : (
              <div>
                {' '}
                <label className='block text-xs font-medium text-gray-700'>
                  Coupon Percent Amount <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('coupon_percent_amount', {
                    validate: (value) => {
                      if (value < 1) {
                        return 'serial must be greater than 0'
                      } else if (value > 100) {
                        return 'Serial must be less then 100'
                      }
                    },
                  })}
                  type='number'
                  placeholder='Coupon Percent Amount'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
              </div>
            )}

            {couponCustomerType === 'specific' && (
              <div>
                {' '}
                <label className='block text-xs font-medium text-gray-700'>
                  Coupon Specific Customer{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('coupon_specific_customer')}
                  className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                >
                  <option value='customer1'>customer1</option>
                  <option value='customer2'>customer2</option>
                  <option value='customer3'>customer3</option>
                  <option value='customer4'>customer4</option>
                </select>
              </div>
            )}

            {couponProductType === 'specification' && (
              <div>
                {' '}
                <label className='block text-xs font-medium text-gray-700'>
                  Coupon Specific Product{' '}
                </label>
                <select
                  {...register('coupon_specific_product')}
                  className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                >
                  <option value='product1'>product1</option>
                  <option value='product2'>product1</option>
                  <option value='product3'>product3</option>
                  <option value='product4'>product4</option>
                </select>
              </div>
            )}
          </div> */}
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Coupon Status
            </label>
            <select
              {...register("coupon_status")}
              defaultValue={getCouponUpdateData?.coupon_status}
              className="mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full"
            >
              <option value="active">Active</option>
              <option value="in-active">In-Active</option>
            </select>
          </div>
          <div className="flex items-center justify-end mt-4 gap-2 mb-4">
            {loading == true ? (
              <div className="px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded">
                <MiniSpinner />
              </div>
            ) : (
              <button
                className="px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200  text-white rounded"
                type="submit"
              >
                Update Status
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCoupon;
