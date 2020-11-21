import * as CONST from "../constants.js";

/**
 * Application State
 */
let activeSlide = null; // Kan inneholde et slide object
let selectedLayout = CONST.DEFAULT_LAYOUT; // alltid en string
let selectedTheme = CONST.DEFAULT_THEME; // alltid en string
let selectedImage = ""; // alltid en string. Tom hvis ikke valgt
let availableSlides = []; // Array av slide objects som kommer fra back end

// Utility
const getRandomID = () => Math.floor(Math.random() * 10000);
//Hent slides (DEBUGGING)
let getSlidesBTN = document.getElementById("getSlidesBTN");
getSlidesBTN.addEventListener("click", async () => {
  const slides = await getSlides();
  console.log(slides);
});

// Adding listeners to save and delete buttons
const saveSlide = document.getElementById("save-slide");
saveSlide.addEventListener("click", createSlide);
const deleteSlideButton = document.getElementById("delete-slide");
deleteSlideButton.addEventListener("click", () => deleteSlide(activeSlide.id));

function handleLayoutClick(layoutID) {
  toggleActiveClass("#layouts", layoutID);
  selectedLayout = layoutID;
  renderTools({ withValues: false });
}

function handleThemeClick(themeID) {
  toggleActiveClass("#themes", themeID);
  selectedTheme = themeID;
  renderTools({ withValues: false });
}

// Creates slide object for back end
function createSlideObject() {
  const textInput = document.getElementById("TEXT");
  const headingInput = document.getElementById("HEADING");
  const bulletpointsInput = document.getElementById("BULLETPOINTS");
  const allowsImage = CONST.LAYOUTS[selectedLayout].ALLOWED_CONTENT.includes(
    "IMAGE"
  );

  const slide = {
    id: getRandomID(),
    name: `Slide name`,
    meta: {
      theme: selectedTheme,
      layout: selectedLayout,
      createdAt: new Date().getMilliseconds(),
    },
    content: {},
  };

  // Append data if availalle
  if (bulletpointsInput) {
    const bulletPoints = getBulletPointsAsArray(bulletpointsInput.value);
    slide.content.bulletpoints = bulletPoints;
  }
  if (textInput) slide.content.text = textInput.value;
  if (headingInput) slide.content.heading = headingInput.value;
  if (allowsImage && selectedImage) slide.content.image = selectedImage;

  return slide;
}

// Converts text from <textarea> element to an array
function getBulletPointsAsArray(textareaInput) {
  if (!textareaInput) return null;
  return textareaInput.split(/\r?\n/).filter((string) => string.length > 0);
}

