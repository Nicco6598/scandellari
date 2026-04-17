import FullscreenFiltersModal from '../filters/FullscreenFiltersModal';

type ProjectsFiltersModalProps = {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  categories: string[];
  isOpen: boolean;
  onApply: () => void;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
};

function formatCategoryLabel(category: string) {
  if (category === 'tutti') return 'Tutti i Progetti';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function ProjectsFiltersModal({
  activeCategory,
  categories,
  categoryCounts,
  isOpen,
  onApply,
  onClose,
  onSelectCategory,
}: ProjectsFiltersModalProps) {
  return (
    <FullscreenFiltersModal
      ariaLabel="Filtri progetti"
      description="Seleziona la categoria da mostrare e conferma l’aggiornamento dell’elenco o della mappa."
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryAction={onApply}
      onSelect={(category) => onSelectCategory(category)}
      primaryActionLabel="Applica"
      sections={[
        {
          title: 'Categorie',
          options: categories.map((category) => ({
            count: categoryCounts[category] ?? 0,
            id: category,
            isActive: activeCategory === category,
            label: formatCategoryLabel(category),
          })),
        },
      ]}
      title="Filtri"
    />
  );
}

export default ProjectsFiltersModal;
