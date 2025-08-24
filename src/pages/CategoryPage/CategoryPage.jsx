import { useContext, useEffect, useState } from "react";
import CategoryTable from "../../components/Category/CategoryTable";
import AddCategory from "../../components/Category/AddCategory";
import { BASE_URL } from "../../utils/baseURL";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "./../../context/AuthProvider";
import useDebounced from "../../hooks/useDebounced";

function CategoryPage() {
  const [categoryCreateModal, setCategoryCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

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

  // Fetch category data
  const {
    data: categoryTypes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
    ],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/category/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(
            `Error: ${res.status} ${res.statusText} - ${errorData}`
          );
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
  });

  return (
    <>
      {user?.role_id?.category_show === true && (
        <div className="bg-white rounded-lg py-6 px-4 shadow">
          <div className="flex justify-between mt-6">
            <div>
              <h1 className="text-2xl">Category</h1>
            </div>

            {user?.role_id?.category_post === true && (
              <div>
                <button
                  type="button"
                  className="rounded-[8px] py-[10px] px-[14px] bg-primaryColor hover:bg-blue-500 duration-200 text-white text-sm"
                  onClick={() => setCategoryCreateModal(true)}
                >
                  Create Category
                </button>
              </div>
            )}
          </div>
          {/* search Category... */}
          <div className="mt-3">
            <input
              type="text"
              defaultValue={searchTerm}
              onChange={(e) => handleSearchValue(e.target.value)}
              placeholder="Search Category..."
              className="w-full sm:w-[350px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          {/* Category Data Show and update and delete operation file */}

          <CategoryTable
            categoryTypes={categoryTypes}
            setPage={setPage}
            setLimit={setLimit}
            page={page}
            limit={limit}
            totalData={categoryTypes?.totalData}
            setSearchTerm={setSearchTerm}
            refetch={refetch}
            user={user}
            isLoading={isLoading}
          />

          {/* Create category modal */}
          {categoryCreateModal && (
            <AddCategory
              refetch={refetch}
              setCategoryCreateModal={setCategoryCreateModal}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
}

export default CategoryPage;
