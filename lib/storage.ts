export interface TemplateField {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

export interface Template {
  id: string;
  name: string;
  imageUrl: string;
  fields: TemplateField[];
}

export interface CustomFont {
  id: string;
  name: string;
  dataUrl: string; // Base64 woff/ttf
}

// Client-side storage using localStorage
export function getTemplates(): Template[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('templates');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading templates:', error);
    return [];
  }
}

export function saveTemplates(templates: Template[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('templates', JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates:', error);
  }
}

export function addTemplate(template: Template): void {
  const templates = getTemplates();
  templates.push(template);
  saveTemplates(templates);
}

export function updateTemplate(updatedTemplate: Template): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === updatedTemplate.id);
  if (index !== -1) {
    templates[index] = updatedTemplate;
    saveTemplates(templates);
  }
}
