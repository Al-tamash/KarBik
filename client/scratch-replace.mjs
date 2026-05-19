import fs from 'fs';
import path from 'path';

const hexMap = {
  '#3B5BDB': 'primary-600',
  '#5C7CFA': 'primary-400',
  '#364FC7': 'primary-800',
  '#EDF2FF': 'primary-50',
  '#DBE4FF': 'primary-100',
  '#F97316': 'accent-500',
  '#FB923C': 'accent-400',
  '#EA580C': 'accent-600',
  '#FFF7ED': 'accent-50',
  '#22C55E': 'success-500',
  '#16A34A': 'success-600',
  '#F0FDF4': 'success-50',
  '#F59E0B': 'warning-500',
  '#FFFBEB': 'warning-50',
  '#EF4444': 'danger-500',
  '#DC2626': 'danger-600',
  '#FEF2F2': 'danger-50',
  '#111827': 'neutral-900',
  '#6B7280': 'neutral-500',
  '#9CA3AF': 'neutral-400',
  '#F9FAFB': 'neutral-50',
  '#FFFFFF': 'neutral-0',
  '#E5E7EB': 'neutral-200',
  '#F3F4F6': 'neutral-100',
  '#0A0A0A': 'neutral-900',
  '#0F172A': 'neutral-900',
};

// Also let's replace generic tailwind colors that are banned like slate, zinc, etc.
const colorFamilyMap = {
  'slate-50': 'neutral-50',
  'slate-100': 'neutral-100',
  'slate-200': 'neutral-200',
  'slate-300': 'neutral-300',
  'slate-400': 'neutral-400',
  'slate-500': 'neutral-500',
  'slate-600': 'neutral-600',
  'slate-700': 'neutral-700',
  'slate-800': 'neutral-800',
  'slate-900': 'neutral-900',
  'foreground': 'neutral-900',
  'muted': 'neutral-500',
  'border': 'neutral-200',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace hardcoded hex codes like bg-[#3B5BDB] -> bg-primary-600
  const hexRegex = /([a-z0-9:-]+)-\[#([A-Fa-f0-9]+)\]/g;
  content = content.replace(hexRegex, (match, prefix, hex) => {
    const upperHex = '#' + hex.toUpperCase();
    if (hexMap[upperHex]) {
      return `${prefix}-${hexMap[upperHex]}`;
    }
    return match;
  });

  // 2. Replace generic tailwind colors
  const colorRegex = /([a-z0-9:-]+)-(slate-\d+|foreground|muted|border)/g;
  content = content.replace(colorRegex, (match, prefix, colorName) => {
    if (colorFamilyMap[colorName]) {
      // Check if it's border-border, bg-slate-50, etc.
      // But avoid things like text-muted-foreground if possible, or handle them.
      return `${prefix}-${colorFamilyMap[colorName]}`;
    }
    return match;
  });
  
  // Replace standalone colors if needed (e.g. text-muted)
  const standaloneRegex = /\b(text-foreground|text-muted|border-border|bg-slate-\d+|text-slate-\d+|border-slate-\d+|ring-slate-\d+)\b/g;
  content = content.replace(standaloneRegex, (match) => {
      const parts = match.split('-');
      const prefix = parts[0];
      const color = parts.slice(1).join('-');
      if (colorFamilyMap[color]) {
          return `${prefix}-${colorFamilyMap[color]}`;
      }
      return match;
  });


  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir('./app');
walkDir('./components');
console.log('Done!');
