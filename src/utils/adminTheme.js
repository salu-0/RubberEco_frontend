// Admin Theme Configuration - Black and Green Color Scheme
// This file provides consistent styling across all admin pages

export const adminTheme = {
  // Background gradients
  backgrounds: {
    main: (darkMode) => darkMode 
      ? 'bg-gradient-to-br from-black via-gray-900 to-black' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    
    sidebar: (darkMode) => darkMode 
      ? 'bg-gradient-to-b from-black to-gray-900 border-r border-green-500/20' 
      : 'bg-white',
    
    header: (darkMode) => darkMode 
      ? 'bg-gradient-to-r from-black to-gray-900 border-green-500/20' 
      : 'bg-white border-gray-200',
    
    card: (darkMode) => darkMode 
      ? 'bg-gray-800/50 border-green-500/20' 
      : 'bg-white/50',
    
    cardHover: (darkMode) => darkMode 
      ? 'hover:shadow-2xl hover:shadow-green-500/10' 
      : 'hover:shadow-2xl'
  },

  // Green accent colors
  colors: {
    primary: {
      gradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
      gradientHover: 'from-green-700 to-emerald-700',
      light: 'text-green-400',
      dark: 'text-green-600',
      bg: 'bg-green-600',
      bgHover: 'hover:bg-green-700'
    },
    
    accent: {
      border: (darkMode) => darkMode ? 'border-green-500/20' : 'border-green-200',
      text: (darkMode) => darkMode ? 'text-green-400' : 'text-green-600',
      bg: (darkMode) => darkMode ? 'bg-green-500/20' : 'bg-green-50'
    },

    status: {
      success: 'from-green-500 to-emerald-600',
      warning: 'from-green-500 to-emerald-600',
      error: 'from-green-500 to-emerald-600',
      info: 'from-green-500 to-emerald-600'
    }
  },

  // Component styles
  components: {
    button: {
      primary: (darkMode) => `
        bg-gradient-to-r from-green-600 to-emerald-600 text-white 
        hover:from-green-700 hover:to-emerald-700 
        shadow-lg shadow-green-500/25 
        border border-green-500/30
        transition-all duration-300
      `,
      
      secondary: (darkMode) => darkMode 
        ? `bg-green-500/20 text-green-400 hover:bg-green-500/30 
           border border-green-500/30 hover:border-green-500/50` 
        : `bg-green-50 text-green-600 hover:bg-green-100 
           border border-green-200`,
      
      ghost: (darkMode) => darkMode 
        ? 'text-gray-300 hover:text-green-400 hover:bg-green-500/10' 
        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
    },

    input: {
      base: (darkMode) => `
        rounded-xl border transition-all duration-300
        focus:ring-2 focus:ring-green-500 focus:border-transparent
        ${darkMode 
          ? 'bg-gray-700/50 border-green-500/30 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-green-500/50' 
          : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white'
        }
      `,
      
      search: (darkMode) => `
        pl-10 pr-4 py-3
        ${adminTheme.components.input.base(darkMode)}
      `
    },

    card: {
      base: (darkMode) => `
        ${adminTheme.backgrounds.card(darkMode)} 
        backdrop-blur-sm rounded-2xl shadow-xl border 
        ${adminTheme.colors.accent.border(darkMode)}
        ${adminTheme.backgrounds.cardHover(darkMode)}
        transition-all duration-300
      `,
      
      header: (darkMode) => `
        ${adminTheme.components.card.base(darkMode)}
        p-8
      `,
      
      content: (darkMode) => `
        ${adminTheme.components.card.base(darkMode)}
        p-6
      `
    },

    navigation: {
      item: (darkMode, isActive) => isActive 
        ? `bg-gradient-to-r from-green-600 to-emerald-600 text-white 
           shadow-lg shadow-green-500/25 border border-green-500/30`
        : darkMode 
          ? 'text-gray-300 hover:bg-green-500/10 hover:text-green-400 hover:border hover:border-green-500/30'
          : 'text-gray-700 hover:bg-green-50 hover:text-green-600',
      
      indicator: 'bg-green-400 shadow-lg shadow-green-400/50',
      
      badge: `bg-gradient-to-r from-green-500 to-emerald-500 text-white 
              shadow-lg shadow-green-500/50 border border-green-400/30`
    },

    table: {
      header: (darkMode) => `
        ${darkMode ? 'bg-gray-800/80 border-green-500/20' : 'bg-gray-50/80'} 
        backdrop-blur-sm border-b
        ${darkMode ? 'border-green-500/20' : 'border-gray-200/50'}
      `,
      
      row: (darkMode) => `
        group transition-all duration-300 
        hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'} 
        hover:shadow-lg
      `,
      
      cell: 'px-6 py-5'
    },

    status: {
      badge: (status, darkMode) => {
        const baseClasses = 'inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm group-hover:scale-105 transition-transform duration-300';
        
        // All status badges use green theme
        return `${baseClasses} bg-gradient-to-r from-green-500/10 to-emerald-500/10 
                text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50`;
      }
    }
  },

  // Animation presets
  animations: {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    },
    
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3 }
    },
    
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    }
  },

  // Utility functions
  utils: {
    getGradientBackground: (darkMode, type = 'green') => {
      if (darkMode) {
        return `bg-gradient-to-r from-${type}-600/10 to-emerald-600/10`;
      }
      return `bg-gradient-to-r from-${type}-500/5 to-emerald-500/5`;
    },
    
    getTextColor: (darkMode, variant = 'primary') => {
      if (variant === 'primary') {
        return darkMode ? 'text-green-400' : 'text-green-600';
      }
      if (variant === 'secondary') {
        return darkMode ? 'text-gray-400' : 'text-gray-600';
      }
      return darkMode ? 'text-white' : 'text-gray-900';
    },
    
    getBorderColor: (darkMode) => {
      return darkMode ? 'border-green-500/20' : 'border-green-200';
    }
  }
};

// Export individual theme parts for convenience
export const { backgrounds, colors, components, animations, utils } = adminTheme;

// Default export
export default adminTheme;
