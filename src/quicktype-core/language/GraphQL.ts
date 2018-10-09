// import { TargetLanguage } from "../TargetLanguage";
// import {BooleanOption, getOptionValues, Option, OptionValues} from "../RendererOptions";
// import {ConvenienceRenderer} from "../ConvenienceRenderer";
// import {RenderContext} from "../Renderer";
// import {funPrefixNamer, Name, Namer} from "../Naming";
// import {javaScriptOptions, JavaScriptRenderer, legalizeName, nameStyle} from "./JavaScript";
// import {modifySource, multiWord, MultiWord, parenIfNeeded, singleWord, Sourcelike} from "../Source";
// import { utf16StringEscape} from "../support/Strings";
// import {ArrayType, ClassProperty, ClassType, EnumType, Type, UnionType} from "../Type";
// import {matchType, nullableFromUnion} from "../TypeUtils";
// import { panic} from "..";
// import {isES3IdentifierStart} from "./JavaScriptUnicodeMaps";
// import {arrayIntercalate} from "collection-utils";
//
// export class GraphQLTargetLanguage extends TargetLanguage {
//     constructor() {
//         super("graphQL", ["graphql", "gql"], "graphql");
//     }
//
//     protected getOptions(): Option<any>[] {
//         return [graphqlOptions.runtimeTypecheck];
//     }
//
//     protected makeRenderer(
//         renderContext: RenderContext,
//         untypedOptionValues: { [name: string]: any }
//     ): GraphQLRender {
//         return new GraphQLRender(this, renderContext, getOptionValues(graphqlOptions, untypedOptionValues));
//     }
// }
// export const graphqlOptions = {
//     runtimeTypecheck: new BooleanOption("runtime-typecheck", "Verify JSON.parse results at runtime", true)
// };
//
// export class GraphQLRender extends ConvenienceRenderer {
//     constructor(
//         targetLanguage: TargetLanguage,
//         renderContext: RenderContext,
//         private readonly _graphqlOptions: OptionValues<typeof graphqlOptions>
//     ) {
//         super(targetLanguage, renderContext);
//         console.log("GraphQLTargetLanguage render-----");
//         console.log(targetLanguage);
//         console.log(renderContext);
//     }
//
//     protected get moduleLine(): string | undefined {
//         return undefined;
//     }
//
//     typeMapTypeForProperty(p: ClassProperty): Sourcelike {
//         const typeMap = this.typeMapTypeFor(p.type);
//         if (!p.isOptional) {
//             return typeMap;
//         }
//         return ["u(undefined, ", typeMap, ")"];
//     }
//     typeMapTypeFor = (t: Type): Sourcelike => {
//         if (["class", "object", "enum"].indexOf(t.kind) >= 0) {
//             return ['r("', this.nameForNamedType(t), '")'];
//         }
//         return matchType<Sourcelike>(
//             t,
//             _anyType => '"any"',
//             _nullType => `null`,
//             _boolType => `true`,
//             _integerType => `0`,
//             _doubleType => `3.14`,
//             _stringType => `""`,
//             arrayType => ["a(", this.typeMapTypeFor(arrayType.items), ")"],
//             _classType => panic("We handled this above"),
//             mapType => ["m(", this.typeMapTypeFor(mapType.values), ")"],
//             _enumType => panic("We handled this above"),
//             unionType => {
//                 const children = Array.from(unionType.getChildren()).map(this.typeMapTypeFor);
//                 return ["u(", ...arrayIntercalate(", ", children), ")"];
//             }
//         );
//     };
//
//     protected emitSourceStructure() {
//         console.log("emitSourceStructure---");
//         if (this.leadingComments !== undefined) {
//             this.emitCommentLines(this.leadingComments);
//         }
//         this.emitLine("// @flow");
//         this.ensureBlankLine();
//
//         this.emitTypes();
//     }
//
//     protected makeEnumCaseNamer(): Namer | null {
//         return null;
//     }
//
//     protected makeNamedTypeNamer(): Namer {
//         return funPrefixNamer("types", s => nameStyle(s, true));
//     }
//
//     protected makeUnionMemberNamer(): Namer | null {
//         return null;
//     }
//
//     protected namerForObjectProperty(): Namer {
//         return funPrefixNamer("properties", s => s);
//     }
//
//     protected sourceFor(t: Type): MultiWord {
//         if (["class", "object", "enum"].indexOf(t.kind) >= 0) {
//             return singleWord(this.nameForNamedType(t));
//         }
//         return matchType<MultiWord>(
//             t,
//             _anyType => singleWord("any"),
//             _nullType => singleWord("null"),
//             _boolType => singleWord("boolean"),
//             _integerType => singleWord("number"),
//             _doubleType => singleWord("number"),
//             _stringType => singleWord("string"),
//             arrayType => {
//                 const itemType = this.sourceFor(arrayType.items);
//                 if (
//                     (arrayType.items instanceof UnionType && !false) ||
//                     // (arrayType.items instanceof UnionType && !this._tsFlowOptions.declareUnions) ||
//                     arrayType.items instanceof ArrayType
//                 ) {
//                     return singleWord(["Array<", itemType.source, ">"]);
//                 } else {
//                     return singleWord([parenIfNeeded(itemType), "[]"]);
//                 }
//             },
//             _classType => panic("We handled this above"),
//             mapType => singleWord(["{ [key: string]: ", this.sourceFor(mapType.values).source, " }"]),
//             _enumType => panic("We handled this above"),
//             unionType => {
//                 if (!false || nullableFromUnion(unionType) !== null) {
//                 // if (!this._tsFlowOptions.declareUnions || nullableFromUnion(unionType) !== null) {
//                     const children = Array.from(unionType.getChildren()).map(c => parenIfNeeded(this.sourceFor(c)));
//                     return multiWord(" | ", ...children);
//                 } else {
//                     return singleWord(this.nameForNamedType(unionType));
//                 }
//             }
//         );
//     }
//
//     emitBlock(source: Sourcelike, end: Sourcelike, emit: () => void) {
//         this.emitLine(source, "{");
//         this.indent(emit);
//         this.emitLine("}", end);
//     }
//
//     protected emitClassBlock(c: ClassType, className: Name): void {
//         console.log("------")
//         console.log(c.getParentTypes())
//         /*
//         *
//         * 这里判断第一层
//         *
//         * */
//         this.emitBlock(["type ", className, " "], "", () => {
//             this.emitClassBlockBody(c);
//         });
//     }
//     protected emitClassBlockBody(c: ClassType): void {
//         this.emitPropertyTable(c, (name, _jsonName, p) => {
//             console.log("emitPropertyTable----");
//             console.log(name);
//             console.log(_jsonName);
//             console.log(p);
//             console.log(quotePropertyName);
//             const t = p.type;
//             const opt = p.isOptional;
//             return [
//                 [modifySource(quotePropertyName, name), p.isOptional ? "?" : "", ": "],
//                 [this.sourceFor(t).source, ";"+opt]
//             ];
//         });
//     }
//
//     private emitClass(c: ClassType, className: Name) {
//         // this.emitDescription(this.descriptionForType(c));
//         this.emitClassBlock(c, className);
//     }
//
//     emitUnion(u: UnionType, unionName: Name) {
//         this.emitDescription(this.descriptionForType(u));
//
//         const children = multiWord(" | ", ...Array.from(u.getChildren()).map(c => parenIfNeeded(this.sourceFor(c))));
//         this.emitLine("export type ", unionName, " = ", children.source, ";");
//     }
//
//     protected emitEnum(e: EnumType, enumName: Name): void {
//         this.emitDescription(this.descriptionForType(e));
//         console.log("enumName-----");
//         console.log(enumName);
//         this.emitBlock(["export enum ", enumName, " "], "", () => {
//             console.log("enumName---e--");
//             console.log(e);
//             this.forEachEnumCase(e, "none", (name, jsonName) => {
//                 console.log("forEachEnumCase---");
//                 console.log(name, jsonName);
//                 this.emitLine(name, ` = "${utf16StringEscape(jsonName)}",`);
//             });
//         });
//     }
//
//     protected emitTypes(): void {
//         this.forEachNamedType(
//             "leading-and-interposing",
//             (c: ClassType, n: Name) => {
//                 // console.log("emitTypes-objectFunc------");
//                 // console.log(c);
//                 // console.log(n);
//                 this.emitClass(c, n);
//             },
//             (e, n) => {
//                 this.emitEnum(e, n);
//                 // console.log("emitTypes-emitEnum------");
//                 // console.log(e);
//                 // console.log(n);
//             },
//             (u, n) => {
//                 // console.log("emitTypes-emitUnion------");
//                 // console.log(u);
//                 // console.log(n);
//                 this.emitUnion(u, n);
//             }
//         );
//     }
//     protected emitConvertModuleBody(): void {
//         console.log("emitConvertModuleBody-----");
//     }
//     protected emitConvertModule(): void {
//         console.log("emitConvertModule-----");
//     }
// }
// function quotePropertyName(original: string): string {
//     const escaped = utf16StringEscape(original);
//     const quoted = `"${escaped}"`;
//
//     if (original.length === 0) {
//         return quoted;
//     } else if (!isES3IdentifierStart(original.codePointAt(0) as number)) {
//         return quoted;
//     } else if (escaped !== original) {
//         return quoted;
//     } else if (legalizeName(original) !== original) {
//         return quoted;
//     } else {
//         return original;
//     }
// }
import { Type, ArrayType, UnionType, ClassType, EnumType } from "../Type";
import { matchType, nullableFromUnion, isNamedType } from "../TypeUtils";
import { utf16StringEscape, camelCase } from "../support/Strings";

