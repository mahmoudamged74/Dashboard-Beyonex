const PARTNER_FOLDER = "/our partner";

const partnerFiles = [
  { name: "Alemba", file: "762-7623458_alemba-graphics-hd-png-download.png" },
  { name: "Partner", file: "Artboard-1-copy.png" },
  { name: "Partner", file: "channels4_profile.jpg" },
  { name: "Partner", file: "download.png" },
  { name: "Faisal Color", file: "Fisalcolor.jpg" },
  { name: "Global GES", file: "global ges.png" },
  {
    name: "Khaled Aldrewesh Recruitment",
    file: "Khaled aldrewesh recruitment Co.-03.png",
  },
  { name: "Oracle", file: "Oracle-Logo.jpg" },
  { name: "Protect4", file: "PROTECT4-LOGO-SEM-ASSINATURA-HRZ.png" },
  {
    name: "Microsoft",
    file: "vecteezy_microsoft-transparent-png-microsoft-free-png_19909695.png",
  },
  {
    name: "بقشان العربية",
    nameEn: "Baqshan Arabia",
    file: "بقشان العربية-Picsart-AiImageEnhancer.jpg",
  },
  { name: "علم", nameEn: "Alam", file: "علم.png" },
];

export const STATIC_PARTNERS = partnerFiles.map((partner, index) => ({
  id: index + 1,
  name: {
    en: partner.nameEn || partner.name,
    ar: partner.name,
  },
  image_path: `${PARTNER_FOLDER}/${encodeURIComponent(partner.file)}`,
  display_order: index + 1,
  status: true,
}));

export const PARTNERS_STORAGE_KEY = "beyonex_static_partners";

export const loadStoredPartners = () => {
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (!raw) return STATIC_PARTNERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : STATIC_PARTNERS;
  } catch {
    return STATIC_PARTNERS;
  }
};

export const saveStoredPartners = (partners) => {
  localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
};
