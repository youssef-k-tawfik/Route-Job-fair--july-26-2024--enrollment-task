import Transaction from "./transaction.js";

const listTransactions = [];
let listCustomers = [];
let lowestAmount = Infinity;
let highestAmount = -Infinity;

// & Fetch and display transactions & //
fetch("db.json")
  .then((res) => res.json())
  .then((data) => {
    // * customers
    listCustomers = data.customers;
    // * transactions
    const responseTransactions = data.transactions;

    // * Create Transactions List to display
    responseTransactions.forEach(({ id, customer_id, date, amount }) => {
      lowestAmount = lowestAmount > amount ? amount : lowestAmount;
      $("#minAmountInput").val(lowestAmount);
      highestAmount = highestAmount < amount ? amount : highestAmount;
      $("#maxAmountInput").val(highestAmount);

      // * get customer name
      const customer = listCustomers.find(({ id }) => id === customer_id);
      const customerName = customer.name;
      listTransactions.push(new Transaction(id, customerName, date, amount));
    });
    displayTransactionsByName(listTransactions);

    // * list customers in select element
    const defaultOption = "<option selected hidden>Choose a user</option>";

    const otherOptions = listCustomers
      .map(({ name }) => generateCustomerOption(name))
      .join("");

    $("#selectedUserSelect").html(defaultOption + otherOptions);
  })
  .catch((error) => console.error("Error: ", error));

function generateTransaction({ id, customerName, date, amount }) {
  return `
    <tr>
      <td>#${id}</td>
      <td class="graph-link">${customerName}</td>
      <td>${date}</td>
      <td>&dollar;${amount}</td>
    </tr>
  `;
}

function filterTransactionsByAmount() {
  const inputValue = $("#customerNameFilterInput").val().toLowerCase();
  const minValue = parseFloat($("#minAmountInput").val());
  const maxValue = parseFloat($("#maxAmountInput").val());

  $("#btnClearFilter").attr("disabled", false);

  const filteredTransactions = listTransactions.filter(
    ({ customerName, amount }) =>
      customerName.toLowerCase().includes(inputValue) &&
      amount >= minValue &&
      amount <= maxValue
  );

  displayTransactionsByAmount(filteredTransactions);
}

function displayTransactionsByName(listTransactions) {
  const tbodyContent = listTransactions
    .map((transaction) => generateTransaction(transaction))
    .join("");
  $("tbody").html(tbodyContent);

  addGraphLinksListeners();

  let currentLowestAmount = Infinity;
  let currentHighestAmount = -Infinity;
  listTransactions.forEach(({ amount }) => {
    currentLowestAmount = Math.min(currentLowestAmount, amount);
    currentHighestAmount = Math.max(currentHighestAmount, amount);
  });

  $("#minAmountInput")
    .attr("min", currentLowestAmount)
    .val(currentLowestAmount);
  $("#maxAmountInput")
    .attr("max", currentHighestAmount)
    .val(currentHighestAmount);
}

function displayTransactionsByAmount(listTransactions) {
  const tbodyContent = listTransactions
    .map((transaction) => generateTransaction(transaction))
    .join("");
  $("tbody").html(tbodyContent);
  addGraphLinksListeners();
}

// & Filter Table & //

// * Filter with customer name
$("#customerNameFilterInput").on("input", function () {
  $("#btnClearFilter").attr("disabled", false);

  const inputValue = $("#customerNameFilterInput").val().toLowerCase();
  const filteredTransactions = listTransactions.filter(({ customerName }) =>
    customerName.toLowerCase().includes(inputValue)
  );

  displayTransactionsByName(filteredTransactions);
});

// * Filter with amount
let minValue;
let maxValue;
$("#minAmountInput").on("change", function () {
  minValue = parseFloat($("#minAmountInput").val()); //501
  maxValue = parseFloat($("#maxAmountInput").val()); //3000

  if (minValue < lowestAmount) {
    $("#minAmountInput").val(lowestAmount);
  } else if (minValue >= maxValue) {
    $("#minAmountInput").val(maxValue - 1);
  }

  filterTransactionsByAmount();
});

$(" #maxAmountInput").on("change", function () {
  minValue = parseFloat($("#minAmountInput").val());
  maxValue = parseFloat($("#maxAmountInput").val());

  if (maxValue > highestAmount) {
    $("#maxAmountInput").val(highestAmount);
  } else if (maxValue <= minValue) {
    $("#maxAmountInput").val(minValue + 1);
  }

  filterTransactionsByAmount();
});

// * Clear Filter
$("#btnClearFilter").on("click", function () {
  $("#customerNameFilterInput").val("");
  $("#minAmountInput").val(lowestAmount);
  $("#maxAmountInput").val(highestAmount);
  $("#btnClearFilter").attr("disabled", true);
  displayTransactionsByName(listTransactions);
});

// & Chart & //

function generateCustomerOption(customerName) {
  return `
    <option value="${customerName}">${customerName}</option>
  `;
}
const dummyLabels = ["July", "Aug", "Sep", "Oct", "Nov"];

let chartInstance = null;
function addChart(selectedUser) {
  const selectedUserTransactions = listTransactions.filter(
    ({ customerName }) => customerName === selectedUser
  );

  const selectedUserTransactionsDates = selectedUserTransactions.map(
    ({ date }) => date
  );
  const selectedUserAmounts = selectedUserTransactions.map(
    ({ amount }) => amount
  );

  const ctx = $("#myChart");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: selectedUserTransactionsDates,
      datasets: [
        {
          label: `Total transactions amount for: ${selectedUser}`,
          data: selectedUserAmounts,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

addChart("", dummyLabels);

$("#selectedUserSelect").on("input", function () {
  const selectedUser = $(this).val();

  addChart(selectedUser);
});

// & Dark Mode & //
$("#darkModeCheckBox").on("change", function () {
  $("html").toggleClass("dark");
});

function addGraphLinksListeners() {
  $(".graph-link").on("click", function () {
    const clickedCustomer = $(this).text();
    addChart(clickedCustomer);
    $("#selectedUserSelect").val(clickedCustomer);
  });
}
