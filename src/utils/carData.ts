export interface CarBrand {
  name: string;
  models: string[];
}

export const CAR_BRANDS: CarBrand[] = [
  { name: 'Lada', models: ['Granta', 'Vesta', 'Niva Travel', 'Largus'] },
  { name: 'Kia', models: ['Rio', 'Ceed', 'Sportage', 'K5'] },
  { name: 'Hyundai', models: ['Solaris', 'Creta', 'Elantra', 'Tucson'] },
  { name: 'Renault', models: ['Logan', 'Sandero', 'Duster', 'Kaptur'] },
  { name: 'Volkswagen', models: ['Polo', 'Tiguan', 'Passat', 'Touareg'] },
  { name: 'Toyota', models: ['Camry', 'RAV4', 'Corolla', 'Land Cruiser'] },
  { name: 'BMW', models: ['3 Series', '5 Series', 'X5', 'X3'] },
  { name: 'Mercedes-Benz', models: ['E-Class', 'C-Class', 'S-Class', 'GLE'] },
];

export const CAR_COLORS = [
  'Бежевый',
  'Белый',
  'Голубой',
  'Графитовый',
  'Зелёный',
  'Коричневый',
  'Красный',
  'Оранжевый',
  'Серебристый Платина',
  'Серый',
  'Синий',
  'Тёмно-серый',
  'Тёмно-синий металлик',
  'Чёрный',
];

/**
 * Resolves the path to the car SVG based on brand, model, and color.
 * Per user request, for now we use the Lada Granta SVGs for all cars to match the color.
 */
export function getCarSvgPath(brand: string, model: string, color: string): string {
  // If no color selected, default to White
  const selectedColor = color || 'Белый';
  
  // We use the provided Lada Granta SVG filenames for all models per request
  // Format: /cars/Lada Granta [Color].svg
  return `/cars/Lada Granta ${selectedColor}.svg`;
}
