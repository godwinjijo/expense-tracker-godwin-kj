// ---------- Get HTML Elements ----------

const transactionForm = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const transactionList = document.getElementById("transaction-list");
const totalIncomeElement = document.getElementById("total-income");
const totalExpensesElement = document.getElementById("total-expenses");
const balanceElement = document.getElementById("balance");
const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");
const submitButton = document.getElementById("submit-button");
const monthSelector = document.getElementById("month-selector");
const monthlyIncomeElement = document.getElementById("monthly-income");
const monthlyExpensesElement = document.getElementById("monthly-expenses");
const monthlyBalanceElement = document.getElementById("monthly-balance");
const monthlyExpenseCountElement = document.getElementById("monthly-expense-count");


// ---------- Application Data ----------

// Load transactions from Local Storage
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

// Used when editing a transaction
let editingTransactionId = null;

// ADD TRANSACTION

transactionForm.addEventListener("submit", function (event) {

    // Prevent page refresh
    event.preventDefault();

    // Get values from form
    const type = typeInput.value;
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();


    // ---------- Validation ----------

    if (type === "") {
        alert("Please select a transaction type.");
        return;
    }

    if (amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    if (category === "") {
        alert("Please select a category.");
        return;
    }

    if (date === "") {
        alert("Please select a date.");
        return;
    }

    if (description === "") {
        alert("Please enter a description.");
        return;
    }

    // EDIT EXISTING TRANSACTION

    if (editingTransactionId !== null) {
        const transaction = transactions.find(
            function (transaction) {
                return transaction.id === editingTransactionId;
            }
        );
        if (transaction) {
            transaction.type = type;
            transaction.amount = amount;
            transaction.category = category;
            transaction.date = date;
            transaction.description = description;
        }
        editingTransactionId = null;
        submitButton.textContent = "Add";

    }

    // ADD NEW TRANSACTION

    else {
        const transaction = {
            id: Date.now(),
            type: type,
            amount: amount,
            category: category,
            date: date,
            description: description
        };
        transactions.push(transaction);
    }

    // Save data
    saveTransactions();

    // Update screen
    renderTransactions();

    // Update totals
    updateSummary();

    // Monthly Summery
    updateMonthlySummary();

    // Reset form
    transactionForm.reset();

});


// SAVE TRANSACTIONS

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// RENDER TRANSACTIONS

function renderTransactions() {

    // Remove existing transaction elements
    transactionList.innerHTML = "";

    // Get filtered transactions
    const filteredTransactions = getFilteredTransactions();

    // If no transactions exist
    if (filteredTransactions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No transactions found.";
        emptyMessage.id = "empty-message";
        transactionList.appendChild(emptyMessage);
        return;
    }

    // Create transaction element for every transaction

    filteredTransactions.forEach(function (transaction) {
        const transactionElement = document.createElement("ul");
        transactionElement.classList.add("transaction-item");

        // Category
        const categoryElement = document.createElement("li");
        categoryElement.textContent = transaction.category;

        // Amount
        const amountElement = document.createElement("li");
        amountElement.textContent =
            (transaction.type === "income" ? "+₹" : "-₹")
            + transaction.amount.toFixed(2);

        // Date
        const dateElement = document.createElement("li");
        dateElement.textContent = formatDate(transaction.date);

        // Description
        const descriptionElement = document.createElement("li");
        descriptionElement.textContent = transaction.description;

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.classList.add("edit-button");
        editButton.addEventListener("click", function () {
            editTransaction(transaction.id);
        });


        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        // Add elements to transaction
        transactionElement.appendChild(categoryElement);
        transactionElement.appendChild(amountElement);
        transactionElement.appendChild(dateElement);
        transactionElement.appendChild(descriptionElement);
        transactionElement.appendChild(editButton);
        transactionElement.appendChild(deleteButton);

        // Add transaction to page
        transactionList.appendChild(transactionElement);
    });

}

// UPDATE SUMMARY

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(function (transaction) {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        }
        else if (transaction.type === "expense") {
            totalExpenses += transaction.amount;
        }
    });
    const balance = totalIncome - totalExpenses;
    totalIncomeElement.textContent = "₹" + totalIncome.toFixed(2);
    totalExpensesElement.textContent = "₹" + totalExpenses.toFixed(2);
    balanceElement.textContent = "₹" + balance.toFixed(2);
}

// DELETE TRANSACTION

function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );
    if (!confirmed) {
        return;
    }
    transactions = transactions.filter(
        function (transaction) {
            return transaction.id !== id;
        }
    );
    saveTransactions();
    renderTransactions();
    updateSummary();
    updateMonthlySummary();
}

// EDIT TRANSACTION

function editTransaction(id) {
    const transaction = transactions.find(
        function (transaction) {
            return transaction.id === id;
        }
    );
    if (!transaction) {
        return;
    }

    // Put existing values into form

    typeInput.value = transaction.type;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    descriptionInput.value = transaction.description;

    // Store which transaction we are editing

    editingTransactionId = id;

    // Change button text

    submitButton.textContent = "Update";

    // Scroll to form

    transactionForm.scrollIntoView({
        behavior: "smooth"
    });
}

// FILTER TRANSACTIONS

function getFilteredTransactions() {
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;
    return transactions.filter(function (transaction) {
        const typeMatches =
            selectedType === "all"
            || transaction.type === selectedType;
        const categoryMatches =
            selectedCategory === "all"
            || transaction.category === selectedCategory;
        return typeMatches && categoryMatches;
    });
}

// FILTER EVENT LISTENERS

typeFilter.addEventListener("change", function () {
    renderTransactions();
});
categoryFilter.addEventListener("change", function () {
    renderTransactions();
});

// FORMAT DATE

function formatDate(date) {
    const dateObject = new Date(date + "T00:00:00");
    return dateObject.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Monthly wise Income Expense

// setting Current Month

function setCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    monthSelector.value = `${year}-${month}`;
}

// Monthly Calculation

function updateMonthlySummary() {
    const selectedMonth = monthSelector.value;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyExpenseCount = 0;
    transactions.forEach(function (transaction) {

        // Get year and month from transaction date
        const transactionMonth =
            transaction.date.substring(0, 7);

        // Check if transaction belongs
        // to selected month
        if (transactionMonth === selectedMonth) {
            if (transaction.type === "income") {
                monthlyIncome += transaction.amount;
            }
            else if (transaction.type === "expense") {
                monthlyExpenses += transaction.amount;
                monthlyExpenseCount++;
            }
        }
    });
    const monthlyBalance =
        monthlyIncome - monthlyExpenses;

    // Update HTML

    monthlyIncomeElement.textContent = "₹" + monthlyIncome.toFixed(2);
    monthlyExpensesElement.textContent = "₹" + monthlyExpenses.toFixed(2);
    monthlyBalanceElement.textContent = "₹" + monthlyBalance.toFixed(2);
    monthlyExpenseCountElement.textContent = monthlyExpenseCount;
}

monthSelector.addEventListener("change", function () {
    updateMonthlySummary();
});

// LOAD APPLICATION

function initializeApp() {
    setCurrentMonth();
    renderTransactions();
    updateSummary();
    updateMonthlySummary();
}

// Start application

initializeApp();