export const DEFAULT_THEME = 'THEME_ONE'
export const DEFAULT_LAYOUT = 'LAYOUT_ONE'

export const THEMES = {
  THEME_ONE: {
    CLASS: "theme-one",
    NAME: "Theme One",
  },
  THEME_TWO: {
    CLASS: "theme-two",
    NAME: "Theme Two",
  },
};

export const CONTENT_LABEL = {
  HEADING: "Heading",
  TEXT: "Some text",
  IMAGE: "Photograph",
};

export const LAYOUTS = {
  LAYOUT_ONE: {
    DEFAULT_THEME: THEMES.THEME_ONE,
    CLASS: "layout-button",
    NAME: "Layout 1",
    ALLOWED_CONTENT: ["HEADING"],
  },
  LAYOUT_TWO: {
    DEFAULT_THEME: THEMES.THEME_ONE,
    CLASS: "layout-button",
    NAME: "Layout 2",
    ALLOWED_CONTENT: ["HEADING", "TEXT", "IMAGE"],
  },
  LAYOUT_THREE: {
    DEFAULT_THEME: THEMES.THEME_TWO,
    CLASS: "layout-button",
    NAME: "Layout 3",
    ALLOWED_CONTENT: ["HEADING", "TEXT", "IMAGE"],
  },
};
