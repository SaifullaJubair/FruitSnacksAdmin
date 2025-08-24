import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BASE_URL } from '../../utils/baseURL'
import { toast } from 'react-toastify'
import MiniSpinner from '../../shared/MiniSpinner/MiniSpinner'

const PhoneCredential = ({ refetch, initialAuthenticationData }) => {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDataPost = async (data) => {
    setLoading(true)
    if (initialAuthenticationData?._id) {
      try {
        const sendData = {
          _id: initialAuthenticationData?._id,

          otp_phone_user: data?.otp_phone_user,
          otp_phone_password: data?.otp_phone_password,
          otp_phone_body: data?.otp_phone_body,
        }

        const response = await fetch(
          `${BASE_URL}/authentication`,
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
              : 'Authentication Update successfully',
            {
              autoClose: 1000,
            }
          )

          refetch()
          setLoading(false)
          setIsEditing(false)
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
    } else {
      try {
        const sendData = {
          otp_phone_user: data?.otp_phone_user,
          otp_phone_password: data?.otp_phone_password,
          otp_phone_body: data?.otp_phone_body,
        }

        const response = await fetch(
          `${BASE_URL}/authentication`,
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
              : 'Authentication created successfully',
            {
              autoClose: 1000,
            }
          )

          refetch()
          setLoading(false)
          setIsEditing(false)
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
                OTP By Phone Credential
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
                    Otp Phone User
                  </label>
                  <input
                    {...register('otp_phone_user')}
                    defaultValue={initialAuthenticationData?.otp_phone_user}
                    type='text'
                    placeholder='Otp Phone User'
                    disabled={!isEditing}
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                </div>
                <div>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700'
                  >
                    Otp Phone Password
                  </label>
                  <input
                    {...register('otp_phone_password')}
                    defaultValue={initialAuthenticationData?.otp_phone_password}
                    type='text'
                    disabled={!isEditing}
                    placeholder='Otp Phone Password'
                    className='mt-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2 border-2'
                  />
                </div>
                <div>
                  <label
                    htmlFor=''
                    className='block text-xs font-medium text-gray-700'
                  >
                    Otp Phone Body
                  </label>
                  <input
                    {...register('otp_phone_body')}
                    defaultValue={initialAuthenticationData?.otp_phone_body}
                    type='text'
                    disabled={!isEditing}
                    placeholder='Otp Phone Body'
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
                        {initialAuthenticationData?._id ? (
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
                            Create
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

export default PhoneCredential
