/**
 * Data type selector (Observations, Forecast, Difference)
 */

import { Select } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import { DATA_TYPES, getDataTypeList } from '../../constants/variables';

function DataTypeSelector() {
  const dataType = useDataStore((state) => state.dataType);
  const setDataType = useDataStore((state) => state.setDataType);

  const dataTypes = getDataTypeList();

  const handleChange = (e) => {
    setDataType(e.target.value);
  };

  return (
    <Select
      value={dataType}
      onChange={handleChange}
      size="lg"
      variant="filled"
      fontWeight="500"
    >
      {dataTypes.map((type) => {
        const info = DATA_TYPES[type];
        return (
          <option key={type} value={type}>
            {info.name}
          </option>
        );
      })}
    </Select>
  );
}

export default DataTypeSelector;
