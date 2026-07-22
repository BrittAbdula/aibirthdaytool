'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  FileUp,
  History,
  Loader2,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PricingCheckoutButton } from '@/components/PricingCheckoutButton';
import { toast } from '@/hooks/use-toast';
import {
  FREE_CREATOR_RECIPIENT_LIMIT,
  CREATOR_BATCH_LIMIT,
  getCardTypeForOccasion,
  getWorkAnniversaryYears,
  toCreatorDate,
  type CreatorOccasionType,
  type CreatorTone,
} from '@/lib/creator-pro';
import { trackMonetizationEvent } from '@/lib/monetization-client';
import { cn } from '@/lib/utils';

interface CreatorRecipient {
  id: string;
  name: string;
  occasionType: string;
  occasionDate: string;
  nextOccasionDate: string;
  daysUntil: number;
  notes: string | null;
}

interface CreatorBrandPreset {
  id: string;
  organizationName: string;
  primaryColor: string;
  tone: string;
  logoUrl: string | null;
}

interface CreatorBatchItem {
  id: string;
  recipientId: string | null;
  recipientName: string;
  occasionType: string;
  occasionDate: string;
  cardId: string | null;
  status: string;
  errorMessage: string | null;
  card: { r2Url: string | null; status: string; cardType: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface CreatorBatch {
  id: string;
  title: string;
  status: string;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
  brandPreset: Omit<CreatorBrandPreset, 'id'> | null;
  items: CreatorBatchItem[];
}

interface CreatorWorkspaceProps {
  initialPlan: 'FREE' | 'PREMIUM';
  initialRecipients: CreatorRecipient[];
  initialPreset: CreatorBrandPreset | null;
  initialBatches: CreatorBatch[];
  userName: string;
}

interface CsvImportError {
  row: number;
  message: string;
}

type WorkspaceView = 'upcoming' | 'recipients' | 'brand' | 'batches';

const occasionLabels: Record<string, string> = {
  birthday: 'Birthday',
  'work-anniversary': 'Work anniversary',
  welcome: 'Welcome',
  appreciation: 'Appreciation',
};

const toneLabels: Record<string, string> = {
  'warm-professional': 'Warm & professional',
  celebratory: 'Celebratory',
  playful: 'Playful',
  minimal: 'Minimal',
};

const viewItems: { id: WorkspaceView; label: string; icon: typeof CalendarDays }[] = [
  { id: 'upcoming', label: 'Next 30 days', icon: CalendarDays },
  { id: 'recipients', label: 'Recipients', icon: Users },
  { id: 'brand', label: 'Brand preset', icon: Palette },
  { id: 'batches', label: 'Batch history', icon: History },
];

const emptyRecipientForm = {
  name: '',
  occasionType: 'birthday' as CreatorOccasionType,
  occasionDate: '',
  notes: '',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`)
  );
}

function formatBatchDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getDueLabel(daysUntil: number) {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  return `In ${daysUntil} days`;
}

async function getJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong') as Error & { code?: string };
    error.code = data.code;
    throw error;
  }
  return data;
}

export function CreatorWorkspace({
  initialPlan,
  initialRecipients,
  initialPreset,
  initialBatches,
  userName,
}: CreatorWorkspaceProps) {
  const reduceMotion = useReducedMotion();
  const [activeView, setActiveView] = useState<WorkspaceView>('upcoming');
  const [recipients, setRecipients] = useState(initialRecipients);
  const [preset, setPreset] = useState(initialPreset);
  const [batches, setBatches] = useState(initialBatches);
  const [recipientDialogOpen, setRecipientDialogOpen] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [recipientForm, setRecipientForm] = useState(emptyRecipientForm);
  const [recipientSaving, setRecipientSaving] = useState(false);
  const [recipientPendingDelete, setRecipientPendingDelete] = useState<CreatorRecipient | null>(null);
  const [recipientDeleting, setRecipientDeleting] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportErrors, setCsvImportErrors] = useState<CsvImportError[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [batchTitle, setBatchTitle] = useState('Upcoming team moments');
  const [generatingBatchId, setGeneratingBatchId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState({ completed: 0, total: 0 });
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallSource, setPaywallSource] = useState('creator_workspace');
  const [brandForm, setBrandForm] = useState({
    organizationName: initialPreset?.organizationName || '',
    primaryColor: initialPreset?.primaryColor || '#B4375F',
    tone: (initialPreset?.tone || 'warm-professional') as CreatorTone,
    logoUrl: initialPreset?.logoUrl || '',
  });
  const [brandSaving, setBrandSaving] = useState(false);

  const isPremium = initialPlan === 'PREMIUM';
  const upcomingRecipients = useMemo(
    () => recipients.filter((recipient) => recipient.daysUntil <= 30),
    [recipients]
  );

  useEffect(() => {
    trackMonetizationEvent({
      eventType: 'creator_workspace_view',
      source: 'creator_workspace',
      path: '/creator',
      metadata: {
        plan: initialPlan,
        recipientCount: initialRecipients.length,
        batchCount: initialBatches.length,
      },
    });
  }, [initialBatches.length, initialPlan, initialRecipients.length]);

  const refreshRecipients = async () => {
    const data = await getJson(await fetch('/api/creator/recipients', { cache: 'no-store' }));
    setRecipients(data.recipients);
  };

  const refreshBatches = async () => {
    const data = await getJson(await fetch('/api/creator/batches', { cache: 'no-store' }));
    setBatches(data.batches);
  };

  const openNewRecipient = () => {
    setEditingRecipientId(null);
    setRecipientForm(emptyRecipientForm);
    setRecipientDialogOpen(true);
  };

  const openEditRecipient = (recipient: CreatorRecipient) => {
    setEditingRecipientId(recipient.id);
    setRecipientForm({
      name: recipient.name,
      occasionType: recipient.occasionType as CreatorOccasionType,
      occasionDate: recipient.occasionDate,
      notes: recipient.notes || '',
    });
    setRecipientDialogOpen(true);
  };

  const saveRecipient = async () => {
    setRecipientSaving(true);
    try {
      const url = editingRecipientId
        ? `/api/creator/recipients/${editingRecipientId}`
        : '/api/creator/recipients';
      await getJson(await fetch(url, {
        method: editingRecipientId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipientForm),
      }));
      await refreshRecipients();
      setRecipientDialogOpen(false);
      toast({ title: editingRecipientId ? 'Recipient updated' : 'Recipient added' });
    } catch (error) {
      if ((error as Error & { code?: string }).code === 'creator_pro_required') {
        setPaywallSource('creator_recipient_limit');
        setPaywallOpen(true);
        setRecipientDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Could not save recipient', description: (error as Error).message });
      }
    } finally {
      setRecipientSaving(false);
    }
  };

  const deleteRecipient = async () => {
    if (!recipientPendingDelete) return;
    setRecipientDeleting(true);
    try {
      await getJson(await fetch(`/api/creator/recipients/${recipientPendingDelete.id}`, { method: 'DELETE' }));
      setRecipients((current) => current.filter((recipient) => recipient.id !== recipientPendingDelete.id));
      setSelectedRecipientIds((current) => current.filter((id) => id !== recipientPendingDelete.id));
      setRecipientPendingDelete(null);
      toast({ title: 'Recipient removed' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not remove recipient', description: (error as Error).message });
    } finally {
      setRecipientDeleting(false);
    }
  };

  const importCsv = async (file: File | undefined) => {
    if (!file) return;
    setCsvImporting(true);
    setCsvImportErrors([]);
    try {
      const csv = await file.text();
      const data = await getJson(await fetch('/api/creator/recipients/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      }));
      await refreshRecipients();
      setCsvImportErrors(data.errors || []);
      toast({
        title: `${data.imported} recipient${data.imported === 1 ? '' : 's'} imported`,
        description: data.limited
          ? 'The free roster is full. Creator Pro unlocks the remaining rows.'
          : data.errors?.length
            ? `${data.errors.length} row${data.errors.length === 1 ? '' : 's'} need attention.`
            : undefined,
      });
      if (data.limited) {
        setPaywallSource('creator_csv_limit');
        setPaywallOpen(true);
      }
    } catch (error) {
      setCsvImportErrors([{ row: 0, message: (error as Error).message }]);
      if ((error as Error & { code?: string }).code === 'creator_pro_required') {
        setPaywallSource('creator_csv_limit');
        setPaywallOpen(true);
      } else {
        toast({ variant: 'destructive', title: 'CSV import failed', description: (error as Error).message });
      }
    } finally {
      setCsvImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csv = [
      'name,occasionType,occasionDate,notes',
      'Taylor Morgan,birthday,1992-08-12,Design team',
      'Jordan Lee,work-anniversary,2020-09-03,Joined the London office',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mewtrucard-recipient-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveBrandPreset = async () => {
    setBrandSaving(true);
    try {
      const data = await getJson(await fetch('/api/creator/brand-preset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm),
      }));
      setPreset(data.preset);
      toast({ title: 'Brand preset saved' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not save brand preset', description: (error as Error).message });
    } finally {
      setBrandSaving(false);
    }
  };

  const updateBatchItem = async (
    batchId: string,
    update: { itemId: string; status: 'pending' | 'generating' | 'completed' | 'failed'; cardId?: string; errorMessage?: string }
  ) => {
    const data = await getJson(await fetch(`/api/creator/batches/${batchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    }));
    setBatches((current) => current.map((batch) => batch.id === batchId ? data.batch : batch));
    return data.batch as CreatorBatch;
  };

  const generateItem = async (batch: CreatorBatch, item: CreatorBatchItem) => {
    await updateBatchItem(batch.id, { itemId: item.id, status: 'generating' });
    try {
      const brand = batch.brandPreset || preset;
      const organizationName = brand?.organizationName || 'our team';
      const tone = brand?.tone || 'warm-professional';
      const anniversaryYears = item.occasionType === 'work-anniversary'
        ? getWorkAnniversaryYears(toCreatorDate(item.occasionDate))
        : 0;
      const occasionDescription = anniversaryYears > 0
        ? `${anniversaryYears}-year work anniversary`
        : occasionLabels[item.occasionType] || 'team occasion';
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardType: getCardTypeForOccasion(item.occasionType),
          size: 'portrait',
          modelId: 'Free_SVG',
          outputFormat: 'svg',
          to: item.recipientName,
          recipientName: item.recipientName,
          relationship: 'colleague',
          message: `Create a ${occasionDescription} card for ${item.recipientName} from ${organizationName}.`,
          tone,
          signed: organizationName,
          requirements: brand
            ? `Use ${brand.primaryColor} as the main brand color. Keep the design polished and workplace-appropriate.`
            : 'Keep the design polished and workplace-appropriate.',
          isPublic: false,
        }),
      });
      const started = await getJson(response);
      const cardId = started.cardId as string;

      for (let attempt = 0; attempt < 48; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 800 : 2500));
        const status = await getJson(await fetch(`/api/card-status?cardId=${encodeURIComponent(cardId)}`, { cache: 'no-store' }));
        if (status.status === 'completed') {
          await updateBatchItem(batch.id, { itemId: item.id, status: 'completed', cardId });
          return;
        }
        if (status.status === 'failed') throw new Error(status.errorMessage || 'Generation failed');
      }
      throw new Error('Generation timed out. You can retry this item.');
    } catch (error) {
      await updateBatchItem(batch.id, {
        itemId: item.id,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Generation failed',
      });
    }
  };

  const generateBatch = async (batch: CreatorBatch, items = batch.items.filter((item) => item.status === 'pending')) => {
    if (items.length === 0) return;
    setGeneratingBatchId(batch.id);
    setGenerationProgress({ completed: 0, total: items.length });
    try {
      for (let index = 0; index < items.length; index += 3) {
        const group = items.slice(index, index + 3);
        await Promise.all(group.map((item) => generateItem(batch, item)));
        setGenerationProgress({ completed: Math.min(index + group.length, items.length), total: items.length });
      }
      await refreshBatches();
      toast({ title: batch.isPreview ? 'Your batch preview is ready' : 'Batch generation finished' });
    } finally {
      setGeneratingBatchId(null);
    }
  };

  const createBatch = async () => {
    if (selectedRecipientIds.length === 0) {
      toast({ variant: 'destructive', title: 'Select at least one recipient' });
      return;
    }
    try {
      const data = await getJson(await fetch('/api/creator/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: batchTitle, recipientIds: selectedRecipientIds }),
      }));
      const batch = data.batch as CreatorBatch;
      setBatches((current) => [batch, ...current]);
      setActiveView('batches');
      setSelectedRecipientIds([]);
      await generateBatch(batch);
    } catch (error) {
      if ((error as Error & { code?: string }).code === 'creator_pro_required') {
        setPaywallSource(selectedRecipientIds.length > FREE_CREATOR_RECIPIENT_LIMIT ? 'creator_batch_size' : 'creator_preview_used');
        setPaywallOpen(true);
      } else {
        toast({ variant: 'destructive', title: 'Could not create batch', description: (error as Error).message });
      }
    }
  };

  const toggleRecipientSelection = (recipientId: string) => {
    if (selectedRecipientIds.includes(recipientId)) {
      setSelectedRecipientIds(selectedRecipientIds.filter((id) => id !== recipientId));
      return;
    }
    if (selectedRecipientIds.length >= CREATOR_BATCH_LIMIT) {
      toast({
        variant: 'destructive',
        title: `Choose up to ${CREATOR_BATCH_LIMIT} recipients`,
        description: 'Create this batch first, then start another for the remaining recipients.',
      });
      return;
    }
    setSelectedRecipientIds([...selectedRecipientIds, recipientId]);
  };

  const selectVisibleRecipients = (rows: CreatorRecipient[]) => {
    const next = [...selectedRecipientIds];
    for (const recipient of rows) {
      if (!next.includes(recipient.id) && next.length < CREATOR_BATCH_LIMIT) next.push(recipient.id);
    }
    if (rows.some((recipient) => !next.includes(recipient.id))) {
      toast({
        title: `Selected the first ${CREATOR_BATCH_LIMIT} recipients`,
        description: 'Creator Pro batches support up to 50 cards at a time.',
      });
    }
    setSelectedRecipientIds(next);
  };

  const exportBatchManifest = (batch: CreatorBatch) => {
    if (!isPremium) {
      setPaywallSource('creator_batch_export');
      setPaywallOpen(true);
      return;
    }
    const rows = [
      ['Recipient', 'Occasion', 'Date', 'Card URL'],
      ...batch.items
        .filter((item) => item.status === 'completed' && item.cardId)
        .map((item) => [
          item.recipientName,
          occasionLabels[item.occasionType] || item.occasionType,
          item.occasionDate,
          `${window.location.origin}/${item.card?.cardType || getCardTypeForOccasion(item.occasionType)}/edit/${item.cardId}`,
        ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${batch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'creator-batch'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderBatchComposer = (view: WorkspaceView) => (
    <div className="mt-7 grid gap-4 border-t border-[#E8CDD6] pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor={`batch-title-${view}`}>Batch name</Label>
          <p className="text-xs font-semibold text-primary" aria-live="polite">
            {selectedRecipientIds.length} selected · {CREATOR_BATCH_LIMIT} maximum
          </p>
        </div>
        <Input
          id={`batch-title-${view}`}
          value={batchTitle}
          onChange={(event) => setBatchTitle(event.target.value)}
          className="mt-2 h-11 max-w-xl border-[#DDBDC8] bg-white"
        />
        <p className="mt-2 text-xs text-[#7B8292]">
          {isPremium
            ? 'Creator Pro generates every selected card and keeps the batch reusable.'
            : 'Free includes one generated card preview. Additional selected items stay locked until you subscribe.'}
        </p>
      </div>
      <Button
        className="h-11 bg-primary px-6 text-white hover:bg-primary/90"
        onClick={createBatch}
        disabled={generatingBatchId !== null || selectedRecipientIds.length === 0 || !batchTitle.trim()}
      >
        {generatingBatchId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {selectedRecipientIds.length === 0
          ? 'Select recipients'
          : isPremium
            ? `Generate ${selectedRecipientIds.length} card${selectedRecipientIds.length === 1 ? '' : 's'}`
            : 'Generate free preview'}
      </Button>
    </div>
  );

  const renderRecipientRows = (
    rows: CreatorRecipient[],
    { selectable = false, editable = false }: { selectable?: boolean; editable?: boolean } = {}
  ) => (
    <div className="divide-y divide-[#E8CDD6] border-y border-[#E8CDD6]">
      {rows.map((recipient) => {
        const selected = selectedRecipientIds.includes(recipient.id);
        return (
          <div
            key={recipient.id}
            className={cn(
              'grid gap-3 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_180px_130px_auto] sm:items-center',
              selectable && 'hover:bg-[#FFF3F5]',
              selected && 'bg-[#FFF3F5]'
            )}
          >
            {selectable ? (
              <button
                type="button"
                className="flex min-h-11 min-w-0 items-center gap-3 rounded-md px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => toggleRecipientSelection(recipient.id)}
                aria-pressed={selected}
                aria-label={`${selected ? 'Remove' : 'Add'} ${recipient.name} ${selected ? 'from' : 'to'} batch`}
              >
                <span className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                  selected ? 'border-primary bg-primary text-white' : 'border-[#CFAEBA] bg-white'
                )} aria-hidden="true">
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[#202A3D]">{recipient.name}</span>
                  <span className="mt-1 block truncate text-sm text-[#687084]">{recipient.notes || 'No private notes'}</span>
                </span>
              </button>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#202A3D]">{recipient.name}</p>
                  <p className="mt-1 truncate text-sm text-[#687084]">{recipient.notes || 'No private notes'}</p>
                </div>
              </div>
            )}
            <p className="text-sm font-medium text-[#3F485B]">{occasionLabels[recipient.occasionType] || recipient.occasionType}</p>
            <div>
              <p className="text-sm font-semibold text-[#202A3D]">{formatDate(recipient.nextOccasionDate)}</p>
              <p className="mt-1 text-xs text-primary">{getDueLabel(recipient.daysUntil)}</p>
            </div>
            {editable && (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditRecipient(recipient)} aria-label={`Edit ${recipient.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setRecipientPendingDelete(recipient)} aria-label={`Delete ${recipient.name}`}>
                  <Trash2 className="h-4 w-4 text-[#9E405E]" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#202A3D]">
      <div className="border-b border-[#E8CDD6] bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Creator workspace</p>
                <span className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  isPremium ? 'bg-primary text-white' : 'border border-[#DDBDC8] bg-white text-[#6B5060]'
                )}>
                  {isPremium ? 'Creator Pro' : 'Free preview'}
                </span>
              </div>
              <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Welcome back, {userName.split(' ')[0]}.</h1>
              <p className="mt-2 text-sm leading-6 text-[#687084]">Plan the next 30 days, then generate each personalized card as one batch.</p>
            </div>
            <Button className="h-11 bg-primary text-white hover:bg-primary/90" onClick={openNewRecipient}>
              <Plus className="mr-2 h-4 w-4" /> Add recipient
            </Button>
          </div>

          <nav className="mt-8 flex gap-1 overflow-x-auto" aria-label="Creator workspace sections">
            {viewItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  aria-pressed={activeView === item.id}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors',
                    activeView === item.id ? 'border-primary text-primary' : 'border-transparent text-[#687084] hover:text-[#202A3D]'
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            {activeView === 'upcoming' && (
              <section>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-serif text-3xl font-semibold">Next 30 days</h2>
                    <p className="mt-2 text-sm text-[#687084]">Select upcoming moments to make one preview or a complete Creator Pro batch.</p>
                  </div>
                  {recipients.length > 0 && (
                    <button type="button" onClick={() => setActiveView('recipients')} className="inline-flex min-h-11 items-center text-left text-sm font-semibold text-primary hover:underline">
                      Manage all {recipients.length} recipients
                    </button>
                  )}
                </div>

                {upcomingRecipients.length > 0 ? (
                  <div className="mt-7">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-[#687084]">Choose the occasions to include.</p>
                      <div className="flex gap-3 text-sm font-semibold">
                        <button type="button" className="min-h-11 text-primary hover:underline" onClick={() => selectVisibleRecipients(upcomingRecipients)}>Select all shown</button>
                        {selectedRecipientIds.length > 0 && <button type="button" className="min-h-11 text-[#687084] hover:text-[#202A3D]" onClick={() => setSelectedRecipientIds([])}>Clear</button>}
                      </div>
                    </div>
                    {renderRecipientRows(upcomingRecipients, { selectable: true })}
                    {renderBatchComposer('upcoming')}
                  </div>
                ) : (
                  <div className="mt-10 border-y border-dashed border-[#DDBDC8] py-14 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">No occasions in the next 30 days</h3>
                    <p className="mt-2 text-sm text-[#687084]">
                      {recipients.length > 0
                        ? 'Your saved recipients are still available for an off-cycle batch.'
                        : 'Add birthdays and work anniversaries to turn this into your working queue.'}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-5 border-primary/30 text-primary"
                      onClick={() => recipients.length > 0 ? setActiveView('recipients') : openNewRecipient()}
                    >
                      {recipients.length > 0 ? 'Choose from full roster' : 'Add a recipient'}
                    </Button>
                  </div>
                )}
              </section>
            )}

            {activeView === 'recipients' && (
              <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-serif text-3xl font-semibold">Recipient roster</h2>
                    <p className="mt-2 text-sm text-[#687084]">
                      {isPremium ? `${recipients.length} saved recipients.` : `${recipients.length} of ${FREE_CREATOR_RECIPIENT_LIMIT} free recipient slots used.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" className="text-primary" onClick={downloadCsvTemplate}>
                      <Download className="mr-2 h-4 w-4" /> CSV template
                    </Button>
                    <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-[#DDBDC8] bg-white px-4 text-sm font-semibold text-[#3F485B] hover:bg-[#FFF8F6] focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                      {csvImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                      Import CSV
                      <input type="file" accept=".csv,text/csv" className="sr-only" disabled={csvImporting} onChange={(event) => {
                        void importCsv(event.target.files?.[0]);
                        event.currentTarget.value = '';
                      }} />
                    </label>
                    <Button className="h-11 bg-primary text-white hover:bg-primary/90" onClick={openNewRecipient}>
                      <Plus className="mr-2 h-4 w-4" /> Add recipient
                    </Button>
                  </div>
                </div>
                <p className="mt-5 text-xs text-[#7B8292]">CSV headers: name, occasionType, occasionDate, notes. Dates use YYYY-MM-DD.</p>
                {csvImportErrors.length > 0 && (
                  <div className="mt-4 border-l-4 border-[#A23858] bg-[#FFF3F5] px-4 py-3 text-sm text-[#7D2945]" role="alert">
                    <p className="font-semibold">Some CSV rows need attention</p>
                    <ul className="mt-2 space-y-1">
                      {csvImportErrors.slice(0, 5).map((error, index) => (
                        <li key={`${error.row}-${index}`}>{error.row > 0 ? `Row ${error.row}: ` : ''}{error.message}</li>
                      ))}
                    </ul>
                    {csvImportErrors.length > 5 && <p className="mt-2">Plus {csvImportErrors.length - 5} more row errors.</p>}
                  </div>
                )}
                <div className="mt-7">
                  {recipients.length > 0 ? (
                    <>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-[#687084]">Select anyone in the roster, even when their date is outside the 30-day queue.</p>
                        <div className="flex gap-3 text-sm font-semibold">
                          <button type="button" className="min-h-11 text-primary hover:underline" onClick={() => selectVisibleRecipients(recipients)}>Select up to 50</button>
                          {selectedRecipientIds.length > 0 && <button type="button" className="min-h-11 text-[#687084] hover:text-[#202A3D]" onClick={() => setSelectedRecipientIds([])}>Clear</button>}
                        </div>
                      </div>
                      {renderRecipientRows(recipients, { selectable: true, editable: true })}
                      {renderBatchComposer('recipients')}
                    </>
                  ) : (
                    <div className="border-y border-dashed border-[#DDBDC8] py-14 text-center text-sm text-[#687084]">Your roster is empty.</div>
                  )}
                </div>
              </section>
            )}

            {activeView === 'brand' && (
              <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)]">
                <div>
                  <h2 className="font-serif text-3xl font-semibold">Brand preset</h2>
                  <p className="mt-2 text-sm text-[#687084]">One reusable preset keeps every card recognizable without repeating setup.</p>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="organization-name">Organization name</Label>
                      <Input id="organization-name" className="mt-2 h-11 border-[#DDBDC8]" value={brandForm.organizationName} onChange={(event) => setBrandForm((current) => ({ ...current, organizationName: event.target.value }))} placeholder="Northstar Studio" />
                    </div>
                    <div>
                      <Label htmlFor="brand-color">Primary color</Label>
                      <div className="mt-2 flex gap-2">
                        <input id="brand-color" type="color" className="h-11 w-14 rounded-md border border-[#DDBDC8] bg-white p-1" value={brandForm.primaryColor} onChange={(event) => setBrandForm((current) => ({ ...current, primaryColor: event.target.value }))} />
                        <Input aria-label="Brand color hex value" className="h-11 border-[#DDBDC8]" value={brandForm.primaryColor} onChange={(event) => setBrandForm((current) => ({ ...current, primaryColor: event.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="brand-tone">Tone</Label>
                      <Select value={brandForm.tone} onValueChange={(tone) => setBrandForm((current) => ({ ...current, tone: tone as CreatorTone }))}>
                        <SelectTrigger id="brand-tone" className="mt-2 h-11 border-[#DDBDC8]"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(toneLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="mt-7 h-11 bg-primary text-white hover:bg-primary/90" onClick={saveBrandPreset} disabled={brandSaving}>
                    {brandSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Save preset
                  </Button>
                </div>
                <div className="self-start border-y border-[#E8CDD6] py-8 lg:mt-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live direction</p>
                  <div className="mt-5 aspect-[4/3] overflow-hidden rounded-md bg-[#FFF8F6] p-7" style={{ borderLeft: `8px solid ${brandForm.primaryColor}` }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#687084]">{brandForm.organizationName || 'Your organization'}</p>
                    <p className="mt-14 font-serif text-3xl font-semibold">A thoughtful moment, on time.</p>
                    <p className="mt-4 text-sm text-[#687084]">{toneLabels[brandForm.tone]} · Brand color {brandForm.primaryColor.toUpperCase()}</p>
                  </div>
                </div>
              </section>
            )}

            {activeView === 'batches' && (
              <section>
                <div>
                  <h2 className="font-serif text-3xl font-semibold">Batch history</h2>
                  <p className="mt-2 text-sm text-[#687084]">Review finished cards, retry failures, and export a reusable delivery manifest.</p>
                </div>
                {generatingBatchId && generationProgress.total > 0 && (
                  <div className="mt-7 border-y border-[#E8CDD6] py-5" aria-live="polite">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Generating batch</span>
                      <span>{generationProgress.completed}/{generationProgress.total}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F1E4E8]">
                      <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${(generationProgress.completed / generationProgress.total) * 100}%` }}
                        transition={{ duration: reduceMotion ? 0 : 0.2 }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-7 space-y-10">
                  {batches.map((batch) => {
                    const completed = batch.items.filter((item) => item.status === 'completed').length;
                    const failedItems = batch.items.filter((item) => item.status === 'failed');
                    const pendingItems = batch.items.filter((item) => item.status === 'pending');
                    const staleGeneratingItems = batch.items.filter((item) =>
                      item.status === 'generating' && Date.now() - new Date(item.updatedAt).getTime() > 10 * 60 * 1000
                    );
                    const resumableItems = [...pendingItems, ...staleGeneratingItems];
                    return (
                      <article key={batch.id} className="border-t border-[#DDBDC8] pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-semibold">{batch.title}</h3>
                              {batch.isPreview && <span className="rounded-full bg-[#FFF0F4] px-2.5 py-1 text-xs font-semibold text-primary">Free preview</span>}
                            </div>
                            <p className="mt-2 text-sm text-[#687084]">{formatBatchDate(batch.createdAt)} · {completed}/{batch.items.length} ready · {batch.status.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {resumableItems.length > 0 && (
                              <Button variant="outline" className="border-[#DDBDC8]" disabled={generatingBatchId !== null} onClick={async () => {
                                await Promise.all(staleGeneratingItems.map((item) => updateBatchItem(batch.id, { itemId: item.id, status: 'pending' })));
                                const normalizedItems = resumableItems.map((item) => ({ ...item, status: 'pending' }));
                                await generateBatch({
                                  ...batch,
                                  items: batch.items.map((item) => resumableItems.some((resumable) => resumable.id === item.id) ? { ...item, status: 'pending' } : item),
                                }, normalizedItems);
                              }}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Resume {resumableItems.length}
                              </Button>
                            )}
                            {failedItems.length > 0 && (
                              <Button variant="outline" className="border-[#DDBDC8]" disabled={generatingBatchId !== null} onClick={async () => {
                                await Promise.all(failedItems.map((item) => updateBatchItem(batch.id, { itemId: item.id, status: 'pending' })));
                                await generateBatch({ ...batch, items: batch.items.map((item) => failedItems.some((failed) => failed.id === item.id) ? { ...item, status: 'pending' } : item) }, failedItems.map((item) => ({ ...item, status: 'pending' })));
                              }}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Retry failures
                              </Button>
                            )}
                            <Button variant="outline" className="border-[#DDBDC8]" onClick={() => exportBatchManifest(batch)} disabled={isPremium && completed === 0}>
                              <Download className="mr-2 h-4 w-4" /> Export manifest
                            </Button>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {batch.items.map((item) => (
                            <div key={item.id} className="flex min-h-24 items-center gap-4 rounded-md border border-[#E8CDD6] bg-white p-4">
                              {item.card?.r2Url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.card.r2Url} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
                              ) : (
                                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-[#FFF3F5] text-primary"><Sparkles className="h-4 w-4" /></div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{item.recipientName}</p>
                                <p className="mt-1 text-xs capitalize text-[#687084]">{item.status.replace(/_/g, ' ')}</p>
                                {item.errorMessage && <p className="mt-1 line-clamp-2 text-xs text-[#A23858]" role="alert">{item.errorMessage}</p>}
                                {item.status === 'completed' && item.cardId && (isPremium || batch.isPreview) && (
                                  <Link href={`/${item.card?.cardType || getCardTypeForOccasion(item.occasionType)}/edit/${item.cardId}`} className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:underline">
                                    {isPremium ? 'Open card' : 'Open preview'} <ArrowRight className="ml-1 h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {batch.isPreview && !isPremium && (
                          <button type="button" onClick={() => { setPaywallSource('creator_preview_result'); setPaywallOpen(true); }} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
                            Unlock every card, export, and reuse this batch <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        )}
                      </article>
                    );
                  })}
                  {batches.length === 0 && <div className="border-y border-dashed border-[#DDBDC8] py-14 text-center text-sm text-[#687084]">Your first generated batch will appear here.</div>}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={recipientDialogOpen} onOpenChange={setRecipientDialogOpen}>
        <DialogContent className="border-[#E8CDD6] bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecipientId ? 'Edit recipient' : 'Add recipient'}</DialogTitle>
            <DialogDescription>Dates repeat every year and appear in the 30-day queue.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label htmlFor="recipient-name">Name</Label><Input id="recipient-name" className="mt-2 h-11 border-[#DDBDC8]" value={recipientForm.name} onChange={(event) => setRecipientForm((current) => ({ ...current, name: event.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="recipient-occasion">Occasion</Label>
                <Select value={recipientForm.occasionType} onValueChange={(occasionType) => setRecipientForm((current) => ({ ...current, occasionType: occasionType as CreatorOccasionType }))}>
                  <SelectTrigger id="recipient-occasion" className="mt-2 h-11 border-[#DDBDC8]"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(occasionLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="occasion-date">{recipientForm.occasionType === 'work-anniversary' ? 'Start date' : 'Date'}</Label><Input id="occasion-date" type="date" className="mt-2 h-11 border-[#DDBDC8]" value={recipientForm.occasionDate} onChange={(event) => setRecipientForm((current) => ({ ...current, occasionDate: event.target.value }))} /></div>
            </div>
            <div><Label htmlFor="recipient-notes">Private notes</Label><Textarea id="recipient-notes" className="mt-2 min-h-24 border-[#DDBDC8]" value={recipientForm.notes} onChange={(event) => setRecipientForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Role, preferred style, or a detail worth remembering" /></div>
            <Button className="mt-2 h-11 bg-primary text-white hover:bg-primary/90" onClick={saveRecipient} disabled={recipientSaving || !recipientForm.name || !recipientForm.occasionDate}>
              {recipientSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingRecipientId ? 'Save changes' : 'Add to roster'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={recipientPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !recipientDeleting) setRecipientPendingDelete(null);
        }}
      >
        <DialogContent className="border-[#E8CDD6] bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {recipientPendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              This removes the recipient from your roster. Existing generated cards and batch history stay available.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRecipientPendingDelete(null)} disabled={recipientDeleting}>Keep recipient</Button>
            <Button variant="destructive" onClick={deleteRecipient} disabled={recipientDeleting}>
              {recipientDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove recipient
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
        <DialogContent className="overflow-hidden border-[#E8CDD6] bg-white p-0 sm:max-w-xl">
          <div className="bg-[#FFF8F6] p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Creator Pro</p>
            <DialogHeader>
              <DialogTitle className="mt-3 font-serif text-3xl font-semibold">Turn the preview into a repeatable workflow.</DialogTitle>
              <DialogDescription className="mt-3 leading-6 text-[#596174]">Generate every selected card, keep an unlimited recipient roster, export delivery manifests, and reuse your brand preset for $6.99 per month.</DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-3 text-sm font-semibold text-[#3F485B]">
              {['Unlimited recipient roster', 'Complete personalized batches', 'Export and reopen finished cards'].map((benefit) => <p key={benefit} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{benefit}</p>)}
            </div>
          </div>
          <div className="p-7">
            <PricingCheckoutButton plan="monthly" source={paywallSource} taskSize={selectedRecipientIds.length || undefined} className="h-12 w-full bg-primary text-white hover:bg-primary/90">
              Start Creator Pro — $6.99/month <ArrowRight className="ml-2 h-4 w-4" />
            </PricingCheckoutButton>
            <p className="mt-3 text-center text-xs text-[#7B8292]">Secure Stripe checkout · Cancel anytime</p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
