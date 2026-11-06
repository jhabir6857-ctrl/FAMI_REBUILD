import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasServiceId: Boolean(process.env.EMAILJS_SERVICE_ID),
    hasTemplateId: Boolean(process.env.EMAILJS_TEMPLATE_ID),
    hasPublicKey: Boolean(process.env.EMAILJS_PUBLIC_KEY),
    serviceIdPrefix: process.env.EMAILJS_SERVICE_ID ? process.env.EMAILJS_SERVICE_ID.substring(0, 10) : null,
    hasSmtpUser: Boolean(process.env.SMTP_USER),
  })
}