function toggleActiveClass(parentElementID, id) {
  const parent = document.querySelector(parentElementID);
  Array.from(parent.children).forEach((button) => {
    if (button.className.includes(id)) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// Layout and Theme
function renderOptions() {
  const layoutsWrapper = document.querySelector("#layouts");
  const themesWrapper = document.querySelector("#themes");

  // Layout buttons
  Object.entries(CONST.LAYOUTS).forEach(([layoutID, layoutSettings]) => {
    const div = document.createElement("div");
    div.setAttribute("class", layoutID);
    div.setAttribute(
      "style",
      `background-image: url(${layoutSettings.PREVIEW}); background-size: contain; background-repeat: no-repeat;`
    );
    div.addEventListener("click", () => handleLayoutClick(layoutID));
    layoutsWrapper.appendChild(div);
  });

  // Theme buttons
  Object.entries(CONST.THEMES).forEach(([themeID, themeSettings]) => {
    const div = document.createElement("div");
    div.setAttribute("class", themeID);
    div.setAttribute("style", `background: ${themeSettings.COLOR}`);
    div.addEventListener("click", () => handleThemeClick(themeID));
    themesWrapper.appendChild(div);
  });
}

// Text and image upload tools
function renderTools({ withValues = true } = {}) {
  if (!selectedLayout || !selectedTheme) return;
  const currentLayout = CONST.LAYOUTS[selectedLayout];
  const contentTools = document.querySelector("#content-tools");

  // Always resetting the HTML within #content-tools before filling in updated data
  contentTools.innerHTML = "";

  currentLayout.ALLOWED_CONTENT.forEach((contentType) => {
    const toolWrapper = document.createElement("div");
    const toolElement = getElement(contentType, withValues);
    const labelElement = document.createElement("h4");
    labelElement.innerHTML = CONST.CONTENT_LABEL[contentType];

    toolWrapper.setAttribute("class", `${contentType}-wrapper`);
    toolWrapper.appendChild(labelElement);
    toolWrapper.appendChild(toolElement);
    contentTools.appendChild(toolWrapper);
  });
}

// Creates a HTML element based on the contentType (heading, text, etc)
// Also inserts values from active slide into text fields
function getElement(contentType, withValues) {
  switch (contentType) {
    case "HEADING": {
      const element = document.createElement("input");
      element.setAttribute("id", contentType);
      if (withValues && activeSlide) {
        element.value = activeSlide.content.heading || "";
      }
      return element;
    }

    case "TEXT": {
      const element = document.createElement("textarea");
      element.setAttribute("id", contentType);
      if (withValues && activeSlide) {
        element.value = activeSlide.content.text || "";
      }
      return element;
    }

    case "BULLETPOINTS": {
      const element = document.createElement("textarea");
      element.setAttribute("id", contentType);
      element.setAttribute("rows", "5");
      if (withValues && activeSlide) {
        const { bulletpoints } = activeSlide.content;
        element.value = bulletpoints
          ? bulletpoints.join("\n")
          : CONST.DEFAULT.BULLETPOINTS;
      } else {
        element.value = CONST.DEFAULT.BULLETPOINTS;
      }
      return element;
    }

    case "IMAGE": {
      const element = document.createElement("input");
      element.setAttribute("id", contentType);
      element.setAttribute("type", "file");
      element.setAttribute("accept", "image/*");
      element.addEventListener("change", () => {
        const file = element.files[0];
        const freader = new FileReader();
        freader.addEventListener("load", () => {
          selectedImage = freader.result;
        });
        freader.readAsDataURL(file);
      });
      return element;
    }

    default:
      break;
  }
}

function buildAvailableSlides() {
  const availableSlidesWrapper = document.querySelector("#available-slides");
  availableSlidesWrapper.innerHTML = "";
  availableSlides.forEach((slide, i) => {
    const slideButton = document.createElement("div");
    slideButton.innerHTML = `Slide ${i + 1}`;
    slideButton.setAttribute("class", slide.id);
    slideButton.setAttribute("id", "available-slides-button");

    slideButton.addEventListener("click", () => {
      activeSlide = slide;
      selectedLayout = slide.meta.layout;
      selectedTheme = slide.meta.theme;
      toggleActiveClass("#available-slides", slide.id);
      renderTools();
      renderSlidePreview();
    });
    availableSlidesWrapper.appendChild(slideButton);
  });
}

async function updateAvailableSlides() {
  const slides = await getSlides();
  availableSlides = slides;

  if (slides.length > 0) {
    activeSlide = slides[slides.length - 1];
    deleteSlideButton.style = "display:inline";
  } else {
    deleteSlideButton.style = "display:none";
  }
  renderSlidePreview();
  buildAvailableSlides();
  if (activeSlide) {
    toggleActiveClass("#available-slides", activeSlide.id);
  }
}

function renderSlidePreview() {
  const slidePreviewElement = document.querySelector("#slide-preview");
  slidePreviewElement.innerHTML = activeSlide
    ? getSlidePreview(activeSlide)
    : "";
}

function getSlidePreview(slide) {
  const theme = CONST.THEMES[activeSlide.meta.theme];
  const layout = CONST.LAYOUTS[activeSlide.meta.layout];
  const { heading, text, image, bulletpoints } = activeSlide.content;

  // Generate image
  const imgWrapper = document.createElement("div");
  const img = new Image();
  img.setAttribute("class", "slide-image");
  img.src = image;
  imgWrapper.appendChild(img);

  switch (slide.meta.layout) {
    case "LAYOUT_ONE":
      return `
        <div class="${layout.CLASS} ${theme.CLASS}">
          <h1>${heading}</h1>
        </div>
      `;

    case "LAYOUT_TWO":
      return `
        <div class="${layout.CLASS} ${theme.CLASS}">
          <h1>${heading}</h1>
          <p>${text}</p>
          ${imgWrapper.innerHTML}
        </div>
      `;

    case "LAYOUT_THREE":
      // Generate list
      const ul = document.createElement("ul");
      bulletpoints.forEach((bulletpoint) => {
        const li = document.createElement("li");
        li.setAttribute("class", "bulletpoint");
        li.innerHTML = bulletpoint;
        ul.appendChild(li);
      });

      return `
        <div class="${layout.CLASS} ${theme.CLASS}">
          <h1>${heading}</h1>
          <ul class="bulletpoints">${ul.innerHTML}</ul>
          ${imgWrapper.innerHTML}
        </div>
      `;

    default:
      break;
  }
}

// Connects to Database
async function addSlide(slide) {
  const url = "/api/makeSlide";
  let token = sessionStorage.getItem("SID");

  let body = {
    presentation_id: localStorage.getItem("pID"),
    ...slide,
  };

  let headers = {
    "content-type": "application/json",
    authorization: "Bearer " + token,
  };

  const config = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    await fetch(url, config);
    await updateAvailableSlides();
  } catch (e) {
    console.error(e);
  }
}

// Connects to Database
async function getSlides() {
  const url = `/api/getSlides/${localStorage.getItem("pID")}`;

  let headers = {
    "content-type": "application/json",
    authorization: "Bearer " + sessionStorage.getItem("SID"),
  };

  const config = {
    method: "get",
    headers: headers,
  };

  let result = await fetch(url, config);
  let slides = await result.json();

  const parsedSlides = slides[0].slides
    .map((slide) => JSON.parse(slide))
    .sort((a, b) => a.createdAt - b.createdAt);

  return parsedSlides;
}

// Connects to Database
async function createSlide() {
  const slide = createSlideObject();
  selectedLayout = CONST.DEFAULT_LAYOUT;
  selectedTheme = CONST.DEFAULT_THEME;
  await addSlide(slide);
  await buildAvailableSlides();
  toggleActiveClass("#available-slides", slide.id);
}

// Connects to Database
async function deleteSlide(slideID) {
  const url = `/api/deleteSlide?slide_id=${slideID}&presentation_id=${localStorage.getItem(
    "pID"
  )}`;
  let token = sessionStorage.getItem("SID");

  let headers = {
    "content-type": "application/json",
    authorization: "Bearer " + token,
  };

  const config = {
    method: "delete",
    headers: headers,
  };

  try {
    await fetch(url, config);
    selectedLayout = activeSlide?.meta?.layout || CONST.DEFAULT_LAYOUT;
    selectedTheme = activeSlide?.meta?.theme || CONST.DEFAULT_THEME;
    await updateAvailableSlides();
    renderTools();
  } catch (e) {
    console.error(e);
  }
}

window.onload = async function () {
  await updateAvailableSlides();
  renderOptions();
  renderTools();
};
