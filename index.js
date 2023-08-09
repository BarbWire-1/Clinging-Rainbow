// ❗️❗️WORK IN PROGRESS ...Switch to JS Animation API!!! STRUCTURE THIS...❗️❗️

//TODO add different sounds, adjust tolerance somehow, or set flag for isPlayed
// style the muteButton or get an icon

// TODO animate rotation directly in animationFrame else sound not in sync!!!!
// TODO create dynamically
// TODO change calc of speed and offset to a fix match-time
// TODO checkbuttons for each bow to add/remove???
// Refactor!!!
const get = (el) => document.querySelector(el);
const getAll = (els) => document.querySelectorAll(els);

const baseInput = get("#base-value");
const delayInput = get("#delay-value");
const shiftInput = get("#shift-value");
const animationMessage = get("#animation-message");

const rainbow = {
	dots: getAll(".dot"),
	baseDur: 3,
	delay: 0.125,
	secondsPassed: 0
};
let shiftSound = 0;
// C-major
const audioFiles = [
	"https://assets.codepen.io/4970299/orbit_C.mp3",
	"https://assets.codepen.io/4970299/orbit_D.mp3",
	"https://assets.codepen.io/4970299/orbit_E.mp3",
	"https://assets.codepen.io/4970299/orbit_F.mp3",
	"https://assets.codepen.io/4970299/orbit_G.mp3",
	"https://assets.codepen.io/4970299/orbit_A.mp3",
	"https://assets.codepen.io/4970299/orbit_H.mp3",
	"https://assets.codepen.io/4970299/orbit_c1.mp3",
	"https://assets.codepen.io/4970299/orbit_d1.mp3",
	"https://assets.codepen.io/4970299/orbit_e1.mp3",
	"https://assets.codepen.io/4970299/orbit_f1.mp3",
	"https://assets.codepen.io/4970299/orbit_g1.mp3"
];
const audioPlayers = audioFiles.map((file) => {
	const player = new Audio(file);
	player.addEventListener("loadeddata", () => {
		//console.log("Audio file loaded:", file);
	});
	return player;
});

let isMuted = true;
let animationFrameId; // Variable to store the animation frame ID for stopping the animation

function playSound(index) {
	//console.log("Playing sound for index:", index, (index + shiftSound) % audioFiles.length);
	if (isMuted || animationPaused) return; // Only play sound if not muted
	const audioPlayer = audioPlayers[index];
	audioPlayer.currentTime = 0;
	audioPlayer.play();
	audioPlayer.volume = 0.1;
}
// TODO set a flag for sound already played to allow more tolerance
// otherwise might miss some contacts
function animateDots(timestamp, audioPlayers) {
	rainbow.dots.forEach((dot, i) => {
		const newDur = rainbow.baseDur + i * rainbow.delay;
		dot.style.animationDuration = `${newDur}s`;

		const animationProgress = ((timestamp / 1000) % newDur) / newDur;
		const tolerance = 0.005; // Adjust the tolerance as needed
		//console.log(dot.querySelector('circle').getBoundingClientRect().bottom)
		if (
			Math.abs(animationProgress - 0.5) < tolerance / 2 ||
			Math.abs(animationProgress - 1) < tolerance
		) {
			// Play sound for passing half of the animation or completing one full animation
			if (!isMuted || !animationPaused) {
				playSound((i + shiftSound) % audioFiles.length); // why doesn't this condition get applied HERE???
				//console.log((i + shiftSound) % audioPlayers.length)
				//console.log('played'+i)
			}
		}
	});

	animationFrameId = requestAnimationFrame((timestamp) =>
		animateDots(timestamp, audioPlayers)
	); // Continue the animation loop
}

function toggleMute() {
	isMuted = !isMuted;
}

// Wait for audio players to be loaded before starting the animation

// Add event listener for the mute button
document.getElementById("muteButton").addEventListener("click", toggleMute);

function updateSecondsPassed() {
	rainbow.secondsPassed++;
	animationMessage.textContent = rainbow.secondsPassed;
}
setInterval(updateSecondsPassed, 1000);

baseInput.addEventListener("input", () => {
	rainbow.baseDur = +baseInput.value;
	delayInput.value = rainbow.delay; // Sync the delayInput value with the updated rainbow.delay
	animateDots();
});

delayInput.addEventListener("input", () => {
	rainbow.delay = +delayInput.value;
	baseInput.value = rainbow.baseDur; // Sync the baseInput value with the updated rainbow.baseDur
	animateDots();
});

