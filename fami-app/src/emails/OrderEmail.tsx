import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { formatBDT } from '@/lib/currency'

interface OrderEmailProps {
  orderId: number
  customerName: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  total: number
  shippingAddress: string
  statusMessage?: string
}

export default function OrderEmail({
  orderId = 1001,
  customerName = 'Valued Customer',
  items = [{ name: 'Rose Gold Solitaire', quantity: 1, price: 4500 }],
  subtotal = 4500,
  total = 4500,
  shippingAddress = 'Dhaka, Bangladesh',
  statusMessage = 'We have received your order and are currently processing it.',
}: OrderEmailProps) {
  const shipping = total - subtotal

  return (
    <Html>
      <Head />
      <Preview>FaMi Order #{orderId} Update</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>FaMi</Text>
          </Section>
          
          <Section style={bodySection}>
            <Heading style={heading}>Order #{orderId}</Heading>
            <Text style={paragraph}>Hello {customerName},</Text>
            <Text style={paragraph}>{statusMessage}</Text>
            
            <Section style={orderBox}>
              <Text style={orderBoxTitle}>Order Summary</Text>
              
              {items.map((item, i) => (
                <div key={i} style={itemRow}>
                  <Text style={itemText}>{item.quantity}x {item.name}</Text>
                  <Text style={itemText}>{formatBDT(item.price * item.quantity)}</Text>
                </div>
              ))}
              
              <Hr style={hr} />
              
              <div style={itemRow}>
                <Text style={itemText}>Subtotal</Text>
                <Text style={itemText}>{formatBDT(subtotal)}</Text>
              </div>
              <div style={itemRow}>
                <Text style={itemText}>Shipping</Text>
                <Text style={itemText}>{shipping === 0 ? 'Free' : formatBDT(shipping)}</Text>
              </div>
              <div style={itemRow}>
                <Text style={totalText}>Total</Text>
                <Text style={totalText}>{formatBDT(total)}</Text>
              </div>
            </Section>

            <Section style={addressBox}>
              <Text style={orderBoxTitle}>Shipping To</Text>
              <Text style={itemText}>{shippingAddress}</Text>
            </Section>

            <Text style={paragraph}>
              If you have any questions about this order, simply reply to this email.
            </Text>
            
            <Text style={signoff}>
              Warmest regards,
              <br />
              The FaMi Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Ac {new Date().getFullYear()} FaMi. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'HelveticaNeue, Helvetica, Arial, sans-serif',
}
const container = { margin: '0 auto', padding: '40px 0', width: '600px', maxWidth: '100%' }
const header = { backgroundColor: '#2b1c24', padding: '30px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const logoText = { color: '#ffffff', fontSize: '28px', fontWeight: '500', letterSpacing: '2px', margin: '0' }
const bodySection = { backgroundColor: '#ffffff', padding: '40px', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }
const heading = { fontSize: '24px', color: '#1a1a1a', fontWeight: 'normal', marginBottom: '24px' }
const paragraph = { fontSize: '15px', lineHeight: '24px', color: '#4a4a4a', marginBottom: '24px' }

const orderBox = { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px', marginBottom: '24px', border: '1px solid #e0e0e0' }
const addressBox = { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px', marginBottom: '24px', border: '1px solid #e0e0e0' }
const orderBoxTitle = { fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', uppercase: 'true', marginBottom: '16px' }
const itemRow = { display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }
const itemText = { fontSize: '14px', color: '#4a4a4a', margin: '0' }
const totalText = { fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', margin: '0' }
const hr = { borderColor: '#e0e0e0', margin: '16px 0' }

const signoff = { fontSize: '15px', color: '#1a1a1a', lineHeight: '24px' }
const footer = { backgroundColor: '#ffffff', padding: '24px 40px', borderTop: '1px solid #e0e0e0', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', borderRadius: '0 0 8px 8px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#8a8a8a', margin: '4px 0' }
