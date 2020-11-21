export const DEFAULT_THEME = "THEME_ONE";
export const DEFAULT_LAYOUT = "LAYOUT_ONE";

export const THEMES = {
  THEME_ONE: {
    CLASS: "theme-one",
    NAME: "Theme One",
    COLOR: "#5dc3c2",
  },
  THEME_TWO: {
    CLASS: "theme-two",
    NAME: "Theme Two",
    COLOR: "#d67172",
  },
};

export const CONTENT_LABEL = {
  HEADING: "Title",
  TEXT: "Text",
  IMAGE: "Image",
  BULLETPOINTS: "List (separate points on new lines)",
};

export const DEFAULT = {
  BULLETPOINTS: `Point 1\nPoint 2\nPoint 3\n`,
};

export const LAYOUTS = {
  LAYOUT_ONE: {
    DEFAULT_THEME: THEMES.THEME_ONE,
    CLASS: "layout-one",
    NAME: "Layout 1",
    ALLOWED_CONTENT: ["HEADING"],
    PREVIEW: "../img/presentation1.png",
  },
  LAYOUT_TWO: {
    DEFAULT_THEME: THEMES.THEME_ONE,
    CLASS: "layout-two",
    NAME: "Layout 2",
    ALLOWED_CONTENT: ["HEADING", "TEXT", "IMAGE"],
    PREVIEW: "../img/presentation2.png",
  },
  LAYOUT_THREE: {
    DEFAULT_THEME: THEMES.THEME_TWO,
    CLASS: "layout-three",
    NAME: "Layout 3",
    ALLOWED_CONTENT: ["HEADING", "BULLETPOINTS", "IMAGE"],
    PREVIEW: "../img/presentation3.png",
  },
};
