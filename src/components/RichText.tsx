import React from "react";
import Markdown from "react-native-markdown-display";
import type { TextStyle } from "react-native";

export type RichTextProps = {
  children: string;
  style?: TextStyle;
};

const markdownStyles = {
  body: {
    color: "#E8EAED",
    fontSize: 15,
    lineHeight: 20,
  },
  strong: {
    color: "#E8EAED",
    fontWeight: "700" as const,
  },
  em: {
    color: "#E8EAED",
    fontStyle: "italic" as const,
  },
  code_inline: {
    backgroundColor: "#2D2D2D",
    color: "#81C995",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  code_block: {
    backgroundColor: "#1A1D23",
    color: "#E8EAED",
    borderColor: "#3C4043",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  fence: {
    backgroundColor: "#1A1D23",
    color: "#E8EAED",
    borderColor: "#3C4043",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  bullet_list: {
    marginLeft: 8,
  },
  ordered_list: {
    marginLeft: 8,
  },
  list_item: {
    marginVertical: 2,
  },
  link: {
    color: "#8AB4F8",
  },
  heading1: {
    color: "#E8EAED",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700" as const,
  },
  heading2: {
    color: "#E8EAED",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700" as const,
  },
  heading3: {
    color: "#E8EAED",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
  },
};

export function RichText({ children, style }: RichTextProps) {
  return <Markdown style={{ ...markdownStyles, body: { ...markdownStyles.body, ...style } }}>{children}</Markdown>;
}
