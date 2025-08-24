import { RxCross1 } from 'react-icons/rx'

const ViewSpecificationValue = ({
  setViewSpecificationValueModal,
  getSpecificationValue,
}) => {
  console.log(getSpecificationValue)

  return (
    <div>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
        <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[650px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin'>
          <div className=''>
            <h3
              className='text-[20px] font-bold text-gray-800 capitalize text-center'
              id='modal-title '
            >
              View Specification
            </h3>
            <button
              type='button'
              className='btn bg-white   p-1 absolute right-1 rounded-full top-1 hover:bg-bgBtnInactive hover:text-btnInactiveColor'
              onClick={() => setViewSpecificationValueModal(false)}
            >
              {' '}
              <RxCross1 size={20}></RxCross1>
            </button>
          </div>
          <div className='text-sm mt-10 grid grid-cols-2 gap-4'>
            <div className='font-bold'>
              Specification Name :{' '}
              <span className='font-medium text-slate-700'>
                {getSpecificationValue?.specification_name}
              </span>
            </div>
            <div className='font-bold'>
              Specification Show :{' '}
              <label className='inline-flex items-center space-x-4 cursor-pointer dark:text-gray-800'>
                <span className='relative'>
                  <input
                    id={getSpecificationValue?._id}
                    type='checkbox'
                    readOnly
                    checked={getSpecificationValue?.specification_show}
                    className='hidden peer'
                  />
                  <div className='w-10 h-2 rounded-full shadow bg-slate-200 peer-checked:bg-bgBtnActive'></div>
                  <div className='absolute left-0 w-4 h-4 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto peer-checked:bg-primaryColor bg-white'></div>
                </span>
              </label>
            </div>
            <div className='font-bold'>
              Category :{' '}
              <span className='font-medium text-slate-700'>
                {getSpecificationValue?.category_id?.category_name}
              </span>
            </div>
            <div className='font-bold'>
              Specification Serial :{' '}
              <span className='font-medium text-slate-700'>
                {getSpecificationValue?.specification_serial}
              </span>
            </div>
            {getSpecificationValue?.sub_category_id?.sub_category_name && (
              <div className='font-bold'>
                Sub Category Name :{' '}
                <span className='font-medium text-slate-700'>
                  {getSpecificationValue?.sub_category_id?.sub_category_name}
                </span>
              </div>
            )}
          </div>
          <div className='mt-6'>
            <span className='font-medium'>Specification Value :</span>
            <div className='mx-auto dark:text-gray-800 mt-3'>
              <div className='overflow-x-auto'>
                <table className='w-full text-xs text-left whitespace-nowrap border'>
                  <thead>
                    <tr className='dark:bg-gray-300 border text-center'>
                      <th className='p-3 border'>Specification Value Name</th>
                      <th className='p-3 border'>Specification Value Status</th>
                    </tr>
                  </thead>
                  <tbody className='border-b dark:bg-gray-50 dark:border-gray-300 text-center'>
                    {getSpecificationValue?.specification_values?.map(
                      (values) => (
                        <tr key={values?._id}>
                          <td className='px-3 py-2 border'>
                            <p>{values?.specification_value_name}</p>
                          </td>

                          {values?.specification_value_status == 'active' ? (
                            <td className='px-3 py-2 border  text-green-800 font-medium'>
                              <p>{values?.specification_value_status}</p>
                            </td>
                          ) : (
                            <td className='px-3 py-2 border text-red-800 font-medium'>
                              <p>{values?.specification_value_status}</p>
                            </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewSpecificationValue
