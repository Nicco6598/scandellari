/**
 * Utility per gli stili di colore comuni nell'applicazione
 * Utilizzare questi stili per mantenere uniformità e coerenza visiva
 */

// Badge stile primario (per categorie, filtri, tag)
export const primaryBadgeClasses = "bg-primary/10 dark:bg-primary/30 text-primary-dark dark:text-primary-lighter";

// Badge stile accent (per caratteristiche speciali, tecnologie)
export const accentBadgeClasses = "bg-accent-lighter dark:bg-accent/30 text-accent-dark dark:text-accent-lighter";

// Pulsante primario (azioni principali, submit)
export const primaryButtonClasses = "bg-primary hover:bg-primary-dark text-white dark:bg-primary-medium dark:hover:bg-primary shadow-sm dark:shadow-dark-soft";

// Pulsante accent (azioni secondarie, alternative)
export const accentButtonClasses = "bg-accent hover:bg-accent-dark text-white dark:shadow-dark-soft";

// Elementi attivi o selezionati (filtri, tab, nav)
export const activeElementClasses = "bg-primary/10 dark:bg-primary/30 text-primary-dark dark:text-primary-lighter border border-primary/30 dark:border-primary/50";

// Elementi inattivi (filtri, tab, nav)
export const inactiveElementClasses = "bg-gray-100 dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-700 dark:text-gray-300 border border-transparent";

// Sfondo principale chiaro/scuro
export const mainBgClasses = "bg-white dark:bg-dark";

// Sfondo secondario chiaro/scuro (per card, sezioni alternate)
export const secondaryBgClasses = "bg-stone-50 dark:bg-dark-surface";

// Testo primario
export const primaryTextClasses = "text-text-primary dark:text-white";

// Testo secondario
export const secondaryTextClasses = "text-text-secondary dark:text-gray-200";

// Combinazioni comuni
export const cardClasses = "bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-sm dark:shadow-dark-card";
export const sectionClasses = "py-16 md:py-24";
export const decorativeBgClasses = "bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/25 dark:to-accent/15";

// Effetti di sfondo decorativi
export const primaryBlobClasses = "bg-primary/10 dark:bg-primary/30 filter blur-3xl opacity-50 dark:opacity-60";
export const accentBlobClasses = "bg-accent/10 dark:bg-accent/25 filter blur-3xl opacity-50 dark:opacity-60";

// Nuovi stili vivaci per il tema scuro
export const glassCardClasses = "backdrop-blur-md bg-white/80 dark:bg-dark-elevated/70 border border-white/20 dark:border-primary-dark/20 shadow-sm dark:shadow-dark-soft";
export const accentBorderClasses = "border-accent/20 dark:border-accent/40";
export const highlightTextClasses = "text-primary-dark dark:text-primary-light";
export const glowEffectClasses = "dark:shadow-[0_0_15px_rgba(30,136,229,0.3)]";
export const hoverGlowClasses = "hover:dark:shadow-[0_0_20px_rgba(30,136,229,0.4)] transition-shadow duration-300"; 
