<template>
  <div class="rounded-lg border border-border bg-card">
    <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b border-border p-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Título"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <LucideHeading2 class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Subtítulo"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <LucideHeading3 class="size-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Negrito"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <LucideBold class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Itálico"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <LucideItalic class="size-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Lista"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <LucideList class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Lista numerada"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <LucideListOrdered class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :class="editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : ''"
        aria-label="Citação"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <LucideQuote class="size-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :disabled="!editor.can().undo()"
        aria-label="Desfazer"
        @click="editor.chain().focus().undo().run()"
      >
        <LucideUndo2 class="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="size-8"
        :disabled="!editor.can().redo()"
        aria-label="Refazer"
        @click="editor.chain().focus().redo().run()"
      >
        <LucideRedo2 class="size-4" />
      </Button>
    </div>

    <EditorContent :editor="editor" class="px-3 py-2" />
  </div>
</template>

<script setup lang="ts">
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: "Escreva o conteúdo da página...",
});

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: "rich-text-content min-h-[220px] focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

watch(() => props.modelValue, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value, { emitUpdate: false });
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>
