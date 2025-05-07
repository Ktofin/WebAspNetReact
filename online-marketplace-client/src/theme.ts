import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
    createTheme({
        palette: {
            mode,
            ...(mode === "light"
                ? {
                    primary: { main: "#7e57c2" },
                    secondary: { main: "#f06292" },
                    background: {
                        default: "#ffffff",
                        paper: "#fff"
                    },
                    text: {
                        primary: "#000",
                        secondary: "#333"
                    }
                }
                : {
                    primary: { main: "#9575cd" },
                    secondary: { main: "#f48fb1" },
                    background: {
                        default: "#121212",
                        paper: "#1e1e1e"
                    },
                    text: {
                        primary: "#fff",
                        secondary: "#ccc"
                    }
                })
        },
        typography: {
            fontFamily: '"Inter", sans-serif',
            button: {
                textTransform: "none"
            }
        },
        shape: {
            borderRadius: 10
        },
        components: {
            MuiButton: {
                defaultProps: {
                    variant: "contained"
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none"
                    }
                }
            }
        }
    });
