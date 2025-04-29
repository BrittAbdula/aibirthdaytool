'use client'

import { useState, useEffect } from 'react'
import { Loader2, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Generator {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  userId: string | null
  title: string
  label: string
  fields: any
  advancedFields: any | null
  templateInfo: string | null
  why: any | null
  promptContent: string
  r2Url?: string
}

export default function AdminGeneratorsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [generators, setGenerators] = useState<Generator[]>([])
  const [systemGenerators, setSystemGenerators] = useState<Generator[]>([])
  const [userGenerators, setUserGenerators] = useState<Generator[]>([])
  const [selectedGenerator, setSelectedGenerator] = useState<Generator | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editedGenerator, setEditedGenerator] = useState<Partial<Generator>>({})
  const [activeTab, setActiveTab] = useState('system')

  // 获取生成器数据
  useEffect(() => {
    async function fetchGenerators() {
      try {
        const response = await fetch('/api/admin/generators')
        if (!response.ok) throw new Error('Failed to fetch generators')
        const data = await response.json()
        setGenerators(data)
        setSystemGenerators(data.filter((gen: Generator) => gen.isSystem))
        setUserGenerators(data.filter((gen: Generator) => !gen.isSystem))
      } catch (error) {
        console.error('Error fetching generators:', error)
        toast({
          title: 'Error',
          description: 'Failed to load generators',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenerators()
  }, [])

  // 处理编辑
  const handleEdit = (generator: Generator) => {
    setSelectedGenerator(generator)
    setEditedGenerator({ ...generator })
    setIsEditing(true)
  }

  // 处理删除
  const handleDelete = (generator: Generator) => {
    setSelectedGenerator(generator)
    setIsDeleting(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    if (!selectedGenerator) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/generators/${selectedGenerator.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete generator')

      setGenerators(generators.filter(g => g.id !== selectedGenerator.id))
      setSystemGenerators(systemGenerators.filter(g => g.id !== selectedGenerator.id))
      setUserGenerators(userGenerators.filter(g => g.id !== selectedGenerator.id))
      
      toast({
        title: 'Success',
        description: 'Generator deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting generator:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete generator',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsDeleting(false)
      setSelectedGenerator(null)
    }
  }

  // 保存编辑
  const saveChanges = async () => {
    if (!selectedGenerator || !editedGenerator) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/generators/${selectedGenerator.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedGenerator),
      })

      if (!response.ok) throw new Error('Failed to update generator')
      const updatedGenerator = await response.json()

      // 更新本地状态
      const updatedGenerators = generators.map(g => 
        g.id === updatedGenerator.id ? updatedGenerator : g
      )
      setGenerators(updatedGenerators)
      setSystemGenerators(updatedGenerators.filter(g => g.isSystem))
      setUserGenerators(updatedGenerators.filter(g => !g.isSystem))
      
      toast({
        title: 'Success',
        description: 'Generator updated successfully',
      })
    } catch (error) {
      console.error('Error updating generator:', error)
      toast({
        title: 'Error',
        description: 'Failed to update generator',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsEditing(false)
      setSelectedGenerator(null)
    }
  }

  // 处理编辑表单改变
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedGenerator(prev => ({ ...prev, [name]: value }))
  }

  // 处理 JSON 输入改变
  const handleJsonInputChange = (name: string, value: string) => {
    try {
      // 尝试解析 JSON
      const parsedValue = JSON.parse(value)
      setEditedGenerator(prev => ({ ...prev, [name]: parsedValue }))
    } catch (error) {
      // 如果不是有效的 JSON，仍然更新文本值，但不解析
      setEditedGenerator(prev => ({ ...prev, [name]: value }))
    }
  }

  // 处理开关组件改变
  const handleSwitchChange = (name: string, checked: boolean) => {
    setEditedGenerator(prev => ({ ...prev, [name]: checked }))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">
        Generator Management
      </h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">
            System Generators <Badge className="ml-2">{systemGenerators.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="user">
            User Generators <Badge className="ml-2">{userGenerators.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <GeneratorTable 
            generators={systemGenerators} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            isSystem={true}
          />
        </TabsContent>
        
        <TabsContent value="user">
          <GeneratorTable 
            generators={userGenerators} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            isSystem={false}
          />
        </TabsContent>
      </Tabs>

      {/* 编辑对话框 */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Generator</DialogTitle>
            <DialogDescription>
              Make changes to the generator configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                name="name"
                value={editedGenerator.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Slug</Label>
              <Input
                name="slug"
                value={editedGenerator.slug || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Description</Label>
              <Textarea
                name="description"
                value={editedGenerator.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Title</Label>
              <Input
                name="title"
                value={editedGenerator.title || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Label</Label>
              <Input
                name="label"
                value={editedGenerator.label || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">R2 URL</Label>
              <Input
                name="r2Url"
                value={editedGenerator.r2Url || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Fields</Label>
              <Textarea
                name="fields"
                value={typeof editedGenerator.fields === 'object' 
                  ? JSON.stringify(editedGenerator.fields, null, 2) 
                  : editedGenerator.fields || ''}
                onChange={(e) => handleJsonInputChange('fields', e.target.value)}
                className="col-span-3 min-h-[150px] font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Why</Label>
              <Textarea
                name="why"
                value={typeof editedGenerator.why === 'object' 
                  ? JSON.stringify(editedGenerator.why, null, 2) 
                  : editedGenerator.why || ''}
                onChange={(e) => handleJsonInputChange('why', e.target.value)}
                className="col-span-3 min-h-[150px] font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Prompt Content</Label>
              <Textarea
                name="promptContent"
                value={editedGenerator.promptContent || ''}
                onChange={handleInputChange}
                className="col-span-3 min-h-[150px]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">System Generator</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  checked={!!editedGenerator.isSystem}
                  onCheckedChange={(checked) => handleSwitchChange('isSystem', checked)}
                />
                <span>{editedGenerator.isSystem ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Public</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  checked={!!editedGenerator.isPublic}
                  onCheckedChange={(checked) => handleSwitchChange('isPublic', checked)}
                />
                <span>{editedGenerator.isPublic ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveChanges} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the generator &quot;{selectedGenerator?.name}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 生成器表格组件
function GeneratorTable({
  generators,
  onEdit,
  onDelete,
  isSystem,
}: {
  generators: Generator[]
  onEdit: (generator: Generator) => void
  onDelete: (generator: Generator) => void
  isSystem: boolean
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generators.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No generators found
              </TableCell>
            </TableRow>
          ) : (
            generators.map((generator) => (
              <TableRow key={generator.id}>
                <TableCell className="font-medium">
                  {generator.name}
                  {generator.isSystem && (
                    <Badge variant="outline" className="ml-2">System</Badge>
                  )}
                </TableCell>
                <TableCell>{generator.slug}</TableCell>
                <TableCell>
                  {generator.isPublic ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">No</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(generator.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(generator)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(generator)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 