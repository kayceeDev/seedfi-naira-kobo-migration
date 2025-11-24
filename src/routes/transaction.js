const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

const nairaToKobo = (naira) => Math.round(naira * 100);

const koboToNaira = (kobo) => (kobo / 100).toFixed(2);

router.post("/", async (req, res) => {
  try {
    const { amount, description } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        amount: nairaToKobo(parseFloat(amount)),
        description,
      },
    });

    res.status(201).json({
      ...transaction,
      amountNaira: koboToNaira(transaction.amount),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });
    const formatted = transactions.map((t) => ({
      ...t,
      amountNaira: koboToNaira(t.amount),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    });

    res.json({
      total: result._count,
      totalAmountKobo: result._sum.amount,
      totalAmountNaira: koboToNaira(result._sum.amount || 0),
      averageAmountKobo: Math.round(result._avg.amount || 0),
      averageAmountNaira: koboToNaira(Math.round(result._avg.amount || 0)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
