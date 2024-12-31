import {
  FormControl,
  Select,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { RoomsService, RoomPublic } from "../../../client";

interface FilterUUIDProps {
  type: string | null | undefined;
  onFilterChange: (filterKey: string, filterValue: string | null) => void;
}

const UUIDFilterComponent = ({ onFilterChange }: FilterUUIDProps) => {
  const { data: rooms, isLoading: isRoomsLoading } = useQuery<RoomPublic[]>({
    queryKey: ["rooms"],
    queryFn: () => RoomsService.readRooms({}).then((response) => response.data),
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === "all") {
      onFilterChange("all", null);
    } else {
      onFilterChange("room_id", selectedValue);
    }
  };

  return (
    <FormControl>
      <Select
        id="room-filter"
        onChange={handleFilterChange}
        defaultValue="all"
        isDisabled={isRoomsLoading}
      >
        {/* Default Option: All */}
        <option value="all">All Rooms</option>

        {/* Room Filters */}
        {rooms?.map((room: RoomPublic) => (
          <option key={room.room_id} value={room.room_id}>
            {room.room_number} - {room.room_place}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default UUIDFilterComponent;