import { Sourcelike, modifySource, MultiWord, singleWord, parenIfNeeded, multiWord } from "../Source";
import { Name, Namer, funPrefixNamer } from "../Naming";
import { BooleanOption, Option, OptionValues, getOptionValues } from "../RendererOptions";
import {
    javaScriptOptions,
    JavaScriptTargetLanguage,
    JavaScriptRenderer,
    JavaScriptTypeAnnotations,
    legalizeName,
    nameStyle
} from "./JavaScript";
import { defined, panic } from "../support/Support";
import { TargetLanguage } from "../TargetLanguage";
import { RenderContext } from "../Renderer";
import { isES3IdentifierStart } from "./JavaScriptUnicodeMaps";

export const tsFlowOptions = Object.assign({}, javaScriptOptions, {
    justTypes: new BooleanOption("just-types", "Interfaces only", false),
    nicePropertyNames: new BooleanOption("nice-property-names", "Transform property names to be JavaScripty", false),
    declareUnions: new BooleanOption("explicit-unions", "Explicitly name unions", false)
});

const tsFlowTypeAnnotations = {
    any: ": any",
    anyArray: ": any[]",
    anyMap: ": { [k: string]: any }",
    string: ": string",
    stringArray: ": string[]",
    boolean: ": boolean"
};

