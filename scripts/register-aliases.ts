import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import moduleAlias from "module-alias";

const __dirname = dirname(fileURLToPath(import.meta.url));

moduleAlias.addAliases({
  "@": resolve(__dirname, ".."),
  "@/lib": resolve(__dirname, "../lib"),
});

moduleAlias();
