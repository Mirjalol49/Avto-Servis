import { z } from "zod";

export const paymentMethodSchema = z.enum(["CASH", "CARD", "TRANSFER"]);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
