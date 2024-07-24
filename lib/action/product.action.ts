import prisma from "@/prisma/client";

export async function getLatestProduct() {
  const data = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
  return data;
}
