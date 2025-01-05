import {
  FormControl,
  Select,
} from "@chakra-ui/react";

interface FilterComponentProps {
  type: string | null | boolean | undefined;
  onFilterChange: (filterKey: string, filterValue: boolean | null) => void;
}

const BoolFilterComponent = ({ type, onFilterChange }: FilterComponentProps) => {
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === "all") {
      onFilterChange("all", null);
    } else {
      onFilterChange("is_available", selectedValue === "true");
    }
  };

  const placeholder = type === "User" ? "All Users" : "All Items";

  return (
    <FormControl w="100%" maxW="300px">
      <Select
        id="bool-filter"
        onChange={handleFilterChange}
        defaultValue="all"
      >
        <option value="all">{placeholder}</option>
        {type === "Item" && (
          <>
            <option value="true">Available Items</option>
            <option value="false">Unavailable Items</option>
          </>
        )}
        {type === "User" && (
          <>
            <option value="true">Part of Lab</option>
            <option value="false">Not Part of Lab</option>
          </>
        )}
      </Select>
    </FormControl>
  );
};

export default BoolFilterComponent;