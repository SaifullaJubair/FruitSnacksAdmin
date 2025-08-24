import { useQuery } from '@tanstack/react-query'
import { BASE_URL } from '../utils/baseURL'

const UseGetPreOrderProduct = ({ page, limit, searchTerm, panel_owner_id }) => {
  return useQuery({
    queryKey: [
      `/api/v1/pre_order/dashboard/add_free_order_product?page=${page}&limit=${limit}&searchTerm=${searchTerm}&panel_owner_id=${panel_owner_id}`,
    ],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/pre_order/dashboard/add_free_order_product?page=${page}&limit=${limit}&searchTerm=${searchTerm}&panel_owner_id=${panel_owner_id}`,
        {
          credentials: "include",
        }
      )
      const data = await res.json()
      return data
    },
  })
}

export default UseGetPreOrderProduct
