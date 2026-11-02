import { createServer } from "node:http";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json",
};

let transactionID = 0;
let transaactions = []

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
            const newInfo = JSON.parse(body);
            updatedInfo.category = newInfo.category;
            updatedInfo.description = newInfo.description;
            updatedInfo.type = newInfo.type;
            updatedInfo.amount = newInfo.amount;
            res.writeHead(200, corsHeader);
            res.end(JSON.stringify({ ...updatedInfo, status: "success" }));
            return;
          });
        }
      } else if (req.method === "DELETE") {
        const deletedInfo = transactions.find(
          (a) => a.id === parseInt(transID),
        );
        if (deletedInfo) {
          transactions = transactions.filter((a) => a.id !== parseInt(transID));
          res.writeHead(200, corsHeader);
          res.end(JSON.stringify({ status: "success" }));
        }
        return;
      } else {
        res.writeHead(405, corsHeader);
        res.end(JSON.stringify({ xatolik: "user not found" }));
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
          const newTransaction = JSON.parse(body);
          transactions.push(newTransaction);
          res.writeHead(200, corsHeader);
          res.end(JSON.stringify({ ...newTransaction, status: "success" }));
        });
      } else {
        res.writeHead(405, corsHeader);
        res.end(JSON.stringify({ xatolik: "sorov metodi notogri" }));
      }
    } else {
      res.writeHead(405, corsHeader);
      res.end(JSON.stringify({ xatolik: "url metodi notogri" }));
    }
  } catch (error) {
    console.error("sorovda xatoli", error);
  }
});

server.listen(1313, () => {
  console.log("1313 port ishga tushdi");
});
