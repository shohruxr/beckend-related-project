import { createServer } from "node:http";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json",
};

let transactionID = 0;
let transactions = [];
class TransactionValidator {
  constructor(categories) {
    this.categories = categories;
  }

  isRealDate(date) {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }
    const [year, month, day] = date.split("-").map(Number);
    const today = new Date(Date.UTC(year, month - 1, day));
    return (
      today.getUTCFullYear() === year &&
      today.getUTCMonth() === month - 1 &&
      today.getUTCDate() === day
    );
  }

  validate(data) {
    const errors = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return ["So'rov tanasi obyekt bo'lishi kerak"];
    }
    const { category, izoh, date, type, amount } = data;
    if (!this.categories.includes(category)) {
      errors.push("Kategoriya noto'gri");
    }
    if (typeof izoh !== "string" || !izoh.trim()) {
      errors.push("Izoh bo'sh bo'lmasligi kerak");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Summa 0 dan katta bo'lishi kerak");
    }
    if (type !== "income" && type !== "outcome") {
      errors.push("Summa 0 dan katta bo'lishi kerak");
    }
    if (!this.isRealDate(date)) {
      errors.push("Sana noto'g'ri");
    } else {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      if (Number(date.slice(0, 4)) < 2000) {
        errors.push("Yil 2000-yildan kichik bo'lmasligi kerak");
      } else if (date > tomorrow) {
        errors.push("Kelajakdagi sanani kiritish mumkin emas");
      }
    }
    return errors;
  }
}

const validator = new TransactionValidator([
  "Maosh",
  "O'yin-kulgi",
  "Oziq-ovqat",
  "Transport",
  "Uy-joy",
  "Kommunal",
  "Maqsad",
  "Boshqa",
]);

const server = createServer((req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(200, corsHeader);
      res.end();
      return;
    }

    if (req.url.startsWith("/transactions/")) {
      const transID = req.url.split("/")[2];
      if (req.method === "PUT") {
        const updatedInfo = transactions.find(
          (a) => a.id === parseInt(transID),
        );
        if (updatedInfo) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            let newInfo;
            try {
              newInfo = JSON.parse(body);
              const errors = validator.validate(newInfo);
              if (errors.length > 0) {
                res.writeHead(400, corsHeader);
                res.end(
                  JSON.stringify({ message: "Ma'lumotlar noto'g'ri", errors }),
                );
                return;
              }
              updatedInfo.category = newInfo.category;
              updatedInfo.izoh = newInfo.izoh;
              updatedInfo.date = newInfo.date;
              updatedInfo.type = newInfo.type;
              updatedInfo.amount = newInfo.amount;

              res.writeHead(200, corsHeader);
              res.end(JSON.stringify({ ...updatedInfo, status: "success" }));
              return;
            } catch {
              res.writeHead(400, corsHeader);
              res.end(JSON.stringify({ message: "Noto'g'ri JSON" }));
            }
          });
        } else {
          res.writeHead(404, corsHeader);
          res.end(JSON.stringify({ message: "Tranzaksiya topilmadi" }));
        }
      } else if (req.method === "DELETE") {
        const deletedInfo = transactions.find(
          (a) => a.id === parseInt(transID),
        );
        if (deletedInfo) {
          transactions = transactions.filter((a) => a.id !== parseInt(transID));
          res.writeHead(200, corsHeader);
          res.end(JSON.stringify({ status: "success" }));
        } else {
          res.writeHead(404, corsHeader);
          res.end(JSON.stringify({ message: "Tranzaksiya topilmadi" }));
        }
        return;
      } else {
        res.writeHead(405, corsHeader);
        res.end(JSON.stringify({ xatolik: "Transaction is not found" }));
        return;
      }
      return;
    }

    if (req.url === "/transactions") {
      if (req.method === "GET") {
        res.writeHead(200, corsHeader);
        res.end(JSON.stringify(transactions));
      } else if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          let newTransaction;
          try {
            const newInfo = JSON.parse(body);
            const errors = validator.validate(newInfo);
            if (errors.length > 0) {
              res.writeHead(400, corsHeader);
              res.end(
                JSON.stringify({ message: "Ma'lumotlar noto'g'ri", errors }),
              );
              return;
            }
            newTransaction = {
              id: ++transactionID,
              category: newInfo.category,
              izoh: newInfo.izoh,
              date: newInfo.date,
              type: newInfo.type,
              amount: newInfo.amount,
            };

            transactions.push(newTransaction);
            res.writeHead(201, corsHeader);
            res.end(JSON.stringify({ ...newTransaction, status: "success" }));
          } catch {
            res.writeHead(400, corsHeader);
            res.end(JSON.stringify({ message: "Noto'g'ri JSON" }));
          }
        });
      } else {
        res.writeHead(405, corsHeader);
        res.end(JSON.stringify({ xatolik: "sorov metodi notogri" }));
      }
    } else {
      res.writeHead(404, corsHeader);
      res.end(JSON.stringify({ message: "Manzil topilmadi" }));
    }
  } catch (error) {
    console.error("sorovda xatoli", error);
    res.writeHead(500, corsHeader);
    res.end(JSON.stringify({ message: "Serverda xatolik yuz berdi" }));
  }
});

server.listen(1313, () => {
  console.log("1313 port ishga tushdi");
});
