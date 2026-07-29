export interface HermesTheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
}

export const darkTheme: HermesTheme = {
  background: "#0E1116",
  surface: "#1A1D23",
  text: "#E8EAED",
  textSecondary: "#9AA0A6",
  primary: "#8AB4F8",
  accent: "#F28B82",
  border: "#3C4043",
  error: "#F28B82",
  success: "#81C995",
};

export const lightTheme: HermesTheme = {
  background: "#FFFFFF",
  surface: "#F1F3F4",
  text: "#202124",
  textSecondary: "#5F6368",
  primary: "#1A73E8",
  accent: "#EA4335",
  border: "#DADCE0",
  error: "#EA4335",
  success: "#34A853",
};
