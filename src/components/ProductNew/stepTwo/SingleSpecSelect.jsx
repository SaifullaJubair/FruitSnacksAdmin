import Select from "react-select";

const SingleSpecSelect = ({
  setSelectedSpecifications,
  specification,
  selectedSpecifications,
}) => {
  // Function to handle selecting a single value
  const handleSelectChange = (specId, specName, selectedOption) => {
    const selectedValue = {
      _id: selectedOption?._id,
      attribute_value_name: selectedOption?.attribute_value_name,
    };

    setSelectedSpecifications((prevState) => {
      const specIndex = prevState?.findIndex((spec) => spec?._id === specId);

      if (specIndex > -1) {
        // Specification exists, update the value
        const updatedSpec = {
          ...prevState[specIndex],
          attribute_values: [selectedValue], // Only one value allowed
        };
        return [
          ...prevState.slice(0, specIndex),
          updatedSpec,
          ...prevState.slice(specIndex + 1),
        ];
      } else {
        // Specification doesn't exist, add it with the selected value
        return [
          ...prevState,
          {
            _id: specId,
            attribute_name: specName,
            attribute_values: [selectedValue], // Only one value allowed
          },
        ];
      }
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.isArray(specification) &&
        specification.map((spec) => {
          // Find the selected specification for the current spec
          const selectedSpec = selectedSpecifications.find(
            (s) => s._id === spec._id,
          );

          return (
            <div key={spec?._id}>
              <h3 className="font-semibold mb-1">{spec?.attribute_name}</h3>
              <Select
                options={spec?.attribute_values}
                getOptionLabel={(option) => option?.attribute_value_name}
                getOptionValue={(option) => option?._id}
                isClearable
                onChange={(selectedOption) =>
                  handleSelectChange(
                    spec?._id,
                    spec?.attribute_name,
                    selectedOption,
                  )
                }
                placeholder={`Select ${spec?.attribute_name}`}
                className="mb-3"
                value={
                  selectedSpec?.attribute_values?.length
                    ? {
                        _id: selectedSpec.attribute_values[0]._id,
                        attribute_value_name:
                          selectedSpec.attribute_values[0].attribute_value_name,
                        attribute_value_code:
                          selectedSpec.attribute_values[0].attribute_value_code,
                      }
                    : null
                }
                // Show color box if attribute_value_code exists
                formatOptionLabel={(option) => (
                  <div className="flex items-center gap-2">
                    {option.attribute_value_code && (
                      <span
                        className="w-4 h-4 rounded-sm border"
                        style={{ backgroundColor: option.attribute_value_code }}
                      ></span>
                    )}
                    <span>{option.attribute_value_name}</span>
                  </div>
                )}
              />
            </div>
          );
        })}
    </div>
  );
};

export default SingleSpecSelect;
