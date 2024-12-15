import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/anki-jpdb.breader/", "src/alt/", "src/alt_orig/", "**/webpack.*.js"],
}, ...compat.extends(
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:prettier/recommended",
).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
        jsdoc,
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        globals: {
            ...globals.commonjs,
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 12,
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".ts"],
                moduleDirectory: ["node_modules", "src/"],
            },
        },
    },

    rules: {
        curly: ["error"],
        "require-await": ["error"],
        "arrow-parens": ["error", "always"],
        "no-console": ["error"],
        "no-debugger": ["error"],
        semi: ["error", "always"],

        quotes: ["error", "single", {
            avoidEscape: true,
        }],

        "max-len": ["error", {
            code: 100,
            ignorePattern: "^import",
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
            ignoreComments: true,
            ignoreStrings: true,
        }],

        "comma-dangle": ["error", "always-multiline"],
        "no-plusplus": ["off"],
        "import/extensions": ["off"],
        "import/prefer-default-export": ["off"],

        "import/order": ["warn", {
            groups: ["builtin", "external", "index", "internal", "parent", "sibling", "type"],

            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },

            pathGroups: [{
                pattern: "@/**",
                group: "internal",
            }],
        }],

        "no-parameter-properties": ["off"],
        "no-unused-vars": ["off"],
        "lines-between-class-members": ["off"],

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: "*",
            next: ["return", "continue", "throw"],
        }, {
            blankLine: "always",
            prev: ["const", "let"],
            next: "*",
        }, {
            blankLine: "any",
            prev: ["const", "let"],
            next: ["const", "let"],
        }, {
            blankLine: "never",
            prev: "break",
            next: ["case", "default"],
        }, {
            blankLine: "always",
            prev: "*",
            next: "break",
        }, {
            blankLine: "always",
            prev: ["expression", "block-like"],
            next: ["if", "for", "do", "while", "try"],
        }],

        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/no-explicit-any": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-unsafe-return": "error",

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            overrides: {
                constructors: "off",
            },
        }],

        "@typescript-eslint/member-ordering": ["error", {
            default: [
                "decorated-field",
                "public-field",
                "protected-field",
                "private-field",
                "public-method",
                "protected-method",
                "private-method",
            ],
        }],

        "@typescript-eslint/no-inferrable-types": "error",

        "@typescript-eslint/explicit-function-return-type": "error",

        "no-duplicate-imports": ["error", {
            includeExports: true,
        }],

        "no-restricted-imports": ["error", {
            patterns: [{
                group: ["src/**/*"],
                message: "Use relative imports instead.",
            }, {
                group: ["**/../shared/**/*", "**/../styles/**/*"],
                message: "Use @* instead.",
            }, {
                group: ["@shared/*/**/*"],
                message: "Use @shared/moduleName instead.",
            }, {
                group: ["**/apps/**/*", "**/background-worker/**/*", "**/views/**/*"],
                message: "This import hints to a missscoped module.",
            }],
        }],

        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/unbound-method": "error",
        "@typescript-eslint/no-empty-object-type": "error",
        "@typescript-eslint/no-unsafe-function-type": "error",
        "@typescript-eslint/no-wrapper-object-types": "error",
    },
}];
