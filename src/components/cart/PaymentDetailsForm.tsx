
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

const paymentSchema = z.object({
  cardNumber: z.string().refine((val) => /^\d{13,19}$/.test(val.replace(/\s/g, '')), {
    message: "Invalid card number",
  }),
  cardName: z.string().min(2, "Name on card is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const PaymentDetailsForm = () => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  function onSubmit(data: PaymentFormValues) {
    console.log("Payment details submitted (mock):", data);
    alert("Payment details submitted (mock) - DO NOT USE REAL CARD INFO!");
  }
};

export default PaymentDetailsForm;
