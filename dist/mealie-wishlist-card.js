/*!
 * Mealie Wishlist Card
 * Shows the Mealie meal plan for the next days and lets anyone wish a recipe
 * for an empty slot with one tap. Uses only the official Home Assistant
 * Mealie integration actions (no Mealie token in the dashboard).
 * License: MIT
 */
(() => {
"use strict";
const MW_VERSION = "0.6.2";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "side", "dessert", "snack", "drink"];
const PICKER_SECTIONS = ["search", "pinned", "favorites_random", "most_cooked", "not_cooked_lately", "random"];

const I18N = {
  de: {
    title: "Mealie Wishlist",
    subtitle: "Was möchtest du essen?",
    wish: "Essen wünschen",
    today: "Heute",
    tomorrow: "Morgen",
    meals: { breakfast: "Frühstück", lunch: "Mittagessen", dinner: "Abendessen", side: "Beilage", dessert: "Nachtisch", snack: "Snack", drink: "Getränk" },
    search: "Rezept suchen …",
    pinned: "Feste Optionen",
    favorites_random: "Lieblingsrezepte",
    most_cooked: "Meist gekocht",
    not_cooked_lately: "Lange nicht gekocht",
    random: "Zufällig",
    shuffle: "neu mischen",
    times: (n) => `${n}× gekocht`,
    ago: (d) => (d < 1 ? "heute" : d === 1 ? "gestern" : d < 45 ? `vor ${d} Tagen` : `vor ${Math.round(d / 30)} Mon.`),
    never: "noch nie gekocht",
    confirm: (r, d, m) => `„${r}“ für ${d}, ${m} wünschen?`,
    yes: "Wünschen",
    cancel: "Abbrechen",
    close: "Schließen",
    saved: "Gewünscht!",
    open_mealie: "In Mealie öffnen",
    change: "Essen tauschen",
    details: "Details",
    remove: "Aus Plan entfernen",
    remove_confirm: (r) => `„${r}“ wirklich aus dem Plan entfernen?`,
    ingredients: "Zutaten",
    servings: "Portionen",
    prep: "Vorbereitung",
    cook: "Kochen",
    total: "Gesamt",
    no_results: "Nichts gefunden",
    add_note: (q) => `„${q}“ als Essen eintragen`,
    add_note_hint: "ohne Rezept, nur mit Namen",
    create_recipe: "Neues Rezept in Mealie anlegen",
    no_entry: "Bitte im Karteneditor eine Mealie-Integration auswählen.",
    error: "Fehler beim Laden aus Mealie",
    action_error: "Das hat nicht geklappt",
    removed: "Aus dem Plan entfernt",
    swapped: "Getauscht!",
    note: "Notiz",
    loading: "Lädt …",
    empty_section: "Noch keine Daten",
  },
  en: {
    title: "Mealie Wishlist",
    subtitle: "What would you like to eat?",
    wish: "Wish a meal",
    today: "Today",
    tomorrow: "Tomorrow",
    meals: { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", side: "Side", dessert: "Dessert", snack: "Snack", drink: "Drink" },
    search: "Search recipes …",
    pinned: "Pinned",
    favorites_random: "Favourites",
    most_cooked: "Most cooked",
    not_cooked_lately: "Not cooked in a while",
    random: "Random",
    shuffle: "shuffle",
    times: (n) => `cooked ${n}×`,
    ago: (d) => (d < 1 ? "today" : d === 1 ? "yesterday" : d < 45 ? `${d} days ago` : `${Math.round(d / 30)} mo. ago`),
    never: "never cooked",
    confirm: (r, d, m) => `Wish "${r}" for ${d}, ${m}?`,
    yes: "Wish",
    cancel: "Cancel",
    close: "Close",
    saved: "Wished!",
    open_mealie: "Open in Mealie",
    change: "Swap meal",
    details: "Details",
    remove: "Remove from plan",
    remove_confirm: (r) => `Really remove "${r}" from the plan?`,
    ingredients: "Ingredients",
    servings: "Servings",
    prep: "Prep",
    cook: "Cook",
    total: "Total",
    no_results: "No results",
    add_note: (q) => `Add "${q}" as a meal`,
    add_note_hint: "without a recipe, name only",
    create_recipe: "Create a new recipe in Mealie",
    no_entry: "Please select a Mealie integration in the card editor.",
    error: "Error loading from Mealie",
    action_error: "That did not work",
    removed: "Removed from plan",
    swapped: "Swapped!",
    note: "Note",
    loading: "Loading …",
    empty_section: "No data yet",
  },
};

const ICONS = {
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  search: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
  favorites_random: "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,4.95C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z",
  most_cooked: "M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z",
  not_cooked_lately: "M6,2H18V8L14,12L18,16V22H6V16L10,12L6,8V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",
  random: "M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M7.5,6A1.5,1.5 0 1,1 7.5,9A1.5,1.5 0 1,1 7.5,6M16.5,6A1.5,1.5 0 1,1 16.5,9A1.5,1.5 0 1,1 16.5,6M12,10.5A1.5,1.5 0 1,1 12,13.5A1.5,1.5 0 1,1 12,10.5M7.5,15A1.5,1.5 0 1,1 7.5,18A1.5,1.5 0 1,1 7.5,15M16.5,15A1.5,1.5 0 1,1 16.5,18A1.5,1.5 0 1,1 16.5,15Z",
  fork: "M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z",
  open: "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z",
  swap: "M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z",
  delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  pinned: "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z",
  note: "M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,12V14H19V12H5M5,16V18H14V16H5Z",
};

const DEFAULTS = {
  title: undefined,
  subtitle: undefined,
  icon: "mdi:silverware-fork-knife",
  show_header: true,
  days: 3,
  meals: ["dinner"],
  wish_label: undefined,
  picker: ["search", "pinned", "favorites_random", "most_cooked", "not_cooked_lately", "random"],
  pinned_title: undefined,
  pinned_categories: [],
  pinned_tags: [],
  pinned_recipes: [],
  pinned_category_ids: [],
  pinned_tag_ids: [],
  pinned_recipe_ids: [],
  pinned_notes: [],
  pinned_exclude_elsewhere: true,
  picker_items: 4,
  history_days: 180,
  favorites_min_rating: 4,
  show_images: true,
  url: "",
  recipe_tap_action: "details",
  allow_open_mealie: true,
  allow_change: true,
  allow_remove: true,
  confirm_wish: false,
  tile_min_height: 64,
  allow_free_text: true,
  allow_create_recipe: true,
  language: undefined,
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const svg = (path, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
const parseDate = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = (s) => String(s || "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");


const EDITOR_I18N = {
  de: {
    sections: { header: "Kopfzeile", picker: "Rezeptauswahl", planned: "Geplante Rezepte", tiles: "Kacheln (einzelne Felder)", card: "Karte (gesamt)" },
    labels: {
      config_entry_id: "Mealie-Integration", show_header: "Kopfzeile anzeigen", title: "Titel", subtitle: "Untertitel", icon: "Symbol",
      days: "Anzahl Tage", meals: "Mahlzeiten (Spalten)", wish_label: "Text auf dem Wunsch-Knopf",
      picker: "Bereiche der Auswahl (Reihenfolge)", pinned_title: "Feste Optionen: Überschrift", pinned_category_ids: "Feste Optionen: Mealie-Kategorien", pinned_tag_ids: "Feste Optionen: Mealie-Tags", pinned_recipe_ids: "Feste Optionen: einzelne Rezepte", pinned_notes: "Feste Optionen: ohne Rezept", pinned_exclude_elsewhere: "Feste Optionen nicht in anderen Bereichen zeigen", picker_items: "Rezepte pro Bereich", history_days: "Zeitraum für Statistik (Tage)",
      favorites_min_rating: "Lieblingsrezept ab Bewertung", confirm_wish: "Vor dem Eintragen nachfragen",
      allow_free_text: "Suche: „Name als Essen eintragen“ anbieten", allow_create_recipe: "Suche: „Rezept in Mealie anlegen“ anbieten",
      recipe_tap_action: "Tippen auf ein geplantes Rezept", allow_open_mealie: "„In Mealie öffnen“ erlauben", allow_change: "Tauschen erlauben", allow_remove: "Entfernen erlauben",
      show_images: "Rezeptbilder in den Kacheln", max_width: "Maximale Breite der ganzen Karte (optional)", tile_min_height: "Mindesthöhe jeder Kachel",
      url: "Mealie-Adresse", language: "Sprache",
    },
    helpers: {
      config_entry_id: "Welche Mealie-Integration die Karte nutzt.",
      show_header: "Zeigt Symbol, Titel und Untertitel über dem Plan.",
      title: "Leer lassen für den Standardtext.",
      subtitle: "Steht rechts in der Kopfzeile. Leer lassen für den Standardtext.",
      icon: "Leer lassen, um kein Symbol zu zeigen.",
      days: "Ab heute. Weitere Tage erscheinen untereinander.",
      meals: "Jede Mahlzeit wird eine Spalte. Reihenfolge per Ziehen.",
      wish_label: "Steht in leeren Feldern, z. B. „Essen wünschen“.",
      picker: "Welche Bereiche das Auswahlfenster zeigt und in welcher Reihenfolge.",
      picker_items: "Wie viele Rezepte jeder Bereich (außer Suche und festen Optionen) zeigt.",
      pinned_title: "Überschrift des Bereichs „Feste Optionen“. Leer = Standardtext.",
      pinned_category_ids: "Alle Rezepte dieser Kategorien erscheinen immer als feste Option. Liste kommt aus Mealie (Kategorien, die mindestens einem Rezept zugeordnet sind).",
      pinned_tag_ids: "Alle Rezepte mit diesen Tags erscheinen immer als feste Option. Liste kommt aus Mealie.",
      pinned_recipe_ids: "Einzelne Rezepte, die immer als feste Option erscheinen.",
      pinned_notes: "Optionen ohne Rezept in Mealie, z. B. „Reste vom Vortag“. Werden als Notiz in den Plan eingetragen.",
      pinned_exclude_elsewhere: "An: Feste Optionen tauchen nicht in Zufällig, Lieblingsrezepte usw. auf.",
      history_days: "So weit zurück wird der Speiseplan für „Meist gekocht“ und „Lange nicht gekocht“ ausgewertet.",
      favorites_min_rating: "Rezepte mit mindestens dieser Sternebewertung zählen automatisch als Lieblingsrezept.",
      confirm_wish: "An: Nach dem Antippen eines Rezepts kommt erst eine Rückfrage „… wünschen?“. Aus: Das Rezept wird sofort eingetragen.",
      allow_free_text: "Unter den Suchtreffern: der eingetippte Name kann als Essen ohne Rezept (Notiz) in den Plan.",
      allow_create_recipe: "Unter den Suchtreffern: ein Link öffnet das Formular „Neues Rezept“ in Mealie. Braucht die Mealie-Adresse.",
      recipe_tap_action: "Was beim Antippen eines bereits geplanten Essens passiert.",
      allow_open_mealie: "Zeigt in der Detailansicht „In Mealie öffnen“ (öffnet das Rezept in Mealie). Braucht die Mealie-Adresse.",
      allow_change: "Erlaubt in der Detailansicht „Essen tauschen“.",
      allow_remove: "Erlaubt in der Detailansicht „Aus Plan entfernen“ (mit Rückfrage).",
      show_images: "Zeigt Rezeptbilder. Braucht die Mealie-Adresse.",
      max_width: "Begrenzt die Breite der gesamten Karte, z. B. 900px; sie wird dann mittig angezeigt. Leer = Breite aus dem Layout-Tab.",
      tile_min_height: "Gilt für jedes einzelne Feld (Rezept oder „Essen wünschen“), in Pixeln. Höhere Felder zeigen mehr vom Rezeptbild.",
      url: "Z. B. https://mealie.example.com – für Bilder und „In Mealie öffnen“. Muss vom anzeigenden Gerät erreichbar sein.",
      language: "Leer = Sprache von Home Assistant.",
    },
    tap: { details: "Details anzeigen", mealie: "In Mealie öffnen", change: "Essen tauschen", none: "Nichts" },
    search: "Suche",
  },
  en: {
    sections: { header: "Header", picker: "Recipe picker", planned: "Planned recipes", tiles: "Tiles (single slots)", card: "Card (overall)" },
    labels: {
      config_entry_id: "Mealie integration", show_header: "Show header", title: "Title", subtitle: "Subtitle", icon: "Icon",
      days: "Number of days", meals: "Meals (columns)", wish_label: "Wish button text",
      picker: "Picker sections (order)", pinned_title: "Pinned: heading", pinned_category_ids: "Pinned: Mealie categories", pinned_tag_ids: "Pinned: Mealie tags", pinned_recipe_ids: "Pinned: single recipes", pinned_notes: "Pinned: without recipe", pinned_exclude_elsewhere: "Hide pinned options from other sections", picker_items: "Recipes per section", history_days: "History for statistics (days)",
      favorites_min_rating: "Favourite from rating", confirm_wish: "Ask before adding",
      allow_free_text: "Search: offer 'Add name as meal'", allow_create_recipe: "Search: offer 'Create recipe in Mealie'",
      recipe_tap_action: "Tap on a planned recipe", allow_open_mealie: "Allow open in Mealie", allow_change: "Allow swapping", allow_remove: "Allow removing",
      show_images: "Recipe images in tiles", max_width: "Maximum width of the whole card (optional)", tile_min_height: "Minimum height of each tile",
      url: "Mealie URL", language: "Language",
    },
    helpers: {
      config_entry_id: "Which Mealie integration the card uses.",
      show_header: "Shows icon, title and subtitle above the plan.",
      title: "Leave empty for the default text.",
      subtitle: "Shown on the right of the header. Leave empty for the default text.",
      icon: "Leave empty to show no icon.",
      days: "Starting today. Further days continue downwards.",
      meals: "Each meal becomes a column. Drag to reorder.",
      wish_label: "Shown in empty slots, e.g. 'Wish a meal'.",
      picker: "Which sections the picker shows and in which order.",
      picker_items: "How many recipes each section (except search and pinned) shows.",
      pinned_title: "Heading of the pinned section. Empty = default text.",
      pinned_category_ids: "All recipes in these categories always show as pinned options. List comes from Mealie (categories used by at least one recipe).",
      pinned_tag_ids: "All recipes with these tags always show as pinned options. List comes from Mealie.",
      pinned_recipe_ids: "Single recipes that always show as pinned options.",
      pinned_notes: "Options without a Mealie recipe, e.g. 'Leftovers'. Added to the plan as a note.",
      pinned_exclude_elsewhere: "On: pinned options do not appear in Random, Favourites etc.",
      history_days: "How far back the meal plan is analysed for 'Most cooked' and 'Not cooked in a while'.",
      favorites_min_rating: "Recipes with at least this star rating automatically count as favourites.",
      confirm_wish: "On: tapping a recipe first asks 'Wish …?'. Off: the recipe is added right away.",
      allow_free_text: "Below the search results: the typed name can be added as a meal without recipe (note).",
      allow_create_recipe: "Below the search results: a link opens Mealie's 'New recipe' form. Needs the Mealie URL.",
      recipe_tap_action: "What happens when a planned meal is tapped.",
      allow_open_mealie: "Shows 'Open in Mealie' in the details (opens the recipe in Mealie). Needs the Mealie URL.",
      allow_change: "Allows 'Swap meal' in the details.",
      allow_remove: "Allows 'Remove from plan' in the details (with confirmation).",
      show_images: "Shows recipe images. Needs the Mealie URL.",
      max_width: "Limits the width of the whole card, e.g. 900px; it is then centred. Empty = width from the Layout tab.",
      tile_min_height: "Applies to every single slot (recipe or 'Wish a meal'), in pixels. Taller slots show more of the recipe image.",
      url: "E.g. https://mealie.example.com – for images and 'Open in Mealie'. Must be reachable from the displaying device.",
      language: "Empty = Home Assistant language.",
    },
    tap: { details: "Show details", mealie: "Open in Mealie", change: "Swap meal", none: "Nothing" },
    search: "Search",
  },
};

class MealieWishlistCard extends HTMLElement {
  static getStubConfig(hass) {
    const entry = Object.values(hass?.entities || {}).find((e) => e.platform === "mealie");
    return { config_entry_id: entry?.config_entry_id || "", days: 3, meals: ["dinner"] };
  }

  static getConfigElement() {
    return document.createElement("mealie-wishlist-card-editor");
  }

  static formSpec(lang = "en", opts = null) {
    const L = EDITOR_I18N[lang] || EDITOR_I18N.en;
    const M = (I18N[lang] || I18N.en);
    const sel = (opts) => ({ select: { multiple: true, mode: "list", reorder: true, options: opts } });
    return {
      schema: [
        { name: "config_entry_id", required: true, selector: { config_entry: { integration: "mealie" } } },
        { type: "expandable", name: "", title: L.sections.header, flatten: true, schema: [
          { name: "show_header", selector: { boolean: {} } },
          { name: "title", selector: { text: {} } },
          { name: "subtitle", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } },
        ] },
        { name: "days", selector: { number: { min: 1, max: 31, mode: "box" } } },
        { name: "meals", selector: sel(MEAL_TYPES.map((m) => ({ value: m, label: M.meals[m] }))) },
        { name: "wish_label", selector: { text: {} } },
        { type: "expandable", name: "", title: L.sections.picker, flatten: true, schema: [
          { name: "picker", selector: sel(PICKER_SECTIONS.map((p) => ({ value: p, label: p === "search" ? L.search : M[p] }))) },
          { name: "picker_items", selector: { number: { min: 1, max: 12, mode: "box" } } },
          { name: "pinned_title", selector: { text: {} } },
          { name: "pinned_category_ids", selector: { select: { multiple: true, mode: "dropdown", options: opts?.categories || [] } } },
          { name: "pinned_tag_ids", selector: { select: { multiple: true, mode: "dropdown", options: opts?.tags || [] } } },
          { name: "pinned_recipe_ids", selector: { select: { multiple: true, mode: "dropdown", options: opts?.recipes || [] } } },
          { name: "pinned_notes", selector: { text: { multiple: true } } },
          { name: "pinned_exclude_elsewhere", selector: { boolean: {} } },
          { name: "history_days", selector: { number: { min: 14, max: 730, mode: "box" } } },
          { name: "favorites_min_rating", selector: { number: { min: 1, max: 5, step: 0.5, mode: "box" } } },
          { name: "confirm_wish", selector: { boolean: {} } },
          { name: "allow_free_text", selector: { boolean: {} } },
          { name: "allow_create_recipe", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: L.sections.planned, flatten: true, schema: [
          { name: "recipe_tap_action", selector: { select: { mode: "dropdown", options: ["details", "mealie", "change", "none"].map((v) => ({ value: v, label: L.tap[v] })) } } },
          { name: "allow_open_mealie", selector: { boolean: {} } },
          { name: "allow_change", selector: { boolean: {} } },
          { name: "allow_remove", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: L.sections.tiles, flatten: true, schema: [
          { name: "tile_min_height", selector: { number: { min: 40, max: 400, step: 4, mode: "box", unit_of_measurement: "px" } } },
          { name: "show_images", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: L.sections.card, flatten: true, schema: [
          { name: "max_width", selector: { text: {} } },
          { name: "url", selector: { text: { type: "url" } } },
          { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "de", label: "Deutsch" }, { value: "en", label: "English" }] } } },
        ] },
      ],
      computeLabel: (s) => L.labels[s.name] ?? s.name,
      computeHelper: (s) => L.helpers[s.name],
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._plan = [];
    this._history = null;
    this._recipes = null;
    this._recipesTruncated = false;
    this._loaded = false;
    this._error = null;
    this._dialog = null;
    this._lastFetch = 0;
    this._dayKey = "";
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    const c = { ...DEFAULTS, ...config };
    c.days = Math.max(1, Math.min(31, parseInt(c.days, 10) || 3));
    c.meals = (Array.isArray(c.meals) && c.meals.length ? c.meals : DEFAULTS.meals).filter((m) => MEAL_TYPES.includes(m));
    if (!c.meals.length) c.meals = ["dinner"];
    c.picker = (Array.isArray(c.picker) ? c.picker : DEFAULTS.picker).filter((p) => PICKER_SECTIONS.includes(p));
    c.picker_items = Math.max(1, Math.min(12, parseInt(c.picker_items, 10) || 4));
    const list = (v) => (Array.isArray(v) ? v : typeof v === "string" && v ? v.split(",") : []).map((x) => String(x).trim()).filter(Boolean);
    c.pinned_categories = list(c.pinned_categories); c.pinned_tags = list(c.pinned_tags);
    c.pinned_recipes = list(c.pinned_recipes); c.pinned_notes = list(c.pinned_notes);
    c.pinned_category_ids = list(c.pinned_category_ids); c.pinned_tag_ids = list(c.pinned_tag_ids); c.pinned_recipe_ids = list(c.pinned_recipe_ids);
    c.url = String(c.url || "").replace(/\/+$/, "");
    const old = this._config;
    this._config = c;
    if (old && (old.config_entry_id !== c.config_entry_id || old.days !== c.days || old.history_days !== c.history_days)) {
      this._history = null; this._recipes = null; this._lastFetch = 0;
    }
    this._render();
    if (this._hass) this._refresh();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    const key = isoDate(new Date());
    if (first || key !== this._dayKey || Date.now() - this._lastFetch > 5 * 60 * 1000) this._refresh();
  }

  get hass() { return this._hass; }

  getCardSize() { return 1 + this._config.days * 2; }

  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  connectedCallback() {
    this._timer = setInterval(() => this._hass && this._refresh(), 5 * 60 * 1000);
    this._ro = new ResizeObserver(() => this._applyWidth());
    this._ro.observe(this);
  }

  disconnectedCallback() { clearInterval(this._timer); this._ro?.disconnect(); }

  _applyWidth() {
    const card = this.shadowRoot.querySelector("ha-card");
    if (!card || !this._config) return;
    const need = 110 + this._config.meals.length * 150;
    card.classList.toggle("narrow", this.clientWidth > 0 && this.clientWidth < need);
  }

  get _t() {
    const lang = this._config?.language || (this._hass?.locale?.language || this._hass?.language || "en").slice(0, 2);
    return I18N[lang] || I18N.en;
  }

  async _call(service, data = {}) {
    const wantsResponse = service.startsWith("get_");
    const res = await this._hass.callService("mealie", service, { config_entry_id: this._config.config_entry_id, ...data }, undefined, false, wantsResponse);
    return res?.response ?? res;
  }

  async _refresh() {
    if (!this._hass || !this._config) return;
    if (!this._config.config_entry_id) { this._render(); return; }
    if (this._busy) return;
    this._busy = true;
    this._lastFetch = Date.now();
    const today = new Date();
    this._dayKey = isoDate(today);
    try {
      const r = await this._call("get_mealplan", { start_date: isoDate(today), end_date: isoDate(addDays(today, this._config.days - 1)) });
      this._plan = r?.mealplan || [];
      this._error = null;
    } catch (e) {
      this._error = e?.message || String(e);
    }
    this._loaded = true;
    this._busy = false;
    this._render();
  }

  async _ensurePickerData(force = false) {
    const c = this._config;
    const today = new Date();
    const jobs = [];
    if (!this._recipes || force) {
      jobs.push(this._call("get_recipes", { result_limit: 100 }).then((r) => {
        this._recipes = r?.recipes?.items || [];
        this._recipesTruncated = this._recipes.length >= 100;
      }));
    }
    const needHistory = c.picker.includes("most_cooked") || c.picker.includes("not_cooked_lately");
    if (needHistory && (!this._history || force)) {
      jobs.push(this._call("get_mealplan", { start_date: isoDate(addDays(today, -c.history_days)), end_date: isoDate(addDays(today, -1)) })
        .then((r) => { this._history = r?.mealplan || []; })
        .catch(() => { this._history = []; }));
    }
    await Promise.all(jobs);
  }

  _stats() {
    const counts = new Map();
    const last = new Map();
    for (const e of this._history || []) {
      const id = e.recipe?.recipe_id;
      if (!id) continue;
      counts.set(id, (counts.get(id) || 0) + 1);
      const d = String(e.mealplan_date).slice(0, 10);
      if (!last.has(id) || last.get(id) < d) last.set(id, d);
    }
    for (const r of this._recipes || []) {
      if (r.last_made) {
        const d = String(r.last_made).slice(0, 10);
        if (!last.has(r.recipe_id) || last.get(r.recipe_id) < d) last.set(r.recipe_id, d);
      }
    }
    return { counts, last };
  }

  _daysAgo(iso) {
    if (!iso) return null;
    const t = new Date();
    return Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()) - parseDate(iso)) / 86400000);
  }

  _isPinned(r) {
    const c = this._config, k = (x) => norm(x).trim();
    if ((r.categories || []).some((x) => c.pinned_category_ids.includes(x.category_id))
      || (r.tags || []).some((x) => c.pinned_tag_ids.includes(x.tag_id))
      || c.pinned_recipe_ids.includes(r.recipe_id)) return true;
    const cats = c.pinned_categories.map(k), tags = c.pinned_tags.map(k), names = c.pinned_recipes.map(k);
    return (r.categories || []).some((x) => cats.includes(k(x.name)) || cats.includes(k(x.slug)))
      || (r.tags || []).some((x) => tags.includes(k(x.name)) || tags.includes(k(x.slug)))
      || names.includes(k(r.name)) || names.includes(k(r.slug));
  }

  _sections() {
    const c = this._config, n = c.picker_items, everything = this._recipes || [];
    const pinnedRecipes = everything.filter((r) => this._isPinned(r));
    const all = c.pinned_exclude_elsewhere && c.picker.includes("pinned") ? everything.filter((r) => !this._isPinned(r)) : everything;
    const { counts, last } = this._stats();
    const t = this._t;
    const byId = new Map(everything.map((r) => [r.recipe_id, r]));
    const out = {};
    out.favorites_random = shuffle(all.filter((r) => (r.rating || 0) >= c.favorites_min_rating)).slice(0, n)
      .map((r) => ({ r, sub: "★ " + Number(r.rating).toLocaleString(this._config.language || this._hass?.locale?.language || "en") }));
    out.most_cooked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id, k]) => ({ r: byId.get(id), k })).filter((x) => x.r).slice(0, n)
      .map((x) => ({ r: x.r, sub: t.times(x.k) }));
    out.not_cooked_lately = all.map((r) => ({ r, d: last.get(r.recipe_id) || "" })).sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)).slice(0, n)
      .map((x) => ({ r: x.r, sub: x.d ? t.ago(this._daysAgo(x.d)) : t.never }));
    out.random = shuffle(all).slice(0, n).map((r) => ({ r, sub: "" }));
    out.pinned = [...pinnedRecipes.map((r) => ({ r, sub: "" })), ...c.pinned_notes.map((note, i) => ({ note, i, sub: "" }))];
    return out;
  }

  _img(recipe) {
    if (!this._config.show_images || !this._config.url || !recipe?.recipe_id || !recipe.image) return "";
    return `${this._config.url}/api/media/recipes/${encodeURIComponent(recipe.recipe_id)}/images/min-original.webp`;
  }

  _dayLabel(i, d) {
    const t = this._t, lang = this._config.language || this._hass?.locale?.language || "en";
    const long = d.toLocaleDateString(lang, { weekday: "long" });
    const short = d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "2-digit" });
    if (i === 0) return [t.today, short];
    if (i === 1) return [t.tomorrow, short];
    return [long, d.toLocaleDateString(lang, { day: "2-digit", month: "2-digit" })];
  }

  _recipeUrl(recipe) {
    if (!this._config.url || !recipe?.slug) return "";
    return `${this._config.url}/g/${encodeURIComponent(this._config.mealie_group_slug || "home")}/r/${encodeURIComponent(recipe.slug)}`;
  }

  _render() {
    if (!this._config) return;
    const c = this._config, t = this._t;
    const title = c.title ?? t.title, subtitle = c.subtitle ?? t.subtitle, wish = c.wish_label ?? t.wish;
    const cols = c.meals.length;
    let body = "";
    if (!c.config_entry_id) body = `<div class="msg">${esc(t.no_entry)}</div>`;
    else if (this._error) body = `<div class="msg err">${esc(t.error)}: ${esc(this._error)}</div>`;
    else if (!this._loaded) body = `<div class="msg">${esc(t.loading)}</div>`;
    else {
      const today = new Date();
      let rows = "";
      if (cols > 1) rows += `<div class="row head"><div></div>${c.meals.map((m) => `<div>${esc(t.meals[m])}</div>`).join("")}</div>`;
      for (let i = 0; i < c.days; i++) {
        const d = addDays(today, i), key = isoDate(d);
        const [a, b] = this._dayLabel(i, d);
        rows += `<div class="row"><div class="day"><b>${esc(a)}</b><small>${esc(b)}</small></div>`;
        for (const m of c.meals) {
          const entries = this._plan.filter((e) => String(e.mealplan_date).slice(0, 10) === key && e.entry_type === m);
          const label = cols === 1 ? "" : `<span class="lbl">${esc(t.meals[m])}</span>`;
          if (!entries.length) {
            rows += `<button class="wish" data-act="wish" data-date="${key}" data-meal="${m}">${label}${svg(ICONS.plus, 22)}<span>${esc(wish)}</span></button>`;
          } else {
            rows += `<div class="cell">${label}${entries.map((e) => {
              const r = e.recipe, img = this._img(r);
              const name = r?.name || e.title || t.note;
              return `<button class="meal${img ? " has-img" : ""}" data-act="planned" data-id="${e.mealplan_id}">${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}<span>${esc(name)}</span></button>`;
            }).join("")}</div>`;
          }
        }
        rows += `</div>`;
      }
      body = `<div class="grid" style="--cols:${cols}">${rows}</div>`;
    }
    const header = c.show_header && (title || subtitle || c.icon)
      ? `<div class="header">${c.icon ? `<div class="hicon"><ha-icon icon="${esc(c.icon)}"></ha-icon></div>` : ""}${title ? `<div class="title">${esc(title)}</div>` : ""}${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ""}</div>`
      : "";
    const oldBody = this.shadowRoot.querySelector(".dbody");
    const keepScroll = oldBody ? oldBody.scrollTop : 0;
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><ha-card style="--cols:${cols};--mw-tile-min-h:${Math.max(40, parseInt(c.tile_min_height, 10) || 64)}px${c.max_width ? `;--mealie-wishlist-max-width:${esc(c.max_width)}` : ""}">${header}${body}</ha-card>${this._dialogHtml()}${this._toast ? `<div class="toast" role="status">${svg(ICONS.check, 22)}<span>${esc(this._toast)}</span></div>` : ""}`;
    this._applyWidth();
    const newBody = this.shadowRoot.querySelector(".dbody");
    if (newBody && keepScroll) newBody.scrollTop = keepScroll;
    this._bind();
    if (this._dialog?.focusSearch) {
      const inp = this.shadowRoot.querySelector("input.q");
      if (inp) { inp.focus(); const v = inp.value; inp.value = ""; inp.value = v; }
      this._dialog.focusSearch = false;
    }
  }

  _dialogHtml() {
    const dlg = this._dialog;
    if (!dlg) return "";
    const t = this._t, c = this._config;
    const mealName = t.meals[dlg.meal] || dlg.meal;
    const dayTxt = dlg.date ? parseDate(dlg.date).toLocaleDateString(c.language || this._hass?.locale?.language || "en", { weekday: "long", day: "2-digit", month: "2-digit" }) : "";
    let inner = "";
    if (dlg.type === "picker") {
      const head = `<div class="dtop"><div><b>${esc(c.wish_label ?? t.wish)}</b><small>${esc(dayTxt)} · ${esc(mealName)}</small></div><button class="x" data-act="close" aria-label="${esc(t.close)}">${svg(ICONS.close)}</button></div>`;
      let secs = "";
      if (dlg.loading) secs = `<div class="msg">${esc(t.loading)}</div>`;
      else {
        const s = dlg.sections || (dlg.sections = this._sections());
        for (const p of c.picker) {
          if (p === "search") {
            const q = dlg.q || "";
            let ac = "";
            if (q.trim().length >= 1) {
              const nq = norm(q);
              const hits = (dlg.remote && dlg.remoteQ === q ? dlg.remote : (this._recipes || []).filter((r) => norm(r.name).includes(nq))).slice(0, 6);
              const { counts, last } = this._stats();
              ac = `<div class="ac">${hits.length ? hits.map((r) => {
                const n = r.name, i = norm(n).indexOf(nq);
                const hl = i >= 0 ? `${esc(n.slice(0, i))}<em>${esc(n.slice(i, i + q.length))}</em>${esc(n.slice(i + q.length))}` : esc(n);
                const k = counts.get(r.recipe_id), l = last.get(r.recipe_id);
                const sub = k ? t.times(k) : l ? t.ago(this._daysAgo(l)) : "";
                return `<button class="hit" data-act="pick" data-rid="${esc(r.recipe_id)}"><span>${hl}</span><small>${esc(sub)}</small></button>`;
              }).join("") : `<div class="none">${esc(t.no_results)}</div>`}${c.allow_free_text ? `<button class="hit add" data-act="note"><span>${svg(ICONS.plus, 18)} ${esc(t.add_note(q.trim()))}</span><small>${esc(t.add_note_hint)}</small></button>` : ""}${c.allow_create_recipe && c.url ? `<a class="hit add" href="${esc(`${c.url}/g/${encodeURIComponent(c.mealie_group_slug || "home")}/r/create/new`)}" target="_blank" rel="noopener"><span>${svg(ICONS.open, 18)} ${esc(t.create_recipe)}</span><small></small></a>` : ""}</div>`;
            }
            secs += `<div class="search">${svg(ICONS.search, 18)}<input class="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="${esc(t.search)}" value="${esc(q)}"></div>${ac}`;
          } else {
            const items = s[p] || [];
            if (p === "pinned" && !items.length) continue;
            const reshuffle = p === "random" || p === "favorites_random";
            secs += `<div class="sec"><h3><span class="si">${svg(ICONS[p], 16)}</span>${esc(p === "pinned" ? (c.pinned_title || t.pinned) : t[p])}${reshuffle ? `<button class="mix" data-act="shuffle" data-sec="${p}">${svg(ICONS.random, 14)} ${esc(t.shuffle)}</button>` : ""}</h3>${
              items.length ? `<div class="tiles" style="--n:${Math.min(c.picker_items, 4)}">${items.map(({ r, sub, note, i }) => {
                if (note !== undefined) return `<button class="tile pin" data-act="pinnote" data-i="${i}"><div class="ph">${svg(ICONS.note, 22)}</div><span>${esc(note)}</span><small>${esc(sub)}</small></button>`;
                const img = this._img(r);
                return `<button class="tile" data-act="pick" data-rid="${esc(r.recipe_id)}">${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : `<div class="ph">${svg(ICONS.fork, 22)}</div>`}<span>${esc(r.name)}</span><small>${esc(sub)}</small></button>`;
              }).join("")}</div>` : `<div class="none">${esc(t.empty_section)}</div>`}</div>`;
          }
        }
      }
      let confirm = "";
      if (dlg.pick) {
        confirm = `<div class="confirm"><p>${esc(t.confirm(dlg.pick.name, dayTxt, mealName))}</p><div class="btns"><button class="btn" data-act="unpick">${esc(t.cancel)}</button><button class="btn primary" data-act="commit">${esc(t.yes)}</button></div></div>`;
      }
      inner = `${head}<div class="dbody">${secs}</div>${confirm}`;
    } else if (dlg.type === "details") {
      const e = dlg.entry, r = dlg.recipe || e.recipe;
      const name = r?.name || e.title || t.note;
      const img = this._img(r);
      const facts = [];
      const dur = (str, sec) => str || (sec ? (sec >= 3600 ? `${Math.floor(sec / 3600)} h${sec % 3600 ? ` ${Math.round((sec % 3600) / 60)} min` : ""}` : `${Math.round(sec / 60)} min`) : "");
      if (r?.recipe_servings) facts.push(`${t.servings}: ${Number(r.recipe_servings).toLocaleString(c.language || this._hass?.locale?.language || "en")}`);
      const prep = dur(r?.prep_time, r?.prep_time_seconds), cook = dur(r?.perform_time, r?.perform_time_seconds), tot = dur(r?.total_time, r?.total_time_seconds);
      if (prep) facts.push(`${t.prep}: ${prep}`);
      if (cook) facts.push(`${t.cook}: ${cook}`);
      if (tot) facts.push(`${t.total}: ${tot}`);
      const ingr = (dlg.recipe?.ingredients || []).map((i) => i.display || i.note || i.original_text || "").filter(Boolean);
      const url = this._recipeUrl(r);
      const btns = [];
      if (url && c.allow_open_mealie) btns.push(`<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${svg(ICONS.open, 18)} ${esc(t.open_mealie)}</a>`);
      if (c.allow_change) btns.push(`<button class="btn" data-act="change">${svg(ICONS.swap, 18)} ${esc(t.change)}</button>`);
      if (c.allow_remove) btns.push(`<button class="btn danger" data-act="remove">${svg(ICONS.delete, 18)} ${esc(t.remove)}</button>`);
      inner = `<div class="dtop"><div><b>${esc(name)}</b><small>${esc(dayTxt)} · ${esc(mealName)}</small></div><button class="x" data-act="close" aria-label="${esc(t.close)}">${svg(ICONS.close)}</button></div>
        <div class="dbody">${img ? `<img class="hero" src="${esc(img)}" alt="" onerror="this.remove()">` : ""}
        ${r?.description ? `<p class="desc">${esc(r.description)}</p>` : e.description ? `<p class="desc">${esc(e.description)}</p>` : ""}
        ${facts.length || ingr.length || dlg.loading ? `<button class="more-btn${dlg.showDetails ? " open" : ""}" data-act="toggle_details" aria-expanded="${dlg.showDetails ? "true" : "false"}">${esc(t.details)} <span class="chev">▾</span></button>` : ""}
        ${dlg.showDetails ? `${facts.length ? `<div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
        ${dlg.loading ? `<div class="msg">${esc(t.loading)}</div>` : ingr.length ? `<h3>${esc(t.ingredients)}</h3><ul class="ingr">${ingr.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}` : ""}
        </div>${dlg.confirmRemove
          ? `<div class="actions confirm-inline"><p>${esc(t.remove_confirm(name))}</p><div class="btns"><button class="btn" data-act="noremove">${esc(t.cancel)}</button><button class="btn danger solid" data-act="doremove"${dlg.saving ? " disabled" : ""}>${svg(ICONS.delete, 18)} ${esc(t.remove)}</button></div></div>`
          : btns.length ? `<div class="actions">${btns.join("")}</div>` : ""}`;
    }
    const err = dlg.error ? `<div class="alert" role="alert">${esc(dlg.error)}</div>` : "";
    inner = inner.replace(/(<\/div>)(\s*<div class="dbody">)/, `$1${err}$2`);
    return `<div class="backdrop" data-act="backdrop"><div class="dialog" role="dialog" aria-modal="true">${inner}</div></div>`;
  }

  _bind() {
    const root = this.shadowRoot;
    root.querySelectorAll("[data-act]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        if (el.dataset.act === "backdrop" && ev.target !== el) return;
        ev.stopPropagation();
        this._act(el.dataset.act, el.dataset);
      });
    });
    const q = root.querySelector("input.q");
    if (q) {
      q.addEventListener("input", () => {
        this._dialog.q = q.value;
        this._dialog.focusSearch = true;
        this._render();
        this._remoteSearch(q.value);
      });
      q.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") { const first = root.querySelector(".ac .hit"); if (first) this._act("pick", first.dataset); }
        if (ev.key === "Escape") this._act("close", {});
      });
    }
  }

  _remoteSearch(q) {
    if (!this._recipesTruncated || q.trim().length < 2) return;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(async () => {
      try {
        const r = await this._call("get_recipes", { search_terms: q, result_limit: 10 });
        if (this._dialog && this._dialog.q === q) { this._dialog.remote = r?.recipes?.items || []; this._dialog.remoteQ = q; this._dialog.focusSearch = true; this._render(); }
      } catch (e) { /* ignore, local results stay */ }
    }, 300);
  }

  _showToast(text) {
    this._toast = text;
    this._render();
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toast = null; this._render(); }, 2500);
  }

  async _commitNote(name) {
    const d = this._dialog, t = this._t;
    if (!d || d.saving) return;
    d.saving = true;
    try {
      if (d.replace) await this._call("update_mealplan", { mealplan_id: String(d.replace.mealplan_id), date: d.date, entry_type: d.meal, note_title: name });
      else await this._call("set_mealplan", { date: d.date, entry_type: d.meal, note_title: name });
      this._dialog = null;
      this._showToast(d.replace ? t.swapped : t.saved);
      this._refresh();
    } catch (e) { d.saving = false; d.error = `${t.action_error}: ${e?.message || e}`; this._render(); }
  }

  _findRecipe(id) {
    return (this._recipes || []).find((r) => r.recipe_id === id) || (this._dialog?.remote || []).find((r) => r.recipe_id === id);
  }

  async _openPicker(date, meal, replaceEntry = null) {
    this._dialog = { type: "picker", date, meal, q: "", loading: !this._recipes, replace: replaceEntry };
    this._render();
    try { await this._ensurePickerData(); } catch (e) { this._dialog.error = `${this._t.error}: ${e?.message || e}`; }
    if (this._dialog) { this._dialog.loading = false; this._render(); }
  }

  async _act(act, ds) {
    const c = this._config, t = this._t;
    switch (act) {
      case "wish": return this._openPicker(ds.date, ds.meal);
      case "planned": {
        const e = this._plan.find((x) => String(x.mealplan_id) === String(ds.id));
        if (!e) return;
        const mode = c.recipe_tap_action;
        if (mode === "none") return;
        if (mode === "mealie" && c.allow_open_mealie) { const u = this._recipeUrl(e.recipe); if (u) window.open(u, "_blank", "noopener"); return; }
        if (mode === "change" && c.allow_change) return this._openPicker(String(e.mealplan_date).slice(0, 10), e.entry_type, e);
        this._dialog = { type: "details", entry: e, date: String(e.mealplan_date).slice(0, 10), meal: e.entry_type, loading: !!e.recipe };
        this._render();
        if (e.recipe?.recipe_id) {
          try { const r = await this._call("get_recipe", { recipe_id: e.recipe.slug || e.recipe.recipe_id }); if (this._dialog?.entry === e) this._dialog.recipe = r?.recipe; }
          catch (err) { /* keep basic info */ }
          if (this._dialog?.entry === e) { this._dialog.loading = false; this._render(); }
        }
        return;
      }
      case "close": case "backdrop": this._dialog = null; return this._render();
      case "shuffle": { const d = this._dialog; if (d?.sections && ds.sec) d.sections = { ...d.sections, [ds.sec]: this._sections()[ds.sec] }; return this._render(); }
      case "pinnote": {
        const name = c.pinned_notes[parseInt(ds.i, 10)];
        if (name) return this._commitNote(name);
        return;
      }
      case "note": {
        const d = this._dialog, name = (d?.q || "").trim();
        if (!d || !name || d.saving || !c.allow_free_text) return;
        return this._commitNote(name);
      }
      case "pick": {
        const r = this._findRecipe(ds.rid);
        if (!r) return;
        if (c.confirm_wish) { this._dialog.pick = r; return this._render(); }
        this._dialog.pick = r;
        return this._act("commit", {});
      }
      case "unpick": this._dialog.pick = null; return this._render();
      case "commit": {
        const d = this._dialog;
        if (!d?.pick || d.saving) return;
        d.saving = true;
        try {
          if (d.replace) await this._call("update_mealplan", { mealplan_id: String(d.replace.mealplan_id), date: d.date, entry_type: d.meal, recipe_id: d.pick.recipe_id });
          else await this._call("set_mealplan", { date: d.date, entry_type: d.meal, recipe_id: d.pick.recipe_id });
          this._dialog = null;
          this._showToast(d.replace ? t.swapped : t.saved);
          this._refresh();
        } catch (e) {
          d.saving = false; d.pick = null; d.error = `${t.action_error}: ${e?.message || e}`; this._render();
        }
        return;
      }
      case "change": {
        const e = this._dialog?.entry;
        if (e && c.allow_change) return this._openPicker(String(e.mealplan_date).slice(0, 10), e.entry_type, e);
        return;
      }
      case "toggle_details": this._dialog.showDetails = !this._dialog.showDetails; return this._render();
      case "remove": this._dialog.confirmRemove = true; return this._render();
      case "noremove": this._dialog.confirmRemove = false; return this._render();
      case "doremove": {
        const e = this._dialog?.entry;
        if (!e || !c.allow_remove) return;
        this._dialog.saving = true; this._render();
        try { await this._call("delete_mealplan", { mealplan_id: String(e.mealplan_id) }); this._dialog = null; this._showToast(t.removed); this._refresh(); }
        catch (err) { if (this._dialog) { this._dialog.saving = false; this._dialog.confirmRemove = false; this._dialog.error = `${t.action_error}: ${err?.message || err}`; this._render(); } }
        return;
      }
    }
  }
}