export abstract class TypeScriptFlowBaseTargetLanguage extends JavaScriptTargetLanguage {
    protected getOptions(): Option<any>[] {
        return [
            tsFlowOptions.justTypes,
            tsFlowOptions.nicePropertyNames,
            tsFlowOptions.declareUnions,
            tsFlowOptions.runtimeTypecheck
        ];
    }

    get supportsOptionalClassProperties(): boolean {
        return true;
    }

    protected abstract makeRenderer(
        renderContext: RenderContext,
        untypedOptionValues: { [name: string]: any }
    ): JavaScriptRenderer;
}

export class GraphQLTargetLanguage extends TypeScriptFlowBaseTargetLanguage {
    constructor() {
        super("graphQL", ["graphql", "gql"], "graphql");
    }

    protected makeRenderer(
        renderContext: RenderContext,
        untypedOptionValues: { [name: string]: any }
    ): TypeScriptRenderer {
        return new TypeScriptRenderer(this, renderContext, getOptionValues(tsFlowOptions, untypedOptionValues));
    }
}

function quotePropertyName(original: string): string {
    const escaped = utf16StringEscape(original);
    const quoted = `"${escaped}"`;

    if (original.length === 0) {
        return quoted;
    } else if (!isES3IdentifierStart(original.codePointAt(0) as number)) {
        return quoted;
    } else if (escaped !== original) {
        return quoted;
    } else if (legalizeName(original) !== original) {
        return quoted;
    } else {
        return original;
    }
}

