import { RxCross1 } from 'react-icons/rx'

const ViewAttributeValue = ({
  setViewAttributeValueModal,
  attributesValue,
}) => {
  
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl w-[550px] p-6 max-h-[100vh] overflow-y-auto scrollbar-thin'>
        <div className=''>
          <h3
            className='text-[20px] font-bold text-gray-800 capitalize text-center'
            id='modal-title '
          >
            View Attribute Value
          </h3>
          <button
            type='button'
            className='btn bg-white   p-1 absolute right-1 rounded-full top-1 hover:bg-bgBtnInactive hover:text-btnInactiveColor'
            onClick={() => setViewAttributeValueModal(false)}
          >
            {' '}
            <RxCross1 size={20}></RxCross1>
          </button>
        </div>

        <div className=''>
          <div className='text-sm mt-10 grid grid-cols-2 gap-4'>
            <div className='font-bold'>
              Attribute Name :{' '}
              <span className='font-medium text-slate-700'>
                {attributesValue?.attribute_name}
              </span>
            </div>

            <div className='font-bold'>
              Category Name:{' '}
              <span className='font-medium text-slate-700'>
                {attributesValue?.category_id?.category_name}
              </span>
            </div>
            <div className='font-bold'>
              Attribute Status :{' '}
              <span className='font-medium text-slate-700'>
                {attributesValue?.attribute_status}
              </span>
            </div>
          </div>
          <div className='mt-6'>
            <span className='font-medium'>Attributes Value :</span>
            <div className='mx-auto dark:text-gray-800 mt-3'>
              <div className='overflow-x-auto'>
                <table className='w-full text-xs text-left whitespace-nowrap border'>
                  <thead>
                    <tr className='dark:bg-gray-300 border text-center'>
                      <th className='p-3 border'>Attribute Value Name</th>
                      <th className='p-3 border'>Attribute Value Code</th>
                      <th className='p-3 border'>Attribute Value Status</th>
                    </tr>
                  </thead>
                  <tbody className='border-b dark:bg-gray-50 dark:border-gray-300 text-center'>
                    {attributesValue?.attribute_values?.map((values) => (
                      <tr key={values?._id}>
                        <td className='px-3 py-2 border'>
                          <p>{values?.attribute_value_name}</p>
                        </td>
                        <td className='px-3 py-2 border'>
                          <p>{values?.attribute_value_code}</p>
                        </td>

                        {values?.attribute_value_status == 'active' ? (
                          <td className='px-3 py-2 border  text-green-800 font-medium'>
                            <p>{values?.attribute_value_status}</p>
                          </td>
                        ) : (
                          <td className='px-3 py-2 border text-red-800 font-medium'>
                            <p>{values?.attribute_value_status}</p>
                          </td>
                        )}
                      </tr>
                    ))}
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

export default ViewAttributeValue
