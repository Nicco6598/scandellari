import FullscreenFiltersModal from '../filters/FullscreenFiltersModal';

type ProjectsFiltersModalProps = {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
};

function ProjectsFiltersModal({
  activeCategory,
  categories,
  categoryCounts,
  isOpen,
  onClose,
  onSelectCategory,
}: ProjectsFiltersModalProps) {
  return (
    <FullscreenFiltersModal
      ariaLabel="Filtri progetti"
      isOpen={isOpen}
      onClose={onClose}
      onSelect={(category) => onSelectCategory(category)}
      sections={[
        {
          title: 'Categorie',
          options: categories.map((category) => ({
            count: categoryCounts[category] ?? 0,
            id: category,
            isActive: activeCategory === category,
            label: category === 'tutti' ? 'Tutti i Progetti' : category,
          })),
        },
      ]}
      title="Filtri"
    />
  );
}

export default ProjectsFiltersModal;
