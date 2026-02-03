import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'English Learning App',
  description: 'Conversational English learning for German speakers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