const nicePropertiesNamingFunction = funPrefixNamer("properties", s => nameStyle(s, false));

export abstract class TypeScriptFlowBaseRenderer extends JavaScriptRenderer {
    constructor(
        targetLanguage: TargetLanguage,
        renderContext: RenderContext,
        private readonly _tsFlowOptions: OptionValues<typeof tsFlowOptions>
    ) {
        super(targetLanguage, renderContext, _tsFlowOptions);
    }

    protected namerForObjectProperty(): Namer {
        if (this._tsFlowOptions.nicePropertyNames) {
            return nicePropertiesNamingFunction;
        } else {
            return super.namerForObjectProperty();
        }
    }

    protected sourceFor(t: Type): MultiWord {
        if (["class", "object", "enum"].indexOf(t.kind) >= 0) {
            return singleWord(this.nameForNamedType(t));
        }
        return matchType<MultiWord>(
            t,
            _anyType => singleWord("Any"),
            _nullType => singleWord("NULL"),
            _boolType => singleWord("Boolean"),
            _integerType => singleWord("Int"),
            _doubleType => singleWord("Int"),
            _stringType => singleWord("String"),
            arrayType => {
                const itemType = this.sourceFor(arrayType.items);
                if (
                    (arrayType.items instanceof UnionType && !this._tsFlowOptions.declareUnions) ||
                    arrayType.items instanceof ArrayType
                ) {
                    return singleWord(["Array<", itemType.source, ">"]);
                } else {
                    // return singleWord([parenIfNeeded(itemType), "[]"]);
                    return singleWord( "[", [parenIfNeeded(itemType), "]"]);
                }
            },
            _classType => panic("We handled this above"),
            mapType => singleWord(["{ [key: string]: ", this.sourceFor(mapType.values).source, " }"]),
            _enumType => panic("We handled this above"),
            unionType => {
                if (!this._tsFlowOptions.declareUnions || nullableFromUnion(unionType) !== null) {
                    const children = Array.from(unionType.getChildren()).map(c => parenIfNeeded(this.sourceFor(c)));
                    return multiWord(" | ", ...children);
                } else {
                    return singleWord(this.nameForNamedType(unionType));
                }
            }
        );
    }

    protected abstract emitEnum(e: EnumType, enumName: Name): void;

    protected abstract emitClassBlock(c: ClassType, className: Name): void;

    protected emitClassBlockBody(c: ClassType): void {
        this.emitPropertyTable(c, (name, _jsonName, p) => {
            console.log("emitPropertyTable----");
            console.log(name);
            console.log(_jsonName);
            console.log(p);
            console.log(quotePropertyName);
            const t = p.type;
            // return [
            //     [modifySource(quotePropertyName, name), p.isOptional ? "?" : "", ": "],
            //     [this.sourceFor(t).source, ";"]
            // ];
            return [
                [modifySource(quotePropertyName, name), ": "],
                [this.sourceFor(t).source, p.isOptional ? "" : "!"]
            ];
        });
    }

    private emitClass(c: ClassType, className: Name) {
        this.emitDescription(this.descriptionForType(c));
        this.emitClassBlock(c, className);
    }

    emitUnion(u: UnionType, unionName: Name) {
        if (!this._tsFlowOptions.declareUnions) {
            return;
        }

        this.emitDescription(this.descriptionForType(u));

        const children = multiWord(" | ", ...Array.from(u.getChildren()).map(c => parenIfNeeded(this.sourceFor(c))));
        this.emitLine("export type ", unionName, " = ", children.source, ";");
    }

    protected emitTypes(): void {
        this.forEachNamedType(
            "leading-and-interposing",
            (c: ClassType, n: Name) => this.emitClass(c, n),
            (e, n) => this.emitEnum(e, n),
            (u, n) => this.emitUnion(u, n)
        );
    }

    protected emitUsageComments(): void {
        if (this._tsFlowOptions.justTypes) return;
        super.emitUsageComments();
    }

    protected deserializerFunctionLine(t: Type, name: Name): Sourcelike {
        return ["function to", name, "(json: string): ", this.sourceFor(t).source];
    }

