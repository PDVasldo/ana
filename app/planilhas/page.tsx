'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Pencil, Clock } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ToastNotification, useToast } from '@/components/ui/toast-notification'

interface TimeEntry {
  arrival?: string
  departure: string
  notes?: string
}

interface WeekData {
  [date: string]: TimeEntry
}

const STORAGE_KEY = 'planilha_horarios_data'

const DAY_COLORS = ['#a855f7', '#facc15', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function PlanilhasPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState<Date[]>([])
  const [weekData, setWeekData] = useState<WeekData>({})
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({})
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWeekData(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
        showToast('Erro', 'error')
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weekData))
      sessionStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(weekData))
    } catch (e) {
      console.error('Erro ao salvar dados:', e)
      showToast('Erro', 'error')
    }
  }, [weekData])

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

  const handleSave = (dateStr: string, data: TimeEntry) => {
    setWeekData(prev => ({
      ...prev,
      [dateStr]: data
    }))
    setEditMode(prev => ({ ...prev, [dateStr]: false }))
    showToast('Salvo', 'success')
  }

  const calculateHours = (arrival: string, departure: string) => {
    if (!departure) return 0
    const arr = arrival ? new Date(`2000-01-01T${arrival}`) : new Date(`2000-01-01T08:00`)
    const dep = new Date(`2000-01-01T${departure}`)
    const diff = (dep.getTime() - arr.getTime()) / (1000 * 60 * 60)
    return Math.max(0, diff)
  }

  const getWeekStats = () => {
    if (selectedWeek.length === 0) return { total: 0, chartData: [], barData: [] }
    
    let total = 0
    const chartData: any[] = []
    const barData: any[] = []
    
    selectedWeek.forEach((date, index) => {
      const dateStr = formatDate(date)
      const entry = weekData[dateStr]
      if (entry && entry.departure) {
        const hours = calculateHours(entry.arrival || '08:00', entry.departure)
        total += hours
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
        chartData.push({
          name: DIAS_SEMANA[dayIndex],
          value: parseFloat(hours.toFixed(2)),
          color: DAY_COLORS[dayIndex]
        })
        barData.push({
          day: DIAS_SEMANA[dayIndex],
          hours: parseFloat(hours.toFixed(2)),
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
            Planilha de Horários
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
                      ? 'bg-primary text-primary-foreground font-bold'
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
              const entry = weekData[dateStr]
              const isOpen = openDays[dateStr]
              const isEditing = editMode[dateStr]

              return (
                <Card key={dateStr} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-foreground">
                        {dayName} - {formatDateDisplay(date)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditMode(prev => ({ ...prev, [dateStr]: !prev[dateStr] }))
                            if (!editMode[dateStr]) {
                              showToast('Editado', 'success')
                            }
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleDay(dateStr)}
                        >
                          <Plus className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {(isOpen || isEditing || entry) && (
                      <Collapsible open={isOpen || isEditing || !!entry}>
                        <CollapsibleContent>
                          <DayEntry
                            entry={entry}
                            isEditing={isEditing || isOpen}
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
                <h3 className="font-semibold text-center mb-2">Horas por Dia</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.barData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="hours">
                      {stats.barData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <p className="text-center text-xl font-bold text-foreground">
                Esta semana você trabalhou <span className="text-primary text-2xl">{stats.total.toFixed(1)}</span> horas
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function DayEntry({
  entry,
  isEditing,
  onSave
}: {
  entry?: TimeEntry
  isEditing: boolean
  onSave: (data: TimeEntry) => void
}) {
  const [arrival, setArrival] = useState(entry?.arrival || '08:00')
  const [departure, setDeparture] = useState(entry?.departure || '')
  const [notes, setNotes] = useState(entry?.notes || '')

  const handleSaveClick = () => {
    if (!departure) {
      alert('Hora de saída é obrigatória!')
      return
    }
    onSave({ arrival, departure, notes })
  }

  if (!isEditing && entry) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>Chegada: {entry.arrival || '08:00'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>Saída: {entry.departure}</span>
        </div>
        {entry.notes && (
          <div className="p-2 bg-muted rounded text-muted-foreground">
            {entry.notes}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      <div>
        <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3" />
          Hora de Chegada (padrão 08:00)
        </label>
        <Input
          type="time"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3" />
          Hora de Saída {!entry?.departure && '*'}
        </label>
        <Input
          type="time"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">
          Anotações (opcional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações do dia..."
          className="w-full resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSaveClick} className="w-full">
        Salvar
      </Button>
    </div>
  )
}
