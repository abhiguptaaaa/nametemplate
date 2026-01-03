import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'templates.json');

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

export async function getTemplates(): Promise<Template[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveTemplates(templates: Template[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(templates, null, 2));
}

export async function addTemplate(template: Template): Promise<void> {
  const templates = await getTemplates();
  templates.push(template);
  await saveTemplates(templates);
}

export async function updateTemplate(updatedTemplate: Template): Promise<void> {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === updatedTemplate.id);
  if (index !== -1) {
    templates[index] = updatedTemplate;
    await saveTemplates(templates);
  }
}
