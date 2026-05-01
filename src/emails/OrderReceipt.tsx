import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderReceiptProps {
  orderId: string;
  customerName: string;
  total: number;
  items: any[];
}

export const OrderReceipt = ({ orderId, customerName, total, items }: OrderReceiptProps) => (
  <Html>
    <Head />
    <Preview>Your KhUShKhUSh Order #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>KhUShKhUSh.</Heading>
        
        <Section style={content}>
          <Text style={text}>Yo {customerName},</Text>
          <Text style={text}>
            We got your order <span style={highlight}>#{orderId}</span>. It's locked in and we're getting it ready to drop.
          </Text>

          <Heading as="h2" style={h2}>THE DAMAGE.</Heading>
          
          <div style={table}>
            {items.map((item, i) => (
              <div key={i} style={row}>
                <Text style={itemText}>{item.qty}x {item.name_en} ({item.size})</Text>
                <Text style={priceText}>Rs. {(item.price * item.qty).toLocaleString()}</Text>
              </div>
            ))}
            <div style={{ ...row, borderTop: "2px solid #111111", paddingTop: "10px", marginTop: "10px" }}>
              <Text style={{...itemText, fontWeight: "bold"}}>Total (inc. Shipping)</Text>
              <Text style={{...priceText, color: "#C8FF00", backgroundColor: "#111111", padding: "4px 8px"}}>
                Rs. {total.toLocaleString()}
              </Text>
            </div>
          </div>

          <Text style={text}>
            Payment Method: <strong>CASH ON DELIVERY</strong><br/>
            Keep the cash ready. No loose change.
          </Text>

          <Text style={footer}>
            Gen-z We're Coming! <br/> @khushkhush.pk
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f4f4f4",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#111111",
  fontSize: "48px",
  fontWeight: "900",
  letterSpacing: "-2px",
  textTransform: "uppercase" as const,
  marginBottom: "40px",
  textAlign: "center" as const,
};

const content = {
  backgroundColor: "#ffffff",
  border: "4px solid #111111",
  padding: "40px",
};

const h2 = {
  fontSize: "24px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  marginBottom: "20px",
  borderBottom: "2px solid #111111",
  paddingBottom: "10px",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#111111",
  marginBottom: "24px",
};

const highlight = {
  backgroundColor: "#C8FF00",
  fontWeight: "bold",
  padding: "2px 6px",
};

const table = {
  width: "100%",
  marginBottom: "32px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
};

const itemText = {
  margin: "0",
  fontSize: "14px",
};

const priceText = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "bold",
};

const footer = {
  marginTop: "40px",
  fontSize: "12px",
  color: "#666666",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};
