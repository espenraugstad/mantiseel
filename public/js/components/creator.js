import * as CONST from "../constants.js";

let saveSlide = document.getElementById("save-slide");
let deleteSlideButton = document.getElementById("delete-slide");

//Hent slides (DEBUGGING)
let getSlidesBTN = document.getElementById("getSlidesBTN");
getSlidesBTN.addEventListener("click", async () => {
	const slides = await getSlides()
	console.log(slides)
});

let activeSlide = null;
let selectedLayout = CONST.DEFAULT_LAYOUT;
let selectedTheme = CONST.DEFAULT_THEME;
let selectedImage = "";
let availableSlides = [];

/* Lag en slide */
saveSlide.addEventListener("click", async () => {
	const slide = createSlideObject();
	selectedLayout = CONST.DEFAULT_LAYOUT;
	selectedTheme = CONST.DEFAULT_THEME;
  await addSlide(slide);
	await buildAvailableSlides()
});


deleteSlideButton.addEventListener('click', () => deleteSlide(activeSlide.id))

function createSlideObject({giveEmptySlide = false} = {}) {
	const textInput = document.getElementById("TEXT");
  const headingInput = document.getElementById("HEADING");
  const allowsImage = CONST.LAYOUTS[selectedLayout].ALLOWED_CONTENT.includes(
    "IMAGE"
  );
	const slide = {
    id: availableSlides.length || 0,
    name: "Slide name",
    meta: {
      theme: selectedTheme,
      layout: selectedLayout,
    },
    content: {},
	};
	if(giveEmptySlide) return slide;

  if (textInput) slide.content.text = textInput.value;
  if (headingInput) slide.content.heading = headingInput.value;
	if (allowsImage && selectedImage) slide.content.image = selectedImage;
	return slide;
}

function handleLayoutClick(layoutID) {
  selectedLayout = layoutID;
  renderTools();
}

function handleThemeClick(themeID) {
  selectedTheme = themeID;
  renderTools();
}

function renderOptions() {
  const layoutsWrapper = document.querySelector("#layouts");
  const themesWrapper = document.querySelector("#themes");

  Object.entries(CONST.LAYOUTS).forEach(([layoutID, layoutSettings]) => {
    const div = document.createElement("div");
    div.setAttribute("class", layoutSettings.NAME);
    div.innerHTML = layoutSettings.NAME;
    div.addEventListener("click", () => handleLayoutClick(layoutID));
    layoutsWrapper.appendChild(div);
  });

  Object.entries(CONST.THEMES).forEach(([themeID, themeSettings]) => {
    const div = document.createElement("div");
    div.setAttribute("class", themeSettings.CLASS);
    div.innerHTML = themeSettings.NAME;
    div.addEventListener("click", () => handleThemeClick(themeID));
    themesWrapper.appendChild(div);
  });
}

function renderTools() {
  if (!selectedLayout || !selectedTheme) return;
	const currentLayout = CONST.LAYOUTS[selectedLayout];
  const contentToolsWrapper = document.querySelector("#content-tools");
  // Tømmer det som er i innstillingenes div
  contentToolsWrapper.innerHTML = "";

  currentLayout.ALLOWED_CONTENT.forEach((contentType) => {
		const wrapper = document.createElement("div");
    const toolElement = getElement(contentType);
    const labelElement = document.createElement("p");
    labelElement.innerHTML = CONST.CONTENT_LABEL[contentType];
    wrapper.appendChild(labelElement);
    wrapper.appendChild(toolElement);
    contentToolsWrapper.appendChild(wrapper);
  });
}

function getElement(contentType) {
  switch (contentType) {
    case "HEADING": {
      const element = document.createElement("input");
			element.setAttribute("id", contentType);
			if(activeSlide) {
				element.setAttribute("value", activeSlide.content.heading || '');
			}
      return element;
    }

    case "TEXT": {
      const element = document.createElement("textarea");
			element.setAttribute("id", contentType);
			if(activeSlide) {
				element.innerHTML = activeSlide.content.text || ''
			}
      return element;
    }

    case "IMAGE": {
      const element = document.createElement("input");
      element.setAttribute("id", contentType);
      element.setAttribute("type", "file");
      element.setAttribute("accept", "image/*");
      element.addEventListener("change", () => {
        let [file] = element.files;

        let freader = new FileReader();
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
	
	const parsedSlides = slides[0].slides.map(slide => {
		return JSON.parse(slide)
	}).sort((a, b) => a.id - b.id)

  return parsedSlides;

  /* TODO
		- Parse informasjon fra slides-variabelen.
		- Legg til all info om en slide i en div med klasse "slide-div".
		- Legg til eventlistener på slide-d iv'ene som gjør de klikkbare og gjør
				det mulig å redigere de igjen.
		*/
}

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
		await updateAvailableSlides()
  } catch (e) {
    console.error(e);
  }
}

async function deleteSlide(slideID) {
	const slideIndex = availableSlides.findIndex(slide => slide.id === slideID)
	const url = `/api/deleteSlide?slide_id=${slideID}&presentation_id=${localStorage.getItem("pID")}`;
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
		activeSlide = availableSlides[slideIndex - 1] || null
		selectedLayout = activeSlide?.meta?.layout || CONST.DEFAULT_LAYOUT
		selectedTheme = activeSlide?.meta?.theme || CONST.DEFAULT_THEME
		await updateAvailableSlides()
		renderTools()
  } catch (e) {
    console.error(e);
  }
}

function buildAvailableSlides() {
	const availableSlidesWrapper = document.querySelector('#available-slides')
	availableSlidesWrapper.innerHTML = '';
	availableSlides.forEach((slide, i) => {
		const element = document.createElement('div')
		element.innerHTML = `Slide ${i + 1}`
		element.addEventListener('click', () => {
			activeSlide = slide
			selectedLayout = slide.meta.layout
			renderTools();
		})
		availableSlidesWrapper.appendChild(element)
	})
}

async function updateAvailableSlides() {
	let slides = await getSlides();
	availableSlides = slides;
	if (slides.length > 0) {
		activeSlide = slides[0]
		deleteSlideButton.style = 'display:inline'
	} else {
		deleteSlideButton.style = 'display:none'
	}
	buildAvailableSlides()
}

window.onload = async function () {
	await updateAvailableSlides()
  renderOptions();
  renderTools();
};
