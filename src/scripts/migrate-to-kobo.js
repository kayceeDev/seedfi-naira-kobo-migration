const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateToKobo() {
  console.log("Starting migration from naira.kobo to kobo...");

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_kobo INTEGER`;
        console.log("✓ Added amount_kobo column");

        const transactions = await tx.transaction.findMany();
        console.log(`Found ${transactions.length} transactions to migrate`);

        for (const transaction of transactions) {
          const koboValue = Math.round(parseFloat(transaction.amount) * 100);

          await tx.$executeRaw`
          UPDATE transactions 
          SET amount_kobo = ${koboValue} 
          WHERE id = ${transaction.id}
        `;

          console.log(
            `Migrated transaction ${transaction.id}: ₦${transaction.amount} → ${koboValue} kobo`
          );
        }

        const unmigrated = await tx.$queryRaw`
        SELECT COUNT(*) as count FROM transactions WHERE amount_kobo IS NULL
      `;

        if (unmigrated[0].count > 0) {
          throw new Error(`${unmigrated[0].count} records failed to migrate`);
        }

        console.log("✓ All records successfully migrated to kobo format");
      },
      {
        maxWait: 10000,
        timeout: 60000,
      }
    );

    console.log("✓ Migration completed successfully");
    console.log("⚠ Run the schema migration to complete the process");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToKobo();