function calculate() {
	const variablesInput = get("#variables-input").value;
	const expressionInput = get("#expression-input").value;

	// get variables from the input string
	const variables = variablesInput.split(",").map((variable) => variable.trim());

	// Dynamically create a function with the variables and expression
	dynamicFunction = new Function(...variables, "return " + expressionInput || 0);

	if (variables.length > 0) {
		const variableValuesDiv = get("#variableValues");
		variableValuesDiv.innerHTML = "";
		variables.forEach((variable) => {
			const inputElement = document.createElement("input");
			inputElement.type = "number";
			inputElement.placeholder = variable;
			variableValuesDiv.appendChild(inputElement);
		});

		const modal = get("#myModal");
		modal.style.display = "block";

		const closeButton = getAll(".close")[0];
		closeButton.onclick = function () {
			modal.style.display = "none";
		};

		modal.addEventListener("keydown", function (event) {
			if (event.key === "Enter") {
				event.preventDefault();
			}
		});
	} else {
		applyResult();
	}
}

//get values and expression form the inputs and run the dynamicFunction
// update the offset time with result and call animateDots()
function submitVariableValues() {
	const variableInputs = get("#variableValues").querySelectorAll(
		"input[type='number']"
	);
	const values = Array.from(variableInputs).map((input) => +input.value);

	let result;
	try {
		result = dynamicFunction(...values);
	} catch (error) {
		result = "Invalid expression";
	}

	rainbow.delay = +result;

	// Update the input fields with the calculated value
	baseInput.value = rainbow.baseDur;
	delayInput.value = rainbow.delay;

	const modal = get("#myModal");
	modal.style.display = "none";
	animateDots();
}

// TODO Directly apply the result when no variables are set in the expression
function applyResult() {
	let result;
	try {
		result = dynamicFunction();
	} catch (error) {
		result = "Invalid expression";
	}

	rainbow.delay = +result;
	animateDots();
}

const stopPlayButton = document.querySelector("#stop-play");
let animationPaused = false;

// --------------------------------------------------------------------TOGGLES
function toggleElement(elementId) {
	const element = document.getElementById(elementId);
	element.classList.toggle("hidden");
}

function toggleDescription() {
	toggleElement("description-content");
}

function toggleAnimation() {
	if (animationPaused) {
		rainbow.dots.forEach((dot) => {
			dot.style.animationPlayState = "running";
		});
		stopPlayButton.classList.remove("stop-button");
		stopPlayButton.classList.add("play-button");
	} else {
		rainbow.dots.forEach((dot) => {
			dot.style.animationPlayState = "paused";
		});
		stopPlayButton.classList.remove("play-button");
		stopPlayButton.classList.add("stop-button");
	}
	animationPaused = !animationPaused;
}

//TODO reset input to placeholders
function toggleCalcInput() {
	// Reset placeholders in the input fields after applying values
	const calcInputContainer = get("#input-group");
	const numericInputs = calcInputContainer.querySelectorAll(
		"input[type='number']"
	);

	numericInputs.forEach((input) => {
		input.value = "";
	});

	toggleElement("calc-input-container");
}

// init call
animateDots();

//stopPlayButton.addEventListener("click", toggleAnimation);

// NUMBER INPUTS - FAKE SPINNER
function handleContinuousChange(button, action) {
	const targetInputId = button.getAttribute("data-target");
	const targetInput = document.getElementById(targetInputId);

	const step = +targetInput.step;
	const min = +targetInput.min || null;
	const max = +targetInput.max || null;

	// Update value and call animateDotS with new values
	function updateValue() {
		let currentValue = +targetInput.value;
		if (action === "increment") {
			currentValue += step;
		} else if (action === "decrement") {
			currentValue -= step;
		}

		// Check min max
		if (currentValue < min) {
			currentValue = min;
		} else if (currentValue > max) {
			currentValue = max;
		}

		// Update the input value
		targetInput.value = currentValue;

		// Apply the new value directly to variable
		if (targetInputId === "base-value") {
			rainbow.baseDur = currentValue;
		} else if (targetInputId === "delay-value") {
			rainbow.delay = currentValue;
			targetInput.value = currentValue?.toFixed(3) || 0;
		} else if (targetInputId === "shift-value") {
			shiftSound = currentValue;
		}
		animateDots();
	}

	// init
	updateValue();

	// interval to set reactivity
	const intervalId = setInterval(updateValue, 150);
	button.addEventListener("mouseup", () => {
		clearInterval(intervalId);
	});
	button.addEventListener("mouseleave", () => {
		clearInterval(intervalId);
	});
}

// Get all the buttons with class "arrow"
const buttons = document.querySelectorAll(".arrow");
buttons.forEach((button) => {
	button.addEventListener("mousedown", () => {
		// corresponsing action
		const action = button.getAttribute("data-action");
		handleContinuousChange(button, action);
	});
});
