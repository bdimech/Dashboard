/**
 * Variable selector dropdown
 */

import { Select } from '@chakra-ui/react';
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
    <Select
      value={variable}
      onChange={handleChange}
      size="lg"
      variant="filled"
      fontWeight="500"
    >
      {variables.map((varName) => {
        const info = VARIABLES[varName];
        return (
          <option key={varName} value={varName}>
            {info.name}
          </option>
        );
      })}
    </Select>
  );
}

export default VariableSelector;
