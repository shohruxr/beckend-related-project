import { fetch } from "undici-types";

const todayDate = document.getElementById("today-date");
const today = new Date();
const option = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
todayDate.textContent = today.toLocaleString("KR-kr", option);

const emptyState = document.getElementById("empty-state");
const trTable = document.getElementById("tr-table");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("kategoriya");
const typeOptions = document.getElementById("type-options");
const dateInput = document.getElementById("date");
const izohInput = document.getElementById("izoh");
const saveBtn = document.getElementById("save-btn");

let editUserId = null;

const fetchUsers = () => {
  fetch("/transactions")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.log("xatolik yuz berdi", data);
        return;
      }
      trTable.innerHTML = "";
      data.forEach((info) => {
        const editButton = document.createElement("button");
        editButton.textContent = "✏️";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑";

        const td = document.createElement("td");
        td.textContent = `${info.category}`;
        td.textContent = `${info.izoh}`;
        td.textContent = `${info.date}`;
        td.textContent = `${info.type}`;
        td.textContent = `${info.amount}`;
        td.textContent = `${editButton} ${deleteButton}`;

        trTable.appendChild(td);

        editButton.addEventListener("click", () => {
          amountInput.value = info.amount;
          categoryInput.value = info.category;
          typeOptions.value = info.type;
          dateInput.value = info.date;
          izohInput.value = info.izoh;
          editUserId = info.id;
          saveBtn.textContent = "Update";
        });

        deleteButton.addEventListener("click", () => {
          if (confirm("Do you want to delete the transaction")) {
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

saveBtn.addEventListener("click", () => {
  const transaction = {
    category: categoryInput.value,
    izoh: izohInput.value,
    date: dateInput.value,
    type: typeOptions.value,
    amount: amountInput.value,
  };

  if (editUserId) {
    fetch(`/transactions/${editUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application-json",
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          fetchUsers();
          amountInput.value = "";
          categoryInput.value = "";
          typeOptions.value = "";
          dateInput.value = "";
          izohInput.value = "";
          editUserId = null;
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
    fetch("/transactions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
      .then((res = res.json()))
      .then((data) => {
        if (data.status === "success") {
          fetchUsers();
          amountInput.value = "";
          categoryInput.value = "";
          typeOptions.value = "";
          dateInput.value = "";
          izohInput.value = "";

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
