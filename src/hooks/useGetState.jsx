import { useQuery } from '@tanstack/react-query'
import { BASE_URL } from '../utils/baseURL'

const useGetState = ({country_id}) => {
  return useQuery({
    queryKey: [`/api/v1/state/${country_id}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/state/${country_id}`)
      const data = await res.json()
      return data
    },
  })
}

export default useGetState
