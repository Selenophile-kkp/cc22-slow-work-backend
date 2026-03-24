export interface CreateServiceProps {
  userId: number;
  data: {
    categoryId: number;
    title: string;
    description?: string;
    image?: string;
    price: number;
    deliveryDays: number;
  };
}

export interface UpdateServiceProps {
  userId: number;
  serviceId: number;
  data: Partial<{
    title: string;
    categoryId: number;
    deliveryDays: number;
    description: string;
    image: string;
    price: number;
  }>;
}
