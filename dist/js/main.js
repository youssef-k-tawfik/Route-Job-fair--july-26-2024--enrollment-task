import Transaction from "./transaction.js";

const listTransactions = [];
let listCustomers = [];
let lowestAmount = Infinity;
let highestAmount = -Infinity;

// & Fetch and display transactions & //
fetch("../../db.json")
  .then((res) => res.json())
  .then((data) => {
    // * customers
    listCustomers = data.customers;
    // * transactions
    const responseTransactions = data.transactions;

    // * Create Transactions List to display
    responseTransactions.forEach(({ id, customer_id, date, amount }) => {
      // * get customer name
      const customer = listCustomers.find(({ id }) => id === customer_id);
      const customerName = customer.name;
      listTransactions.push(new Transaction(id, customerName, date, amount));
    });
    displayTransactions(listTransactions);

    // * setting the amount filter
    $("#minAmountInput").val(lowestAmount);
    $("#minAmountInput").attr("min", lowestAmount);
    $("#minAmountInput").attr("max", highestAmount - 1);

    $("#maxAmountInput").val(highestAmount);
    $("#maxAmountInput").attr("min", lowestAmount + 1);
    $("#maxAmountInput").attr("max", highestAmount);

    // * list customers in select element
    const defaultOption = "<option selected hidden>Choose a user</option>";
    $("#selectedUserSelect").html(defaultOption);

    listCustomers.forEach(({ name }) => {
      $("#selectedUserSelect").html(
        $("#selectedUserSelect").html() + generateCustomerOption(name)
      );
    });
  });

function generateTransaction({ id, customerName, date, amount }) {
  return `
    <tr>
      <td>#${id}</td>
      <td>${customerName}</td>
      <td>${date}</td>
      <td>&dollar;${amount}</td>
    </tr>
  `;
}

function displayTransactions(listTransactions) {
  $("tbody").html("");
  listTransactions.forEach((transaction) => {
    // * display transactions
    $("tbody").html($("tbody").html() + generateTransaction(transaction));

    // * get lowest and highest amount
    lowestAmount = Math.min(lowestAmount, transaction.amount);
    highestAmount = Math.max(highestAmount, transaction.amount);
  });
}

// & Filter Table & //

// * Filter with customer name
$("#customerNameFilterInput").on("input", function () {
  const inputValue = $(this).val().toLowerCase();

  if (inputValue === "") displayTransactions(listTransactions);

  const filteredTransactions = listTransactions.filter(({ customerName }) =>
    customerName.toLowerCase().includes(inputValue)
  );

  displayTransactions(filteredTransactions);
});

// * Filter with amount

$("#minAmountInput, #maxAmountInput").on("change", function () {
  const minValue = $("#minAmountInput").val();
  const maxValue = $("#maxAmountInput").val();

  // * prevent the user from entering invalid values
  minValue < lowestAmount && $("#minAmountInput").val(lowestAmount);
  minValue >= highestAmount && $("#minAmountInput").val(highestAmount - 1);

  maxValue > highestAmount && $("#maxAmountInput").val(highestAmount);
  maxValue <= lowestAmount && $("#maxAmountInput").val(lowestAmount + 1);

  const filteredTransactions = listTransactions.filter(
    ({ amount }) => amount >= minValue && amount <= maxValue
  );
  displayTransactions(filteredTransactions);
});

// & Chart & //

function generateCustomerOption(customerName) {
  return `
    <option value="${customerName}">${customerName}</option>
  `;
}
const dummyLabels = ["June", "July", "Aug", "Sep", "Oct", "Nov"];

let chartInstance = null;
function addChart(user, labels, amounts) {
  const ctx = $("#myChart");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Total transactions amount for: ${user}`,
          data: amounts,
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
  const selectedUserTransactions = listTransactions.filter(
    ({ customerName }) => customerName === selectedUser
  );

  const selectedUserTransactionsDates = selectedUserTransactions.map(
    ({ date }) => date
  );
  const selectedUserAmounts = selectedUserTransactions.map(
    ({ amount }) => amount
  );
  addChart(selectedUser, selectedUserTransactionsDates, selectedUserAmounts);
});

// & Dark Mode & //
$("#darkModeCheckBox").on("change", function () {
  $("html").toggleClass("dark");
});
