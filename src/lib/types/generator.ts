export interface GeneratorField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'color' | 'date' | 'age';
  placeholder?: string;
  optional?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface GeneratorFormData {
  name: string;
  slug: string;
  title: string;
  label: string;
  description?: string;
  fields: GeneratorField[];
  advancedFields?: GeneratorField[];
  templateInfo?: string;
  why?: string[];
  promptContent: string;
} 