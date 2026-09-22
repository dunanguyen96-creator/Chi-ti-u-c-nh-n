-- AlterTable
ALTER TABLE "CardPayment" ADD COLUMN     "statementId" TEXT;

-- CreateIndex
CREATE INDEX "CardPayment_statementId_idx" ON "CardPayment"("statementId");

-- AddForeignKey
ALTER TABLE "CardPayment" ADD CONSTRAINT "CardPayment_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "CardStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
