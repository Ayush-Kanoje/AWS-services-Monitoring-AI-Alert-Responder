import { FiImage } from 'react-icons/fi'

/**
 * Reserved space for a full architecture diagram image.
 * No diagram is generated here — this is a placeholder only.
 */
export default function ArchitecturePlaceholder() {
  return (
    <section className="card p-5 sm:p-6">
      <p className="eyebrow mb-4">Cloud Architecture Diagram</p>
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
          border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark py-16"
      >
        <FiImage className="h-6 w-6 text-muted dark:text-muted-dark" />
        <p className="text-sm text-muted dark:text-muted-dark">Architecture Diagram will be added here.</p>
      </div>
    </section>
  )
}
