'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Desk, Room } from '@/lib/types'
import { z } from 'zod'
import { MultiSelect } from './multi-select'
import {
  makeCreateDesk,
  makeUpdateDesk,
  makeDeleteDesk,
} from '@/lib/server-actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeskFormModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number } | null
  rooms: Room[]
  onDeskCreated: () => void
  onDeskDeleted?: () => void
  isEditMode?: boolean
  deskData?: Desk | null
}

// Sample desk types
const deskTypes = [
  { value: 'standard', label: 'Standard' },
  { value: 'standing', label: 'Standing' },
  { value: 'corner', label: 'Corner' },
  { value: 'executive', label: 'Executive' },
]

// Sample features
const availableFeatures = [
  { value: 'monitor', label: 'External Monitor' },
  { value: 'docking', label: 'Docking Station' },
  { value: 'ergonomic', label: 'Ergonomic Chair' },
  { value: 'adjustable', label: 'Height Adjustable' },
  { value: 'privacy', label: 'Privacy Screen' },
  { value: 'power', label: 'Power Outlets' },
  { value: 'usb', label: 'USB Ports' },
  { value: 'ethernet', label: 'Ethernet Connection' },
]

// Form validation schema
const deskFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  roomId: z.string().min(1, 'Room is required'),
  features: z.array(z.string()).optional(),
})

export function DeskFormModal({
  isOpen,
  onClose,
  position,
  rooms,
  onDeskCreated,
  onDeskDeleted,
  isEditMode = false,
  deskData = null,
}: DeskFormModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load desk data when in edit mode
  useEffect(() => {
    if (isEditMode && deskData) {
      setName(deskData.name || '')
      setType(deskData.type || '')
      setDescription(deskData.description || '')
      setRoomId(deskData.roomId || '')
      setSelectedFeatures(deskData.features || [])
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      setName('')
      setType('')
      setDescription('')
      setRoomId('')
      setSelectedFeatures([])
    }
  }, [isEditMode, deskData])

  const handleSubmit = async () => {
    // Validate form
    try {
      deskFormSchema.parse({
        name,
        type,
        description,
        roomId,
        features: selectedFeatures,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(formattedErrors)
        return
      }
    }

    if (!position) {
      toast.error('Position data is missing')
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      if (isEditMode && deskData) {
        // Update existing desk
        await makeUpdateDesk({
          id: deskData.id,
          name,
          x: position.x,
          y: position.y,
          type,
          description,
          roomId,
          features: selectedFeatures,
        })

        toast.success('Desk updated successfully')
      } else {
        // Create new desk
        await makeCreateDesk({
          name,
          x: position.x,
          y: position.y,
          type,
          description,
          roomId,
          features: selectedFeatures,
        })

        toast.success('Desk created successfully')
      }

      // Reset form
      setName('')
      setType('')
      setDescription('')
      setRoomId('')
      setSelectedFeatures([])

      // Notify parent component
      onDeskCreated()
    } catch (error) {
      console.error('Error saving desk:', error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} desk`, {
        description: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the desk. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deskData) return

    setIsDeleting(true)

    try {
      await makeDeleteDesk(deskData.id)

      // Reset form
      setName('')
      setType('')
      setDescription('')
      setRoomId('')
      setSelectedFeatures([])

      // Close delete confirmation
      setShowDeleteConfirm(false)

      // Notify parent component
      if (onDeskDeleted) {
        onDeskDeleted()
      }
    } catch (error) {
      console.error('Error deleting desk:', error)
      toast.error('Failed to delete desk', {
        description:
          'An error occurred while deleting the desk. Please try again.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Desk' : 'Create New Desk'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {position && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-coordinate">X Coordinate</Label>
                  <Input id="x-coordinate" value={position.x} disabled />
                </div>
                <div>
                  <Label htmlFor="y-coordinate">Y Coordinate</Label>
                  <Input id="y-coordinate" value={position.y} disabled />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">
                Desk Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Desk A1"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">
                Desk Type <span className="text-red-500">*</span>
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger
                  id="type"
                  className={errors.type ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select desk type" />
                </SelectTrigger>
                <SelectContent>
                  {deskTypes.map(deskType => (
                    <SelectItem key={deskType.value} value={deskType.value}>
                      {deskType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="room">
                Room <span className="text-red-500">*</span>
              </Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger
                  id="room"
                  className={errors.roomId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <p className="text-xs text-red-500">{errors.roomId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="features">Features</Label>
              <MultiSelect
                options={availableFeatures}
                selected={selectedFeatures}
                onChange={setSelectedFeatures}
                placeholder="Select features"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter desk description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex items-center">
              {isEditMode && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Desk'
                ) : (
                  'Create Desk'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this desk?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              desk and remove it from the map.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
