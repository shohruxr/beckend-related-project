const todayDate = document.getElementById("today-date");
const today = new Date();
const option = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
todayDate.textContent = today.toLocaleString("uz-UZ", option);

const emptyState = document.getElementById("empty-state");
const trBody = document.getElementById("tr-body");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("kategoriya");
const typeOptions = document.querySelector(".type-options");
const dateInput = document.getElementById("date");
const izohInput = document.getElementById("izoh");
const saveBtn = document.getElementById("save-btn");
const transactionForm = document.getElementById("transaction-form");

let editTransactionId = null;

const fetchUsers = () => {
  fetch("http://localhost:1313/transactions")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.log("xatolik yuz berdi", data);
        return;
      }
      trBody.innerHTML = "";
      data.forEach((info) => {
        const tr = document.createElement("tr");

        const values = [
          info.category,
          info.izoh,
          info.date,
          info.type,
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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑";

        actionTd.append(editButton, deleteButton);
        tr.appendChild(actionTd);

        trBody.appendChild(tr);

        editButton.addEventListener("click", () => {
          amountInput.value = info.amount;
          categoryInput.value = info.category;
          typeOptions.value = info.type;
          dateInput.value = info.date;
          izohInput.value = info.izoh;
          editTransactionId = info.id;
          saveBtn.textContent = "Update";
        });

        deleteButton.addEventListener("click", () => {
          if (confirm("Do you want to delete the transaction")) {
            fetch(`http://localhost:1313/transactions/${info.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.status === "success") {
                  fetchUsers();
                  alert("Transaction has been deleted");
                } else {
                  alert("Error occured");
                }
              });
          }
        });
      });
    })
    .catch((err) => {
      console.log("error found", err);
    });
};

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = amountInput.value;
  const category = categoryInput.value;
  const type = typeOptions.value;
  const date = dateInput.value;
  const izoh = izohInput.value.trim();

  if (!amount || !category || !type || !date || !izoh) {
    alert("Barcha maydonlarni toldiring!");
    return;
  }
  if (!Number.isFinite(Number(amount)) || amount <= 0) {
    alert("Miqdor 0 dan katta bolishi kerak");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    alert("Sanani togri kiriting");
    return;
  }
  const year = Number(date.slice(0, 4));
  if (year < 2000 || year > today.getFullYear()) {
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

  if (editTransactionId) {
    fetch(`http://localhost:1313/transactions/${editTransactionId}`, {
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

          alert("Changes have been saved");
        } else {
          alert("Error occured while editing");
        }
      })
      .catch((err) => {
        console.log("Error occured while editing");
      });
  } else {
    fetch("http://localhost:1313/transactions", {
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

          alert("New transaction is added");
        } else {
          alert("Error occured");
        }
      })
      .catch((err) => {
        console.log("Error occured ", err);
      });
  }
});
