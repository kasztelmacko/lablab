import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { BsFilter } from "react-icons/bs";

interface FilterComponentProps {
  type: string;
  onFilterChange: (filterKey: string, filterValue: boolean | null) => void;
}

const FilterComponent = ({ type, onFilterChange }: FilterComponentProps) => {
  const handleFilterChange = (filterKey: string, filterValue: boolean | null) => {
    onFilterChange(filterKey, filterValue);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<BsFilter />}
        variant="unstyled"
        color="ui.main"
      >
        Filter
      </MenuButton>
      <MenuList>
        {/* Default Option: All */}
        <MenuItem onClick={() => handleFilterChange("all", null)}>
          All {type === "User" ? "Users" : type}
        </MenuItem>

        {type === "User" && (
          <>
            <MenuItem onClick={() => handleFilterChange("is_part_of_lab", true)}>
              Part of Lab
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange("is_part_of_lab", false)}>
              Not Part of Lab
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default FilterComponent;