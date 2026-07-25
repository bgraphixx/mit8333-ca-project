import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { requestsService } from "@/services/requests";
import { categoriesService } from "@/services/categories";
import type { Category, RequestPriority } from "@/types";

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const EMPTY_FORM = { title: "", description: "", categoryId: "", priority: "Medium" as RequestPriority };

export function NewRequestDialog({ open, onOpenChange, onCreated }: NewRequestDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      categoriesService.list().then(setCategories).catch(() => setCategories([]));
    } else {
      setForm(EMPTY_FORM);
      setPhoto(null);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await requestsService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.categoryId),
        priority: form.priority,
      });
      if (photo) {
        await requestsService.uploadEvidence(created.id, photo);
      }
      onCreated();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New maintenance request</DialogTitle>
            <DialogDescription>Describe the issue and we'll route it to the right team.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-[15px]">
            <div>
              <Label htmlFor="nr-title">Title</Label>
              <Input
                id="nr-title"
                placeholder="e.g. Flickering lights in reading area"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nr-desc">Description</Label>
              <Textarea
                id="nr-desc"
                rows={3}
                placeholder="What's wrong, and where exactly? (e.g. Unity Hostel – Rm 120)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="nr-cat">Category</Label>
                <Select
                  id="nr-cat"
                  className="w-full"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="nr-pri">Priority</Label>
                <Select
                  id="nr-pri"
                  className="w-full"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as RequestPriority }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Evidence photo</Label>
              <label className="flex items-center gap-2.5 border-[1.5px] border-dashed border-border-strong rounded-[10px] p-3.5 cursor-pointer bg-bg-subtle hover:border-accent">
                <ImagePlus size={18} className="flex-none text-fg-muted" strokeWidth={1.8} />
                <span className="text-sm text-fg-muted">
                  {photo ? photo.name : "Click to upload a photo (optional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            {error && <div className="text-[12.5px] text-red-fg bg-red-bg rounded-lg px-3 py-2">{error}</div>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.title.trim() || submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
