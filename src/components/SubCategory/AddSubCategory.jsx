import { RxCross1 } from 'react-icons/rx'
import { RiImageAddFill } from 'react-icons/ri'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { generateSlug } from '../../utils/generateSlug'
import { BASE_URL } from '../../utils/baseURL'
import { toast } from 'react-toastify'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import { useQuery } from '@tanstack/react-query'
import Select from 'react-select'

const AddSubCategory = ({ setSubCategoryCreateModal, refetch, user }) => {
  const [loading, setLoading] = useState(false)
  const [sub_category_logo, setSub_category_logo] = useState()
  const [category_id, setCategory_id] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [imagePreview, setImagePreview] = useState(null)
  //

  //get Category data
  const { data: categoryTypes = [], isLoading } = useQuery({
    queryFn: async () => {
      try {
        const res = await fetch(`${BASE_URL}/category`, {
          credentials: 'include',
        })

        if (!res.ok) {
          const errorData = await res.text() // Get more info about the error
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          )
        }

        const data = await res.json()
        return data
      } catch (error) {
        console.error('Fetch error:', error)
        throw error // Rethrow to propagate the error to react-query
      }
    },
  })

  //Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setSub_category_logo(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle Add Sub Category
  const handleDataPost = async (data) => {
    console.log(data)

    setLoading(true)
    try {
      const sub_category_slug = generateSlug(data?.sub_category_name)

      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'sub_category_logo') {
          formData.append(key, sub_category_logo)
        } else {
          formData.append(key, value)
        }
      })

      formData.append('sub_category_slug', sub_category_slug)
      formData.append('category_id', category_id)
      formData.append('sub_category_publisher_id', user?._id)
      const response = await fetch(
        `${BASE_URL}/sub_category`,
        {
          method: 'POST',
          credentials: 'include',

          body: formData,
        }
      )
      const result = await response.json()
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : 'Category created successfully',
          {
            autoClose: 1000,
          }
        )
        refetch()
        setLoading(false)
        setSubCategoryCreateModal(false)
      } else {
        toast.error(result?.message || 'Something went wrong', {
          autoClose: 1000,
        })
        setLoading(false)
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      })
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
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
                Create Sub Category
              </h3>
              <button
                type='button'
                className='btn bg-white  hover:bg-bgBtnInactive hover:text-btnInactiveColor  p-1 absolute right-3 rounded-full top-3'
                onClick={() => setSubCategoryCreateModal(false)}
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
                  Sub Category Name <span className='text-red-600'>*</span>
                </label>

                <input
                  {...register('sub_category_name', {
                    required: 'Sub category name is required',
                  })}
                  type='text'
                  placeholder='Sub Category Name'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
                {errors.sub_category_name && (
                  <p className='text-red-600'>
                    {errors.sub_category_name?.message}
                  </p>
                )}
              </div>

              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Sub Category Status <span className='text-red-600'>*</span>
                  </label>
                  <select
                    {...register('sub_category_status', {
                      required: 'Sub Category Status is required',
                    })}
                    className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                  >
                    <option value='active'>Active</option>
                    <option value='in-active'>In-Active</option>
                  </select>

                  {errors.sub_category_status && (
                    <p className='text-red-600'>
                      {errors.sub_category_status?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Sub Category serial<span className='text-red-600'>*</span>
                  </label>
                  <input
                    {...register('sub_category_serial', {
                      required: 'Sub category Serial is required',
                      validate: (value) => {
                        if (value < 1) {
                          return 'serial must be greater than 0'
                        }
                      },
                    })}
                    type='number'
                    placeholder='Sub Category serial'
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                  {errors.sub_category_serial && (
                    <p className='text-red-600'>
                      {errors.sub_category_serial?.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 mt-2'>
                  Category Name <span className='text-red-600'>*</span>
                </label>

                {!isLoading && (
                  <Select
                    id='category_id'
                    name='category_id'
                    // defaultValue={{
                    //   _id: brandUpdateData?.category_id?._id,
                    //   category_name:
                    //     brandUpdateData?.category_id?.category_name,
                    // }}
                    required
                    aria-label='Category Type'
                    options={categoryTypes?.data}
                    getOptionLabel={(x) => x?.category_name}
                    getOptionValue={(x) => x?._id}
                    onChange={(selectedOption) =>
                      setCategory_id(selectedOption?._id)
                    }
                  ></Select>
                )}
                {errors._id && (
                  <p className='text-red-600'>{errors._id?.message}</p>
                )}
              </div>
              <div className='mt-6'>
                {imagePreview ? (
                  <>
                    <div className='relative'>
                      <button
                        type='button'
                        className='btn bg-bgBtnInactive border p-1 absolute right-1 rounded-full top-1 text-btnInactiveColor '
                        onClick={() => setImagePreview(false)}
                      >
                        {' '}
                        <RxCross1 size={15}></RxCross1>
                      </button>

                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='w-full h-64 object-cover my-2 rounded '
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label
                      className='mt-4 w-full h-[160px] bg-gray-100 border-dashed border flex justify-center items-center rounded cursor-pointer'
                      htmlFor='file-input'
                    >
                      <div className='flex flex-col items-center justify-center '>
                        <div>
                          <RiImageAddFill size={25} />
                        </div>
                        <p className='mt-2 text-[#C9CACA]' type=''>
                          upload Logo
                        </p>
                      </div>
                    </label>
                    <input
                      {...register('sub_category_logo', {
                        required: 'Image is Required',
                        valiDate: {
                          isImage: (value) =>
                            (value[0] && value[0].type.startsWith('image/')) ||
                            'Only image files are allowed',
                        },
                      })}
                      accept='image/*'
                      type='file'
                      id='file-input'
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <p className='text-xs text-[#C9CACA]  mt-1 text-end'>
                      Upload 300x300 pixel images in PNG, JPG, or WebP format
                      (max 1 MB).
                    </p>
                    {errors.sub_category_logo && (
                      <p className='text-red-600'>
                        {errors.sub_category_logo?.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className='flex gap-8 mt-6 justify-end'>
                <button
                  className='px-10 py-2 border-2  rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor'
                  onClick={() => setSubCategoryCreateModal(false)}
                  type='button'
                >
                  Cancel
                </button>
                {loading == true ? (
                  <div className='px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded'>
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className='px-10 py-2   bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
                    type='submit'
                  >
                    Create
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

export default AddSubCategory
