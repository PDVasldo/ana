'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Clock, DollarSign, FileText } from 'lucide-react'

export default function Home() {
  const options = [
    {
      title: 'Planilha Horários',
      image: 'https://cdn.stormwebs.site/IMG_9449.jpg',
      href: '/planilhas',
      icon: Clock,
      color: 'from-primary/20 to-primary/5'
    },
    {
      title: 'Gastos',
      image: 'https://cdn.stormwebs.site/1f33d710-0dd0-43a9-9974-f2a714244007.JPG',
      href: '/gastos',
      icon: DollarSign,
      color: 'from-secondary/20 to-secondary/5'
    },
    {
      title: 'Anotações',
      image: 'https://cdn.stormwebs.site/IMG_9071.JPG',
      href: '/anotacoes',
      icon: FileText,
      color: 'from-chart-3/20 to-chart-3/5'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SIT
          </h1>
          <p className="text-muted-foreground text-sm">
            Tá tudo aqui, ó
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option) => (
            <Link key={option.href} href={option.href}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                <div className={`bg-gradient-to-br ${option.color} p-4`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-card shadow-md">
                      <img
                        src={option.image || "/placeholder.svg"}
                        alt={option.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <option.icon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-card-foreground truncate">
                          {option.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
