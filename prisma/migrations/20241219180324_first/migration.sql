-- CreateTable
CREATE TABLE "User" (
    "user_pseudo_id" TEXT NOT NULL,
    "install_date" TIMESTAMP(3) NOT NULL,
    "install_timestamp" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_pseudo_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" TEXT NOT NULL,
    "user_pseudo_id" TEXT NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "session_timestamp" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);