const STYLE = `
:host{--mw-accent:var(--mealie-wishlist-accent,var(--primary-color,#e58325));display:block}
ha-card{display:block;padding:16px 16px 8px;overflow:hidden;max-width:var(--mealie-wishlist-max-width,none);margin:0 auto;box-sizing:border-box;height:100%}
.header{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.hicon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:var(--mw-accent);background:color-mix(in srgb,var(--mw-accent) 14%,transparent)}
.title{font-size:1.15rem;font-weight:600;color:var(--primary-text-color)}
.subtitle{color:var(--secondary-text-color);font-size:.9rem;margin-left:auto}
.grid{display:flex;flex-direction:column}
.row{display:grid;grid-template-columns:minmax(80px,96px) repeat(var(--cols),minmax(0,1fr));gap:8px;padding:8px 0;border-bottom:1px solid var(--divider-color,#e4e6ea);align-items:stretch}
.row:last-child{border-bottom:0}
.row.head{font-size:.75rem;color:var(--secondary-text-color);padding:0 0 6px;text-transform:none}
.day{display:flex;flex-direction:column;justify-content:center;color:var(--primary-text-color);text-transform:capitalize}
.day b{font-size:.98rem}.day small{color:var(--secondary-text-color);font-size:.78rem}
.cell{display:flex;flex-direction:column;gap:6px;min-width:0}
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;text-align:left}
.meal{display:flex;flex-direction:column;border-radius:12px;background:var(--secondary-background-color,#f1f2f4);overflow:hidden;min-height:var(--mw-tile-min-h,64px);flex:1;color:var(--primary-text-color)}
.meal{position:relative}
.meal img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.meal span{position:relative;padding:8px 10px;font-size:.88rem;line-height:1.25;overflow-wrap:anywhere}
.meal.has-img{justify-content:flex-end}
.meal.has-img span{background:color-mix(in srgb,var(--card-background-color,#fff) var(--mealie-wishlist-text-backdrop,70%),transparent);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.wish{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:var(--mw-tile-min-h,64px);border-radius:12px;border:2px dashed var(--mw-accent);background:color-mix(in srgb,var(--mw-accent) 9%,transparent);color:var(--mw-accent);font-weight:600;font-size:.9rem;text-align:center;padding:6px}
.wish:hover,.meal:hover,.tile:hover,.hit:hover{filter:brightness(.97)}
.wish:focus-visible,.meal:focus-visible,.tile:focus-visible{outline:3px solid color-mix(in srgb,var(--mw-accent) 45%,transparent)}
.lbl{display:none;font-size:.72rem;font-weight:500;color:var(--secondary-text-color);margin-bottom:2px}
.wish .lbl{color:inherit;opacity:.8;margin:0}
.narrow .row{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.narrow .row.head{display:none}
.narrow .day{grid-column:1/-1;flex-direction:row;justify-content:flex-start;align-items:baseline;gap:8px}
.narrow .lbl{display:block}
.msg{padding:12px 4px;color:var(--secondary-text-color)}.err{color:var(--error-color,#db4437)}
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9;padding:12px}
.dialog{position:relative;background:var(--card-background-color,#fff);color:var(--primary-text-color);border-radius:22px;width:min(560px,100%);max-height:min(88vh,860px);display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.25);overflow:hidden}
.dtop{display:flex;align-items:flex-start;gap:8px;padding:18px 18px 10px}
.dtop b{font-size:1.15rem;display:block}.dtop small{color:var(--secondary-text-color);display:block;margin-top:2px;text-transform:capitalize}
.x{margin-left:auto;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color,#f1f2f4);color:var(--secondary-text-color);flex:none}
.dbody{padding:0 18px 18px;overflow:auto}
.search{position:relative;display:flex;align-items:center;color:var(--secondary-text-color)}
.search svg{position:absolute;left:13px}
.search input{width:100%;font:inherit;font-size:1rem;padding:12px 14px 12px 40px;border-radius:12px;border:2px solid var(--mw-accent);outline:0;background:var(--card-background-color,#fff);color:var(--primary-text-color)}
.ac{border:1px solid var(--divider-color,#e4e6ea);border-radius:12px;margin-top:6px;overflow:hidden}
.hit{display:flex;justify-content:space-between;gap:8px;width:100%;padding:10px 14px;font-size:.92rem}
.hit+.hit{border-top:1px solid var(--divider-color,#e4e6ea)}
.hit em{font-style:normal;font-weight:700;color:var(--mw-accent)}
.hit.add{border-top:1px solid var(--divider-color,#e4e6ea);color:var(--mw-accent);font-weight:500;text-decoration:none;align-items:center}
.hit.add span{display:inline-flex;align-items:center;gap:6px}.hit small{color:var(--secondary-text-color);white-space:nowrap}
.none{padding:10px 14px;color:var(--secondary-text-color);font-size:.9rem}
.sec{margin-top:16px}
.sec h3,.dbody h3{font-size:.92rem;margin:0 0 8px;display:flex;align-items:center;gap:6px}
.si{color:var(--mw-accent);display:flex}
.mix{margin-left:auto;font-weight:400;color:var(--mw-accent);font-size:.82rem;display:flex;align-items:center;gap:4px}
.tiles{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px}
@media (max-width:480px){.tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
.tile{display:flex;flex-direction:column;background:var(--secondary-background-color,#f1f2f4);border-radius:12px;overflow:hidden;font-size:.82rem;line-height:1.25}
.tile img,.tile .ph{width:100%;height:64px;object-fit:cover;display:grid;place-items:center;color:var(--secondary-text-color);background:color-mix(in srgb,var(--mw-accent) 10%,transparent)}
.tile span{padding:6px 8px 2px;overflow-wrap:anywhere}
.tile.pin .ph{color:var(--mw-accent)}.tile small{padding:0 8px 8px;color:var(--secondary-text-color);min-height:1.1em}
.confirm{position:absolute;inset:auto 0 0 0;background:var(--card-background-color,#fff);border-top:1px solid var(--divider-color,#e4e6ea);padding:16px 18px;box-shadow:0 -8px 24px rgba(0,0,0,.12)}
.confirm p{margin:0 0 12px;font-size:1rem}
.btns{display:flex;justify-content:flex-end;gap:8px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:999px;background:var(--secondary-background-color,#f1f2f4);color:var(--primary-text-color);font-weight:500;text-decoration:none;font-size:.92rem}
.btn.primary{background:var(--mw-accent);color:var(--text-primary-color,#fff)}
.btn.danger{color:var(--error-color,#db4437)}
.actions{display:flex;flex-wrap:wrap;gap:8px;padding:12px 18px 18px;border-top:1px solid var(--divider-color,#e4e6ea)}
.hero{width:100%;max-height:220px;object-fit:cover;border-radius:14px;display:block;margin-bottom:12px}
.desc{margin:0 0 10px;color:var(--secondary-text-color)}
.more-btn{display:inline-flex;align-items:center;gap:6px;color:var(--mw-accent);font-weight:500;padding:6px 0;margin-bottom:8px}
.more-btn .chev{transition:transform .15s}.more-btn.open .chev{transform:rotate(180deg)}
.facts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.facts span{background:var(--secondary-background-color,#f1f2f4);border-radius:999px;padding:4px 10px;font-size:.82rem}
.ingr{margin:0;padding-left:18px;line-height:1.6}
.toast{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;display:flex;align-items:center;gap:10px;background:var(--mw-accent);color:var(--text-primary-color,#fff);padding:16px 26px;border-radius:999px;font-weight:600;font-size:1.1rem;box-shadow:0 10px 30px rgba(0,0,0,.35);animation:mwpop .18s ease-out}
@keyframes mwpop{from{opacity:0;transform:translate(-50%,-50%) scale(.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.alert{margin:0 18px 12px;padding:10px 14px;border-radius:12px;background:color-mix(in srgb,var(--error-color,#db4437) 15%,transparent);color:var(--error-color,#db4437);font-size:.9rem}
.confirm-inline{flex-direction:column;align-items:stretch}.confirm-inline p{margin:0 0 4px;font-size:1rem}
.btn.solid{background:var(--error-color,#db4437);color:#fff}.btn[disabled]{opacity:.6}
`;

