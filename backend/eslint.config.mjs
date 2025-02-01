// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";

export default tseslint.config({
  files: ["**/*.ts"],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs?.recommended,
    importPlugin.flatConfigs?.typescript,
  ],
  rules: {
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: ["./src/modules/*/domain/**"],
            from: [
              // domain/ から repositories/, services/ を呼べないように
              "./src/modules/*/repositories/**",
              "./src/modules/*/services/**",
            ],
          },
          {
            target: ["./src/modules/*/repositories/**"],
            from: [
              // repositories/ から services/ を呼べないように
              "./src/modules/*/services/**",
            ],
          },
          {
            target: ["./src/api/**"],
            from: [
              // moduleからexportされたもの以外使えないように
              "./src/modules/*/domain/**",
              "./src/modules/*/services/**",
              "./src/modules/*/repositories/**",
            ],
          },
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
});
