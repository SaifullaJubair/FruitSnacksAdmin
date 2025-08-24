import { RxCross1 } from 'react-icons/rx'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { generateSlug } from './../../utils/generateSlug'
import { BASE_URL } from '../../utils/baseURL'
import { GrUpdate } from 'react-icons/gr'
import { Tooltip } from 'react-tooltip'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import { toast } from 'react-toastify'
import Select from 'react-select'
import useGetCategory from '../../hooks/useGetCategory'

const UpdateSubCateGory = ({
  setSubcategoryUpdateModal,
  subCategoryUpdateData,
  refetch,
  user,
}) => {
  const [loading, setLoading] = useState(false)
  const [category_id, setCategory_id] = useState(
    subCategoryUpdateData?.category_id?._id
  )
  const { register, handleSubmit } = useForm()

  const [imagePreview, setImagePreview] = useState(
    subCategoryUpdateData?.sub_category_logo
  )
  console.log(category_id)
  console.log(subCategoryUpdateData)

  //handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }
  //get Category data
  const { data: categoryTypes = [], isLoading } = useGetCategory()

  // Handle Update SUbCategory
  const handleDataPost = async (data) => {
    if (data?.sub_category_logo[0]) {
      setLoading(true)
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'sub_category_logo') {
          formData.append(key, data?.sub_category_logo[0])
        } else formData.append(key, value)
      })

      formData.append(
        'sub_category_logo_key',
        subCategoryUpdateData?.sub_category_logo_key
      )
      formData.append('category_id', category_id)

      const sub_category_slug = generateSlug(
        data?.sub_category_name
          ? data?.sub_category_name
          : subCategoryUpdateData?.sub_category_name
      )
      formData.append('sub_category_slug', sub_category_slug)
      formData.append('_id', subCategoryUpdateData?._id)
      formData.append('sub_category_updated_by', user?._id)
      const response = await fetch(
        `${BASE_URL}/sub_category`,
        {
          method: 'PATCH',
          credentials: 'include',
          body: formData,
        }
      )
      const result = await response.json()
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message
            ? result?.message
            : 'Sub Category update successfully',
          {
            autoClose: 1000,
          }
        )
        refetch()
        setLoading(false)
        setSubcategoryUpdateModal(false)
      } else {
        toast.error(result?.message || 'Something went wrong', {
          autoClose: 1000,
        })
        setLoading(false)
      }
    } else {
      setLoading(true)
      const sendData = {
        _id: subCategoryUpdateData?._id,
        sub_category_updated_by: user?._id,
        sub_category_name: data?.sub_category_name
          ? data?.sub_category_name
          : subCategoryUpdateData?.sub_category_name,
        sub_category_serial: data?.sub_category_serial
          ? data?.sub_category_serial
          : subCategoryUpdateData?.subCategoryUpdateData,
        sub_category_logo: subCategoryUpdateData?.sub_category_logo,
        sub_category_status: data?.sub_category_status
          ? data?.sub_category_status
          : subCategoryUpdateData?.sub_category_status,

        category_logo_key: subCategoryUpdateData?.sub_category_logo_key,
        sub_category_slug: generateSlug(
          data?.sub_category_name
            ? data?.sub_category_name
            : subCategoryUpdateData?.sub_category_name
        ),
        category_id: category_id
          ? category_id
          : subCategoryUpdateData?.category_id?._id,
      }
      const response = await fetch(
        `${BASE_URL}/sub_category`,
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
            : 'Sub Category update successfully',
          {
            autoClose: 1000,
          }
        )
        refetch()
        setLoading(false)
        setSubcategoryUpdateModal(false)
      } else {
        toast.error(result?.message || 'Something went wrong', {
          autoClose: 1000,
        })
        setLoading(false)
      }
    }
  }
  console.log(subCategoryUpdateData)

  return (
    <div>
      <div>
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin'>
            <div className='flex items-center justify-between mt-4'>
              <h3
                className='text-[26px] font-bold text-gray-800 capitalize'
                id='modal-title'
              >
                Update Sub Category
              </h3>
              <button
                type='button'
                className='btn bg-white hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3'
                onClick={() => setSubcategoryUpdateModal(false)}
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
                  Sub Category Name
                </label>

                <input
                  {...register('sub_category_name')}
                  type='text'
                  placeholder='Sub Category Name'
                  defaultValue={subCategoryUpdateData?.sub_category_name}
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
              </div>

              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Sub Category Status
                  </label>
                  <select
                    {...register('sub_category_status')}
                    defaultValue={subCategoryUpdateData?.sub_category_status}
                    className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                  >
                    <option value='active'>Active</option>
                    <option value='in-active'>In-Active</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Sub Category serial
                  </label>
                  <input
                    {...register('sub_category_serial', {
                      validate: (value) => {
                        if (value < 1) {
                          return 'serial must be greater than 0'
                        }
                      },
                    })}
                    type='number'
                    placeholder='Sub Category serial'
                    defaultValue={subCategoryUpdateData?.sub_category_serial}
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                </div>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 mt-2'>
                  Category Name
                </label>
                {!isLoading && (
                  <Select
                    defaultValue={{
                      _id: subCategoryUpdateData?.category_id?._id,
                      category_name:
                        subCategoryUpdateData?.category_id?.category_name,
                    }}
                    id='category_id'
                    name='category_id'
                    aria-label='Category Type'
                    options={categoryTypes?.data}
                    getOptionLabel={(x) => x?.category_name}
                    getOptionValue={(x) => x?._id}
                    onChange={(selectedOption) =>
                      setCategory_id(selectedOption?._id)
                    }
                  ></Select>
                )}
              </div>
              <div className='mt-6 relative'>
                {imagePreview && (
                  <>
                    <div className='relative'>
                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='w-full h-64 object-cover my-2 rounded '
                      />
                    </div>
                  </>
                )}
                <>
                  <label
                    className='p-2  bg-primaryColor  rounded cursor-pointer absolute top-2  right-2 text-white border '
                    htmlFor='sub_category_logo'
                    data-tooltip-id='sub_category-image'
                    data-tooltip-content='Upload Your Image'
                  >
                    <GrUpdate size={25} />
                    <Tooltip id='sub_category-image' />
                    <Tooltip />
                  </label>

                  <input
                    {...register('sub_category_logo', {
                      valiDate: {
                        isImage: (value) =>
                          (value[0] && value[0].type.startsWith('image/')) ||
                          'Only image files are allowed',
                      },
                    })}
                    accept='image/*'
                    type='file'
                    id='sub_category_logo'
                    className=' sm:text-sm p-0.5 file:cursor-pointer file:bg-primaryColor file:text-white  file:border-none file:rounded file:px-2 file:py-1.5'
                    onChange={handleImageChange}
                  />
                  <p className='text-xs text-[#C9CACA]  mt-1 text-end'>
                    Upload 300x300 pixel images in PNG, JPG, or WebP format (max
                    1 MB).
                  </p>
                </>
              </div>

              <div className='flex gap-8 mt-6 justify-end'>
                <button
                  className='px-10 py-2 border-2  rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor '
                  onClick={() => setSubcategoryUpdateModal(false)}
                  type='button'
                >
                  Cancel
                </button>
                {loading ? (
                  <div className='px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded'>
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className='px-10 py-2   bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
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
    </div>
  )
}

export default UpdateSubCateGory