const EDITOR_DEFAULTS = {
  show_header: true, icon: DEFAULTS.icon, days: DEFAULTS.days, meals: DEFAULTS.meals, picker: DEFAULTS.picker,
  picker_items: DEFAULTS.picker_items, pinned_exclude_elsewhere: true, history_days: DEFAULTS.history_days, favorites_min_rating: DEFAULTS.favorites_min_rating,
  confirm_wish: false, tile_min_height: 64, allow_free_text: true, allow_create_recipe: true, recipe_tap_action: "details", allow_open_mealie: true, allow_change: true, allow_remove: true, show_images: true,
};

class MealieWishlistCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this._update(); }
  set hass(hass) { this._hass = hass; this._update(); }
  async connectedCallback() {
    if (!customElements.get("ha-form") && window.loadCardHelpers) {
      try { const h = await window.loadCardHelpers(); const c = await h.createCardElement({ type: "entities", entities: [] }); await c.constructor.getConfigElement?.(); } catch (e) { /* ignore */ }
    }
    await customElements.whenDefined("ha-form");
    this._update();
  }
  async _loadOptions() {
    const entry = this._config?.config_entry_id;
    if (!entry || this._optsFor === entry || !this._hass) return;
    this._optsFor = entry;
    try {
      const res = await this._hass.callService("mealie", "get_recipes", { config_entry_id: entry, result_limit: 100 }, undefined, false, true);
      const items = (res?.response ?? res)?.recipes?.items || [];
      const cats = new Map(), tags = new Map();
      for (const r of items) {
        for (const x of r.categories || []) cats.set(x.category_id, x.name);
        for (const x of r.tags || []) tags.set(x.tag_id, x.name);
      }
      const sorted = (m) => [...m.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
      // bereits gespeicherte, aber nicht mehr gefundene IDs sichtbar halten
      const keep = (list, ids) => { for (const id of ids || []) if (!list.some((o) => o.value === id)) list.push({ value: id, label: `? ${id}` }); return list; };
      this._opts = {
        categories: keep(sorted(cats), this._config.pinned_category_ids),
        tags: keep(sorted(tags), this._config.pinned_tag_ids),
        recipes: keep(items.map((r) => ({ value: r.recipe_id, label: r.name })).sort((a, b) => a.label.localeCompare(b.label)), this._config.pinned_recipe_ids),
      };
    } catch (e) { this._opts = { categories: [], tags: [], recipes: [] }; }
    if (this._form) { this._form.remove(); this._form = null; }
    this._update();
  }

  _update() {
    if (!this._config || !this._hass || !customElements.get("ha-form")) return;
    if (this._config.config_entry_id && this._optsFor !== this._config.config_entry_id) this._loadOptions();
    if (!this._form) {
      const lang = (this._config?.language || this._hass?.locale?.language || this._hass?.language || "en").slice(0, 2);
      const spec = MealieWishlistCard.formSpec(lang, this._opts);
      this._form = document.createElement("ha-form");
      this._form.schema = spec.schema;
      this._form.computeLabel = spec.computeLabel;
      this._form.computeHelper = spec.computeHelper;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = { ...this._config, ...ev.detail.value };
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    if (this._hass) this._form.hass = this._hass;
    // Fehlende Schlüssel mit den echten Standardwerten anzeigen (sonst stehen Schalter fälschlich auf aus)
    this._form.data = { ...EDITOR_DEFAULTS, ...this._config };
  }
}


// ---------------------------------------------------------------- Next meal tile
const NM_TEXT = {
  de: { name: "Essensplan", nothing: "Noch nichts geplant", wish: "Essen wünschen", today: "Heute", tomorrow: "Morgen", error: "Mealie nicht erreichbar" },
  en: { name: "Meal plan", nothing: "Nothing planned yet", wish: "Wish a meal", today: "Today", tomorrow: "Tomorrow", error: "Mealie unreachable" },
};
const NM_DEFAULT_TIMES = { breakfast: "10:30", lunch: "14:30", snack: "17:00", side: "21:00", dessert: "21:00", drink: "21:00", dinner: "21:00" };

class MealieNextMealCard extends HTMLElement {
  static getStubConfig(hass) {
    const entry = Object.values(hass?.entities || {}).find((e) => e.platform === "mealie");
    return { config_entry_id: entry?.config_entry_id || "", navigation_path: "/mealie-wishlist" };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "config_entry_id", required: true, selector: { config_entry: { integration: "mealie" } } },
        { name: "navigation_path", selector: { navigation: {} } },
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "color", selector: { ui_color: {} } },
        { name: "meals", selector: { select: { multiple: true, mode: "list", options: MEAL_TYPES.map((m) => ({ value: m, label: I18N.en.meals[m] })) } } },
        { name: "days", selector: { number: { min: 1, max: 14, mode: "box" } } },
        { name: "show_image", selector: { boolean: {} } },
        { name: "url", selector: { text: { type: "url" } } },
      ],
      computeLabel: (s) => ({
        config_entry_id: "Mealie integration", navigation_path: "Open on tap (dashboard path)", name: "Name", icon: "Icon", color: "Icon colour",
        meals: "Meals to consider (empty = all)", days: "Look ahead (days)", show_image: "Show recipe image instead of icon", url: "Mealie URL (for the image)",
      }[s.name]),
      computeHelper: (s) => ({
        navigation_path: "E.g. /mealie-wishlist – the dashboard with the Mealie Wishlist card.",
        meals: "Only these meal types count as 'next meal'. A meal counts as over after its usual time (breakfast 10:30, lunch 14:30, snack 17:00, dinner 21:00).",
        show_image: "Needs the Mealie URL.",
      }[s.name]),
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._plan = null;
    this._error = null;
    this._lastFetch = 0;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { navigation_path: "/mealie-wishlist", icon: "mdi:silverware-fork-knife", color: "orange", days: 7, meals: [], show_image: false, url: "", ...config };
    this._config.url = String(this._config.url || "").replace(/\/+$/, "");
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (Date.now() - this._lastFetch > 5 * 60 * 1000) this._fetch();
  }

  connectedCallback() { this._tick = setInterval(() => this._render(), 60 * 1000); }
  disconnectedCallback() { clearInterval(this._tick); }
  getCardSize() { return 3; }
  getGridOptions() { return { columns: 6, rows: 2, min_columns: 3, min_rows: 2 }; }

  get _lang() { return (this._hass?.locale?.language || this._hass?.language || "en").slice(0, 2); }

  async _fetch() {
    if (!this._hass || !this._config?.config_entry_id) return;
    this._lastFetch = Date.now();
    const today = new Date();
    try {
      const res = await this._hass.callService("mealie", "get_mealplan", {
        config_entry_id: this._config.config_entry_id, start_date: isoDate(today), end_date: isoDate(addDays(today, this._config.days)),
      }, undefined, false, true);
      this._plan = (res?.response ?? res)?.mealplan || [];
      this._error = null;
    } catch (e) { this._error = e?.message || String(e); }
    this._render();
  }

  _next() {
    if (!this._plan) return null;
    const now = new Date();
    const times = { ...NM_DEFAULT_TIMES, ...(this._config.meal_times || {}) };
    const allowed = this._config.meals?.length ? this._config.meals : MEAL_TYPES;
    const order = (m) => { const [h, mi] = String(times[m] || "21:00").split(":").map(Number); return h * 60 + (mi || 0); };
    const cands = this._plan.filter((e) => allowed.includes(e.entry_type)).map((e) => {
      const d = parseDate(e.mealplan_date); const end = order(e.entry_type);
      return { e, end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(end / 60), end % 60) };
    }).filter((x) => x.end > now).sort((a, b) => a.end - b.end);
    return cands[0] || null;
  }

  _render() {
    if (!this._config) return;
    const c = this._config, T = NM_TEXT[this._lang] || NM_TEXT.en, M = I18N[this._lang] || I18N.en;
    const nx = this._next();
    let line = "";
    let img = "";
    if (this._error) line = T.error;
    else if (this._plan && !nx) line = `${T.nothing} · ${T.wish}`;
    else if (nx) {
      const d = parseDate(nx.e.mealplan_date), today = new Date();
      const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
      const day = diff === 0 ? T.today : diff === 1 ? T.tomorrow : d.toLocaleDateString(this._lang, { weekday: "long" });
      line = `${day} · ${nx.e.recipe?.name || nx.e.title || ""}`;
      this._title = `${day}, ${M.meals[nx.e.entry_type] || nx.e.entry_type}: ${nx.e.recipe?.name || nx.e.title || ""}`;
      if (c.show_image && c.url && nx.e.recipe?.recipe_id && nx.e.recipe.image) img = `${c.url}/api/media/recipes/${encodeURIComponent(nx.e.recipe.recipe_id)}/images/min-original.webp`;
    }
    const color = String(c.color || "orange");
    const cssColor = /^(#|rgb|var\()/.test(color) ? color : `var(--${color}-color, var(--state-icon-color, var(--primary-color)))`;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;height:100%}
      ha-card{height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;cursor:pointer;text-align:center;overflow:hidden}
      ha-card:focus-visible{outline:2px solid var(--primary-color)}
      .ic{color:${cssColor};display:flex;flex:0 1 auto;min-height:0}
      .ic ha-icon{--mdc-icon-size:var(--mealie-next-meal-icon-size,48px)}
      .img{width:64px;height:64px;border-radius:50%;object-fit:cover;flex:none}
      .name{font-size:var(--ha-font-size-l,16px);font-weight:var(--ha-font-weight-normal,400);color:var(--primary-text-color);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .next{font-size:var(--ha-font-size-s,12px);color:var(--secondary-text-color);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
    </style><ha-card tabindex="0" role="button">
      ${img ? `<img class="img" src="${esc(img)}" alt="" onerror="this.remove()">` : `<div class="ic"><ha-icon icon="${esc(c.icon)}"></ha-icon></div>`}
      <div class="name">${esc(c.name ?? T.name)}</div>
      ${line ? `<div class="next" title="${esc(this._title || line)}">${esc(line)}</div>` : ""}
    </ha-card>`;
    const card = this.shadowRoot.querySelector("ha-card");
    const go = () => {
      const path = c.navigation_path;
      if (!path) return;
      history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") go(); });
  }
}

if (!customElements.get("mealie-next-meal-card")) {
  customElements.define("mealie-next-meal-card", MealieNextMealCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "mealie-next-meal-card",
    name: "Mealie Next Meal",
    description: "Small tile showing the next planned meal; tap opens your meal plan dashboard.",
    preview: false,
    documentationURL: "https://github.com/andrelung/mealie-wishlist-card",
  });
}

if (!customElements.get("mealie-wishlist-card-editor")) customElements.define("mealie-wishlist-card-editor", MealieWishlistCardEditor);

if (!customElements.get("mealie-wishlist-card")) {
  customElements.define("mealie-wishlist-card", MealieWishlistCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "mealie-wishlist-card",
    name: "Mealie Wishlist",
    description: "Meal plan for the next days with a one-tap 'wish a meal' button for empty slots.",
    preview: false,
    documentationURL: "https://github.com/andrelung/mealie-wishlist-card",
  });
  console.info(`%c MEALIE-WISHLIST-CARD %c ${MW_VERSION} `, "background:#e58325;color:#fff;font-weight:700", "background:#444;color:#fff");
}
})();
