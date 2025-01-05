import { Input, Flex } from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder: string;
  onSearch: (searchTerm: string) => void;
  debounceDelay?: number;
}

const SearchBar = ({ placeholder, onSearch, debounceDelay = 300 }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, debounceDelay, onSearch]);

  return (
    <Flex w="100%" maxW="300px">
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Flex>
  );
};

export default SearchBar;