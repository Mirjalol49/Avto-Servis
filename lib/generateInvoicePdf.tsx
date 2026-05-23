import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";

import type { InvoiceWithNumber } from "@/lib/invoices/data";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { shortJobId } from "@/lib/jobs/status";
import { formatCurrency } from "@/lib/money";

type InvoicePdfDocumentProps = {
  invoice: InvoiceWithNumber;
  currency: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#111827",
    color: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  muted: {
    color: "#6b7280",
  },
  invoiceTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "right",
  },
  rightText: {
    textAlign: "right",
  },
  infoGrid: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 12,
    marginRight: 10,
  },
  infoBoxLast: {
    marginRight: 0,
  },
  label: {
    color: "#6b7280",
    fontSize: 9,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  cell: {
    padding: 8,
  },
  cellNumber: {
    width: "8%",
  },
  cellName: {
    width: "42%",
  },
  cellPrice: {
    width: "20%",
  },
  cellQty: {
    width: "12%",
  },
  cellTotal: {
    width: "18%",
    textAlign: "right",
  },
  summary: {
    width: 220,
    marginLeft: "auto",
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryTotal: {
    borderTopWidth: 2,
    borderTopColor: "#111827",
    paddingTop: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  status: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    fontSize: 12,
    fontWeight: "bold",
  },
});

function paymentMethodLabel(value: string | null) {
  if (value === "CASH") return "Cash";
  if (value === "CARD") return "Card";
  if (value === "TRANSFER") return "Bank Transfer";

  return "Unknown";
}

export function InvoicePdfDocument({ invoice, currency }: InvoicePdfDocumentProps) {
  const customer = invoice.jobOrder.car.customer;
  const car = invoice.jobOrder.car;
  const parts = invoice.jobOrder.parts;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text>AS</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>AutoServis</Text>
              <Text style={styles.muted}>Car service management</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.rightText}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.rightText, styles.muted]}>
              {format(invoice.createdAt, "dd MMM yyyy")}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.bold}>{customer.name}</Text>
            <Text style={styles.muted}>{formatUzbekPhone(customer.phone)}</Text>
          </View>
          <View style={[styles.infoBox, styles.infoBoxLast]}>
            <Text style={styles.label}>Car</Text>
            <Text style={styles.bold}>{car.plateNumber}</Text>
            <Text style={styles.muted}>Job {shortJobId(invoice.jobOrder.id)}</Text>
            <Text style={styles.muted}>
              Master: {invoice.jobOrder.master?.name ?? "Unassigned"}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cellNumber]}>#</Text>
            <Text style={[styles.cell, styles.cellName]}>Part Name</Text>
            <Text style={[styles.cell, styles.cellPrice]}>Unit Price</Text>
            <Text style={[styles.cell, styles.cellQty]}>Qty</Text>
            <Text style={[styles.cell, styles.cellTotal]}>Total</Text>
          </View>
          {parts.length > 0 ? (
            parts.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index === parts.length - 1 ? styles.tableRowLast : {},
                ]}
              >
                <Text style={[styles.cell, styles.cellNumber]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.cellName]}>{item.part.name}</Text>
                <Text style={[styles.cell, styles.cellPrice]}>
                  {formatCurrency(item.unitPrice, currency)}
                </Text>
                <Text style={[styles.cell, styles.cellQty]}>{item.quantity}</Text>
                <Text style={[styles.cell, styles.cellTotal]}>
                  {formatCurrency(Number(item.unitPrice) * item.quantity, currency)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={[styles.cell, styles.cellNumber]}>1</Text>
              <Text style={[styles.cell, styles.cellName]}>Service only</Text>
              <Text style={[styles.cell, styles.cellPrice]}>
                {formatCurrency(invoice.serviceFee, currency)}
              </Text>
              <Text style={[styles.cell, styles.cellQty]}>1</Text>
              <Text style={[styles.cell, styles.cellTotal]}>
                {formatCurrency(invoice.serviceFee, currency)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Parts Total</Text>
            <Text>{formatCurrency(invoice.partsTotal, currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Service Fee</Text>
            <Text>{formatCurrency(invoice.serviceFee, currency)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text>TOTAL</Text>
            <Text>{formatCurrency(invoice.totalAmount, currency)}</Text>
          </View>
        </View>

        <View style={styles.status}>
          <Text>{invoice.isPaid ? "PAID" : "UNPAID"}</Text>
          {invoice.isPaid ? (
            <Text style={styles.muted}>
              {paymentMethodLabel(invoice.paymentMethod)} ·{" "}
              {invoice.paidAt ? format(invoice.paidAt, "dd MMM yyyy, HH:mm") : ""}
            </Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
