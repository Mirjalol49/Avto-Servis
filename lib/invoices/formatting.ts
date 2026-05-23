export function formatInvoiceNumber(sequence: number) {
  return `#INV-${String(sequence).padStart(4, "0")}`;
}

export function invoicePdfFileName(invoiceId: string, plateNumber: string) {
  const safePlate = plateNumber.replace(/[^a-zA-Z0-9-]/g, "");

  return `INV-${invoiceId}-${safePlate}.pdf`;
}
