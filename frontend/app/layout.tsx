import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QalaqiChecker - გამოცდის შემოწმება',
  description: 'შეამოწმეთ მართვის მოწმობის გამოცდის ხელმისაწვდომობა',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  )
}
