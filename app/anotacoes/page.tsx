'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Pencil, Trash2, Save } from 'lucide-react'
import { ToastNotification, useToast } from '@/components/ui/toast-notification'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'anotacoes_data'

export default function AnotacoesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setNotes(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
        showToast('Erro', 'error')
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
      sessionStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(notes))
    } catch (e) {
      console.error('Erro ao salvar dados:', e)
      showToast('Erro', 'error')
    }
  }, [notes])

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setNotes([newNote, ...notes])
    setEditingId(newNote.id)
    showToast('Salvo', 'success')
  }

  const updateNote = (id: string, field: 'title' | 'content', value: string) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, [field]: value, updatedAt: new Date().toISOString() }
        : note
    ))
  }

  const deleteNote = (id: string) => {
    if (confirm('Tem certeza que quer deletar esta anotação?')) {
      setNotes(notes.filter(note => note.id !== id))
      if (editingId === id) {
        setEditingId(null)
      }
    }
  }

  const toggleEdit = (id: string) => {
    const wasEditing = editingId === id
    setEditingId(editingId === id ? null : id)
    if (wasEditing) {
      showToast('Editado', 'success')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex-1">
            Minhas Anotações
          </h1>
          <Button onClick={addNote} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova
          </Button>
        </div>

        {notes.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">📝</div>
              <p className="text-muted-foreground">
                Nenhuma anotação ainda. Clique em "Nova" para começar!
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const isEditing = editingId === note.id

              return (
                <Card key={note.id} className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      {isEditing ? (
                        <Input
                          value={note.title}
                          onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                          placeholder="Título da anotação..."
                          className="text-lg font-semibold flex-1"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-foreground flex-1">
                          {note.title || 'Sem título'}
                        </h3>
                      )}
                      
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleEdit(note.id)}
                        >
                          {isEditing ? (
                            <Save className="w-4 h-4" />
                          ) : (
                            <Pencil className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <Textarea
                        value={note.content}
                        onChange={(e) => updateNote(note.id, 'content', e.target.value)}
                        placeholder="Escreva sua anotação aqui..."
                        className="w-full min-h-[150px] resize-none"
                        rows={6}
                      />
                    ) : (
                      <div className="text-foreground whitespace-pre-wrap min-h-[60px]">
                        {note.content || (
                          <span className="text-muted-foreground italic">
                            Anotação vazia...
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Criada: {formatDate(note.createdAt)}</span>
                      {note.updatedAt !== note.createdAt && (
                        <span>Editada: {formatDate(note.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground pt-4">
          {notes.length} {notes.length === 1 ? 'anotação' : 'anotações'} salva{notes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
