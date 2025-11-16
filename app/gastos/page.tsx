'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign } from 'lucide-react'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ToastNotification, useToast } from '@/components/ui/toast-notification'

interface Expense {
  id: string
  amount: string
  description: string
}

interface DayExpense {
  expenses: Expense[]
  notes?: string
}

interface ExpensesData {
  [date: string]: DayExpense
}

const STORAGE_KEY = 'gastos_data'
const COLORS = ['#a855f7', '#facc15', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAY_COLORS = ['#a855f7', '#facc15', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']

export default function GastosPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState<Date[]>([])
  const [expensesData, setExpensesData] = useState<ExpensesData>({})
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setExpensesData(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
        showToast('Erro', 'error')
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expensesData))
      sessionStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(expensesData))
    } catch (e) {
      console.error('Erro ao salvar dados:', e)
      showToast('Erro', 'error')
    }
  }, [expensesData])

  const getMonthDates = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const dates: Date[] = []
    
    if (firstDay.getDate() === 1 && currentDate.getDate() === 1) {
      const prevWeekStart = new Date(firstDay)
      prevWeekStart.setDate(prevWeekStart.getDate() - 7)
      for (let i = 0; i < 7; i++) {
        const date = new Date(prevWeekStart)
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d))
    }
    
    return dates
  }

  const getWeekDates = (date: Date) => {
    const day = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      week.push(d)
    }
    return week
  }

  const handleDateClick = (date: Date) => {
    const week = getWeekDates(date)
    setSelectedWeek(week)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const toggleDay = (dateStr: string) => {
    setOpenDays(prev => ({ ...prev, [dateStr]: !prev[dateStr] }))
  }

  const handleSave = (dateStr: string, data: DayExpense) => {
    setExpensesData(prev => ({
      ...prev,
      [dateStr]: data
    }))
    showToast('Salvo', 'success')
  }

  const getWeekStats = () => {
    if (selectedWeek.length === 0) return { total: 0, chartData: [], barData: [] }
    
    let total = 0
    const chartData: any[] = []
    const barData: any[] = []
    
    selectedWeek.forEach((date, index) => {
      const dateStr = formatDate(date)
      const dayData = expensesData[dateStr]
      if (dayData && dayData.expenses.length > 0) {
        const dayTotal = dayData.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0)
        total += dayTotal
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
        chartData.push({
          name: DIAS_SEMANA[dayIndex],
          value: parseFloat(dayTotal.toFixed(2)),
          color: DAY_COLORS[dayIndex]
        })
        barData.push({
          day: DIAS_SEMANA[dayIndex],
          amount: parseFloat(dayTotal.toFixed(2)),
          fill: DAY_COLORS[dayIndex]
        })
      }
    })
    
    return { total, chartData, barData }
  }

  const stats = getWeekStats()
  const monthDates = getMonthDates()

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Controle de Gastos
          </h1>
        </div>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-3 text-center">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="grid grid-cols-7 gap-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground p-1">
                {day}
              </div>
            ))}
            {monthDates.map((date, index) => {
              const isSelected = selectedWeek.some(d => formatDate(d) === formatDate(date))
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                    isSelected
                      ? 'bg-secondary text-secondary-foreground font-bold'
                      : 'hover:bg-accent'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </Card>

        {selectedWeek.length > 0 && (
          <div className="space-y-3">
            {selectedWeek.map((date) => {
              const dateStr = formatDate(date)
              const dayName = DIAS_SEMANA[date.getDay() === 0 ? 6 : date.getDay() - 1]
              const dayData = expensesData[dateStr]
              const isOpen = openDays[dateStr]

              return (
                <Card key={dateStr} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-foreground">
                        {dayName} - {formatDateDisplay(date)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleDay(dateStr)}
                      >
                        <Plus className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                      </Button>
                    </div>

                    {(isOpen || dayData) && (
                      <Collapsible open={isOpen || !!dayData}>
                        <CollapsibleContent>
                          <DayExpenses
                            data={dayData}
                            isOpen={isOpen}
                            onSave={(data) => handleSave(dateStr, data)}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {selectedWeek.length > 0 && stats.chartData.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Estatísticas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold text-center mb-2">Distribuição</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-center mb-2">Gastos por Dia</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.barData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="amount">
                      {stats.barData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/10">
              <p className="text-center text-xl font-bold text-foreground">
                Esta semana você gastou <span className="text-secondary text-2xl">R$ {stats.total.toFixed(2)}</span>
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function DayExpenses({
  data,
  isOpen,
  onSave
}: {
  data?: DayExpense
  isOpen: boolean
  onSave: (data: DayExpense) => void
}) {
  const [expenses, setExpenses] = useState<Expense[]>(data?.expenses || [{ id: crypto.randomUUID(), amount: '', description: '' }])
  const [notes, setNotes] = useState(data?.notes || '')
  const [editingId, setEditingId] = useState<string | null>(null)

  const addExpense = () => {
    setExpenses([...expenses, { id: crypto.randomUUID(), amount: '', description: '' }])
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: string, field: 'amount' | 'description', value: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const handleSaveClick = () => {
    const validExpenses = expenses.filter(e => e.amount && parseFloat(e.amount) > 0)
    if (validExpenses.length === 0) {
      alert('Adicione pelo menos um gasto com valor!')
      return
    }
    onSave({ expenses: validExpenses, notes })
  }

  if (!isOpen && data) {
    const total = data.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0)
    return (
      <div className="space-y-2 text-sm">
        {data.expenses.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between p-2 bg-muted rounded">
            <span>{exp.description || 'Sem descrição'}</span>
            <span className="font-semibold text-secondary">R$ {parseFloat(exp.amount).toFixed(2)}</span>
          </div>
        ))}
        <div className="pt-2 border-t font-bold flex justify-between">
          <span>Total:</span>
          <span className="text-secondary">R$ {total.toFixed(2)}</span>
        </div>
        {data.notes && (
          <div className="p-2 bg-muted rounded text-muted-foreground mt-2">
            {data.notes}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      {expenses.map((expense, index) => (
        <div key={expense.id} className="space-y-2 p-3 bg-accent rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Gasto {index + 1}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditingId(editingId === expense.id ? null : expense.id)}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              {expenses.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => removeExpense(expense.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3" />
              Valor (R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              value={expense.amount}
              onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Descrição
            </label>
            <Input
              value={expense.description}
              onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
              placeholder="Ex: Almoço, Transporte..."
              className="w-full"
            />
          </div>
        </div>
      ))}

      <Button onClick={addExpense} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Gasto
      </Button>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">
          Anotações Gerais (opcional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações sobre os gastos do dia..."
          className="w-full resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSaveClick} className="w-full">
        Salvar Tudo
      </Button>
    </div>
  )
}
