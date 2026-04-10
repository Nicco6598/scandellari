import { useEffect, useMemo, useState } from 'react';
import { publicCategorieService, publicProgettiService } from '../supabase/publicData';
import { ProgettoData } from '../types/supabaseTypes';
import { logger } from '../utils/logger';

export function useProjectsCatalog() {
  const [projects, setProjects] = useState<ProgettoData[]>([]);
  const [categories, setCategories] = useState<string[]>(['tutti']);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('tutti');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);

        const [projectData, categoryData] = await Promise.all([
          publicProgettiService.getAllProjects(),
          publicCategorieService.getAllCategorie(),
        ]);

        const categoryNames = categoryData.flatMap(({ nome }) => (
          nome ? [nome.toLowerCase()] : []
        ));

        setProjects(projectData);
        setCategories(['tutti', ...new Set(categoryNames)]);
      } catch (error) {
        logger.error('Impossibile caricare i progetti.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const filteredProjects = useMemo(() => (
    activeCategory === 'tutti'
      ? projects
      : projects.filter((project) => project.categoria?.toLowerCase() === activeCategory.toLowerCase())
  ), [activeCategory, projects]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { tutti: projects.length };

    projects.forEach((project) => {
      const category = project.categoria?.toLowerCase();
      if (category) {
        counts[category] = (counts[category] || 0) + 1;
      }
    });

    return counts;
  }, [projects]);

  return {
    activeCategory,
    categories,
    categoryCounts,
    filteredProjects,
    loading,
    projects,
    setActiveCategory,
  };
}
