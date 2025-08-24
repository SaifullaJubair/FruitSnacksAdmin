import { useContext, useEffect, useState } from "react";
import AddChildCategory from "../../components/ChildCategory/AddChildCategory";
import ChildCategoryTable from "../../components/ChildCategory/ChildCategoryTable";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../utils/baseURL";

import useGetCategory from "../../hooks/useGetCategory";
import useGetSubCategory from "../../hooks/useGetSubCategory";
import { AuthContext } from "../../context/AuthProvider";
import useDebounced from "../../hooks/useDebounced";

const ChildCategoryPage = () => {
  const [childCategoryCreateModal, setChildCategoryCreateModal] =
    useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  // handle item search function....
  const searchText = useDebounced({ searchQuery: searchValue, delay: 500 });
  useEffect(() => {
    setSearchTerm(searchText);
  }, [searchText]);

  // handle item search function....
  const handleSearchValue = (value) => {
    setSearchValue(value);
    setLimit(10);
    setPage(1);
  };

  //data fetching of Child Category by TansTeck Query
  const {
    data: childCategoryTypes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/child_category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
    ],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/child_category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorData = await res.text(); // Get more info about the error
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error; // Rethrow to propagate the error to react-query
      }
    },
  });

  //
  //get Category data
  const { data: categoryTypes, isLoading: categoryLoading } = useGetCategory();
  const { data: subCategoryTypes, isLoading: subCategoryLoading } =
    useGetSubCategory();

  return (
    <>
      {user?.role_id?.child_category_show === true && (
        <div className="bg-white rounded-lg py-6 px-4 shadow">
          <div className="flex justify-between mt-6">
            <div>
              <h1 className="text-2xl">Child Category</h1>
            </div>
            {user?.role_id?.child_category_post === true && (
              <div>
                <button
                  type="button"
                  className="h-[40px] rounded-[8px] py-[10px] px-[14px] bg-primaryColor hover:bg-blue-500 duration-200  text-white text-sm"
                  onClick={() => setChildCategoryCreateModal(true)}
                >
                  Create Child
                </button>
              </div>
            )}
          </div>
          {/* search Child Category... */}
          <div className="mt-3">
            <input
              type="text"
              defaultValue={searchTerm}
              onChange={(e) => handleSearchValue(e.target.value)}
              placeholder="Search Child Category..."
              className="w-full sm:w-[350px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          {/* Show Child Category Create Modal */}
          {childCategoryCreateModal && (
            <AddChildCategory
              setChildCategoryCreateModal={setChildCategoryCreateModal}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              categoryLoading={categoryLoading}
              subCategoryLoading={subCategoryLoading}
              refetch={refetch}
              user={user}
            />
          )}
          {/* Show Child Category Table Create child Update and Delete */}
          <ChildCategoryTable
            childCategoryTypes={childCategoryTypes}
            setPage={setPage}
            setLimit={setLimit}
            setSearchTerm={setSearchTerm}
            refetch={refetch}
            totalData={childCategoryTypes.totalData}
            page={page}
            limit={limit}
            categoryTypes={categoryTypes}
            subCategoryTypes={subCategoryTypes}
            categoryLoading={categoryLoading}
            subCategoryLoading={subCategoryLoading}
            user={user}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
};

export default ChildCategoryPage;
