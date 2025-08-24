import { BsBagPlusFill } from "react-icons/bs";
import { BASE_URL } from "../../utils/baseURL";
import { useQuery } from "@tanstack/react-query";
import { LoaderOverlay } from "../../components/common/loader/LoderOverley";
import { Link } from "react-router-dom";

const DashBoard = () => {
  //data fetching of Dashboard by Tans Tack Query
  const { data: getDashboardData, isLoading } = useQuery({
    queryKey: [`/api/v1/dashboard`],
    queryFn: async () => {
      try {
        const res = await fetch(`${BASE_URL}/dashboard`, {
          credentials: "include",
        });

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

  if (isLoading) {
    return <LoaderOverlay />;
  }

  return (
    <div>
      {" "}
      <section className="grid sm:grid-cols-4 gap-8">
        {getDashboardData?.data?.map((data, index) => (
          <Link
            to={data?.url_link}
            key={index}
            className="flex items-center p-6 rounded-sm shadow-md bg-[#e9fcf8]"
          >
            <div className="bg-blue-100 w-[50px] h-[50px] flex items-center justify-center rounded-full">
              <BsBagPlusFill size={25} className="text-red-400" />
            </div>
            <div className="ml-10">
              <p
                className="font-semibold text-xl  space-x-1 "
               
              >
                {data?.title}
              </p>
              <p
                className="text-xl mt-1.5"
                 
              >
                {data?.number}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default DashBoard;
 