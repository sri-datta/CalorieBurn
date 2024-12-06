// Replace with your Edamam API credentials
const EDAMAM_APP_ID = "93790d94";
const EDAMAM_APP_KEY = "0db8c7d577fd508c9f627f137a70fa84";

// Replace with your API Ninjas API key
const API_NINJAS_API_KEY = "ECVj2r+ArzqnNyB4SXGHQA==GYkv1aAnc9C5CooR";

// DOM Element References
const addEntryButton = document.getElementById("add-entry");
const entryDropdown = document.getElementById("entry-dropdown");
const calorieCounter = document.getElementById("calorie-counter");
const clearButton = document.getElementById("clear");
const budgetNumberInput = document.getElementById("budget");
const output = document.getElementById("output");

// Add a new entry dynamically
function addEntry() {
  const targetInputContainer = document.querySelector(
    `#${entryDropdown.value} .input-container`
  );
  if (!targetInputContainer) {
    console.error(`Target container not found for: ${entryDropdown.value}`);
    return;
  }

  const entryNumber = targetInputContainer.querySelectorAll(".entry-group").length + 1;
  const entryHTML = generateEntryHTML(entryDropdown.value, entryNumber);
  targetInputContainer.insertAdjacentHTML("beforeend", entryHTML);

  const newEntry = targetInputContainer.querySelector(".entry-group:last-child");
  const foodInput = newEntry.querySelector('input[name="food-name"]');
  const calorieInput = newEntry.querySelector('input[name="calories"]');

  // Attach event listener to autofill calories for food or exercise
  foodInput.addEventListener("input", () =>
    autoFillCalories(foodInput, calorieInput, entryDropdown.value === "exercise")
  );
}

// Generate dynamic HTML for new entries
function generateEntryHTML(type, entryNumber) {
  const isExercise = type === "exercise";
  return `
    <div class="entry-group">
      <label for="${type}-${entryNumber}-name">Entry ${entryNumber} ${
    isExercise ? "Exercise" : "Food"
  } Name</label>
      <input type="text" id="${type}-${entryNumber}-name" placeholder="${
    isExercise ? "Exercise (e.g., running)" : "Food (e.g., chicken)"
  }" name="food-name" />
      ${
        isExercise
          ? `<label for="${type}-${entryNumber}-duration">Duration (minutes)</label>
             <input type="number" id="${type}-${entryNumber}-duration" placeholder="Duration (min)" min="1" value="30" name="duration" />`
          : ""
      }
      <label for="${type}-${entryNumber}-calories">Calories</label>
      <input type="number" id="${type}-${entryNumber}-calories" placeholder="Calories" name="calories" readonly />
    </div>`;
}

// Autofill calories for food or exercise
async function autoFillCalories(foodInput, calorieInput, isExercise = false) {
  const entryName = foodInput.value.trim().toLowerCase();

  if (!entryName) {
    calorieInput.value = ""; // Clear calories if no input
    return;
  }

  if (isExercise) {
    const durationInput = calorieInput.parentElement.querySelector('input[name="duration"]');
    const duration = parseInt(durationInput?.value) || 30; // Default to 30 minutes

    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/caloriesburned?activity=${entryName}&duration=${duration}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": API_NINJAS_API_KEY,
          },
        }
      );

      const data = await response.json();
      if (data.length > 0) {
        calorieInput.value = data[0].total_calories || "Not Found";
      } else {
        calorieInput.value = "Not Found";
      }
    } catch (error) {
      console.error("Error fetching exercise calorie data:", error);
      calorieInput.value = "Error";
    }
  } else {
    // Fetch food calorie data from Edamam
    try {
      const endpoint = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${entryName}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      const calories = data.hints[0]?.food?.nutrients?.ENERC_KCAL || 0;
      calorieInput.value = calories.toFixed(2);
    } catch (error) {
      console.error("Error fetching food calorie data:", error);
      calorieInput.value = "Error";
    }
  }
}

// Calculate total calorie budget and display results
function calculateCalorieBudget(event) {
  event.preventDefault();
  const budget = parseInt(budgetNumberInput.value);
  if (!budget) {
    alert("Please enter a valid daily calorie budget.");
    return;
  }

  let totalCalories = 0;
  let totalBurned = 0;

  // Sum up all food and exercise calories
  document.querySelectorAll(".entry-group").forEach((entry) => {
    const calories = parseInt(entry.querySelector('input[name="calories"]').value) || 0;

    if (entry.closest("fieldset").id === "exercise") {
      totalBurned += calories;
    } else {
      totalCalories += calories;
    }
  });

  const netCalories = totalCalories - totalBurned;
  const remainingCalories = budget - netCalories;

  // Display results
  output.classList.remove("hide");
  output.innerHTML = `
    <div>
      <p><strong>${Math.abs(remainingCalories)} Calorie ${
    remainingCalories > 0 ? "Surplus" : "Deficit"
  }</strong></p>
      <p><strong>Budget:</strong> ${budget} Calories</p>
      <p><strong>Consumed:</strong> ${totalCalories} Calories</p>
      <p><strong>Burned:</strong> ${totalBurned} Calories</p>
    </div>`;
}

// Clear all entries and reset the form
function clearAll() {
  calorieCounter.reset();
  document.querySelectorAll(".input-container").forEach((container) => (container.innerHTML = ""));
  output.classList.add("hide");
}

// Event Listeners
addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalorieBudget);
clearButton.addEventListener("click", clearAll);
