import { useState } from 'react'
import { useForm } from 'react-hook-form'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'
import { BASE_URL } from '../../utils/baseURL'
import { toast } from 'react-toastify'

const CurrencySymbol = ({ refetch, getInitialCurrencyData }) => {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDataPost = async (data) => {
    setLoading(true)
    try {
      const sendData = {
        _id: getInitialCurrencyData?._id,
        currency_symbol: data?.currency_symbol,
        currency_code: data?.currency_code,
      }

      const response = await fetch(
        `${BASE_URL}/setting`,
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
          result?.message ? result?.message : 'Currency Update successfully',
          {
            autoClose: 1000,
          }
        )
        refetch()
        setLoading(false)
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
      {' '}
      <div>
        <div>
          <div className='relative overflow-hidden text-left bg-white rounded-lg shadow-xl  p-6'>
            <div className=' mt-4'>
              <h3
                className='text-[26px] font-bold text-gray-800 capitalize'
                id='modal-title'
              >
                Change Currency
              </h3>
            </div>

            <hr className='mt-2 mb-6' />

            <form onSubmit={handleSubmit(handleDataPost)} className=''>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700'
                  >
                    Currency Symbol
                  </label>
                  <input
                    {...register('currency_symbol')}
                    defaultValue={getInitialCurrencyData?.currency_symbol}
                    type='text'
                    placeholder='Currency Symbol'
                    disabled={!isEditing}
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                </div>
                <div>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700'
                  >
                    Currency Code
                  </label>
                  <input
                    {...register('currency_code')}
                    defaultValue={getInitialCurrencyData?.currency_code}
                    type='text'
                    disabled={!isEditing}
                    placeholder='Currency Code'
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                </div>
              </div>

              <div className='flex gap-6 mt-6 justify-end'>
                {isEditing === true ? (
                  <>
                    <button
                      className='px-10 py-2 border rounded hover:bg-bgBtnInactive hover:text-btnInactiveColor'
                      type='button'
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    {loading == true ? (
                      <div className='px-10 py-2 flex items-center justify-center  bg-primaryColor text-white rounded'>
                        <MiniSpinner />
                      </div>
                    ) : (
                      <>
                        {getInitialCurrencyData?._id ? (
                          <button
                            className='px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
                            type='submit'
                          >
                            Update
                          </button>
                        ) : (
                          <button
                            className='px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
                            type='submit'
                          >
                            Save
                          </button>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <button
                    className='px-10 py-2  bg-primaryColor hover:bg-blue-500 duration-200 text-white rounded'
                    type='button'
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
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

export default CurrencySymbol
