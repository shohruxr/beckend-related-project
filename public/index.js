const todayDate = document.getElementById("today-date");
const today = new Date();
const option = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
todayDate.textContent = today.toLocaleString("ko-KR", option);

const trBody = document.getElementById("tr-body");
const filterButtons = document.querySelectorAll(".filter-btn");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("kategoriya");
const typeOptions = document.querySelector(".type-options");
const dateInput = document.getElementById("date");
const izohInput = document.getElementById("izoh");
const saveBtn = document.getElementById("save-btn");
const transactionForm = document.getElementById("transaction-form");

let editTransactionId = null;
let filterType = "all";
let transactionData = [];

const fetchUsers = () => {
  fetch("/transactions")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.log("xatolik yuz berdi", data);
        return;
      }

      transactionData = data;

      calculateTotals(data);

      renderGoalProgress(data);

      renderHighestCategory(data);

      searchTransactions();
    })
    .catch((err) => {
      console.log("Serverga ukanib bo'lmadi ", err);
      trBody.innerHTML = `<tr><td class="empty-state" colspan="6">Serverga ulanib bo'lmadi</td></tr>`;
    });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterType = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    searchTransactions();
  });
});

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const type = typeOptions.value;
  const date = dateInput.value;
  const izoh = izohInput.value.trim();

  if (!amount || !category || !type || !date || !izoh) {
    alert("Barcha maydonlarni toldiring!");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Miqdor 0 dan katta bolishi kerak");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    alert("Sanani togri kiriting");
    return;
  }
  const year = Number(date.slice(0, 4));
  if (year < 2000) {
    alert("Yil 2000-yildan hozirgi yilgacha bolishi kerak!");
    return;
  }
  const currentYear = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  if (date > currentYear) {
    alert("Kelajakdagi sanani kiritish mumkin emas");
    return;
  }

  const transaction = {
    category,
    izoh,
    date,
    type,
    amount,
  };

  if (editTransactionId !== null) {
    fetch(`/transactions/${editTransactionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          fetchUsers();
          transactionForm.reset();

          editTransactionId = null;
          saveBtn.textContent = "Tranzaksiyani saqlash";

          alert("O'zgarishlar saqlandi");
        } else {
          alert("Tahrirlashda xatolik yuz berdi");
        }
      })
      .catch((err) => {
        console.log("Tahrirlashda xatolik yuz berdi");
      });
  } else {
    fetch("/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          fetchUsers();
          transactionForm.reset();

          alert("Yangi tranzaksiya qo'shildi");
        } else {
          alert("Xatolik yuz berdi");
        }
      })
      .catch((err) => {
        alert("Serverga ulanib bo'lmadi");
        console.log("Serverga ulanib bo'lmadi ", err);
      });
  }
});

const totalBalance = document.getElementById("total-balance");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");

function calculateTotals(data) {
  let income = 0;
  let expense = 0;

  data.forEach((transaction) => {
    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      income += amount;
    } else if (transaction.type === "outcome") {
      expense += amount;
    }
  });

  const balance = income - expense;

  totalIncome.textContent = `${income.toLocaleString("fr-FR")} so'm`;
  totalExpense.textContent = `${expense.toLocaleString("fr-FR")} so'm`;
  totalBalance.textContent = `${balance.toLocaleString("fr-FR")} so'm`;
}

const goalForm = document.getElementById("goal-form");
const goalNameInput = document.getElementById("goal-name");
const goalTarget = document.getElementById("goal-target");

const goalTitle = document.getElementById("goal-title");
const goalHint = document.getElementById("goal-hint");
const goalAmount = document.getElementById("goal-amount");
const goalPercentage = document.getElementById("goal-percentage");
const goalBar = document.getElementById("goal-bar");
const goalProcess = document.getElementById("goal-process");
const goalDeleteBtn = document.getElementById("goal-delete-btn");

let currentGoal = JSON.parse(localStorage.getItem("myGoal") || "null");

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = goalNameInput.value.trim();
  const amount = Number(goalTarget.value);

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    alert("Maqsad nomi va summasini togri kiriting");
    return;
  }

  currentGoal = {
    name,
    amount,
  };

  localStorage.setItem("myGoal", JSON.stringify(currentGoal));

  goalForm.reset();
  // fetchUsers()
  renderGoalProgress(transactionData);
});

goalDeleteBtn.addEventListener("click", () => {
  if (confirm("Maqsadni o'chirmoqchimisiz")) {
    currentGoal = null;
    localStorage.removeItem("myGoal");
    renderGoalProgress(transactionData);
  }
});

