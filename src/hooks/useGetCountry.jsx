import { useQuery } from "@tanstack/react-query"
import { BASE_URL } from "../utils/baseURL"


const useGetCountry = () => {
  return useQuery({
    queryKey: [`/api/v1/country`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/country`)
      const data = await res.json()
      return data
    },
  })
}

export default useGetCountry
