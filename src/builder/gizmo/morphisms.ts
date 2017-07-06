import {
  CAYLEY_ADDRESS
} from "../../config";

import * as Context from "feedbackfruits-knowledge-context";
import { IGizmoBuilder } from "./index";
import cayley = require("node-cayley");

const client = cayley(CAYLEY_ADDRESS);
export const graph: IGizmoBuilder = client.g;

export const fieldOfStudy = (key: string = "fieldOfStudy") => graph.M()
  .Save(Context.name, `${key}_name`)
  .Save(Context.image, `${key}_image`)
  .Tag(`${key}_id`);

export const parents = (key: string = "parent") => graph.M()
  .Out(Context.AcademicGraph.parentFieldOfStudy);

export const children = (key: string = "child") => graph.M()
  .Out(Context.AcademicGraph.childFieldOfStudy);
