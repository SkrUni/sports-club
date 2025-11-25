import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Спортивный клуб - Управление услугами',
  description: 'Система учета услуг спортивного клуба',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' lang="ru">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
}



