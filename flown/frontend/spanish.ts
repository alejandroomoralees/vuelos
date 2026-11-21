/* Separate entry point keeps the Spanish strings out of the first-visit map bundle. */
import { startSpanishTranslation } from "./ui/spanish";

if (typeof document !== "undefined") startSpanishTranslation();
