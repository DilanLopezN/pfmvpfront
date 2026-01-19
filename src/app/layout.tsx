import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Goal Board - Constelação de Metas',
  description: 'Sistema de metas pessoais visual',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