function renderGoalProgress(transactionsData) {
  if (!currentGoal) {
    goalTitle.textContent = "Yangi maqsad";
    goalHint.hidden = false;
    goalForm.hidden = false;
    goalProcess.hidden = true;
    return;
  }

  let savedAmount = 0;

  transactionsData.forEach((transaction) => {
    if (transaction.type === "income") {
      if (transaction.category === "Maqsad") {
        savedAmount += Number(transaction.amount);
      }
    }
    if (transaction.type === "outcome") {
      if (transaction.category === "Maqsad") {
        savedAmount -= Number(transaction.amount);
      }
    }
  });
  savedAmount = Math.max(savedAmount, 0);
  const percentage = Math.min((savedAmount / currentGoal.amount) * 100, 100);

  goalTitle.textContent = currentGoal.name;

  goalAmount.textContent = `${savedAmount.toLocaleString("fr-FR")} / ${currentGoal.amount.toLocaleString("fr-FR")} so'm`;

  goalPercentage.textContent = `${percentage.toFixed(1)}%`;

  goalBar.style.width = `${percentage}%`;

  goalHint.hidden = true;
  goalForm.hidden = true;
  goalProcess.hidden = false;
}

const highestCategory = document.getElementById("highest-category");
const highestAmount = document.getElementById("highest-amount");
const currentProgressCat = document.getElementById("current-progress-cat");
const percentageHighCat = document.getElementById("percentage-high-cat");

function renderHighestCategory(data) {
  const categories = {};
  let totalExpense = 0;

  data.forEach((transaction) => {
    if (transaction.type === "outcome" && transaction.category !== "Maqsad") {
      const category = transaction.category;
      const amount = Number(transaction.amount);

      categories[category] = (categories[category] || 0) + amount;

      totalExpense += amount;
    }
  });

  const categoryList = Object.entries(categories);

  if (categoryList.length === 0) {
    highestCategory.textContent = "Hozircha ma'lumot yo'q";
    highestAmount.textContent = "0.00";
    percentageHighCat.textContent = "0%";
    currentProgressCat.style.width = "0%";
    return;
  }

  const [name, amount] = categoryList.reduce((max, current) => {
    if (current[1] > max[1]) {
      return current;
    } else {
      return max;
    }
  });

  const percentage = (amount / totalExpense) * 100;

  highestCategory.textContent = name;
  highestAmount.textContent = `${amount.toLocaleString("fr-FR")} so'm`;
  percentageHighCat.textContent = `${percentage.toFixed(1)}%`;
  currentProgressCat.style.width = `${percentage}%`;
}

const searchInput = document.getElementById("searchInput");

function cancelEdit() {
  transactionForm.reset();
  editTransactionId = null;
  saveBtn.textContent = "Tranzaksiyani saqlash";
  searchTransactions();
}

function searchTransactions() {
  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredData = transactionData.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;

    const matchSearch = [
      item.izoh,
      item.category,
      item.date,
      item.type === "income" ? "daromad" : "xarajat",
      Number(item.amount).toLocaleString("fr-FR"),
      String(item.amount),
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);

    return matchType && matchSearch;
  });

  trBody.innerHTML = "";

  if (filteredData.length === 0) {
    if (transactionData.length === 0) {
      trBody.innerHTML = `
    <tr>
    <td class='empty-state' colspan='6'>Hozircha tranzaksiyalar yo'q</td>
    </tr>`;
      return;
    }
    trBody.innerHTML = `
    <tr>
    <td class='empty-state' colspan='6'>Tranzaksiya topilmadi</td>
    </tr>`;
    return;
  }

  filteredData.forEach((info) => {
    {
      const tr = document.createElement("tr");

      const values = [
        info.category,
        info.izoh,
        info.date,
        info.type === "income" ? "Daromad" : "Xarajat",
        `${Number(info.amount).toLocaleString("fr-FR")}`,
      ];

      values.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      const actionTd = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "✏️";
      editButton.type = "button";
      editButton.className = "action-btn edit-btn";
      editButton.textContent = editTransactionId === info.id ? "❌" : "✏️";

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑";
      deleteButton.type = "button";
      deleteButton.className = "action-btn delete-btn";

      actionTd.append(editButton, deleteButton);
      actionTd.className = "actions-btns";
      tr.appendChild(actionTd);

      trBody.appendChild(tr);

      editButton.addEventListener("click", () => {
        if (editTransactionId === info.id) return cancelEdit();

        amountInput.value = info.amount;
        categoryInput.value = info.category;
        typeOptions.value = info.type;
        dateInput.value = info.date;
        izohInput.value = info.izoh;
        editTransactionId = info.id;
        saveBtn.textContent = "Yangilash";
        searchTransactions();
      });

      deleteButton.addEventListener("click", () => {
        if (confirm("Tranzaksiyani o'chirishni xohlaysizmi?")) {
          fetch(`/transactions/${info.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "success") {
                fetchUsers();
                if (editTransactionId === info.id) {
                  cancelEdit();
                }
                alert("Tranzaksiya o'chirib tashlandi");
              } else {
                alert("Xatolik yuz berdi");
              }
            })
            .catch((err) => {
              alert("Serverga ulanib bo'lmadi");
              console.log("Serverga ulanib bo'lmadi", err);
            });
        }
      });
    }
  });
}

function debounce(callback, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

searchInput.addEventListener(
  "input",
  debounce(() => {
    searchTransactions();
  }, 500),
);
renderGoalProgress([]);
fetchUsers();
