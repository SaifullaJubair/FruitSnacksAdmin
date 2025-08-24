import { useForm } from 'react-hook-form'
import { generateSlug } from '../../utils/generateSlug'
import { RxCross1 } from 'react-icons/rx'
import { FaPlus } from 'react-icons/fa'
import { useEffect, useState } from 'react'

import { RiDeleteBin6Line } from 'react-icons/ri'
import Select from 'react-select'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import { toast } from 'react-toastify'
import { BASE_URL } from '../../utils/baseURL'

const AddSpecification = ({
  setShowSpecificationCreateModal,
  categoryTypes,
  subCategoryTypes,
  refetch,
  user,
}) => {
  const [loading, setLoading] = useState(false)

  //state Management of category and Sub Category
  const [categoryId, setCategory_id] = useState('')
  const [sub_category_id, setSubCategory_id] = useState('')
  const [filteredSubCategory, setFilteredSubCategory] = useState([])
  const [subCategoryOpen, setSubCategoryOpen] = useState(true)
  //Specification Values State
  const [specificationValues, setSpecificationValue] = useState([
    { specification_value: '' },
  ])

  useEffect(() => {
    const result = subCategoryTypes.data?.filter(
      (item) => item?.category_id?._id === categoryId
    );
    setFilteredSubCategory(result)
  }, [subCategoryTypes, categoryId])

  //Form Handling State
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  //Specification values
  const handleAddSpecificationValueField = () => {
    setSpecificationValue([...specificationValues, { specification_value: '' }])
  }
  const handleRemoveSpecificationValueField = () => {
    if (specificationValues.length > 1) {
      setSpecificationValue(specificationValues.slice(0, -1))
    }
  }
  const handleSpecificationValueChange = (index, event) => {
    const updatedValues = specificationValues.map((value, i) =>
      i === index
        ? { ...value, [event.target.name]: event.target.value }
        : value
    )
    setSpecificationValue(updatedValues)
  }

  // Handle Add Category
  const handleDataPost = async (data) => {
    setLoading(true)
    try {
      const sendData = {
        specification_publisher_id: user?._id,

        specification_slug: generateSlug(data?.specification_name),
        specification_name: data?.specification_name,
        specification_serial: data?.specification_serial,
        specification_status: data?.specification_status,
        specification_show: data?.specification_show,
        category_id: categoryId,
        sub_category_id: sub_category_id,
        specification_values: specificationValues?.map((item) => ({
          specification_value_name: item?.specification_value,
          specification_value_slug: generateSlug(item?.specification_value),
        })),
      }

      const response = await fetch(
        `${BASE_URL}/specification`,
        {
          method: 'POST',
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
            : 'Specification created successfully',
          {
            autoClose: 1000,
          }
        )
        refetch()
        setLoading(false)
        setShowSpecificationCreateModal(false)
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
                id='modal-title '
              >
                Create Specification List
              </h3>
              <button
                type='button'
                className='btn bg-white p-1 absolute right-3 rounded-full top-3 hover:bg-bgBtnInactive hover:text-btnInactiveColor'
                onClick={() => setShowSpecificationCreateModal(false)}
              >
                {' '}
                <RxCross1 size={20}></RxCross1>
              </button>
            </div>

            <hr className='mt-2 mb-6' />

            <form onSubmit={handleSubmit(handleDataPost)} className=''>
              <div>
                <label
                  htmlFor=''
                  className='block text-xs font-medium text-gray-700'
                >
                  Specification Name<span className='text-red-600'>*</span>
                </label>

                <input
                  {...register('specification_name', {
                    required: 'Specification name is required',
                  })}
                  type='text'
                  placeholder='Specification Name'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
                {errors.specification_name && (
                  <p className='text-red-600'>
                    {errors.specification_name?.message}
                  </p>
                )}
              </div>
              <div className='mt-2'>
                <label
                  htmlFor=''
                  className='block text-xs font-medium text-gray-700'
                >
                  Specification Serial <span className='text-red-600'>*</span>
                </label>

                <input
                  {...register('specification_serial', {
                    required: 'Specification serial is required',
                    validate: (value) => {
                      if (value < 1) {
                        return 'serial must be greater than 0'
                      }
                    },
                  })}
                  type='number'
                  placeholder='Specification Serial'
                  className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                />
                {errors.specification_serial && (
                  <p className='text-red-600'>
                    {errors.specification_serial?.message}
                  </p>
                )}
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Specification Status<span className='text-red-600'>*</span>
                  </label>
                  <select
                    {...register('specification_status', {
                      required: 'Status is required',
                    })}
                    className='mt-2 rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2 w-full'
                  >
                    <option value='active'>Active</option>
                    <option value='in-active'>In-Active</option>
                  </select>

                  {errors.specification_status && (
                    <p className='text-red-600'>
                      {errors.specification_status?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-700'>
                    Specification show<span className='text-red-600'>*</span>
                  </label>
                  <div className='whitespace-nowrap px-4 py-2 text-gray-700 '>
                    <label
                      htmlFor='specification_show'
                      className='inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800'
                    >
                      <span className='relative mt-2'>
                        <input
                          id='specification_show'
                          type='checkbox'
                          className='hidden peer'
                          {...register('specification_show')}
                        />
                        <div className='w-10 h-4 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive '></div>
                        <div className='absolute left-0 w-6 h-6 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white'></div>
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-700 mb-2'>
                    Category Name<span className='text-red-600'>*</span>
                  </label>

                  <Select
                    id='category_id'
                    name='category_id'
                    required
                    aria-label='Category Type'
                    options={categoryTypes?.data}
                    getOptionLabel={(x) => x?.category_name}
                    getOptionValue={(x) => x?._id}
                    onChange={(selectedOption) => {
                      setCategory_id(selectedOption?._id)
                      setSubCategoryOpen(false)
                      setSubCategory_id()
                      setTimeout(() => {
                        setSubCategoryOpen(true)
                      }, 100)
                    }}
                  ></Select>

                  {errors._id && (
                    <p className='text-red-600'>{errors._id?.message}</p>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-700 mb-2'>
                    Sub Category Name{' '}
                    <span className='font-bold'>(Optional)</span>
                  </label>
                  {subCategoryOpen && (
                    <Select
                      id='sub_category_id'
                      name='sub_category_id'
                      aria-label='Sub Category Type'
                      isClearable
                      options={filteredSubCategory}
                      getOptionLabel={(x) => x?.sub_category_name}
                      getOptionValue={(x) => x?._id}
                      onChange={(selectedOption) =>
                        setSubCategory_id(
                          selectedOption ? selectedOption?._id : null
                        )
                      }
                    ></Select>
                  )}
                  {errors._id && (
                    <p className='text-red-600'>{errors._id?.message}</p>
                  )}
                </div>
              </div>
              <div className='mt-4'>
                <div className='flex justify-end'>
                  <button
                    onClick={handleAddSpecificationValueField}
                    type='button'
                    className='border px-2 py-2 rounded mr-2 hover:bg-bgBtnActive hover:text-btnActiveColor '
                  >
                    <FaPlus size={18} />
                  </button>
                  <button
                    onClick={handleRemoveSpecificationValueField}
                    type='button'
                    className='border px-2 py-2 rounded hover:bg-bgBtnInactive hover:text-bgDelete'
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                </div>

                <div className='mt-2'>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700 mb-2'
                  >
                    Specification Values
                  </label>
                  {specificationValues.map((value, index) => (
                    <div key={index} className='py-1'>
                      <input
                        name='specification_value'
                        required
                        type='text'
                        value={value?.specification_value}
                        onChange={(e) =>
                          handleSpecificationValueChange(index, e)
                        }
                        placeholder='Specification Value'
                        className='w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex gap-6 mt-6 justify-end'>
                <button
                  className='px-10 py-2 border hover:bg-bgBtnInactive hover:text-btnInactiveColor rounded '
                  onClick={() => setShowSpecificationCreateModal(false)}
                >
                  Cancel
                </button>
                {loading == true ? (
                  <div className='px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded'>
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    className='px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200  text-white rounded'
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

export default AddSpecification