    protected serializerFunctionLine(t: Type, name: Name): Sourcelike {
        const camelCaseName = modifySource(camelCase, name);
        return ["function ", camelCaseName, "ToJson(value: ", this.sourceFor(t).source, "): string"];
    }

    protected get moduleLine(): string | undefined {
        return undefined;
    }

    protected get castFunctionLines(): [string, string] {
        return ["function cast<T>(val: any, typ: any): T", "function uncast<T>(val: T, typ: any): any"];
    }

    protected get typeAnnotations(): JavaScriptTypeAnnotations {
        throw new Error("not implemented");
    }

    protected emitConvertModule(): void {
        if (this._tsFlowOptions.justTypes) return;
        // super.emitConvertModule();
    }

    protected emitModuleExports(): void {
        if (this._tsFlowOptions.justTypes) {
            return;
        } else {
            // super.emitModuleExports();
        }
    }
}

export class TypeScriptRenderer extends TypeScriptFlowBaseRenderer {
    protected forbiddenNamesForGlobalNamespace(): string[] {
        return ["Array", "Date"];
    }

    protected deserializerFunctionLine(t: Type, name: Name): Sourcelike {
        return ["export ", super.deserializerFunctionLine(t, name)];
    }

    protected serializerFunctionLine(t: Type, name: Name): Sourcelike {
        return ["export ", super.serializerFunctionLine(t, name)];
    }

    protected get moduleLine(): string | undefined {
        return undefined;
    }

    protected get typeAnnotations(): JavaScriptTypeAnnotations {
        return Object.assign({ never: ": never" }, tsFlowTypeAnnotations);
    }

    protected emitModuleExports(): void {
        return;
    }

    protected emitUsageImportComment(): void {
        const topLevelNames: Sourcelike[] = [];
        this.forEachTopLevel(
            "none",
            (_t, name) => {
                topLevelNames.push(", ", name);
            },
            isNamedType
        );
        this.emitLine("//   import { Convert", topLevelNames, ' } from "./file";');
    }

    protected emitEnum(e: EnumType, enumName: Name): void {
        this.emitDescription(this.descriptionForType(e));
        this.emitBlock(["enum ", enumName, " "], "", () => {
            this.forEachEnumCase(e, "none", (name) => {
                this.emitLine(name);
                // this.emitLine(name, ` = "${utf16StringEscape(jsonName)}",`);
            });
        });
    }

    protected emitClassBlock(c: ClassType, className: Name): void {
        this.emitBlock(["type ", className, " "], "", () => {
            this.emitClassBlockBody(c);
        });
    }
}

export class FlowTargetLanguage extends TypeScriptFlowBaseTargetLanguage {
    constructor() {
        super("Flow", ["flow"], "js");
    }

    protected makeRenderer(renderContext: RenderContext, untypedOptionValues: { [name: string]: any }): FlowRenderer {
        return new FlowRenderer(this, renderContext, getOptionValues(tsFlowOptions, untypedOptionValues));
    }
}

export class FlowRenderer extends TypeScriptFlowBaseRenderer {
    protected forbiddenNamesForGlobalNamespace(): string[] {
        return ["Class", "Object", "String", "Array", "JSON", "Error"];
    }

    protected get typeAnnotations(): JavaScriptTypeAnnotations {
        return Object.assign({ never: "" }, tsFlowTypeAnnotations);
    }

    protected emitEnum(e: EnumType, enumName: Name): void {
        this.emitDescription(this.descriptionForType(e));
        const lines: string[][] = [];
        this.forEachEnumCase(e, "none", (_, jsonName) => {
            const maybeOr = lines.length === 0 ? "  " : "| ";
            lines.push([maybeOr, '"', utf16StringEscape(jsonName), '"']);
        });
        defined(lines[lines.length - 1]).push(";");

        this.emitLine("export type ", enumName, " =");
        this.indent(() => {
            for (const line of lines) {
                this.emitLine(line);
            }
        });
    }

    protected emitClassBlock(c: ClassType, className: Name): void {
        this.emitBlock(["export type ", className, " = "], ";", () => {
            this.emitClassBlockBody(c);
        });
    }

    protected emitSourceStructure() {
        this.emitLine("// @flow");
        this.ensureBlankLine();
        super.emitSourceStructure();
    }
}
