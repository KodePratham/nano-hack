import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Post Factory - AI Image Generation for Social Media',
  description: 'Create stunning social media visuals with AI. Perfect for brands, companies, and individuals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
