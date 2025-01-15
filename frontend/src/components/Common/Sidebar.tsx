import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FiLogOut, FiMenu, FiSettings } from "react-icons/fi";

import Logo from "/assets/images/fastapi-logo.svg";
import type { UserPublic } from "../../client";
import useAuth from "../../hooks/useAuth";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue("ui.light", "ui.dark");
  const textColor = useColorModeValue("ui.dark", "ui.light");
  const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <>
      {/* Mobile */}
      <IconButton
        onClick={onOpen}
        display={{ base: "flex", md: "none" }}
        aria-label="Open Menu"
        position="absolute"
        fontSize="20px"
        m={4}
        icon={<FiMenu />}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="250px">
          <DrawerCloseButton />
          <DrawerBody py={8}>
            <Flex flexDir="column" justify="space-between" h="100%">
              <Box>
                <Image src={Logo} alt="logo" p={6} h="100px"/>
                <SidebarItems onClose={onClose} />
              </Box>
              <Box>
                {/* User Settings */}
                <Flex
                  as={Link}
                  to="/settings"
                  p={2}
                  color={textColor}
                  fontWeight="bold"
                  alignItems="center"
                  onClick={onClose}
                >
                  <Icon as={FiSettings} />
                  <Text ml={2}>User Settings</Text>
                </Flex>

                {/* Logout */}
                <Flex
                  as="button"
                  onClick={handleLogout}
                  p={2}
                  color="ui.danger"
                  fontWeight="bold"
                  alignItems="center"
                >
                  <FiLogOut />
                  <Text ml={2}>Log out</Text>
                </Flex>

                {/* Logged in as */}
                {currentUser?.email && (
                  <Text color={textColor} noOfLines={2} fontSize="sm" p={2}>
                    Logged in as: {currentUser.email}
                  </Text>
                )}
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop */}
      <Box
        bg={bgColor}
        p={3}
        h="100vh"
        position="sticky"
        top="0"
        borderRight="1px solid #E2E8F0"
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          flexDir="column"
          justify="space-between"
          bg={secBgColor}
          p={4}
          borderRadius={12}
          h="100%"
        >
          <Box>
            <Image src={Logo} alt="Logo" w="180px" maxW="2xs" p={6} h="100px"/>
            <SidebarItems />
          </Box>
          <Box>
            {/* User Settings */}
            <Flex
              as={Link}
              to="/settings"
              p={2}
              color={textColor}
              fontWeight="bold"
              alignItems="center"
              borderTop="1px solid #E2E8F0"
            >
              <Icon as={FiSettings} />
              <Text ml={2}>User Settings</Text>
            </Flex>

            {/* Logout */}
            <Flex
              as="button"
              onClick={handleLogout}
              p={2}
              color="ui.danger"
              fontWeight="bold"
              alignItems="center"
            >
              <FiLogOut />
              <Text ml={2}>Log out</Text>
            </Flex>

            {/* Logged in as */}
            {currentUser?.email && (
              <Text
                color={textColor}
                noOfLines={2}
                fontSize="sm"
                p={2}
                maxW="180px"
              >
                Logged in as: {currentUser.email}
              </Text>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;