import { useQuery } from '@tanstack/react-query'
import { BASE_URL } from './../utils/baseURL'

const useGetChildCategory = () => {
  return useQuery({
    queryKey: [`/api/v1/child_category`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/child_category`)
      const data = await res.json()
      return data
    },
  })
}

export default useGetChildCategory
