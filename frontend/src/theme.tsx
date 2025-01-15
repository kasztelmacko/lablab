import { extendTheme } from "@chakra-ui/react";

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.main",
  },
};

const theme = extendTheme({
  colors: {
    ui: {
      main: "#211f1f",
      secondary: "white",
      success: "#50ad58",
      danger: "#E53E3E",
      light: "white",
      dark: "#211f1f",
      darkSlate: "#211f1f",
      dim: "white",
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: "ui.secondary",
          color: "ui.dark",
          border: "2px solid",
          borderColor: "ui.dark",
          _hover: {
            backgroundColor: "ui.dark",
            color: "ui.secondary",
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: "ui.danger",
          color: "ui.light",
          _hover: {
            backgroundColor: "#a62d2d",
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: "ui.main",
            },
          },
        },
      },
    },
  },
});

export default theme;