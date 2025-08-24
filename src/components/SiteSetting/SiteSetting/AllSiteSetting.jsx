import AboutUs from "./AboutUs";
import CardInformation from "./CardInformation";
import SoftwareInformation from "./SoftwareInformation";
import StoreDetails from "./StoreDetails";

const AllSiteSetting = ({ refetch, getInitialCurrencyData }) => {
  return (
    <div>
      {/*   Software Information */}
      <div className="md:mt-10 mt-8 bg-slate-50 rounded-lg shadow-lg">
        <div className="p-5">
          <h4 className="font-semibold text-[20px] mt-2">
            Software Information
          </h4>
          <hr className="mt-2 mb-4" />
          <SoftwareInformation
            refetch={refetch}
            getInitialCurrencyData={getInitialCurrencyData}
          />
        </div>
      </div>
      {/* Store Details */}
      <div className="md:mt-10 mt-8 bg-slate-50 rounded-lg shadow-lg">
        <div className="p-5">
          <h4 className="font-semibold text-[20px] mt-2">Store Information</h4>
          <hr className="mt-2 mb-4" />
          <StoreDetails
            refetch={refetch}
            getInitialCurrencyData={getInitialCurrencyData}
          />
        </div>
      </div>
      {/* Store Details */}
      {/* <div className="md:mt-10 mt-8 bg-slate-50 rounded-lg shadow-lg">
        <div className="p-5">
          <h4 className="font-semibold text-[20px] mt-2">Card Informatoin</h4>
          <hr className="mt-2 mb-4" />
          <CardInformation
            refetch={refetch}
            getInitialCurrencyData={getInitialCurrencyData}
          />
        </div>
      </div> */}
      {/* About Us */}
      <div className="md:mt-10 mt-8 bg-slate-50 rounded-lg shadow-lg">
        <div className="p-5">
          <h4 className="font-semibold text-[20px] mt-2">About Us</h4>
          <hr className="mt-2 mb-4" />
          <AboutUs
            refetch={refetch}
            getInitialCurrencyData={getInitialCurrencyData}
          />
        </div>
      </div>
    </div>
  );
};

export default AllSiteSetting;
