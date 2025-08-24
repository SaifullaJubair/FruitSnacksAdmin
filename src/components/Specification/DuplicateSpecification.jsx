import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaPlus } from 'react-icons/fa'

import { RiDeleteBin6Line } from 'react-icons/ri'
import { RxCross1 } from 'react-icons/rx'
import { generateSlug } from '../../utils/generateSlug'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import Select from 'react-select'
import { BASE_URL } from '../../utils/baseURL'
import { toast } from 'react-toastify'

const DuplicateSpecification = ({
  setViewSpecificationDuplicateModal,
  getSpecificationDuplicateModalValue,
  categoryTypes,
  subCategoryTypes,
  refetch,
  user,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  //console.log(getSpecificationDuplicateModalValue)
  //get Default Value of Specification Values State
  const [defaultValues, setDefaultValues] = useState(
    getSpecificationDuplicateModalValue?.specification_values
  )

  //Category And SubCategory Sate management start....
  const [loading, setLoading] = useState(false)

  const [categoryId, setCategory_id] = useState(
    getSpecificationDuplicateModalValue?.category_id?._id
  )
  const [categoryChange, setCategoryChange] = useState(false)
  const [sub_category_id, setSubCategory_id] = useState(
    getSpecificationDuplicateModalValue?.sub_category_id?._id
  )
  const [subCategoryOpen, setSubCategoryOpen] = useState(true)
  const [filteredSubCategory, setFilteredSubCategory] = useState([])
  const default_category_id =
    getSpecificationDuplicateModalValue?.category_id?._id
  const default_category_name =
    getSpecificationDuplicateModalValue?.category_id?.category_name

  const default_sub_category_id =
    getSpecificationDuplicateModalValue?.sub_category_id?._id
  const default_sub_category_name =
    getSpecificationDuplicateModalValue?.sub_category_id?.sub_category_name

  useEffect(() => {
    const result = subCategoryTypes?.data?.filter(
      (item) => item?.category_id?._id === categoryId
    );
    setFilteredSubCategory(result)
  }, [subCategoryTypes?.data, categoryId])
  // Category And SubCategory Sate management End......

  //SpecificationValue State
  const [specificationValues, setSpecificationValue] = useState([
    { specification_value_name: '' },
  ])

  //Specification value and link handle
  const handleAddSpecificationValueField = () => {
    setSpecificationValue([
      ...specificationValues,
      { specification_value_name: '' },
    ])
  }
  const handleRemoveSpecificationValueField = () => {
    if (specificationValues.length > 1) {
      setSpecificationValue(specificationValues.slice(0, -1))
    }
  }
  const handleLinkValueChange = (index, event) => {
    const updatedValues = specificationValues.map((value, i) =>
      i === index
        ? { ...value, [event.target.name]: event.target.value }
        : value
    )
    setSpecificationValue(updatedValues)
  }

  //handle specification status Value State

  const handleSubCategoryActiveStatus = (id) => {
    const updatedItems = defaultValues.map((item) =>
      item._id === id
        ? {
            ...item,
            specification_value_status:
              item?.specification_value_status === 'in-active'
                ? 'active'
                : 'in-active',
          }
        : item
    )
    setDefaultValues(updatedItems)
  }
  const handleSubCategoryInActiveStatus = (id) => {
    const updatedItems = defaultValues.map((item) =>
      item._id === id
        ? {
            ...item,
            specification_value_status:
              item?.specification_value_status === 'active'
                ? 'in-active'
                : 'active',
          }
        : item
    )
    setDefaultValues(updatedItems)
  }

  // Handle Add Category
  const handleDataPost = async (data) => {
    setLoading(true)
    const cleanedSpecificationValues = specificationValues.filter(
      (item) => item.specification_value_name.trim() !== ''
    )

    const cleanedData = {
      ...data,
      specification_values: cleanedSpecificationValues,
    }

    if (!cleanedData.specification_value_name?.trim()) {
      delete cleanedData.specification_value_name
    }

    const combinedArray = defaultValues.concat(
      cleanedData?.specification_values
    )

    const sendData = {
      specification_publisher_id: user?._id,
      specification_slug: generateSlug(cleanedData?.specification_name),
      specification_name: cleanedData?.specification_name
        ? cleanedData?.specification_name
        : getSpecificationDuplicateModalValue?.specification_name,
      specification_serial: cleanedData?.specification_serial
        ? cleanedData?.specification_serial
        : getSpecificationDuplicateModalValue?.specification_serial,
      specification_status: cleanedData?.specification_status
        ? cleanedData?.specification_status
        : getSpecificationDuplicateModalValue?.specification_status,
      specification_show: cleanedData?.specification_show
        ? cleanedData?.specification_show
        : getSpecificationDuplicateModalValue?.specification_show,
      category_id: categoryId,
      sub_category_id: sub_category_id,
      specification_values: combinedArray?.map((item) => ({
        specification_value_name: item?.specification_value_name,
        specification_value_slug: generateSlug(item?.specification_value_name),
        specification_value_status: item?.specification_value_status,
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
          : 'Specification duplicate create successfully',
        {
          autoClose: 1000,
        }
      )
      refetch()
      setLoading(false)
      setViewSpecificationDuplicateModal(false)
    } else {
      toast.error(result?.message || 'Something went wrong', {
        autoClose: 1000,
      })
      setLoading(false)
    }
  }

  return (
    <div>
      <div>
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[650px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin'>
            <div className='flex items-center justify-between mt-4'>
              <h3
                className='text-[26px] font-bold text-gray-800 capitalize'
                id='modal-title '
              >
                Duplicate Specification List
              </h3>
              <button
                type='button'
                className='btn bg-white   p-1 absolute right-3 rounded-full top-3 hover:bg-bgBtnInactive hover:text-btnInactiveColor'
                onClick={() => setViewSpecificationDuplicateModal(false)}
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
                  defaultValue={
                    getSpecificationDuplicateModalValue?.specification_name
                  }
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
                  Specification Serial<span className='text-red-600'>*</span>
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
                  defaultValue={
                    getSpecificationDuplicateModalValue?.specification_serial
                  }
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
                    defaultValue={
                      getSpecificationDuplicateModalValue?.specification_status
                    }
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
                          defaultChecked={
                            getSpecificationDuplicateModalValue?.specification_show
                          }
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
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700 mb-2'
                  >
                    Category Name<span className='text-red-600'>*</span>
                  </label>

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

                      setTimeout(() => {
                        setSubCategoryOpen(true)
                      }, 100)
                    }}
                  ></Select>
                </div>

                <div>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700 mb-2'
                  >
                    Sub Category Name
                    <span className='font-bold'>(Optional)</span>
                  </label>

                  {subCategoryOpen &&
                    (categoryChange == true ? (
                      <Select
                        id='sub_category_id'
                        name='sub_category_id'
                        aria-label='Sub Category Type'
                        options={filteredSubCategory}
                        getOptionLabel={(x) => x?.sub_category_name}
                        getOptionValue={(x) => x?._id}
                        isClearable
                        onChange={(selectedOption) =>
                          setSubCategory_id(
                            selectedOption ? selectedOption?._id : null
                          )
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
                    ))}
                </div>
              </div>
              <div className='mt-3'>
                {getSpecificationDuplicateModalValue?.specification_values && (
                  <>
                    <p className='ml-1 font-semibold py-1 text-gray-700'>
                      Specification Values:
                    </p>
                    <table className='min-w-full divide-y-2 divide-gray-200 text-sm border border-gray-300 mt-4 rounded-xl'>
                      <thead>
                        <tr>
                          <th className='whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left'>
                            Specification Value Name
                          </th>

                          <th className='px-4 py-2 text-center font-medium text-gray-900 whitespace-nowrap'>
                            Specification Value Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className='divide-y divide-gray-200'>
                        {defaultValues?.map((value) => (
                          <tr key={value?._id}>
                            <td className='whitespace-nowrap  px-4 py-2 font-semibold text-justify'>
                              {value?.specification_value_name}
                            </td>

                            <td className='whitespace-nowrap px-4 py-2 space-x-1 flex items-center justify-center gap-4 '>
                              {value?.specification_value_status ===
                              'active' ? (
                                <button
                                  type='button'
                                  className='bg-bgBtnActive text-btnActiveColor px-[10px] py-[4px] rounded-[8px]'
                                  onClick={() =>
                                    handleSubCategoryActiveStatus(value?._id)
                                  }
                                >
                                  <span>Active</span>
                                </button>
                              ) : (
                                <button
                                  type='button'
                                  className='bg-bgBtnInactive text-btnInactiveColor px-[10px] py-[4px] rounded-[8px]'
                                  onClick={() =>
                                    handleSubCategoryInActiveStatus(value?._id)
                                  }
                                >
                                  <span>In-Active</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
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
                  {specificationValues?.map((value, index) => (
                    <div key={index} className='py-1'>
                      <input
                        name='specification_value_name'
                        type='text'
                        value={value?.specification_value_name}
                        onChange={(e) => handleLinkValueChange(index, e)}
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
                  onClick={() => setViewSpecificationDuplicateModal(false)}
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
                    Duplicate
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

export default DuplicateSpecification
