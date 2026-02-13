/**
 * Data type selector (Observations, Forecast, Difference)
 */

import { NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
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
    <NativeSelectRoot size="lg" variant="subtle">
      <NativeSelectField
        value={dataType}
        onChange={handleChange}
        fontWeight="500"
        color="black"
      >
        {dataTypes.map((type) => {
          const info = DATA_TYPES[type];
          return (
            <option key={type} value={type}>
              {info.name}
            </option>
          );
        })}
      </NativeSelectField>
    </NativeSelectRoot>
  );
}

export default DataTypeSelector;
