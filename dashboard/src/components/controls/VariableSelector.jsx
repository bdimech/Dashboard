/**
 * Variable selector dropdown
 */

import { NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import { VARIABLES, getVariableList } from '../../constants/variables';

function VariableSelector() {
  const variable = useDataStore((state) => state.variable);
  const setVariable = useDataStore((state) => state.setVariable);

  const variables = getVariableList();

  const handleChange = (e) => {
    setVariable(e.target.value);
  };

  return (
    <NativeSelectRoot size="lg" variant="subtle">
      <NativeSelectField
        value={variable}
        onChange={handleChange}
        fontWeight="500"
        color="black"
      >
        {variables.map((varName) => {
          const info = VARIABLES[varName];
          return (
            <option key={varName} value={varName}>
              {info.name}
            </option>
          );
        })}
      </NativeSelectField>
    </NativeSelectRoot>
  );
}

export default VariableSelector;
