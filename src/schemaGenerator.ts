// ! if prisma.schema exists, then appends after last model
// ? Partially implemented TODO: add secondary parser, to test for any possible bugs and recommend solutions, like automincement: true, type: int only.. so on..
// DONE TODO: if foreign key is false, type != anyModelType

// TODO: Add comment that this model is generated by schemaGenerator
// TOdo: create issue, if same model name defined in schema, then it should throw error in console, and not generate prisma schema

import { createModel, createScalarField } from "prisma-schema-dsl";
import {
  AUTO_INCREMENT,
  DataSourceProvider,
  DataSourceURLEnv,
  Enum,
  ScalarType,
  UUID,
} from "prisma-schema-dsl-types";

export interface Field {
  fieldName: string;
  type: string;
  description: string;
  maxLength?: number | null;
  nullable: boolean;
  unique: boolean;
  default?: string | null;
  autoincrement?: boolean;
  uuid?: boolean;

  isId?: boolean;
  vectorEmbed?: boolean;
  embeddingAlgo?: string;
  isForeignKey?: boolean;
  isList?: boolean;
}

export interface Schema {
  schema: [{ schemaName: string; fields: Field[]; description: string }];
  dataSource?: {
    name: string;
    provider: DataSourceProvider;
    url: {
      url: string;
      fromEnv: DataSourceURLEnv;
      // fromEnv: DataSourceURLEnv;
    };
  };
  enum?: Enum[];
  generator?: {
    generatorName: string;
    provider: string;
    output: string;
    binaryTargets: string[];
  };
}

export function createModels(schema: Schema["schema"]): any[] {
  const models: any[] = [];
  for (const schemaItem of schema) {
    const fields: any[] = createFields(schemaItem.fields);
    models.push(createModel(schemaItem.schemaName, fields));
  }
  return models;
}

// increment is breaking the code
// ! ERROR: Error parsing JSON: Error: Default must be a number or call expression to autoincrement()
// ? Log by console.war:
/*  String;
    Default
    Default
    Default
    Default
    Default
    Int 
*/
export function createFields(fields: Field[]): any[] {
  // console.error("Feilds: ", fields);
  const result: any[] = [];
  for (const fieldData of fields) {
    fieldData.isId && fieldData.autoincrement
      ? console.error("Cannot have String in autoincrement")
      : null;

    // TODO @db.Uuid if default is uuid, and isId is true
    result.push(
      createScalarField(
        fieldData.fieldName,
        // fieldData.type as ScalarType
        //
        //   : fieldData.isId && fieldData.uuid
        //   ? ScalarType.String
        //   :
        fieldData.type as ScalarType,
        fieldData.isList || undefined, //isList boolean | undefined
        !fieldData.nullable || false, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique || false,
        fieldData.isId || false,
        undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
          ? { callee: AUTO_INCREMENT }
          : fieldData.isId && fieldData.uuid
          ? { callee: UUID }
          : fieldData.default || undefined, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        fieldData.isForeignKey || false, // isForeignKey boolean | undefined
        undefined // attributes in string | string[] | undefined
      )
    );

    if (fieldData.vectorEmbed) {
      result.push(
        createScalarField(
          `${fieldData.fieldName}Algorithm`,
          "String" as ScalarType,
          false,
          true,
          false,
          false,
          undefined,
          `"${fieldData.embeddingAlgo}"`,
          undefined,
          undefined,
          undefined
        ),

        createScalarField(
          `${fieldData.fieldName}Embedding`,
          `Unsupported("vector(${
            fieldData.embeddingAlgo!.length
          })")` as ScalarType,
          false,
          true,
          false,
          false,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        )
      );
    }
  }
  // console.log("Results: ", result);
  return result;
}
