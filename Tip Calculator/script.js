// DOM Elements
const elements = {
  //  left-panel
  billAmount: document.getElementById("billAmount"),
  customTip: document.getElementById("customTip"),
  numPeople: document.getElementById("numPeople"),
  //right-panel
  tipAmount: document.getElementById("tipAmount"),
  totalAmount: document.getElementById("totalAmount"),
  perPersonAmount: document.getElementById("perPersonAmount"),
  // receipt---
  receiptBillAmount: document.getElementById("receiptBillAmount"),
  receiptTipPercentage: document.getElementById("receiptTipPercentage"),
  receiptNumPeople: document.getElementById("receiptNumPeople"),
  receiptTipAmount: document.getElementById("receiptTipAmount"),
  receiptTotalAmount: document.getElementById("receiptTotalAmount"),
  receiptPerPersonAmount: document.getElementById("receiptPerPersonAmount"),
};

function setTip(percentage) {
  elements.customTip.value = percentage;
  updateCalculations();
}

function updateCalculations() {
  const billAmount = parseFloat(elements.billAmount.value) || 0;
  const tipPercentage = parseFloat(elements.customTip.value) || 0;
  const numPeople = parseInt(elements.numPeople.value) || 1;

  const tipAmount = (billAmount * tipPercentage) / 100;
  const totalAmount = billAmount + tipAmount;
  const perPersonAmount = totalAmount / numPeople;

  elements.tipAmount.textContent = `₹${tipAmount.toFixed(2)}`;
  elements.totalAmount.textContent = `₹${totalAmount.toFixed(2)}`;
  elements.perPersonAmount.textContent = `₹${perPersonAmount.toFixed(2)}`;

  // Update receipt values
  elements.receiptBillAmount.textContent = `₹${billAmount.toFixed(2)}`;
  elements.receiptTipPercentage.textContent = `${tipPercentage}%`;
  elements.receiptNumPeople.textContent = numPeople;
  elements.receiptTipAmount.textContent = `₹${tipAmount.toFixed(2)}`;
  elements.receiptTotalAmount.textContent = `₹${totalAmount.toFixed(2)}`;
  elements.receiptPerPersonAmount.textContent = `₹${perPersonAmount.toFixed(
    2
  )}`;
}

function resetCalculator() {
  elements.billAmount.value = "";
  elements.customTip.value = "";
  elements.numPeople.value = "1";
  elements.tipAmount.textContent = "₹0.00";
  elements.totalAmount.textContent = "₹0.00";
  elements.perPersonAmount.textContent = "₹0.00";
  updateCalculations();
}

function printReceipt() {
  window.print();
}

