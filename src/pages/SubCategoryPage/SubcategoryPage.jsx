import { useQuery } from '@tanstack/react-query'

import AddSubCategory from '../../components/SubCategory/AddSubCategory'
import SubCategoryTable from '../../components/SubCategory/SubCategoryTable'
import { useContext, useEffect, useState } from 'react'
import { BASE_URL } from '../../utils/baseURL'
import { AuthContext } from '../../context/AuthProvider'
import useDebounced from '../../hooks/useDebounced'
const SubcategoryPage = () => {
  const [subCategoryCreateModal, setSubCategoryCreateModal] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useContext(AuthContext)

  // handle item search function....
  const searchText = useDebounced({ searchQuery: searchValue, delay: 500 })
  useEffect(() => {
    setSearchTerm(searchText)
  }, [searchText])

  // handle item search function....
  const handleSubCategorySearchValue = (value) => {
    setSearchValue(value)
    setLimit(10)
    setPage(1)
  }

  const {
    data: subCategoryTypes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/sub_category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
    ],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/sub_category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
          {
            credentials: 'include',
          }
        )

        if (!res.ok) {
          const errorData = await res.text() // Get more info about the error
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          )
        }

        const data = await res.json()
        return data
      } catch (error) {
        console.error('Fetch error:', error)
        throw error // Rethrow to propagate the error to react-query
      }
    },
  })

  return (
    <>
      {user?.role_id?.sub_category_show === true && (
        <div className="bg-white rounded-lg py-6 px-4 shadow">
          <div className="flex justify-between mt-6">
            <div>
              <h1 className="text-2xl">Sub Category</h1>
            </div>

            {user?.role_id?.sub_category_post === true && (
              <div>
                <button
                  className="h-[40px] rounded-[8px] py-[10px] px-[14px] bg-primaryColor hover:bg-blue-500 duration-200  text-white text-sm"
                  onClick={() => setSubCategoryCreateModal(true)}
                >
                  Create Sub Category
                </button>
              </div>
            )}
          </div>
          {/* search Sub Category... */}
          <div className="mt-3">
            <input
              type="text"
              defaultValue={searchTerm}
              onChange={(e) => handleSubCategorySearchValue(e.target.value)}
              placeholder="Search Sub Category..."
              className="w-full sm:w-[350px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          {/*Sub Category Data Show and update and delete operation file */}
          <SubCategoryTable
            refetch={refetch}
            subCategoryTypes={subCategoryTypes}
            setSearchTerm={setSearchTerm}
            setLimit={setLimit}
            setPage={setPage}
            page={page}
            limit={limit}
            totalData={subCategoryTypes.totalData}
            user={user}
            isLoading={isLoading}
          />

          {/* Create Sub Category modal */}
          {subCategoryCreateModal && (
            <AddSubCategory
              setSubCategoryCreateModal={setSubCategoryCreateModal}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
}

export default SubcategoryPage
