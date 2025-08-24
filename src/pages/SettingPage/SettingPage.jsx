import SettingS from '../../components/SiteSetting/SettingS'
import { IoSettings } from 'react-icons/io5'

const SettingPage = () => {
  return (
    <div className='flex justify-center '>
      <div>
        <div className='flex justify-between items-center mt-6 bg-white rounded-lg py-4 px-4 shadow'>
          <h1 className='text-2xl'>Site Setting</h1>
          <div>
            <IoSettings size={35} />
          </div>
        </div>
        <div className='my-6'>
          <SettingS />
        </div>
      </div>
    </div>
  )
}

export default SettingPage
