-- CreateIndex
CREATE INDEX "Session_user_pseudo_id_idx" ON "Session"("user_pseudo_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_pseudo_id_fkey" FOREIGN KEY ("user_pseudo_id") REFERENCES "User"("user_pseudo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
