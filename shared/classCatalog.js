export const CLASS_CATEGORIES = Object.freeze({
  disease: 'disease',
  pest: 'pest',
  other: 'other',
  unknown: 'unknown',
});

const entry = (label, displayName, category, description, icon) => Object.freeze({
  label,
  displayName,
  category,
  description,
  icon,
});

export const CLASS_CATALOG = Object.freeze([
  entry('citrus_anthracnose', 'Citrus Anthracnose', 'disease', 'Fungal disease that can cause dark, sunken lesions on leaves, twigs, or fruit.', '🍂'),
  entry('citrus_black_spot', 'Citrus Black Spot', 'disease', 'Fungal disease associated with dark spots on citrus leaves and fruit.', '⚫'),
  entry('citrus_brown_spot', 'Citrus Brown Spot', 'disease', 'Fungal spotting that commonly affects young citrus leaves and shoots.', '🟤'),
  entry('citrus_canker', 'Citrus Canker', 'disease', 'Bacterial disease that causes raised, corky lesions on citrus tissue.', '🟠'),
  entry('citrus_exocortis', 'Citrus Exocortis', 'disease', 'Viroid disease that can cause bark scaling and decline, especially on susceptible rootstocks.', '🌿'),
  entry('citrus_greasy_spot', 'Citrus Greasy Spot', 'disease', 'Fungal disease that produces dark, greasy-looking leaf spots.', '🫒'),
  entry('citrus_green_blue_mold', 'Citrus Green / Blue Mold', 'disease', 'Postharvest fungal molds that can cause soft rot on citrus fruit.', '🟢'),
  entry('citrus_huanglongbing', 'Citrus Greening (HLB)', 'disease', 'Serious citrus disease associated with blotchy leaves, decline, and misshapen fruit.', '🟡'),
  entry('citrus_leprosis', 'Citrus Leprosis', 'disease', 'Disease that can produce localized lesions on citrus leaves, twigs, or fruit.', '🟧'),
  entry('citrus_melanose', 'Citrus Melanose', 'disease', 'Fungal disease that causes small, rough, dark spots on citrus tissue.', '🟫'),
  entry('citrus_powdery_mildew', 'Citrus Powdery Mildew', 'disease', 'Fungal growth that appears as a pale, powdery coating on plant surfaces.', '⚪'),
  entry('citrus_rot', 'Citrus Rot', 'disease', 'General rot symptoms involving tissue breakdown, often on damaged or stored fruit.', '🟣'),
  entry('citrus_scab', 'Citrus Scab', 'disease', 'Fungal disease that causes raised, corky scabs on leaves, shoots, or fruit.', '🟫'),
  entry('citrus_sooty_mold', 'Citrus Sooty Mold', 'disease', 'Dark surface mold commonly associated with honeydew from sap-feeding insects.', '⬛'),
  entry('other_disease', 'Other Disease', 'disease', 'A disease-like condition outside the model’s named disease classes.', '🔎'),
  entry('black_aphid', 'Black Aphid', 'pest', 'Small sap-feeding aphid that may cluster on tender citrus growth.', '🐜'),
  entry('brown_banded_tortrix', 'Brown-Banded Tortrix', 'pest', 'Moth pest whose larvae can feed on and roll plant leaves.', '🦋'),
  entry('citrus_aphid', 'Citrus Aphid', 'pest', 'Sap-feeding aphid that commonly attacks young citrus growth.', '🐜'),
  entry('citrus_fruit_fly', 'Citrus Fruit Fly', 'pest', 'Fruit fly associated with egg laying and larval damage in citrus fruit.', '🪰'),
  entry('citrus_leafminer', 'Citrus Leafminer', 'pest', 'Small moth larva that makes winding mines in young citrus leaves.', '🐛'),
  entry('citrus_longhorned_beetle', 'Citrus Longhorned Beetle', 'pest', 'Beetle pest whose larvae may bore into woody plant tissue.', '🪲'),
  entry('citrus_psyllid', 'Citrus Psyllid', 'pest', 'Sap-feeding psyllid that attacks new citrus growth and can spread HLB.', '🪲'),
  entry('citrus_red_mite', 'Citrus Red Mite', 'pest', 'Tiny mite that feeds on citrus leaves and can cause stippling or bronzing.', '🔴'),
  entry('citrus_rust_mite', 'Citrus Rust Mite', 'pest', 'Tiny mite associated with russeting or bronzing on citrus leaves and fruit.', '🟠'),
  entry('citrus_swallowtail', 'Citrus Swallowtail', 'pest', 'Caterpillar that can feed on citrus leaves.', '🦋'),
  entry('citrus_thrips', 'Citrus Thrips', 'pest', 'Tiny insects that scrape and feed on young citrus leaves or fruit surfaces.', '🪲'),
  entry('citrus_whitefly', 'Citrus Whitefly', 'pest', 'Small sap-feeding insect that may produce honeydew and weaken citrus foliage.', '🪰'),
  entry('other_pest', 'Other Pest', 'pest', 'A pest outside the model’s named pest classes.', '🔎'),
  entry('other_scale_insect', 'Other Scale Insect', 'pest', 'A scale insect outside the model’s more specific scale class.', '🪲'),
  entry('other_slug_moth', 'Other Slug Moth', 'pest', 'A slug moth or caterpillar class outside the model’s named pest classes.', '🐛'),
  entry('red_wax_scale', 'Red Wax Scale', 'pest', 'Scale insect recognized by a reddish waxy covering on plant surfaces.', '🔴'),
  entry('spring_weevil', 'Spring Weevil', 'pest', 'Weevil class associated with feeding damage to plant tissue.', '🪲'),
  entry('thripidae', 'Thripidae', 'pest', 'A thrips family class representing small plant-feeding insects.', '🪲'),
  entry('spider', 'Spider', 'other', 'Spider detected in the image; not automatically classified as a crop pest.', '🕷️'),
  entry('beneficial_insect', 'Beneficial Insect', 'other', 'Beneficial insect class; treatment should not be inferred from this label.', '🐞'),
  entry('honeybee', 'Honeybee', 'other', 'Honeybee detected in the image; protect pollinators and do not infer treatment.', '🐝'),
  entry('lacewing', 'Lacewing', 'other', 'Lacewing detected in the image; many lacewings are beneficial predators.', '🪲'),
  entry('ladybug', 'Ladybug', 'other', 'Ladybug detected in the image; commonly a beneficial predator.', '🐞'),
  entry('wasp', 'Wasp', 'other', 'Wasp detected in the image; do not infer crop treatment from this label.', '🐝'),
  entry('healthy_leaf', 'Healthy Leaf', 'other', 'Healthy leaf class explicitly predicted by the model.', '🌿'),
]);

export const CLASS_CATALOG_BY_LABEL = Object.freeze(
  Object.fromEntries(CLASS_CATALOG.map((item) => [item.label, item])),
);

export const CLASS_CATEGORY_LABELS = Object.freeze({
  all: 'All',
  disease: 'Diseases & Conditions',
  pest: 'Pests',
  other: 'Other',
});
