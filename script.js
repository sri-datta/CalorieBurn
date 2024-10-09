// DOM Element References
const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');

let isError = false;

// Clears specific entry
function clearSpecificEntry(entryContainer) {
    entryContainer.remove();
}

// Clears the entire form
function clearForm() {
    document.querySelectorAll('.input-container').forEach(container => container.innerHTML = "");
    budgetNumberInput.value = "";
    output.innerHTML = "";
    output.classList.add("hide");
}

// Adds new food or exercise entries dynamically
function addEntry() {
    const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
    const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;

    const entryHTML = generateEntryHTML(entryDropdown.value, entryNumber);
    targetInputContainer.insertAdjacentHTML("beforeend", entryHTML);

    // Attach event listener to new clear button
    const clearButtons = document.querySelectorAll('.clear-entry');
    clearButtons.forEach(button => {
        button.addEventListener('click', function() {
            clearSpecificEntry(this.parentElement);
        });
    });
}

// Generates dynamic HTML for new entries
function generateEntryHTML(type, entryNumber) {
    return `
        <div class="entry-group">
            <label for="${type}-${entryNumber}-name">Entry ${entryNumber} Name</label>
            <input type="text" id="${type}-${entryNumber}-name" placeholder="Name" class="form-control" />
            <label for="${type}-${entryNumber}-calories">Entry ${entryNumber} Calories</label>
            <input type="number" id="${type}-${entryNumber}-calories" min="0" placeholder="Calories" class="form-control" />
            <button type="button" class="clear-entry">Clear Entry</button>
        </div>`;
}

// Calculates total calories and updates the output
function calculateCalories(e) {
    e.preventDefault();
    isError = false;

    const breakfastCalories = getCaloriesFromInputs('#breakfast input[type=number]');
    const lunchCalories = getCaloriesFromInputs('#lunch input[type=number]');
    const dinnerCalories = getCaloriesFromInputs('#dinner input[type=number]');
    const snacksCalories = getCaloriesFromInputs('#snacks input[type=number]');
    const exerciseCalories = getCaloriesFromInputs('#exercise input[type=number]');
    const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

    if (isError || budgetCalories === 0) {
        output.innerHTML = "<p class='text-danger'>Please enter valid inputs!</p>";
        return;
    }

    const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
    const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
    const surplusOrDeficit = remainingCalories >= 0 ? "Surplus" : "Deficit";

    displayResults(budgetCalories, consumedCalories, exerciseCalories, remainingCalories, surplusOrDeficit);
}

// Extracts calories from input fields and validates
function getCaloriesFromInputs(selectorOrInputs) {
    let inputs = Array.isArray(selectorOrInputs) ? selectorOrInputs : document.querySelectorAll(selectorOrInputs);
    let totalCalories = 0;

    for (let input of inputs) {
        let value = input.value.trim();
        if (value === "" || isNaN(value)) {
            alert("Invalid or empty input. Please correct the fields.");
            isError = true;
            return 0;
        }
        totalCalories += Number(value);
    }
    return totalCalories;
}

// Displays calculated results
function displayResults(budget, consumed, burned, remaining, status) {
    output.innerHTML = `
        <div class="alert alert-${status === "Surplus" ? "success" : "danger"}">
            <strong>${Math.abs(remaining)} Calorie ${status}</strong>
        </div>
        <p>Budget: ${budget} Calories</p>
        <p>Consumed: ${consumed} Calories</p>
        <p>Burned: ${burned} Calories</p>`;
    output.classList.remove("hide");
}

// Event Listeners
addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);
