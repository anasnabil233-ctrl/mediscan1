import { Specialty } from '../types';

const SPECIALTIES_KEY = 'mediscan_specialties';

const DEFAULT_SPECIALTIES: Specialty[] = [
  { id: '1', name: 'طب القلب (Cardiology)', description: 'تشخيص وعلاج أمراض القلب والأوعية الدموية.' },
  { id: '2', name: 'جراحة العظام (Orthopedics)', description: 'علاج إصابات وأمراض الجهاز العضلي الهيكلي والمفاصل.' },
  { id: '3', name: 'الأشعة والتصوير الطبي (Radiology)', description: 'استخدام تقنيات التصوير الطبي لتشخيص وعلاج الأمراض.' },
  { id: '4', name: 'المخ والأعصاب (Neurology)', description: 'تشخيص وعلاج اضطرابات الجهاز العصبي المركزي والطرفي.' },
  { id: '5', name: 'الأمراض الصدرية (Pulmonology)', description: 'علاج أمراض الجهاز التنفسي والرئتين.' },
  { id: '6', name: 'الباطنة العامة (Internal Medicine)', description: 'تشخيص وعلاج ومريضة الأمراض الداخلية للبالغين.' },
];

export const getSpecialties = (): Specialty[] => {
  const stored = localStorage.getItem(SPECIALTIES_KEY);
  if (!stored) {
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(DEFAULT_SPECIALTIES));
    return DEFAULT_SPECIALTIES;
  }
  return JSON.parse(stored);
};

export const saveSpecialty = (specialty: Specialty): Specialty[] => {
  const list = getSpecialties();
  const index = list.findIndex(s => s.id === specialty.id);
  
  if (index >= 0) {
    list[index] = specialty;
  } else {
    list.push(specialty);
  }
  
  localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(list));
  return list;
};

export const deleteSpecialty = (id: string): Specialty[] => {
  const list = getSpecialties().filter(s => s.id !== id);
  localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(list));
  return list;
};