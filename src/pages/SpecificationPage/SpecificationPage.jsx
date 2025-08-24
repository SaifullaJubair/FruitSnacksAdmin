import { useContext, useEffect, useState } from "react";
import SpecificationTable from "../../components/Specification/SpecificationTable";
import AddSpecification from "../../components/Specification/AddSpecification";
import useGetCategory from "../../hooks/useGetCategory";
import useGetSubCategory from "../../hooks/useGetSubCategory";

import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../utils/baseURL";
import { AuthContext } from "../../context/AuthProvider";
import useDebounced from "../../hooks/useDebounced";

const SpecificationPage = () => {
  const [showSpecificationCreateModal, setShowSpecificationCreateModal] =
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

  //get Category And Sub Category Data...
  const { data: categoryTypes } = useGetCategory();
  const { data: subCategoryTypes } = useGetSubCategory();

  //get Specification Values Data
  const {
    data: specificationValues = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/specification/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
    ],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/specification/dashboard?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
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
  //get category data

  return (
    <>
      {user?.role_id?.specification_show && (
        <div className="bg-white rounded-lg py-6 px-4 shadow">
          <div className="flex justify-between mt-6">
            <div>
              <h1 className="text-2xl">Specification List</h1>
            </div>
            {user?.role_id?.specification_post && (
              <div>
                <button
                  className="h-[40px] rounded-[8px] py-[10px] px-[14px] bg-primaryColor hover:bg-blue-500 duration-200  text-white text-sm"
                  onClick={() => setShowSpecificationCreateModal(true)}
                >
                  Create List
                </button>
              </div>
            )}
          </div>
          {/* search Specification... */}
          <div className="mt-3">
            <input
              type="text"
              defaultValue={searchTerm}
              onChange={(e) => handleSearchValue(e.target.value)}
              placeholder="Search Specification..."
              className="w-full sm:w-[350px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          {/* Show Specification tableDta show specification Value create and Update Specification list*/}

          {
            <SpecificationTable
              specificationValues={specificationValues}
              setPage={setPage}
              setLimit={setLimit}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              page={page}
              limit={limit}
              totalData={specificationValues?.totalData}
              setSearchTerm={setSearchTerm}
              refetch={refetch}
              user={user}
              isLoading={isLoading}
            />
          }

          {/* Create Specification List Modal */}
          {showSpecificationCreateModal && (
            <AddSpecification
              setShowSpecificationCreateModal={setShowSpecificationCreateModal}
              categoryTypes={categoryTypes}
              subCategoryTypes={subCategoryTypes}
              refetch={refetch}
              user={user}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SpecificationPage;
