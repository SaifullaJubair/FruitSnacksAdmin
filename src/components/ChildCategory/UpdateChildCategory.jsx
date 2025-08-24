import { useForm } from 'react-hook-form'
import { generateSlug } from '../../utils/generateSlug'
import { RxCross1 } from 'react-icons/rx'
import { useEffect, useState } from 'react'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import Select from 'react-select'
import { BASE_URL } from '../../utils/baseURL'
import { toast } from 'react-toastify'

const UpdateChildCategory = ({
  setChildCategoryUpdateModal,
  childUpdateData,
  categoryTypes,
  subCategoryTypes,
  categoryLoading,
  subCategoryLoading,
  refetch,
  user,
}) => {
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategory_id] = useState(
    childUpdateData?.category_id?._id
  )
  const [categoryChange, setCategoryChange] = useState(false)
  const [sub_category_id, setSubCategory_id] = useState(
    childUpdateData?.sub_category_id?._id
  )
  const [subCategoryOpen, setSubCategoryOpen] = useState(true)
  const [filteredSubCategory, setFilteredSubCategory] = useState([])
  const { register, handleSubmit } = useForm()

  const default_category_id = childUpdateData?.category_id?._id
  const default_category_name = childUpdateData?.category_id?.category_name

  const default_sub_category_id = childUpdateData?.sub_category_id?._id
  const default_sub_category_name =
    childUpdateData?.sub_category_id?.sub_category_name

  //
  useEffect(() => {
    const result = subCategoryTypes?.data?.filter(
      (item) => item?.category_id?._id === categoryId
    )
    setFilteredSubCategory(result)
  }, [subCategoryTypes?.data, categoryId])

  // Handle Add Category

  const handleDataPost = async (data) => {
    setLoading(true)
    const sendData = {
      _id: childUpdateData?._id,
      child_category_updated_by: user?._id,
      child_category_name: data?.child_category_name
        ? data?.child_category_name
        : childUpdateData?.child_category_name,
      child_category_serial: data?.child_category_serial
        ? data?.child_category_serial
        : childUpdateData?.child_category_serial,

      child_category_status: data?.child_category_status
        ? data?.child_category_status
        : childUpdateData?.child_category_status,

      child_category_slug: generateSlug(
        data?.child_category_name
          ? data?.child_category_name
          : childUpdateData?.child_category_name
      ),
      category_id: categoryId,
      sub_category_id: sub_category_id,
    }
    const response = await fetch(
      `${BASE_URL}/child_category`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData),
      }
    )
    const result = await response.json()
    if (result?.statusCode === 200 && result?.success === true) {
      toast.success(
        result?.message
          ? result?.message
          : 'Child Category update successfully',
        {
          autoClose: 1000,
        }
      )
      refetch()
      setLoading(false)
      setChildCategoryUpdateModal(false)
    } else {
      toast.error(result?.message || 'Something went wrong', {
        autoClose: 1000,
      })
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50'>
        <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin'>
          <div className='flex items-center justify-between mt-4'>
            <h3
              className='text-[26px] font-bold text-gray-800 capitalize'
              id='modal-title'
            >
              Update Child Category
            </h3>
            <button
              type='button'
              className='btn bg-white hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3'
              onClick={() => setChildCategoryUpdateModal(false)}
            >
              {' '}
              <RxCross1 size={20}></RxCross1>
            </button>
          </div>

          <hr className='mt-2 mb-6' />

          <form onSubmit={handleSubmit(handleDataPost)} className=''>
            <div>
              <label
                htmlFor='UserEmail'
                className='block text-xs font-medium text-gray-700'
              >
                Child Category Name
              </label>

              <input
                {...register('child_category_name')}
                type='text'
                placeholder='Child Category Name'
                defaultValue={childUpdateData?.child_category_name}
                className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
              />
            </div>

            <div className='mt-4 grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-medium text-gray-700'>
                  Child Category Status
                </label>
                <select
                  {...register('child_category_status')}
                  defaultValue={childUpdateData?.child_category_status}
                  className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                >
                  <option value='active'>Active</option>
                  <option value='in-active'>In-Active</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700'>
                  Child Category serial
                </label>

                <input
                  {...register('child_category_serial', {
                    validate: (value) => {
                      if (value < 1) {
                        return 'serial must be greater than 0'
                      } else if (value > 100) {
                        return 'Serial must be less then 100'
                      }
                    },
                  })}
                  type='Number'
                  defaultValue={childUpdateData?.child_category_serial}
                  placeholder='Child Category Serial'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-2'>
                  Category Name
                </label>
                {!categoryLoading && (
                  <Select
                    id='category_id'
                    name='category_id'
                    defaultValue={{
                      _id: default_category_id,
                      category_name: default_category_name,
                    }}
                    required
                    aria-label='Category Type'
                    options={categoryTypes?.data}
                    getOptionLabel={(x) => x?.category_name}
                    getOptionValue={(x) => x?._id}
                    onChange={(selectedOption) => {
                      setCategory_id(selectedOption?._id)
                      setCategoryChange(true)
                      setSubCategoryOpen(false)
                      //setSubCategory_id()
                      setTimeout(() => {
                        setSubCategoryOpen(true)
                      }, 100)
                    }}
                  ></Select>
                )}
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-2'>
                  Sub Category Name
                </label>
                {!subCategoryLoading &&
                  subCategoryOpen &&
                  (categoryChange == true ? (
                    <Select
                      id='sub_category_id'
                      name='sub_category_id'
                      aria-label='Sub Category Type'
                      required
                      options={filteredSubCategory}
                      getOptionLabel={(x) => x?.sub_category_name}
                      getOptionValue={(x) => x?._id}
                      onChange={(selectedOption) =>
                        setSubCategory_id(selectedOption?._id)
                      }
                    ></Select>
                  ) : (
                    <Select
                      id='sub_category_id'
                      name='sub_category_id'
                      aria-label='Sub Category Type'
                      defaultValue={{
                        _id: default_sub_category_id,
                        sub_category_name: default_sub_category_name,
                      }}
                      required
                      options={filteredSubCategory}
                      getOptionLabel={(x) => x?.sub_category_name}
                      getOptionValue={(x) => x?._id}
                      onChange={(selectedOption) =>
                        setSubCategory_id(selectedOption?._id)
                      }
                    ></Select>
                  ))}
              </div>
            </div>

            <div className='flex gap-6 mt-6 justify-end'>
              <button
                className='px-10 py-2 border hover:bg-bgBtnInactive hover:text-btnInactiveColor rounded'
                onClick={() => setChildCategoryUpdateModal(false)}
                type='button'
              >
                Cancel
              </button>
              {loading == true ? (
                <div className='px-10 py-2 flex items-center justify-center bg-primaryColor text-white rounded'>
                  <MiniSpinner />
                </div>
              ) : (
                <button
                  className='px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
                  type='submit'
                >
                  Update
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateChildCategory
