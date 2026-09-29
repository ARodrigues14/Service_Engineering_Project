// Update slider values dynamically

// Link to HTML controls

// slider1 - amount
const slider = document.getElementById('slider1');
const sliderValue = document.getElementById('slider1-value');
const decreaseBtn = document.getElementById('decrease1');
const increaseBtn = document.getElementById('increase1');

const amountLabel = document.getElementById("amount");
const amountInterest = document.getElementById("amount-interest");

// slider 2 - months
const slider2 = document.getElementById('slider2');
const sliderValue2 = document.getElementById('slider2-value');
const decreaseBtn2 = document.getElementById('decrease2');
const increaseBtn2 = document.getElementById('increase2');

const durationLabel = document.getElementById("duration");

// slider 3 - monthly payment
const monthlyPaymentLabel = document.getElementById("slider3-value");

const installmentLabel = document.getElementById("installment");

// slider 1 - amount ---------------------------------------------------------------------------------

// Display initial slider value
sliderValue.innerText = slider.value;

// Update value as the slider is moved
slider.addEventListener('input', () => {
    sliderValue.innerText = slider.value;
});

// Decrease button
decreaseBtn.addEventListener('click', () => {
    slider.value = Math.max(slider.min, slider.value - slider.step);
    sliderValue.innerText = slider.value;

    let newValue = parseInt(slider.value);
    if (newValue >= parseInt(slider.min)) {
        slider.value = newValue;
        updateLabel1();
    }
});

// Increase button
increaseBtn.addEventListener('click', () => {
    slider.value = Math.min(slider.max, parseInt(slider.value) + parseInt(slider.step));
    sliderValue.innerText = slider.value;

    let newValue = parseInt(slider.value);
    if (newValue <= parseInt(slider.max)) {
        slider.value = newValue;
        updateLabel1();
    }
});

// Link slider1 to labels
function updateLabel1() {
    const formattedValue = parseFloat(slider.value).toFixed(2).replace(".", ",") + " €";
    amountLabel.textContent = formattedValue;

    // Update installment and interest values
    const result = calculateInstallments(slider.value, 8, slider2.value);

    const formattedInterest = parseFloat(result.total).toFixed(2).replace(".", ",") + " €";
    amountInterest.textContent = formattedInterest;

    // Update the monthly installment value
    monthlyPaymentLabel.textContent = result.installment.replace(".", ",") + " €";
    installmentLabel.textContent = result.installment.replace(".", ",") + " €";
}

// Event to update the label value when the slider is moved
slider.addEventListener("input", updateLabel1);

// slider 2 - months ---------------------------------------------------------------------------------

// Display initial slider value
sliderValue2.innerText = slider2.value;

// Update value as the slider is moved
slider2.addEventListener('input', () => {
    sliderValue2.innerText = slider2.value;
});

// Decrease button
decreaseBtn2.addEventListener('click', () => {
    slider2.value = Math.max(slider2.min, slider2.value - slider2.step);
    sliderValue2.innerText = slider2.value;

    let newValue2 = parseInt(slider2.value);
    if (newValue2 >= parseInt(slider2.min)) {
        slider2.value = newValue2;
        updateLabel2();
    }
});

// Increase button
increaseBtn2.addEventListener('click', () => {
    slider2.value = Math.min(slider2.max, parseInt(slider2.value) + parseInt(slider2.step));
    sliderValue2.innerText = slider2.value;

    let newValue2 = parseInt(slider2.value);
    if (newValue2 <= parseInt(slider2.max)) {
        slider2.value = newValue2;
        updateLabel2();
    }
});

// Link slider2 to labels
function updateLabel2() {
    const formattedValue = parseFloat(slider2.value).toFixed(0).replace(".", ",") + " months";
    durationLabel.textContent = formattedValue;

    // Update installment and interest values
    const result = calculateInstallments(slider.value, 8, slider2.value);

    const formattedInterest = parseFloat(result.total).toFixed(2).replace(".", ",") + " €";
    amountInterest.textContent = formattedInterest;

    // Update the monthly installment value
    monthlyPaymentLabel.textContent = result.installment.replace(".", ",") + " €";
    installmentLabel.textContent = result.installment.replace(".", ",") + " €";
}

// Event to update the label value when the slider is moved
slider2.addEventListener("input", updateLabel2);

//##########################################################################################################

// Calculate Total Value and Installments
function calculateInstallments(loanAmount, annualRate, monthsDuration) {
    const monthlyRate = annualRate / 12 / 100; // Monthly rate in decimal
    const totalInstallments = monthsDuration;

    const installment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalInstallments)) /
                      (Math.pow(1 + monthlyRate, totalInstallments) - 1);

    const total = installment * totalInstallments;

    return {
        installment: installment.toFixed(2),
        total: total.toFixed(2)
    };
}

//##############################################################################################

// Update the label with the value of the card type

// Function to update the label with the value of the <p>
function updateCardTypeLabel(event) {
    event.preventDefault(); // Prevent default behavior of the link

    const valueP = event.currentTarget.querySelector('p').innerText;

    document.getElementById('tipo').innerText = valueP;
}

// Add click events to <a> links
document.getElementById('Personal').addEventListener('click', updateCardTypeLabel);
document.getElementById('Vehicle').addEventListener('click', updateCardTypeLabel);
document.getElementById('Build').addEventListener('click', updateCardTypeLabel);
document.getElementById('Education').addEventListener('click', updateCardTypeLabel);
