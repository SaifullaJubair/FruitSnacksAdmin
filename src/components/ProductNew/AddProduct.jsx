import { useState } from "react";
import { TiTick } from "react-icons/ti";
import "./stepper.css";
import StepOne from "./stepOne/StepOne";
import StepThree from "./stepThree/StepThree";

// AddProduct = 2-step wizard since Phase 2 (variation-attribute-filter).
// Old StepTwo was the specifications picker — that backend module is retired;
// attribute assignment now happens inside StepOne (one unified attribute block
// that also drives the variation matrix). Step 2 is now the final media/SEO
// step (StepThree), so the form goes StepOne → StepThree.

const AddProduct = () => {
  const steps = ["", ""];

  const [currentStep, setCurrentStep] = useState(1);
  const [complete] = useState(false);

  // store all step one data
  const [stepOneData, setStepOneData] = useState();
  // attribute selection state shared across renders of StepOne
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  const [dataToSubmit, setDataToSubmit] = useState([]);

  // store all step two/final data (media + SEO)
  const [stepThreeData, setStepThreeData] = useState();

  return (
    <div className="mt-6 bg-white  rounded-lg shadow-xl sm:p-6 py-6">
      <div className="flex items-center justify-center">
        {steps?.map((step, i) => (
          <div
            key={i}
            className={`step-item    ${currentStep === i + 1 && "active"} ${
              (i + 1 < currentStep || complete) && "complete"
            }`}
          >
            <div className="step  text-gray-700 ">
              {i + 1 < currentStep || complete ? <TiTick size={24} /> : i + 1}
            </div>
            <p className="text-gray-500 text-xs ">{step}</p>
          </div>
        ))}
      </div>
      <div className="mx-4  mt-6 sm:mt-10">
        {currentStep == 2 ? (
          <StepThree
            setCurrentStep={setCurrentStep}
            stepThreeData={stepThreeData}
            stepOneData={stepOneData}
          />
        ) : (
          <StepOne
            stepOneData={stepOneData}
            setStepOneData={setStepOneData}
            setCurrentStep={setCurrentStep}
            selectedAttributes={selectedAttributes}
            selectedAttributeValues={selectedAttributeValues}
            setSelectedAttributes={setSelectedAttributes}
            setSelectedAttributeValues={setSelectedAttributeValues}
            setDataToSubmit={setDataToSubmit}
            dataToSubmit={dataToSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default AddProduct;
