import { Prism } from "prism-react-renderer"

// Assigns the shared Prism instance to the global slot BEFORE any
// prismjs grammar module evaluates, so grammars must import this file
// first. Static imports evaluate in order, which makes tokenization
// deterministic on both server and client; the old dynamic-import
// approach let the server render without grammars, which changed the
// DOM structure, broke hydration, and made React rebuild the editor
// under the user's cursor.
const globalScope = globalThis as { Prism?: typeof Prism }
if (!globalScope.Prism) globalScope.Prism = Prism
